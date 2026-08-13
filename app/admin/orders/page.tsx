'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateOrderStatus } from '@/app/admin/actions'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import StatusBadge from '@/components/admin/StatusBadge'
import { canTransitionOrderStatus } from '@/lib/validations/orderStatus'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmData, setConfirmData] = useState<{
    orderId: string
    oldStatus: string
    newStatus: string
    message: string
  } | null>(null)
  const [updating, setUpdating] = useState(false)

  const fetchOrders = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false })
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) query = query.ilike('order_number', `%${search}%`)
    const { data } = await query
    setOrders(data || [])
    setLoading(false)
  }, [statusFilter, search])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = (orderId: string, oldStatus: string, newStatus: string) => {
    if (oldStatus === newStatus) return

    const isDestructive = newStatus === 'cancelled' || newStatus === 'refunded'
    const isReactivation = (oldStatus === 'cancelled' || oldStatus === 'refunded') && !isDestructive

    if (isDestructive || isReactivation) {
      let msg = ''
      if (newStatus === 'cancelled') {
        msg = 'Cancel this order?\n\nCancellation will restore inventory according to the database order lifecycle.'
      } else if (newStatus === 'refunded') {
        msg = 'Refund this order?\n\nRefund will restore inventory according to the database order lifecycle.'
      } else {
        msg = 'Reactivate this order?\n\nThis will re-deduct product inventory and may fail if stock is unavailable.'
      }

      setConfirmData({ orderId, oldStatus, newStatus, message: msg })
    } else {
      executeStatusUpdate(orderId, newStatus)
    }
  }

  const executeStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(true)
    const res = await updateOrderStatus(orderId, status)
    if (res.success) {
      toast.success(`Order status updated to ${status}`)
      await fetchOrders()
    } else {
      toast.error(res.error || 'Failed to update order status')
    }
    setUpdating(false)
    setConfirmData(null)
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    processing: 'bg-purple-50 text-purple-700',
    shipped: 'bg-indigo-50 text-indigo-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
    refunded: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Orders"
        description="Monitor status, payments, shipping, and moderate customer purchases."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm input-brand"
            id="admin-order-search"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-brand-red text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-5 py-5">
                      <div className="skeleton h-6 rounded" />
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="px-5 py-4 font-mono text-sm font-bold text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {(order.shipping_address as any)?.full_name || '—'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(order.shipping_address as any)?.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {(order.items || []).length} items
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-red text-sm">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, order.status, e.target.value)
                          }
                          className={`text-xs font-semibold rounded-full px-3 py-1.5 border border-gray-150 cursor-pointer ${
                            STATUS_COLORS[order.status]
                          } focus:outline-none focus:ring-1 focus:ring-brand-red/35`}
                        >
                          {STATUSES.filter((s) => s !== 'all').map((s) => {
                            const isCurrent = order.status === s
                            const isAllowed = canTransitionOrderStatus(order.status as any, s as any)
                            return (
                               <option
                                key={s}
                                value={s}
                                disabled={!isCurrent && !isAllowed}
                                className="bg-white text-gray-900 capitalize font-sans disabled:text-gray-300"
                              >
                                {s}
                              </option>
                            )
                          })}
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-gray-100 p-4 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))
          ) : orders.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No orders found</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 text-xs">
                {/* Top row */}
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-sm text-gray-900">#{order.order_number}</span>
                  <span className="text-gray-450">
                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Customer */}
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Customer</p>
                  <p className="font-semibold text-gray-850">{(order.shipping_address as any)?.full_name || '—'}</p>
                  <p className="text-[10px] text-gray-400">{(order.shipping_address as any)?.phone}</p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2.5 border-t border-b border-gray-100 py-3 my-1">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Items</p>
                    <p className="font-bold text-gray-800">{(order.items || []).length} items</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Amount</p>
                    <p className="font-bold text-brand-red">{formatPrice(order.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Payment</p>
                    <div className="mt-0.5">
                      <StatusBadge status={order.payment_status} type="payment" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">Fulfillment</p>
                    <div className="mt-0.5 relative inline-block">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, order.status, e.target.value)
                        }
                        className={`text-[10px] font-bold rounded-full px-2.5 py-1 border border-gray-150 cursor-pointer ${
                          STATUS_COLORS[order.status]
                        } focus:outline-none`}
                      >
                        {STATUSES.filter((s) => s !== 'all').map((s) => {
                          const isCurrent = order.status === s
                          const isAllowed = canTransitionOrderStatus(order.status as any, s as any)
                          return (
                            <option
                              key={s}
                              value={s}
                              disabled={!isCurrent && !isAllowed}
                              className="bg-white text-gray-900 capitalize font-sans disabled:text-gray-200"
                            >
                              {s}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {confirmData && (
        <ConfirmDialog
          isOpen={!!confirmData}
          onClose={() => setConfirmData(null)}
          onConfirm={() =>
            executeStatusUpdate(confirmData.orderId, confirmData.newStatus)
          }
          title="Update Order Status"
          message={confirmData.message}
          variant="danger"
          loading={updating}
        />
      )}
    </div>
  )
}
