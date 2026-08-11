'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { 
  Sparkles, 
  Search, 
  Filter, 
  PlusCircle, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  Leaf,
  Award,
  Truck,
  RefreshCw,
  Shield,
  ShieldCheck,
  Package,
  Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminHomeHighlightsList } from '@/lib/data/content'
import { 
  createHomeHighlightAction, 
  updateHomeHighlightAction, 
  deleteHomeHighlightAction, 
  toggleHomeHighlightStatusAction,
  reorderHomeHighlightAction
} from './actions'
import toast from 'react-hot-toast'

interface HomeHighlight {
  id: string
  icon_key: string
  title: string
  description: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface HighlightForm {
  icon_key: string
  title: string
  description: string
  display_order: number
  is_active: boolean
}

// Maps icon keys to their visual components for rendering in the table list
const ICON_MAP: Record<string, any> = {
  'hero_100_natural': Leaf,
  'hero_premium_quality': ShieldCheck,
  'hero_freshly_packed': Package,
  'why_100_natural': Leaf,
  'why_premium_quality': Award,
  'why_fast_delivery': Truck,
  'why_safe_sealed': Shield,
  'why_easy_returns': RefreshCw,
}

const PRESET_ICONS = [
  { value: 'hero_100_natural', label: 'Leaf (Hero Slider)' },
  { value: 'hero_premium_quality', label: 'Shield Check (Hero Slider)' },
  { value: 'hero_freshly_packed', label: 'Package (Hero Slider)' },
  { value: 'hero_no_preservatives', label: 'Sparkles (Hero Slider)' },
  { value: 'why_100_natural', label: 'Leaf (Why Choose Us)' },
  { value: 'why_premium_quality', label: 'Award (Why Choose Us)' },
  { value: 'why_fast_delivery', label: 'Truck (Why Choose Us)' },
  { value: 'why_safe_sealed', label: 'Shield (Why Choose Us)' },
  { value: 'why_easy_returns', label: 'Refresh (Why Choose Us)' },
]

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<HomeHighlight[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form / Modal states
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<HomeHighlight | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Confirm delete states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HighlightForm>({
    defaultValues: {
      display_order: 0,
      is_active: true,
      icon_key: 'hero_100_natural'
    }
  })

  const fetchHighlights = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const data = await getAdminHomeHighlightsList(supabase, {
        search: search.trim() || undefined,
        status: statusFilter
      })
      setHighlights(data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load highlights list')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchHighlights()
  }, [fetchHighlights])

  const handleOpenCreate = () => {
    setEditing(null)
    reset({
      title: '',
      description: '',
      icon_key: 'hero_100_natural',
      display_order: 0,
      is_active: true
    })
    setShowModal(true)
  }

  const handleOpenEdit = (h: HomeHighlight) => {
    setEditing(h)
    reset({
      title: h.title,
      description: h.description,
      icon_key: h.icon_key,
      display_order: h.display_order,
      is_active: h.is_active
    })
    setShowModal(true)
  }

  const onSubmit = async (data: HighlightForm) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        display_order: Number(data.display_order),
        id: editing?.id
      }

      const res = editing
        ? await updateHomeHighlightAction(payload)
        : await createHomeHighlightAction(payload)

      if (res.success) {
        toast.success(editing ? 'Highlight updated!' : 'Highlight created!')
        setShowModal(false)
        fetchHighlights()
      } else {
        toast.error(res.error || 'Failed to save highlight')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await deleteHomeHighlightAction(deleteId)
      if (res.success) {
        toast.success('Highlight deleted!')
        setDeleteId(null)
        fetchHighlights()
      } else {
        toast.error(res.error || 'Failed to delete highlight')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (h: HomeHighlight) => {
    try {
      const res = await toggleHomeHighlightStatusAction(h.id, !h.is_active)
      if (res.success) {
        toast.success(`Highlight visibility updated to ${!h.is_active ? 'active' : 'inactive'}`)
        fetchHighlights()
      } else {
        toast.error(res.error || 'Failed to update visibility')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    }
  }

  const handleReorder = async (h: HomeHighlight, newOrderStr: string) => {
    const val = parseInt(newOrderStr)
    if (isNaN(val) || val < 0) return

    try {
      const res = await reorderHomeHighlightAction(h.id, val)
      if (res.success) {
        toast.success('Display order updated')
        fetchHighlights()
      } else {
        toast.error(res.error || 'Failed to update display order')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <AdminPageHeader
        title="Homepage Highlights"
        description="Configure brand value cards and quality trust features displayed in the slider header and Choose us grid."
      />

      {/* Toolbar filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search highlights, title, tags..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none input-brand"
            id="highlight-search-input"
          />
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
            id="highlight-status-filter"
          >
            <option value="all">All visibility</option>
            <option value="active">Active storefront</option>
            <option value="inactive">Hidden storefront</option>
          </select>

          <Button onClick={handleOpenCreate} variant="primary" size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add Highlight
          </Button>
        </div>

      </div>

      {/* Table list */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : highlights.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Sparkles}
              title="No highlights found"
              description="Configure brand highlight trust features to show them on the homepage sections."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                  <th className="px-6 py-4">Visual Icon</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Description Description</th>
                  <th className="px-6 py-4 text-center">Display Order</th>
                  <th className="px-6 py-4 text-center">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/40">
                {highlights.map((h) => {
                  const Icon = ICON_MAP[h.icon_key] || Sparkles
                  const isHero = h.icon_key.startsWith('hero_')

                  return (
                    <tr key={h.id} className="hover:bg-gray-50/20 transition-colors">
                      
                      {/* Icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 px-1 py-0.2 rounded border border-amber-100 uppercase">
                            {isHero ? 'Hero Slider' : 'Why Us'}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4 font-bold text-gray-800">
                        {h.title}
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-gray-500 max-w-xs font-medium">
                        <p className="line-clamp-2">{h.description}</p>
                      </td>

                      {/* Display Order */}
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min={0}
                          defaultValue={h.display_order}
                          onBlur={(e) => handleReorder(h, e.target.value)}
                          className="w-16 text-center border border-gray-200 rounded-lg px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
                        />
                      </td>

                      {/* Visibility Status */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(h)}
                          className="focus:outline-none"
                        >
                          {h.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 cursor-pointer hover:bg-emerald-100 uppercase transition-all">
                              <Eye className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-250 cursor-pointer hover:bg-gray-100 uppercase transition-all">
                              <EyeOff className="w-3 h-3" /> Hidden
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Edit/Delete Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                            title="Edit Highlight"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(h.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Highlight"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Form modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? 'Edit Homepage Highlight' : 'Create Homepage Highlight'}
          size="md"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
            
            {/* Title */}
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Highlight Title *
              </label>
              <Input
                placeholder="e.g. 100% Organic Products"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                id="high-title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Description Details *
              </label>
              <textarea
                placeholder="Write highlight description details here..."
                rows={3}
                {...register('description', { required: 'Description is required' })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand font-medium text-gray-800"
                id="high-description"
              />
              {errors.description && (
                <p className="text-[10px] text-brand-red mt-1 font-semibold">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Icon Selection */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Visual Layout Icon *
                </label>
                <select
                  {...register('icon_key', { required: 'Icon type is required' })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/35 font-medium text-gray-800"
                  id="high-icon"
                >
                  {PRESET_ICONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Display Order *
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  {...register('display_order', { required: 'Display order is required', valueAsNumber: true })}
                  error={errors.display_order?.message}
                  id="high-order"
                />
              </div>

            </div>

            {/* Visibility checkbox */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="high-active"
                {...register('is_active')}
                className="w-4 h-4 rounded text-brand-red focus:ring-brand-red"
              />
              <label htmlFor="high-active" className="font-semibold text-gray-700 select-none cursor-pointer">
                Publish on storefront homepage
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting} id="high-submit-btn">
                {editing ? 'Save Changes' : 'Create Highlight'}
              </Button>
            </div>

          </form>
        </Modal>
      )}

      {/* Confirm Deletion */}
      {deleteId && (
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Highlight"
          message="Are you sure you want to permanently delete this homepage highlight? This cannot be undone."
          loading={deleting}
        />
      )}

    </div>
  )
}
