'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Tag, PlusCircle, Edit, Trash2, Search, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Coupon } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
  toggleCouponStatusAction,
} from './actions'
import toast from 'react-hot-toast'

interface CouponForm {
  code: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_order_amount: number
  maximum_discount: number
  usage_limit: number
  is_active: boolean
  starts_at: string
  expires_at: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Form & modal state
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CouponForm>({
    defaultValues: {
      discount_type: 'percentage',
      minimum_order_amount: 0,
      is_active: true,
      starts_at: new Date().toISOString().slice(0, 16),
    },
  })

  const discountType = watch('discount_type')

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from('coupons').select('*')

      if (statusFilter === 'active') {
        query = query.eq('is_active', true)
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      if (search.trim()) {
        query = query.ilike('code', `%${search.trim()}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      setCoupons(data || [])
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const openCreate = () => {
    setEditing(null)
    reset({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      minimum_order_amount: 0,
      maximum_discount: 0,
      usage_limit: 0,
      is_active: true,
      starts_at: new Date().toISOString().slice(0, 16),
      expires_at: '',
    })
    setShowModal(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon)
    reset({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type as 'percentage' | 'fixed',
      discount_value: Number(coupon.discount_value),
      minimum_order_amount: Number(coupon.minimum_order_amount),
      maximum_discount: coupon.maximum_discount ? Number(coupon.maximum_discount) : 0,
      usage_limit: coupon.usage_limit ? Number(coupon.usage_limit) : 0,
      is_active: coupon.is_active,
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    reset()
  }

  const onSubmit = async (formData: CouponForm) => {
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        id: editing?.id,
        discount_value: Number(formData.discount_value),
        minimum_order_amount: Number(formData.minimum_order_amount),
        maximum_discount: formData.maximum_discount ? Number(formData.maximum_discount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        expires_at: formData.expires_at || null,
      }

      const result = editing
        ? await updateCouponAction(payload)
        : await createCouponAction(payload)

      if (!result.success) {
        toast.error(result.error || 'Operation failed')
      } else {
        toast.success(editing ? 'Coupon updated!' : 'Coupon created!')
        closeModal()
        fetchCoupons()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    const result = await toggleCouponStatusAction(coupon.id, !coupon.is_active)
    if (!result.success) {
      toast.error(result.error || 'Failed to update coupon status')
    } else {
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated')
      fetchCoupons()
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const result = await deleteCouponAction(deleteId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete coupon')
      } else {
        toast.success('Coupon deleted successfully!')
        fetchCoupons()
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
        title="Coupons"
        description="Configure percentage or fixed amount promo codes to discount checkout cart prices."
        action={
          <Button variant="primary" size="sm" onClick={openCreate} id="add-coupon-btn">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Coupon
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="coupons-search"
            type="text"
            placeholder="Search promo code…"
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <EmptyState
            icon={Tag}
            title={search || statusFilter !== 'all' ? 'No coupons match filters' : 'No coupons yet'}
            description="Create your first discount promo code to launch sales campaigns."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Discount</th>
                  <th className="px-5 py-3 text-left">Min Order</th>
                  <th className="px-5 py-3 text-left">Used / Limit</th>
                  <th className="px-5 py-3 text-left">Expires</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="font-mono font-bold text-sm text-gray-900">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-brand-red">
                      {coupon.discount_type === 'percentage'
                        ? `${coupon.discount_value}%`
                        : formatPrice(Number(coupon.discount_value))}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {formatPrice(Number(coupon.minimum_order_amount))}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">
                      {coupon.used_count} / {coupon.usage_limit || '∞'}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        aria-label={coupon.is_active ? 'Deactivate coupon' : 'Activate coupon'}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          coupon.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {coupon.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          aria-label="Edit coupon"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-red hover:bg-red-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(coupon.id)}
                          aria-label="Delete coupon"
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
      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Coupon' : 'New Coupon'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Promo Code *
              </label>
              <Input
                id="code"
                placeholder="e.g. CRAZILO20"
                {...register('code', { required: 'Code is required' })}
                error={errors.code?.message}
              />
            </div>

            <div>
              <label htmlFor="discount_type" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Discount Type *
              </label>
              <select
                id="discount_type"
                {...register('discount_type')}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm input-brand bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label htmlFor="discount_value" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Discount Value *
              </label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                {...register('discount_value', {
                  required: 'Discount value is required',
                  valueAsNumber: true,
                  min: { value: 0.01, message: 'Discount must be positive' },
                })}
                error={errors.discount_value?.message}
              />
            </div>

            <div>
              <label htmlFor="minimum_order_amount" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Min Order Amount (₹) *
              </label>
              <Input
                id="minimum_order_amount"
                type="number"
                {...register('minimum_order_amount', {
                  required: 'Min order is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Min order must be at least 0' },
                })}
                error={errors.minimum_order_amount?.message}
              />
            </div>

            <div>
              <label htmlFor="maximum_discount" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Max Discount Limit (₹)
              </label>
              <Input id="maximum_discount" type="number" {...register('maximum_discount')} />
            </div>

            <div>
              <label htmlFor="usage_limit" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Usage Limit Count
              </label>
              <Input id="usage_limit" type="number" placeholder="Unlimited if blank" {...register('usage_limit')} />
            </div>

            <div>
              <label htmlFor="starts_at" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Starts At *
              </label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register('starts_at', { required: 'Start time is required' })}
                error={errors.starts_at?.message}
              />
            </div>

            <div>
              <label htmlFor="expires_at" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Expires At
              </label>
              <Input id="expires_at" type="datetime-local" {...register('expires_at')} />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                Description
              </label>
              <Input id="description" placeholder="e.g. 10% off on all gift combos" {...register('description')} />
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
              {editing ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon?\n\nIt will immediately be removed. If this coupon is already referenced by existing checkout orders, deletion will fail to protect historical order records."
        confirmText="Delete Coupon"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  )
}
