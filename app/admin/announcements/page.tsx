'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlusCircle, Edit, Trash2, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Announcement {
  id: string; text: string; link: string | null; display_order: number; is_active: boolean
}

interface AnnouncementForm { text: string; link: string; display_order: number }

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, reset } = useForm<AnnouncementForm>()

  const fetch = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('announcements').select('*').order('display_order')
    setAnnouncements(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const onSubmit = async (data: AnnouncementForm) => {
    setSubmitting(true)
    try {
      const supabase = createClient()
      const payload = { text: data.text, link: data.link || null, display_order: data.display_order, is_active: true }
      if (editing) {
        await supabase.from('announcements').update(payload).eq('id', editing.id)
        toast.success('Updated!')
      } else {
        await supabase.from('announcements').insert(payload)
        toast.success('Announcement added!')
      }
      reset(); setEditing(null); setShowForm(false); fetch()
    } catch (err: any) { toast.error(err.message) } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">Announcements</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditing(null); reset() }} variant="primary">
          <PlusCircle className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add'}
        </Button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">These announcements appear in the scrolling ticker bar at the top of your store.</p>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Announcement Text *" placeholder="🎉 Free Shipping on Orders Above ₹599" {...register('text', { required: true })} id="ann-text" />
            <Input label="Link (Optional)" placeholder="/products" {...register('link')} id="ann-link" />
            <Input label="Display Order" type="number" defaultValue={0} {...register('display_order')} id="ann-order" />
            <div className="flex gap-3">
              <Button type="submit" variant="primary" loading={submitting} id="ann-submit">{editing ? 'Update' : 'Add'} Announcement</Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset() }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-2xl" />) :
          announcements.map(ann => (
            <div key={ann.id} className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />
              <p className="flex-1 text-sm text-gray-800 font-medium">{ann.text}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={async () => {
                  const supabase = createClient()
                  await supabase.from('announcements').update({ is_active: !ann.is_active }).eq('id', ann.id)
                  fetch()
                }} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ann.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {ann.is_active ? 'Active' : 'Hidden'}
                </button>
                <button onClick={() => { setEditing(ann); reset({ text: ann.text, link: ann.link || '', display_order: ann.display_order }); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={async () => {
                  if (!confirm('Delete?')) return
                  const supabase = createClient()
                  await supabase.from('announcements').delete().eq('id', ann.id)
                  fetch()
                  toast.success('Deleted')
                }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
