'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, AlertCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getUserOrders } from '@/lib/data/orders'
import { useCartStore } from '@/lib/store/cartStore'

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
  const [isGuest, setIsGuest] = useState(false)
  const searchParams = useSearchParams()
  const paidOrder = searchParams.get('paid')
  const paymentState = searchParams.get('payment')
  const successOrder = searchParams.get('success') || paidOrder
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    if (paidOrder) clearCart()
  }, [paidOrder, clearCart])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setIsGuest(true)
          setLoading(false)
          return
        }
        setIsGuest(false)
        const data = await getUserOrders(supabase, user.id)
        setOrders(data)
      } catch (err) {
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {paymentState && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 mb-6">
            <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {paymentState === 'pending'
                ? 'Your payment is still being confirmed by the bank. Your order will update automatically once confirmed.'
                : 'Your payment needs manual review by our team. We will contact you shortly.'}
            </p>
          </div>
        )}

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
        ) : isGuest && successOrder ? (
          <div className="bg-white rounded-2xl p-8 shadow-card text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Guest Order Confirmed!</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              We have received your order <strong className="text-gray-900">#{successOrder}</strong>. An email confirmation and receipt have been dispatched to the email address you provided.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-brand-red-dark transition"
              >
                Continue Shopping
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Create an Account
              </Link>
            </div>
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
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = status.icon
              const address = order.shipping_address as any

              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="font-heading font-bold text-gray-900">Order #{order.order_number}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                      <span className="font-bold text-gray-900">{formatPrice(order.total_amount)}</span>
                    </div>
                  </div>

                  <div className="py-4 space-y-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">{item.quantity}x</span>
                          <span className="text-gray-800 font-medium">{item.product_name}</span>
                          {item.variant_name && <span className="text-xs text-gray-400">({item.variant_name})</span>}
                        </div>
                        <span className="text-gray-600">{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                    <div>
                      {address && (
                        <span>Deliver to: {address.full_name}, {address.city} - {address.pincode}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{order.payment_method}</span>
                      <span>•</span>
                      <span className="capitalize">{order.payment_status}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
