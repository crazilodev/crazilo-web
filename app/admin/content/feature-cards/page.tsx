'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  LayoutGrid,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ImageIcon,
  Tag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminHomeFeatureCardsList } from '@/lib/data/content'
import {
  createFeatureCardAction,
  updateFeatureCardAction,
  deleteFeatureCardAction,
  toggleFeatureCardStatusAction,
  reorderFeatureCardAction,
} from './actions'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
}

interface HomeFeatureCard {
  id: string
  section_key: 'find_your_snack' | 'featured_collections'
  eyebrow_text: string | null
  title: string
  subtitle: string
  description: string | null
  image_url: string
  category_id: string | null
  link_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: Category | null
}

interface FeatureCardForm {
  section_key: 'find_your_snack' | 'featured_collections'
  eyebrow_text: string
  title: string
  subtitle: string
  description: string
  image_url: string
  category_id: string
  link_url: string
  display_order: number
  is_active: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  find_your_snack: 'Find Your Snack',
  featured_collections: 'Featured Collections',
}

const SECTION_BADGE_STYLES: Record<string, string> = {
  find_your_snack:
    'bg-amber-100 text-amber-800 border border-amber-200',
  featured_collections:
    'bg-blue-100 text-blue-800 border border-blue-200',
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function AdminFeatureCardsPage() {
  const [cards, setCards] = useState<HomeFeatureCard[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sectionFilter, setSectionFilter] = useState<
    'all' | 'find_your_snack' | 'featured_collections'
  >('all')

  // Modal / form state
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<HomeFeatureCard | null>(null)
  const [cardImages, setCardImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeatureCardForm>({
    defaultValues: {
      section_key: 'find_your_snack',
      display_order: 0,
      is_active: true,
    },
  })

  // ─── Data loading ──────────────────────────────────────────────────────────

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const data = await getAdminHomeFeatureCardsList(supabase, {
        search: search.trim() || undefined,
        status: statusFilter,
        sectionKey: sectionFilter,
      })
      setCards(data as HomeFeatureCard[])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load feature cards')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, sectionFilter])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // Load flat category list for the selector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('is_active', true)
          .order('name', { ascending: true })
        if (!error && data) setCategories(data)
      } catch {
        // Non-fatal – category selector just stays empty
      }
    }
    loadCategories()
  }, [])

  // ─── Form helpers ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null)
    setCardImages([])
    reset({
      section_key: 'find_your_snack',
      eyebrow_text: '',
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      category_id: '',
      link_url: '',
      display_order: 0,
      is_active: true,
    })
    setShowModal(true)
  }

  const openEdit = (card: HomeFeatureCard) => {
    setEditing(card)
    setCardImages(card.image_url ? [card.image_url] : [])
    reset({
      section_key: card.section_key,
      eyebrow_text: card.eyebrow_text || '',
      title: card.title,
      subtitle: card.subtitle,
      description: card.description || '',
      image_url: card.image_url,
      category_id: card.category_id || '',
      link_url: card.link_url || '',
      display_order: card.display_order,
      is_active: card.is_active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setCardImages([])
    reset()
  }

  // Keep image_url form value in sync with the uploader
  const handleImagesChange = (imgs: string[]) => {
    setCardImages(imgs)
    setValue('image_url', imgs[0] || '')
  }

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const onSubmit = async (formData: FeatureCardForm) => {
    if (submitting) return
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        id: editing?.id,
        eyebrow_text: formData.eyebrow_text.trim() || null,
        description: formData.description.trim() || null,
        category_id: formData.category_id.trim() || null,
        link_url: formData.link_url.trim() || null,
        display_order: Number(formData.display_order),
      }

      const result = editing
        ? await updateFeatureCardAction(payload)
        : await createFeatureCardAction(payload)

      if (!result.success) {
        toast.error(result.error || 'Operation failed')
        return
      }

      toast.success(editing ? 'Card updated!' : 'Card created!')
      closeModal()
      fetchCards()
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (card: HomeFeatureCard) => {
    const result = await toggleFeatureCardStatusAction(card.id, !card.is_active)
    if (!result.success) {
      toast.error(result.error || 'Failed to update status')
    } else {
      toast.success(card.is_active ? 'Card deactivated' : 'Card activated')
      fetchCards()
    }
  }

  const handleReorder = async (card: HomeFeatureCard, newOrder: number) => {
    const val = Number(newOrder)
    if (isNaN(val) || val < 0) return
    const result = await reorderFeatureCardAction(card.id, val)
    if (!result.success) {
      toast.error(result.error || 'Failed to update order')
    } else {
      fetchCards()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteFeatureCardAction(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete card')
      } else {
        toast.success('Card deleted')
        fetchCards()
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  const totalCards = cards.length
  const activeCards = cards.filter((c) => c.is_active).length
  const findYourSnackCount = cards.filter((c) => c.section_key === 'find_your_snack').length
  const featuredCount = cards.filter((c) => c.section_key === 'featured_collections').length

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <AdminPageHeader
        title="Homepage Feature Cards"
        description="Manage the Find Your Snack and Featured Collections card sections on the homepage."
        action={
          <Button variant="primary" size="sm" onClick={openCreate} id="add-feature-card-btn">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Feature Card
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Cards', value: totalCards, color: 'text-gray-800' },
          { label: 'Active', value: activeCards, color: 'text-emerald-600' },
          { label: 'Find Your Snack', value: findYourSnackCount, color: 'text-amber-600' },
          { label: 'Featured Collections', value: featuredCount, color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
          >
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="feature-cards-search"
            type="text"
            placeholder="Search title, subtitle, eyebrow…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-gray-50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Section filter */}
          <select
            id="section-filter"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value as typeof sectionFilter)}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          >
            <option value="all">All Sections</option>
            <option value="find_your_snack">Find Your Snack</option>
            <option value="featured_collections">Featured Collections</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-14 h-14 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                  <div className="h-2 bg-gray-50 rounded animate-pulse w-1/2" />
                </div>
                <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title={search || statusFilter !== 'all' || sectionFilter !== 'all'
              ? 'No cards match your filters'
              : 'No feature cards yet'}
            description={search || statusFilter !== 'all' || sectionFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Create your first feature card to populate the homepage sections.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Card
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">
                    Section
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                    Category
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Order
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Card preview */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 relative">
                          {card.image_url ? (
                            <Image
                              src={card.image_url}
                              alt={card.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          {card.eyebrow_text && (
                            <p className="text-[10px] font-bold text-brand-red uppercase tracking-wider mb-0.5">
                              {card.eyebrow_text}
                            </p>
                          )}
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">
                            {card.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Section */}
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          SECTION_BADGE_STYLES[card.section_key] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {SECTION_LABELS[card.section_key] || card.section_key}
                      </span>
                    </td>

                    {/* Linked category */}
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-gray-600">
                        {card.categories?.name || (
                          <span className="text-gray-300 italic">None</span>
                        )}
                      </span>
                    </td>

                    {/* Display order */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min={0}
                        defaultValue={card.display_order}
                        onBlur={(e) => handleReorder(card, parseInt(e.target.value, 10))}
                        className="w-14 text-center text-sm border border-gray-200 rounded-lg py-1 px-1 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                        aria-label={`Display order for ${card.title}`}
                      />
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(card)}
                        aria-label={card.is_active ? 'Deactivate card' : 'Activate card'}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          card.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {card.is_active ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {card.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {card.link_url && (
                          <a
                            href={card.link_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Preview link"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEdit(card)}
                          aria-label={`Edit ${card.title}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(card.id)}
                          aria-label={`Delete ${card.title}`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editing ? 'Edit Feature Card' : 'Add Feature Card'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5" noValidate>

          {/* Section key */}
          <div>
            <label
              htmlFor="section_key"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Section <span className="text-brand-red">*</span>
            </label>
            <select
              id="section_key"
              {...register('section_key', { required: 'Section is required' })}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white"
            >
              <option value="find_your_snack">Find Your Snack</option>
              <option value="featured_collections">Featured Collections</option>
            </select>
            {errors.section_key && (
              <p className="text-xs text-red-600 mt-1">{errors.section_key.message}</p>
            )}
          </div>

          {/* Title + Eyebrow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Title <span className="text-brand-red">*</span>
              </label>
              <Input
                id="title"
                placeholder="e.g. Daily Wellness"
                {...register('title', {
                  required: 'Title is required',
                  maxLength: { value: 100, message: 'Title is too long' },
                })}
                error={errors.title?.message}
              />
            </div>
            <div>
              <label
                htmlFor="eyebrow_text"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Eyebrow Text
              </label>
              <Input
                id="eyebrow_text"
                placeholder="e.g. 100% Natural"
                {...register('eyebrow_text', {
                  maxLength: { value: 100, message: 'Eyebrow text is too long' },
                })}
                error={errors.eyebrow_text?.message}
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label
              htmlFor="subtitle"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Subtitle <span className="text-brand-red">*</span>
            </label>
            <Input
              id="subtitle"
              placeholder="e.g. Wholesome snacks for everyday nourishment…"
              {...register('subtitle', {
                required: 'Subtitle is required',
                maxLength: { value: 200, message: 'Subtitle is too long' },
              })}
              error={errors.subtitle?.message}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-1.5"
            >
              Description{' '}
              <span className="text-gray-400 font-normal text-xs">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Additional details shown in some layouts…"
              {...register('description', {
                maxLength: { value: 500, message: 'Description is too long' },
              })}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Card Image <span className="text-brand-red">*</span>
            </label>
            <ImageUploader
              bucket="banner-images"
              folder="feature-cards"
              images={cardImages}
              onImagesChange={handleImagesChange}
              maxFiles={1}
            />
            {/* Hidden validation field */}
            <input
              type="hidden"
              {...register('image_url', { required: 'An image is required' })}
            />
            {errors.image_url && (
              <p className="text-xs text-red-600 mt-1">{errors.image_url.message}</p>
            )}
          </div>

          {/* Category + Link URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Linked Category{' '}
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <select
                id="category_id"
                {...register('category_id')}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white"
              >
                <option value="">— None —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="link_url"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Link URL{' '}
                <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <Input
                id="link_url"
                placeholder="/category/dry-fruits"
                {...register('link_url', {
                  maxLength: { value: 500, message: 'Link URL is too long' },
                })}
                error={errors.link_url?.message}
              />
            </div>
          </div>

          {/* Display order + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="display_order"
                className="block text-sm font-semibold text-gray-700 mb-1.5"
              >
                Display Order
              </label>
              <Input
                id="display_order"
                type="number"
                min={0}
                {...register('display_order', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be ≥ 0' },
                })}
                error={errors.display_order?.message}
              />
            </div>
            <div className="flex flex-col justify-end pb-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  id="is_active"
                  type="checkbox"
                  {...register('is_active')}
                  className="w-4 h-4 rounded accent-brand-red"
                />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Only active cards appear on the homepage.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editing ? 'Save Changes' : 'Create Card'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Feature Card"
        message={`Are you sure you want to delete this feature card?\n\nThis action cannot be undone and will immediately remove the card from the homepage.`}
        confirmText="Delete Card"
        cancelText="Keep Card"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
