'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Banner } from '@/types'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface BannerForm {
  title: string
  subtitle: string
  badge_text: string
  cta_text: string
  cta_link: string
  display_order: number
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, reset } = useForm<BannerForm>()

  const fetchBanners = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('banners').select('*').order('display_order')
    setBanners(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchBanners() }, [])

  const openEdit = (banner: Banner) => {
    setEditing(banner)
    setImages(banner.image_url ? [banner.image_url] : [])
    reset({ title: banner.title, subtitle: banner.subtitle || '', badge_text: banner.badge_text || '', cta_text: banner.cta_text, cta_link: banner.cta_link, display_order: banner.display_order })
    setShowForm(true)
  }

  const onSubmit = async (data: BannerForm) => {
    if (!images[0]) { toast.error('Please upload a banner image'); return }
    setSubmitting(true)
    try {
      const supabase = createClient()
      const payload = { ...data, image_url: images[0], is_active: true }
      if (editing) {
        await supabase.from('banners').update(payload).eq('id', editing.id)
        toast.success('Banner updated!')
      } else {
        await supabase.from('banners').insert(payload)
        toast.success('Banner created!')
      }
      reset(); setImages([]); setEditing(null); setShowForm(false); fetchBanners()
    } catch (err: any) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    const supabase = createClient()
    await supabase.from('banners').delete().eq('id', id)
    fetchBanners()
    toast.success('Banner deleted')
  }

  const toggleActive = async (banner: Banner) => {
    const supabase = createClient()
    await supabase.from('banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
    fetchBanners()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Hero Banners</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset(); setImages([]) }} variant="primary">
          <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Banner'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <h2 className="font-heading font-bold text-xl mb-5">{editing ? 'Edit Banner' : 'New Banner'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Banner Image *</p>
              <ImageUploader bucket="banner-images" folder="banners" images={images} onImagesChange={setImages} maxFiles={1} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Title *" {...register('title', { required: true })} id="banner-title" />
              <Input label="Badge Text" placeholder="e.g. NEW ARRIVALS" {...register('badge_text')} id="banner-badge" />
              <div className="sm:col-span-2"><Input label="Subtitle" {...register('subtitle')} id="banner-subtitle" /></div>
              <Input label="Button Text" {...register('cta_text')} placeholder="Shop Now" id="banner-cta-text" />
              <Input label="Button Link" {...register('cta_link')} placeholder="/products" id="banner-cta-link" />
              <Input label="Display Order" type="number" {...register('display_order')} id="banner-order" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={submitting} id="banner-submit">{editing ? 'Update' : 'Create'} Banner</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-card">No banners yet. Add your first hero banner!</div>
        ) : (
          banners.map(banner => (
            <div key={banner.id} className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-48 h-32 relative bg-gray-100 flex-shrink-0">
                  {banner.image_url && <Image src={banner.image_url} alt={banner.title} fill className="object-cover" />}
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {banner.badge_text && <p className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-1">{banner.badge_text}</p>}
                      <h3 className="font-heading font-bold text-gray-900">{banner.title}</h3>
                      {banner.subtitle && <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{banner.subtitle}</p>}
                      <p className="text-xs text-gray-400 mt-1">Order: {banner.display_order} · CTA: {banner.cta_text} → {banner.cta_link}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleActive(banner)} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${banner.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {banner.is_active ? 'Active' : 'Hidden'}
                      </button>
                      <button onClick={() => openEdit(banner)} className="p-2 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteBanner(banner.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
