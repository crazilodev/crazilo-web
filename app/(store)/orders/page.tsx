'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/types'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Package, ChevronRight, Truck, CheckCircle, Clock, XCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getUserOrders } from '@/lib/data/orders'
import { useCartStore } from '@/lib/store/cartStore'
import { useAuthModalStore } from '@/lib/store/authModalStore'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-purple-600 bg-purple-50', icon: AlertCircle },
  shipped: { label: 'Shipped', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-gray-600 bg-gray-100', icon: XCircle },
}

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const searchParams = useSearchParams()
  const paidOrder = searchParams.get('paid')
  const paymentState = searchParams.get('payment')
  const successOrder = searchParams.get('success') || paidOrder
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    if (paidOrder || successOrder) clearCart()
  }, [paidOrder, successOrder, clearCart])

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
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">
          {successOrder ? 'Order Confirmation' : 'My Orders'}
        </h1>

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

        {/* High-visibility celebratory banner when order is confirmed */}
        {successOrder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner ring-4 ring-emerald-50">
                <CheckCircle className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                    Confirmed
                  </span>
                  <span className="font-mono text-sm font-extrabold text-gray-900">
                    Order #{successOrder}
                  </span>
                </div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-gray-900">
                  Thank You! Your Order Has Been Placed 🎉
                </h2>
                <p className="text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
                  We have successfully received your order and sent a confirmation receipt to your email.
                  Our team is preparing your package with farm-fresh care.
                </p>

                <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                  <Link
                    href="/products"
                    className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-[#991B1B] text-white text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                  >
                    Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {isGuest && (
                    <button
                      type="button"
                      onClick={() => useAuthModalStore.getState().openRegister()}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold transition-all"
                    >
                      Create Account to Track Orders
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 skeleton h-32" />
            ))}
          </div>
        ) : isGuest && !successOrder ? (
          <div className="bg-white rounded-2xl p-8 shadow-card text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">Track Your Orders</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Log in to your Crazilo account to view your past purchases, shipment statuses, and delivery receipts.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => useAuthModalStore.getState().openLogin()}
                className="w-full sm:w-auto px-6 py-3 bg-brand-red text-white font-semibold rounded-xl hover:bg-brand-red-dark transition cursor-pointer"
              >
                Log In
              </button>
              <Link
                href="/products"
                className="w-full sm:w-auto px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : orders.length === 0 && !successOrder ? (
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

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  )
}
