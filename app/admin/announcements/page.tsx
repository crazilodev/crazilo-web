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
  Megaphone,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementStatusAction,
} from './actions'
import toast from 'react-hot-toast'

interface Announcement {
  id: string
  text: string
  link: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AnnouncementForm {
  text: string
  link: string
  display_order: number
  is_active: boolean
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Modal / form state
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementForm>({
    defaultValues: {
      display_order: 0,
      is_active: true,
    },
  })

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from('announcements').select('*')

      if (statusFilter === 'active') {
        query = query.eq('is_active', true)
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      if (search.trim()) {
        query = query.ilike('text', `%${search.trim()}%`)
      }

      const { data, error } = await query.order('display_order', { ascending: true })
      if (error) throw error
      setAnnouncements(data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  const openCreate = () => {
    setEditing(null)
    reset({
      text: '',
      link: '',
      display_order: 0,
      is_active: true,
    })
    setShowModal(true)
  }

  const openEdit = (ann: Announcement) => {
    setEditing(ann)
    reset({
      text: ann.text,
      link: ann.link || '',
      display_order: ann.display_order,
      is_active: ann.is_active,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    reset()
  }

  const onSubmit = async (formData: AnnouncementForm) => {
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        id: editing?.id,
        link: formData.link.trim() || null,
        display_order: Number(formData.display_order),
      }

      const result = editing
        ? await updateAnnouncementAction(payload)
        : await createAnnouncementAction(payload)

      if (!result.success) {
        toast.error(result.error || 'Operation failed')
      } else {
        toast.success(editing ? 'Announcement updated!' : 'Announcement created!')
        closeModal()
        fetchAnnouncements()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (ann: Announcement) => {
    const result = await toggleAnnouncementStatusAction(ann.id, !ann.is_active)
    if (!result.success) {
      toast.error(result.error || 'Failed to update status')
    } else {
      toast.success(ann.is_active ? 'Announcement hidden' : 'Announcement activated')
      fetchAnnouncements()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteAnnouncementAction(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete announcement')
      } else {
        toast.success('Announcement deleted')
        fetchAnnouncements()
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Announcements"
        description="Configure scrolling text items that ticker at the very top header area of your store."
        action={
          <Button variant="primary" size="sm" onClick={openCreate} id="add-announcement-btn">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Announcement
          </Button>
        }
      />

      {/* Info notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Megaphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700 leading-relaxed">
          These announcements appear in the scrolling ticker bar at the top of your store.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="announcements-search"
            type="text"
            placeholder="Search text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title={search || statusFilter !== 'all' ? 'No announcements match filters' : 'No announcements yet'}
            description="Create your first announcement banner to broadcast store hours, thresholds, or policies."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Announcement Text
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
                {announcements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div>
                        <p>{ann.text}</p>
                        {ann.link && (
                          <span className="text-[10px] text-gray-400 font-mono">Link: {ann.link}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-500">{ann.display_order}</td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(ann)}
                        aria-label={ann.is_active ? 'Deactivate announcement' : 'Activate announcement'}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          ann.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {ann.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {ann.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(ann)}
                          aria-label="Edit announcement"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(ann.id)}
                          aria-label="Delete announcement"
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
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Announcement' : 'New Announcement'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Announcement Text *
              </label>
              <Input
                id="text"
                placeholder="e.g. 🎉 Free Shipping on orders above ₹599!"
                {...register('text', { required: 'Text is required' })}
                error={errors.text?.message}
              />
            </div>

            <div>
              <label htmlFor="link" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Navigation Link (Optional)
              </label>
              <Input id="link" placeholder="e.g. /category/gift-boxes" {...register('link')} />
            </div>

            <div>
              <label htmlFor="display_order" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Display Order
              </label>
              <Input id="display_order" type="number" {...register('display_order')} />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input id="is_active" type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-brand-red" />
                <span className="text-sm font-semibold text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={closeModal} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              {editing ? 'Save Changes' : 'Create Announcement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to delete this announcement?\n\nIt will immediately be removed from the store banner ticker rotation."
        confirmText="Delete Announcement"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
