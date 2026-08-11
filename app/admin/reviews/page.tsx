'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import {
  MessageSquare,
  Search,
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  User,
  ShoppingBag,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAdminReviewsList, Review } from '@/lib/data/reviews'
import { deleteReviewAction, toggleReviewApprovalAction } from './actions'
import toast from 'react-hot-toast'

interface ExtendedReview extends Review {
  products: { name: string } | null
  profiles: { email: string; full_name: string | null } | null
}

const PAGE_SIZE = 12

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ExtendedReview[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')
  const [page, setPage] = useState(1)

  // Interaction States
  const [selectedReview, setSelectedReview] = useState<ExtendedReview | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await getAdminReviewsList(supabase, {
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: statusFilter,
        rating: ratingFilter,
      })
      setReviews(res.reviews as ExtendedReview[])
      setTotalCount(res.totalCount)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, ratingFilter])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleStatusFilterChange = (val: 'all' | 'approved' | 'pending') => {
    setStatusFilter(val)
    setPage(1)
  }

  const handleRatingFilterChange = (val: string) => {
    setRatingFilter(val === 'all' ? 'all' : Number(val))
    setPage(1)
  }

  const handleToggleApproval = async (review: ExtendedReview) => {
    const nextStatus = !review.is_approved
    const result = await toggleReviewApprovalAction(review.id, nextStatus)
    if (!result.success) {
      toast.error(result.error || 'Failed to moderate review')
    } else {
      toast.success(nextStatus ? 'Review approved and published' : 'Review set to pending')
      fetchReviews()
      // If modal is open, update state locally
      if (selectedReview?.id === review.id) {
        setSelectedReview({ ...selectedReview, is_approved: nextStatus })
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteReviewAction(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete review')
      } else {
        toast.success('Review deleted')
        if (selectedReview?.id === deleteId) {
          setSelectedReview(null)
        }
        if (reviews.length === 1 && page > 1) {
          setPage(page - 1)
        } else {
          fetchReviews()
        }
      }
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Product Reviews & Moderation"
        description="Moderate, approve, reject, or remove customer reviews posted on product catalog items."
      />

      {/* Toolbar / Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="reviews-search"
            type="text"
            placeholder="Search review content..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-gray-50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          {/* Rating Dropdown */}
          <select
            id="rating-filter"
            value={ratingFilter}
            onChange={(e) => handleRatingFilterChange(e.target.value)}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-red/30"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Status Buttons */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-semibold">
            {(['all', 'approved', 'pending'] as const).map((s) => (
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
      </div>

      {/* Review Cards Grid (Better suited than tables for reading text blocks) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-gray-50 rounded animate-pulse w-3/4" />
              <div className="h-10 bg-gray-50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reviews found"
          description={search || statusFilter !== 'all' || ratingFilter !== 'all' ? 'Try clearing your filters or search query.' : 'Reviews submitted by users on product pages appear here.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Meta Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                      {review.profiles?.full_name || 'Anonymous User'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">
                      {review.profiles?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {review.rating}
                  </div>
                </div>

                {/* Product Reference */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-100/50">
                  <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0 text-brand-red" />
                  <span className="font-semibold truncate">
                    {review.products?.name || 'Deleted Product'}
                  </span>
                </div>

                {/* Review Text */}
                <div className="space-y-1">
                  {review.title && (
                    <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{review.title}</h4>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                    {review.body || <span className="text-gray-300 italic">No text provided.</span>}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-4">
                <button
                  onClick={() => setSelectedReview(review)}
                  className="text-xs text-brand-red font-bold hover:underline"
                >
                  View Details
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleApproval(review)}
                    aria-label={review.is_approved ? 'Revoke review approval' : 'Approve review'}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                      review.is_approved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    {review.is_approved ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        Approved
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-yellow-600" />
                        Pending
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setDeleteId(review.id)}
                    aria-label={`Remove review`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Review Details"
        size="md"
      >
        {selectedReview && (
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg font-black text-gray-900">
                  {selectedReview.profiles?.full_name || 'Anonymous User'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">{selectedReview.profiles?.email}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-sm font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {selectedReview.rating} Stars
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</p>
              <div className="flex items-center gap-2 text-sm text-gray-800 bg-gray-50 border border-gray-100 p-3 rounded-2xl font-bold">
                <ShoppingBag className="w-4 h-4 text-brand-red flex-shrink-0" />
                {selectedReview.products?.name || 'Deleted Product'}
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Review Content</p>
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2">
                {selectedReview.title && (
                  <h4 className="font-extrabold text-sm text-gray-900">{selectedReview.title}</h4>
                )}
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedReview.body || <span className="text-gray-300 italic">No text content provided.</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-mono">
                Submitted on: {new Date(selectedReview.created_at).toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedReview.is_approved ? 'outline' : 'primary'}
                  size="sm"
                  onClick={() => handleToggleApproval(selectedReview)}
                >
                  {selectedReview.is_approved ? 'Revoke Approval' : 'Approve & Publish'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedReview(null)
                    setDeleteId(selectedReview.id)
                  }}
                  className="text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message={`Are you sure you want to delete this review?\n\nThis will permanently remove it from the product page and moderation records. This action is irreversible.`}
        confirmText="Delete Review"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
