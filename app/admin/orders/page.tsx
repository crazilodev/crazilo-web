'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Search, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchOrders = async () => {
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
  }

  useEffect(() => { fetchOrders() }, [statusFilter, search])

  const updateStatus = async (orderId: string, status: string) => {
    const supabase = createClient()
    const updateData: any = { status }
    if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString()
    if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
    if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

    const { error } = await supabase.from('orders').update(updateData).eq('id', orderId)
    if (error) { toast.error('Failed to update status'); return }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any, ...updateData } : o))
    toast.success(`Order status updated to ${status}`)
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm input-brand" id="admin-order-search" />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-brand-red text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-red'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead><tr>
              <th className="px-4 py-3 text-left">Order #</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Payment</th>
            </tr></thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="skeleton h-6 rounded" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm font-bold text-gray-900">#{order.order_number}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{(order.shipping_address as any)?.full_name || '—'}</p>
                        <p className="text-xs text-gray-400">{(order.shipping_address as any)?.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{(order.items || []).length} items</td>
                    <td className="px-4 py-3 font-bold text-brand-red text-sm">{formatPrice(order.total_amount)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2.5 py-1 border-0 cursor-pointer ${STATUS_COLORS[order.status]} focus:outline-none`}
                        style={{ appearance: 'none' }}
                      >
                        {STATUSES.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s} className="bg-white text-gray-900 capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                        {order.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
