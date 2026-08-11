'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import StatusBadge from '@/components/admin/StatusBadge'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/formatPrice'
import { 
  getAdminOrderDetailAction, 
  updateOrderStatus, 
  updateOrderPaymentStatus 
} from '@/app/admin/actions'
import { canTransitionOrderStatus, OrderStatus } from '@/lib/validations/orderStatus'
import { PAYMENT_STATUSES, PaymentStatus } from '@/lib/validations/paymentStatus'
import { 
  ShoppingBag, 
  User, 
  MapPin, 
  CreditCard, 
  Calendar, 
  Tag, 
  FileText, 
  ArrowLeft, 
  Clock, 
  Truck, 
  CheckCircle2, 
  XCircle,
  Package,
  Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  params: {
    id: string
  }
}

interface OrderItem {
  id: string
  product_name: string
  variant_name: string | null
  sku: string | null
  thumbnail_url: string | null
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderDetail {
  id: string
  order_number: string
  user_id: string | null
  shipping_address: any
  billing_address: any
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total_amount: number
  coupon_code: string | null
  coupon_id: string | null
  payment_method: string
  status: string
  payment_status: string
  customer_notes: string | null
  created_at: string
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  profiles: { email: string } | null
  items: OrderItem[]
}

const ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrderDetailPage({ params }: Props) {
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingPayment, setUpdatingPayment] = useState(false)

  // Status transitions confirm state
  const [confirmData, setConfirmData] = useState<{
    newStatus: string
    message: string
  } | null>(null)

  const fetchOrderDetail = useCallback(async () => {
    try {
      const res = await getAdminOrderDetailAction(params.id)
      if (res.success && res.data) {
        setOrder(res.data as any)
      } else {
        setOrder(null)
      }
    } catch (err) {
      toast.error('Failed to retrieve order details')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchOrderDetail()
  }, [fetchOrderDetail])

  const handleStatusChange = (oldStatus: string, newStatus: string) => {
    if (oldStatus === newStatus) return

    const isDestructive = newStatus === 'cancelled' || newStatus === 'refunded'
    const isReactivation = (oldStatus === 'cancelled' || oldStatus === 'refunded') && !isDestructive

    if (isDestructive || isReactivation) {
      let msg = ''
      if (newStatus === 'cancelled') {
        msg = 'Cancel this order?\n\nCancellation will restore product stock levels and log a return in the inventory ledger.'
      } else if (newStatus === 'refunded') {
        msg = 'Refund this order?\n\nRefund will restore product stock levels and log a return in the inventory ledger.'
      } else {
        msg = 'Reactivate this order?\n\nReactivation will re-deduct stock levels and log a sale. This operation will fail if inventory levels are insufficient.'
      }
      setConfirmData({ newStatus, message: msg })
    } else {
      executeStatusUpdate(newStatus)
    }
  }

  const executeStatusUpdate = async (status: string) => {
    setUpdatingStatus(true)
    try {
      const res = await updateOrderStatus(params.id, status)
      if (res.success) {
        toast.success(`Order status updated to ${status}`)
        await fetchOrderDetail()
      } else {
        toast.error(res.error || 'Failed to update order status')
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setUpdatingStatus(false)
      setConfirmData(null)
    }
  }

  const handlePaymentChange = async (newPaymentStatus: string) => {
    if (!order || order.payment_status === newPaymentStatus) return
    setUpdatingPayment(true)
    try {
      const res = await updateOrderPaymentStatus(params.id, newPaymentStatus)
      if (res.success) {
        toast.success(`Payment status updated to ${newPaymentStatus}`)
        await fetchOrderDetail()
      } else {
        toast.error(res.error || 'Failed to update payment status')
      }
    } catch (err: any) {
      toast.error(err.message || 'Operation failed')
    } finally {
      setUpdatingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Order Not Found"
          description="The requested order does not exist or has been deleted from the database."
          action={
            <Link href="/admin/orders">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Orders
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const sa = order.shipping_address || {}
  const ba = order.billing_address || sa

  // Visual Timeline Mapping
  const timelineSteps = [
    { title: 'Order Placed', timestamp: order.created_at, icon: Clock, desc: 'Order received by the storefront' },
    { title: 'Confirmed', timestamp: order.confirmed_at, icon: CheckCircle2, desc: 'Fulfillment process confirmed' },
    { title: 'Processing', timestamp: order.status === 'processing' || order.shipped_at || order.delivered_at ? 'Active' : null, icon: Layers, desc: 'Items packaging and sorting' },
    { title: 'Shipped', timestamp: order.shipped_at, icon: Truck, desc: 'Dispatched with logistics provider' },
    { title: 'Delivered', timestamp: order.delivered_at, icon: CheckCircle2, desc: 'Order delivered successfully' },
  ]

  const isCancelledOrRefunded = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back to list and Actions header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-5">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-brand-red mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Orders List
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading text-gray-900">Order #{order.order_number}</h1>
            <span className="text-xs text-gray-400 font-mono hidden md:inline">({order.id})</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Received on {new Date(order.created_at).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap gap-3">
          {/* Order Status Select */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Order Status</label>
            <select
              value={order.status}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(order.status, e.target.value)}
              className="text-xs font-semibold rounded-xl border border-gray-200 px-3.5 py-2 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-brand-red/35"
            >
              {ORDER_STATUSES.map((s) => {
                const isCurrent = order.status === s
                const isAllowed = canTransitionOrderStatus(order.status as any, s as any)
                return (
                  <option key={s} value={s} disabled={!isCurrent && !isAllowed} className="bg-white text-gray-900 capitalize">
                    {s.toUpperCase()}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Payment Status Select */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Payment Status</label>
            <select
              value={order.payment_status}
              disabled={updatingPayment}
              onChange={(e) => handlePaymentChange(e.target.value)}
              className="text-xs font-semibold rounded-xl border border-gray-200 px-3.5 py-2 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-brand-red/35"
            >
              {PAYMENT_STATUSES.map((ps) => (
                <option key={ps} value={ps} className="bg-white text-gray-900 capitalize">
                  {ps.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Order items, values summary, notes, coupons) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order items snapshot list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-400" /> Order Items ({order.items.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase">
                    <th className="px-5 py-3">Product Item</th>
                    <th className="px-5 py-3">SKU</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Unit Price</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/10">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumbnail_url} alt={item.product_name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.product_name}</p>
                          {item.variant_name && (
                            <span className="text-[10px] bg-red-50 text-brand-red px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5 uppercase">
                              {item.variant_name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 font-mono">{item.sku || '-'}</td>
                      <td className="px-5 py-3 text-center font-semibold text-gray-700">{item.quantity}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{formatPrice(item.unit_price)}</td>
                      <td className="px-5 py-3 text-right font-bold text-gray-900">{formatPrice(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary & Coupon code details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Coupons and operational logistics notes */}
            <div className="space-y-6">
              {/* Coupon Detail card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-400" /> Discount Coupon
                </h3>
                {order.coupon_code ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                    <div>
                      <span className="text-xs font-mono font-bold bg-white text-emerald-700 px-2 py-1 rounded shadow-sm">
                        {order.coupon_code}
                      </span>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-1">Applied discount</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">-{formatPrice(order.discount_amount)}</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No coupons applied to this order.</p>
                )}
              </div>

              {/* Customer delivery notes card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-400" /> Customer Notes
                </h3>
                {order.customer_notes ? (
                  <div className="bg-gray-50 border border-gray-150/60 p-3.5 rounded-xl text-xs text-gray-600 leading-relaxed">
                    {order.customer_notes}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No customer notes provided.</p>
                )}
              </div>
            </div>

            {/* Price invoicing breakdown summary */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-3">
                Financial Summary
              </h3>
              <div className="space-y-2.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="font-semibold text-emerald-600">-{formatPrice(order.discount_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="font-semibold text-gray-800">+{formatPrice(order.shipping_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST)</span>
                  <span className="font-semibold text-gray-800">{formatPrice(order.tax_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-dashed border-gray-150 pt-3 text-sm text-gray-900 font-bold">
                  <span className="text-brand-red">Grand Total</span>
                  <span className="text-brand-red text-base">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Columns (Customers, delivery snapshot addresses, statuses timeline) */}
        <div className="space-y-6">
          
          {/* Customer information profile card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <User className="w-4 h-4" /> Customer Profile
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-gray-400 font-semibold">Contact Name</p>
                <p className="font-bold text-gray-800 mt-0.5">{sa.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold">Email Address</p>
                <p className="font-bold text-gray-800 mt-0.5">{order.profiles?.email || 'Guest Customer (Profile Deleted)'}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold">Phone Number</p>
                <p className="font-bold text-gray-800 mt-0.5">{sa.phone || '—'}</p>
              </div>
            </div>
          </div>

          {/* Delivery snapshot addresses card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <MapPin className="w-4 h-4" /> Shipping Address
            </h3>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-bold text-gray-800">{sa.full_name}</p>
              <p>{sa.line1}</p>
              {sa.line2 && <p>{sa.line2}</p>}
              <p>{sa.city}, {sa.state} - {sa.postal_code}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">{sa.country || 'India'}</p>
            </div>

            {/* Billing Address check */}
            <div className="border-t border-gray-50 pt-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Billing Address</h4>
              {order.billing_address ? (
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-bold text-gray-800">{ba.full_name}</p>
                  <p>{ba.line1}</p>
                  {ba.line2 && <p>{ba.line2}</p>}
                  <p>{ba.city}, {ba.state} - {ba.postal_code}</p>
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 italic">Identical to shipping address</p>
              )}
            </div>
          </div>

          {/* Fulfillment Status timeline tracker */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-50 pb-3">
              <Clock className="w-4 h-4" /> Fulfillment Timeline
            </h3>

            {isCancelledOrRefunded ? (
              <div className="bg-red-50 text-red-700 border border-red-100 p-4 rounded-xl flex gap-3 text-xs">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase">Order {order.status}</p>
                  <p className="mt-1 leading-normal">
                    Fulfillment stopped. Inventory was restored by the database order-status trigger.
                  </p>
                  {order.cancelled_at && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1.5">
                      Cancelled on: {new Date(order.cancelled_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative pl-6 space-y-5 border-l border-gray-100 ml-3">
                {timelineSteps.map((step, idx) => {
                  const isCompleted = !!step.timestamp
                  const StepIcon = step.icon

                  return (
                    <div key={idx} className="relative">
                      {/* Step Indicator Dot */}
                      <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ring-4 ring-white ${isCompleted ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-300'}`}>
                        <StepIcon className="w-2.5 h-2.5" />
                      </span>
                      
                      {/* Step description */}
                      <div>
                        <h4 className={`text-xs font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                          {step.title}
                        </h4>
                        {isCompleted && typeof step.timestamp === 'string' && step.timestamp !== 'Active' && (
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {new Date(step.timestamp).toLocaleString()}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Confirmation modal for destructive order status transitions */}
      {confirmData && (
        <ConfirmDialog
          isOpen={!!confirmData}
          onClose={() => setConfirmData(null)}
          onConfirm={() => executeStatusUpdate(confirmData.newStatus)}
          title="Update Order Status"
          message={confirmData.message}
          variant="danger"
          loading={updatingStatus}
        />
      )}
    </div>
  )
}
