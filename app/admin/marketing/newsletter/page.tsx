'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Button from '@/components/ui/Button'
import {
  Mail,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminNewsletterList, NewsletterSubscriber } from '@/lib/data/newsletter'
import {
  deleteNewsletterSubscriberAction,
  toggleNewsletterSubscriberStatusAction,
} from './actions'
import toast from 'react-hot-toast'

const PAGE_SIZE = 15

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filtering states
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)

  // Mutation states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await getAdminNewsletterList(supabase, {
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: statusFilter,
      })
      setSubscribers(res.subscribers)
      setTotalCount(res.totalCount)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load newsletter subscribers')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleStatusFilterChange = (val: 'all' | 'active' | 'inactive') => {
    setStatusFilter(val)
    setPage(1)
  }

  const handleToggleStatus = async (sub: NewsletterSubscriber) => {
    const nextStatus = !sub.is_active
    const result = await toggleNewsletterSubscriberStatusAction(sub.id, nextStatus)
    if (!result.success) {
      toast.error(result.error || 'Failed to update subscriber status')
    } else {
      toast.success(nextStatus ? 'Subscriber activated' : 'Subscriber deactivated')
      fetchSubscribers()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteNewsletterSubscriberAction(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete subscriber')
      } else {
        toast.success('Subscriber deleted')
        // Adjust page if deleting last item on current page
        if (subscribers.length === 1 && page > 1) {
          setPage(page - 1)
        } else {
          fetchSubscribers()
        }
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const activeCount = statusFilter === 'active' ? totalCount : subscribers.filter(s => s.is_active).length

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Newsletter Subscribers"
        description="View, filter, or moderate registered subscribers for newsletter announcements."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: totalCount, color: 'text-gray-800' },
          { label: 'Active Subscriptions', value: activeCount, color: 'text-emerald-600' },
          { label: 'Unsubscribed / Inactive', value: totalCount - activeCount, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
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
            id="newsletter-search"
            type="text"
            placeholder="Search email address…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-gray-50"
          />
        </div>

        {/* Filters */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilterChange(s)}
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

      {/* Subscriber List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="w-1/3 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-20 h-6 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={search || statusFilter !== 'all' ? 'No subscribers match filters' : 'No newsletter subscribers'}
            description={search || statusFilter !== 'all' ? 'Try adjusting your search query.' : 'Emails registered through footer forms appear here.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Email Address
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Subscribed Date
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
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(sub)}
                        aria-label={sub.is_active ? 'Deactivate subscription' : 'Activate subscription'}
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          sub.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {sub.is_active ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-gray-400" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteId(sub.id)}
                        aria-label={`Remove subscriber ${sub.email}`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <p className="text-xs text-gray-500">
            Showing <span className="font-semibold">{((page - 1) * PAGE_SIZE) + 1}</span> to{' '}
            <span className="font-semibold">{Math.min(page * PAGE_SIZE, totalCount)}</span> of{' '}
            <span className="font-semibold">{totalCount}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-600 font-semibold px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Subscriber"
        message={`Are you sure you want to remove this subscriber from the mailing list?\n\nThey will no longer receive any promotional store updates. This action is permanent.`}
        confirmText="Remove Email"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
