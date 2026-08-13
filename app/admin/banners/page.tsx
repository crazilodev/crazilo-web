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
  Image as ImageIcon,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Banner } from '@/types'
import {
  createBannerAction,
  updateBannerAction,
  deleteBannerAction,
  toggleBannerStatusAction,
  reorderBannerAction,
} from './actions'
import toast from 'react-hot-toast'

interface BannerForm {
  title: string
  subtitle: string
  badge_text: string
  cta_text: string
  cta_link: string
  display_order: number
  is_active: boolean
  bg_color: string
  text_color: string
  is_full_width: boolean
  starts_at: string
  ends_at: string
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form & modal state
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [mobileImages, setMobileImages] = useState<string[]>([])
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerForm>({
    defaultValues: {
      cta_text: 'Shop Now',
      cta_link: '/products',
      display_order: 0,
      is_active: true,
      bg_color: '#B91C1C',
      text_color: '#FFFFFF',
      is_full_width: false,
    },
  })

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from('banners').select('*')

      if (statusFilter === 'active') {
        query = query.eq('is_active', true)
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      if (search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`)
      }

      const { data, error } = await query.order('display_order', { ascending: true })
      if (error) throw error
      setBanners(data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load banners')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const openCreate = () => {
    setEditing(null)
    setImages([])
    setMobileImages([])
    setPreviewMode('desktop')
    reset({
      title: '',
      subtitle: '',
      badge_text: '',
      cta_text: 'Shop Now',
      cta_link: '/products',
      display_order: 0,
      is_active: true,
      bg_color: '#B91C1C',
      text_color: '#FFFFFF',
      is_full_width: false,
      starts_at: '',
      ends_at: '',
    })
    setShowModal(true)
  }

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setImages(banner.image_url ? [banner.image_url] : [])
    setMobileImages(banner.mobile_image_url ? [banner.mobile_image_url] : [])
    setPreviewMode('desktop')
    reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      badge_text: banner.badge_text || '',
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      display_order: banner.display_order,
      is_active: banner.is_active,
      bg_color: banner.bg_color || '#8B0000',
      text_color: banner.text_color || '#FFFFFF',
      is_full_width: banner.is_full_width || false,
      starts_at: banner.starts_at ? new Date(banner.starts_at).toISOString().slice(0, 16) : '',
      ends_at: banner.ends_at ? new Date(banner.ends_at).toISOString().slice(0, 16) : '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setImages([])
    setMobileImages([])
    reset()
  }

  const handleImagesChange = (urls: string[]) => {
    setImages(urls)
  }

  const handleMobileImagesChange = (urls: string[]) => {
    setMobileImages(urls)
  }

  const onSubmit = async (formData: BannerForm) => {
    if (images.length === 0) {
      toast.error('Banner image is required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        id: editing?.id,
        image_url: images[0],
        mobile_image_url: mobileImages[0] || null,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
        display_order: Number(formData.display_order),
      }

      const result = editing
        ? await updateBannerAction(payload)
        : await createBannerAction(payload)

      if (!result.success) {
        toast.error(result.error || 'Operation failed')
      } else {
        toast.success(editing ? 'Banner updated!' : 'Banner created!')
        closeModal()
        fetchBanners()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (banner: Banner) => {
    const result = await toggleBannerStatusAction(banner.id, !banner.is_active)
    if (!result.success) {
      toast.error(result.error || 'Failed to update status')
    } else {
      toast.success(banner.is_active ? 'Banner deactivated' : 'Banner activated')
      fetchBanners()
    }
  }

  const handleReorder = async (banner: Banner, newOrder: number) => {
    const val = Number(newOrder)
    if (isNaN(val) || val < 0) return
    const result = await reorderBannerAction(banner.id, val)
    if (!result.success) {
      toast.error(result.error || 'Failed to update order')
    } else {
      fetchBanners()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteBannerAction(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete banner')
      } else {
        toast.success('Banner deleted')
        fetchBanners()
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Homepage Hero Banners"
        description="Configure dynamic slider cards that display at the top of the storefront main page."
        action={
          <Button variant="primary" size="sm" onClick={openCreate} id="add-banner-btn">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Banner
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="banners-search"
            type="text"
            placeholder="Search banner title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
            }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-gray-50"
          />
        </div>

        {/* Filters */}
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
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-20 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : banners.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={search || statusFilter !== 'all' ? 'No banners match filters' : 'No banners yet'}
            description="Create your first slider hero banner to showcase seasonal combos or category highlights."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Banner Preview
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
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Preview details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 relative">
                          <Image src={banner.image_url} alt={banner.title} fill className="object-cover" />
                        </div>
                        <div>
                          {banner.badge_text && (
                            <span className="text-[9px] font-bold bg-brand-gold/15 text-[#D97706] border border-[#D97706]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {banner.badge_text}
                            </span>
                          )}
                          <h4 className="font-bold text-gray-900 text-sm mt-1">{banner.title}</h4>
                          <p className="text-xs text-gray-500 truncate max-w-[280px]">{banner.subtitle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min={0}
                        defaultValue={banner.display_order}
                        onBlur={(e) => handleReorder(banner, parseInt(e.target.value, 10))}
                        className="w-14 text-center text-sm border border-gray-200 rounded-lg py-1 px-1 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                        aria-label={`Display order for ${banner.title}`}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        aria-label={banner.is_active ? 'Deactivate banner' : 'Activate banner'}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          banner.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {banner.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(banner)}
                          aria-label={`Edit banner`}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(banner.id)}
                          aria-label={`Delete banner`}
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

      {/* Editor Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Banner' : 'New Banner'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Banner Title *
              </label>
              <Input
                id="title"
                placeholder="e.g. Premium Cashew Nuts Sale"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
              />
            </div>

            <div>
              <label htmlFor="subtitle" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Subtitle
              </label>
              <Input id="subtitle" placeholder="e.g. Up to 20% off all sizes" {...register('subtitle')} />
            </div>

            <div>
              <label htmlFor="badge_text" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Badge Text
              </label>
              <Input id="badge_text" placeholder="e.g. LIMITED OFFER" {...register('badge_text')} />
            </div>

            <div>
              <label htmlFor="cta_text" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                CTA Text *
              </label>
              <Input id="cta_text" {...register('cta_text', { required: true })} />
            </div>

            <div>
              <label htmlFor="cta_link" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                CTA Link *
              </label>
              <Input id="cta_link" {...register('cta_link', { required: true })} />
            </div>

            <div>
              <label htmlFor="bg_color" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                BG Color Hex
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={watch('bg_color') || '#8B0000'}
                  onChange={(e) => setValue('bg_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <Input id="bg_color" placeholder="#8B0000" {...register('bg_color')} className="flex-1" />
              </div>
            </div>

            <div>
              <label htmlFor="text_color" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Text Color Hex
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={watch('text_color') || '#FFFFFF'}
                  onChange={(e) => setValue('text_color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <Input id="text_color" placeholder="#FFFFFF" {...register('text_color')} className="flex-1" />
              </div>
            </div>

            <div>
              <label htmlFor="starts_at" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Starts At (Scheduling)
              </label>
              <Input id="starts_at" type="datetime-local" {...register('starts_at')} />
            </div>

            <div>
              <label htmlFor="ends_at" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Ends At (Scheduling)
              </label>
              <Input id="ends_at" type="datetime-local" {...register('ends_at')} />
            </div>

            <div>
              <label htmlFor="display_order" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Display Order
              </label>
              <Input id="display_order" type="number" {...register('display_order')} />
            </div>

            <div className="flex flex-col gap-2.5 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input id="is_active" type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-brand-red" />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input id="is_full_width" type="checkbox" {...register('is_full_width')} className="w-4 h-4 rounded accent-brand-red" />
                <span className="text-sm font-semibold text-gray-700">Full Width Layout (No Text)</span>
              </label>
            </div>

            <div className="sm:col-span-2 bg-amber-50/50 border border-amber-200/50 rounded-xl p-3 text-xs text-amber-800 space-y-1">
              <p className="font-bold">💡 Banner Composition Guide</p>
              <p>You can upload images of any size/ratio. The storefront separates text from photos to prevent overlapping. The container maintains a stable responsive aspect-ratio. For full-width banners, recommend using high-resolution files with details centered.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Banner Image * (Desktop layout or Default)
              </label>
              <ImageUploader bucket="banner-images" folder="hero" images={images} onImagesChange={handleImagesChange} maxFiles={1} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Mobile Banner Image (Optional - will crop desktop image if empty)
              </label>
              <ImageUploader bucket="banner-images" folder="hero" images={mobileImages} onImagesChange={handleMobileImagesChange} maxFiles={1} />
            </div>

            {/* Real-time storefront preview simulator */}
            <div className="sm:col-span-2 border border-gray-150 rounded-2xl p-4 bg-gray-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Storefront Preview</p>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-2.5 py-1 transition-colors ${previewMode === 'desktop' ? 'bg-gray-900 text-white' : 'bg-white text-gray-650 hover:bg-gray-100'}`}
                  >
                    Desktop View
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-2.5 py-1 transition-colors ${previewMode === 'mobile' ? 'bg-gray-900 text-white' : 'bg-white text-gray-650 hover:bg-gray-100'}`}
                  >
                    Mobile View
                  </button>
                </div>
              </div>

              <div
                className="relative w-full border border-gray-200 rounded-xl overflow-hidden shadow-inner mx-auto transition-all duration-300 flex items-center"
                style={{
                  backgroundColor: watch('bg_color') || '#8B0000',
                  maxWidth: previewMode === 'desktop' ? '100%' : '280px',
                  aspectRatio: previewMode === 'desktop' ? '16/6' : '4/5.2',
                }}
              >
                {/* Background image preview */}
                <div className="absolute inset-0 w-full h-full z-0">
                  {watch('is_full_width') ? (
                    (previewMode === 'mobile' && mobileImages[0]) ? (
                      <Image src={mobileImages[0]} alt="Mobile preview" fill className="object-cover object-center" unoptimized />
                    ) : images[0] ? (
                      <Image src={images[0]} alt="Desktop preview" fill className="object-cover object-center" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px]">No image uploaded</div>
                    )
                  ) : (
                    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: watch('bg_color') || '#8B0000' }} />
                  )}
                </div>

                {/* Content text preview */}
                <div className="relative z-10 w-full h-full flex items-center px-4">
                  {!watch('is_full_width') ? (
                    <div className="w-full grid grid-cols-12 gap-2 items-center h-full py-2">
                      <div className="col-span-8 flex flex-col justify-center space-y-1 text-left">
                        {watch('badge_text') && (
                          <span
                            className="inline-block text-[7px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded-full w-max"
                            style={{
                              color: watch('text_color') || '#FFFFFF',
                              backgroundColor: watch('text_color') ? `${watch('text_color')}20` : 'rgba(255,255,255,0.1)'
                            }}
                          >
                            {watch('badge_text')}
                          </span>
                        )}
                        <h4
                          className="font-heading text-xs font-black leading-tight uppercase truncate"
                          style={{ color: watch('text_color') || '#FFFFFF' }}
                        >
                          {watch('title') || 'Banner Title'}
                        </h4>
                        <p
                          className="text-[9px] font-medium leading-relaxed truncate"
                          style={{ color: watch('text_color') ? `${watch('text_color')}D9` : '#FFFFFFD9' }}
                        >
                          {watch('subtitle') || 'Banner subtitle text...'}
                        </p>
                        <div className="pt-0.5">
                          <span className="inline-block text-[7px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white bg-black/30">
                            {watch('cta_text') || 'SHOP NOW'}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-4 flex items-center justify-center h-full">
                        {images[0] ? (
                          <div className="relative w-10 h-10 aspect-square flex items-center justify-center">
                            <Image src={images[0]} alt="product preview" fill className="object-contain" unoptimized />
                          </div>
                        ) : (
                          <div className="text-[7px] text-white/40">No photo</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/10 text-white/50 text-[9px] font-bold">
                      Full Width Layout Mode (No text overlay)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editing ? 'Save Changes' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message={`Are you sure you want to delete this hero banner?\n\nThis slider card will immediately disappear from the homepage storefront.`}
        confirmText="Delete Card"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
