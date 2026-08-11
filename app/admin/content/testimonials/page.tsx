'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import Image from 'next/image'
import { 
  Star, 
  Search, 
  Filter, 
  PlusCircle, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminTestimonialsList } from '@/lib/data/content'
import { 
  createTestimonialAction, 
  updateTestimonialAction, 
  deleteTestimonialAction, 
  toggleTestimonialStatusAction,
  reorderTestimonialAction
} from './actions'
import toast from 'react-hot-toast'

interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  text: string
  product_name: string
  avatar_initial: string
  avatar_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TestimonialForm {
  name: string
  location: string
  rating: number
  text: string
  product_name: string
  avatar_initial: string
  avatar_url: string
  display_order: number
  is_active: boolean
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form & Modal States
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Confirm delete states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<TestimonialForm>({
    defaultValues: {
      rating: 5,
      display_order: 0,
      is_active: true,
      avatar_initial: ''
    }
  })

  const watchName = watch('name')

  // Automatically compute avatar initial from name
  useEffect(() => {
    if (watchName && watchName.trim().length > 0) {
      setValue('avatar_initial', watchName.trim().charAt(0).toUpperCase())
    }
  }, [watchName, setValue])

  const fetchTestimonials = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const data = await getAdminTestimonialsList(supabase, {
        search: search.trim() || undefined,
        status: statusFilter
      })
      setTestimonials(data)
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch testimonials list')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const handleOpenCreate = () => {
    setEditing(null)
    setImages([])
    reset({
      name: '',
      location: '',
      rating: 5,
      text: '',
      product_name: '',
      avatar_initial: '',
      avatar_url: '',
      display_order: 0,
      is_active: true
    })
    setShowModal(true)
  }

  const handleOpenEdit = (t: Testimonial) => {
    setEditing(t)
    setImages(t.avatar_url ? [t.avatar_url] : [])
    reset({
      name: t.name,
      location: t.location,
      rating: t.rating,
      text: t.text,
      product_name: t.product_name,
      avatar_initial: t.avatar_initial,
      avatar_url: t.avatar_url || '',
      display_order: t.display_order,
      is_active: t.is_active
    })
    setShowModal(true)
  }

  const onSubmit = async (data: TestimonialForm) => {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        rating: Number(data.rating),
        display_order: Number(data.display_order),
        avatar_url: images[0] || null,
        id: editing?.id
      }

      const res = editing 
        ? await updateTestimonialAction(payload)
        : await createTestimonialAction(payload)

      if (res.success) {
        toast.success(editing ? 'Testimonial updated!' : 'Testimonial added!')
        setShowModal(false)
        fetchTestimonials()
      } else {
        toast.error(res.error || 'Failed to save testimonial')
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
      const res = await deleteTestimonialAction(deleteId)
      if (res.success) {
        toast.success('Testimonial removed successfully!')
        setDeleteId(null)
        fetchTestimonials()
      } else {
        toast.error(res.error || 'Failed to remove testimonial')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (t: Testimonial) => {
    try {
      const res = await toggleTestimonialStatusAction(t.id, !t.is_active)
      if (res.success) {
        toast.success(`Testimonial is now ${!t.is_active ? 'active' : 'inactive'}`)
        fetchTestimonials()
      } else {
        toast.error(res.error || 'Failed to update visibility')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    }
  }

  const handleReorder = async (t: Testimonial, newOrderStr: string) => {
    const val = parseInt(newOrderStr)
    if (isNaN(val) || val < 0) return

    try {
      const res = await reorderTestimonialAction(t.id, val)
      if (res.success) {
        toast.success('Display order updated')
        fetchTestimonials()
      } else {
        toast.error(res.error || 'Failed to reorder')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Page Header */}
      <AdminPageHeader
        title="Homepage Testimonials"
        description="Configure client quotes, locations, ratings, and avatars shown in the storefront testimonial marquee slider."
      />

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotes, clients, location..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none input-brand"
            id="testimonial-search-input"
          />
        </div>

        {/* Filters and Add Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
            id="testimonial-status-filter"
          >
            <option value="all">All Visibility</option>
            <option value="active">Active Storefront</option>
            <option value="inactive">Hidden Storefront</option>
          </select>

          <Button onClick={handleOpenCreate} variant="primary" size="sm">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add Testimonial
          </Button>
        </div>

      </div>

      {/* Content Directory Table */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Star}
              title="No testimonials found"
              description="Add a testimonial to begin collecting dynamic storefront customer reviews."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                  <th className="px-6 py-4">Client Detail</th>
                  <th className="px-6 py-4">Quote Text</th>
                  <th className="px-6 py-4">Product Purchased</th>
                  <th className="px-6 py-4 text-center">Rating</th>
                  <th className="px-6 py-4 text-center">Display Order</th>
                  <th className="px-6 py-4 text-center">Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150/40">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/20 transition-colors">
                    
                    {/* Avatar/Initial, Name, Location */}
                    <td className="px-6 py-4 font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red font-bold text-sm flex items-center justify-center flex-shrink-0 uppercase overflow-hidden">
                        {t.avatar_url ? (
                          <Image src={t.avatar_url} alt={t.name} width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                          t.avatar_initial
                        )}
                      </div>
                      <div>
                        <span className="block font-bold">{t.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{t.location}</span>
                      </div>
                    </td>

                    {/* Quote text snippet */}
                    <td className="px-6 py-4 text-gray-500 max-w-xs font-medium">
                      <p className="line-clamp-2 italic">&ldquo;{t.text}&rdquo;</p>
                    </td>

                    {/* Product purchased */}
                    <td className="px-6 py-4 text-gray-700 font-semibold uppercase tracking-wide">
                      {t.product_name}
                    </td>

                    {/* Rating stars display */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < t.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Display Order reordering */}
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min={0}
                        defaultValue={t.display_order}
                        onBlur={(e) => handleReorder(t, e.target.value)}
                        className="w-16 text-center border border-gray-200 rounded-lg px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red/35"
                      />
                    </td>

                    {/* Toggle Visibility status */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className="focus:outline-none"
                      >
                        {t.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.8 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 cursor-pointer hover:bg-emerald-100 uppercase transition-all">
                            <Eye className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.8 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400 border border-gray-200 cursor-pointer hover:bg-gray-100 uppercase transition-all">
                            <EyeOff className="w-3 h-3" /> Hidden
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Edit/Delete Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit Quote"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Quote"
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

      {/* Edit/Create Form Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? 'Edit Testimonial Quote' : 'Add Store Testimonial'}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
            
            {/* Avatar image uploader */}
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-2">
                Client Avatar Image (Optional)
              </label>
              <ImageUploader
                bucket="avatars"
                folder="testimonials"
                images={images}
                onImagesChange={setImages}
                maxFiles={1}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Client Name *
                </label>
                <Input
                  placeholder="e.g. Ramesh Patel"
                  {...register('name', { required: 'Name is required' })}
                  error={errors.name?.message}
                  id="test-name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Location / City *
                </label>
                <Input
                  placeholder="e.g. Ahmedabad, Gujarat"
                  {...register('location', { required: 'Location is required' })}
                  error={errors.location?.message}
                  id="test-location"
                />
              </div>

              {/* Product purchased */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Product Purchased *
                </label>
                <Input
                  placeholder="e.g. Premium Cashews"
                  {...register('product_name', { required: 'Product name is required' })}
                  error={errors.product_name?.message}
                  id="test-product"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Rating Stars *
                </label>
                <select
                  {...register('rating', { required: 'Rating is required', valueAsNumber: true })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-red/35 font-medium text-gray-800"
                  id="test-rating"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                  <option value={2}>2 Stars ★★☆☆☆</option>
                  <option value={1}>1 Star ★☆☆☆☆</option>
                </select>
              </div>

              {/* Display Order */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Display order
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  {...register('display_order', { valueAsNumber: true })}
                  error={errors.display_order?.message}
                  id="test-order"
                />
              </div>

              {/* Avatar Initial (auto-calculated) */}
              <div>
                <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Avatar initial (Auto-calculated)
                </label>
                <Input
                  readOnly
                  className="bg-gray-50 text-gray-400 cursor-not-allowed uppercase"
                  {...register('avatar_initial')}
                  id="test-initial"
                />
              </div>

            </div>

            {/* Testimonial Quote Text */}
            <div>
              <label className="block font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Client Testimonial Quote *
              </label>
              <textarea
                placeholder="Write the customer quote text here..."
                rows={4}
                {...register('text', { required: 'Quote text is required' })}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:outline-none input-brand font-medium text-gray-800"
                id="test-text"
              />
              {errors.text && (
                <p className="text-[10px] text-brand-red mt-1 font-semibold">{errors.text.message}</p>
              )}
            </div>

            {/* Active Status Check */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="test-active"
                {...register('is_active')}
                className="w-4 h-4 rounded text-brand-red focus:ring-brand-red"
              />
              <label htmlFor="test-active" className="font-semibold text-gray-700 select-none cursor-pointer">
                Publish on storefront homepage
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting} id="test-submit-btn">
                {editing ? 'Save Changes' : 'Publish Testimonial'}
              </Button>
            </div>

          </form>
        </Modal>
      )}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <ConfirmDialog
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Testimonial"
          message="Are you sure you want to permanently delete this testimonial quote? This action cannot be undone and it will be removed from the homepage marquee immediately."
          loading={deleting}
        />
      )}

    </div>
  )
}
