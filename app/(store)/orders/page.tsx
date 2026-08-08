'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-purple-600 bg-purple-50', icon: AlertCircle },
  shipped: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-600 bg-gray-100', icon: XCircle },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const successOrder = searchParams.get('success')

  useEffect(() => {
    const fetchOrders = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {successOrder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 mb-6"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">Order Placed Successfully</p>
              <p className="text-sm text-emerald-600">Order #{successOrder} has been confirmed. You&apos;ll receive updates via email.</p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 skeleton h-32" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl">
            <Package className="w-16 h-16 text-gray-200 mb-4" />
            <h2 className="font-heading text-xl font-bold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-400 mb-6">Place your first order and it&apos;ll show up here!</p>
            <Link href="/products" className="bg-brand-red text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-red-dark transition-colors">
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status]
              const StatusIcon = statusConfig.icon
              return (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">#{order.order_number}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusConfig.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig.label}
                      </span>
                      <span className="font-bold text-brand-red text-lg">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(order.items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <span className="text-sm text-gray-700">{item.product_name}</span>
                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.tracking_number && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-brand-red">
                      <Truck className="w-4 h-4" />
                      <span>Tracking: {order.tracking_number}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
