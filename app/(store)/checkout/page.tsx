'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, CreditCard, CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/formatPrice'
import { orderSchema, OrderFormData } from '@/lib/validations/orderSchema'
import Button from '@/components/ui/Button'
import { useShippingSettings } from '@/lib/hooks/useShippingSettings'
import Input from '@/components/ui/Input'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string
    orderId: string
    totalAmount: number
    shippingAddress: any
    items: any[]
    paymentMethod: string
  } | null>(null)
  const totalPrice = getTotalPrice()
  const { calculateShipping } = useShippingSettings()
  const shipping = calculateShipping(totalPrice)
  const grandTotal = totalPrice + shipping

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { payment_method: 'cod', same_as_shipping: true },
  })

  const selectedPaymentMethod = watch('payment_method') ?? 'cod'

  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        if (user.email) setValue('shipping_address.email', user.email)
        if (user.user_metadata?.full_name) {
          setValue('shipping_address.full_name', user.user_metadata.full_name)
        }
      }
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null
      setCurrentUser(user)
      if (user) {
        if (user.email) setValue('shipping_address.email', user.email)
        if (user.user_metadata?.full_name) {
          setValue('shipping_address.full_name', user.user_metadata.full_name)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setValue])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('payment')
    if (p === 'failed') toast.error('Payment failed. Your order was not placed. Please try again.')
    else if (p === 'cancelled') toast.error('Payment cancelled. Your order was not placed.')
    else if (p === 'invalid') toast.error('Payment response could not be verified. If money was debited, contact support.')
  }, [])

  if (items.length === 0 && !confirmedOrder) {
    router.push('/cart')
    return null
  }

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true)
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant?.id || null,
        quantity: item.quantity,
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping_address: data.shipping_address,
          billing_address: data.same_as_shipping ? data.shipping_address : data.billing_address,
          items: orderItems,
          coupon_code: data.coupon_code,
          customer_notes: data.customer_notes,
          payment_method: data.payment_method,
        }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to place order')

      if (data.payment_method === 'online') {
        const payRes = await fetch('/api/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: result.order_id }),
        })
        const pay = await payRes.json()
        if (!payRes.ok) throw new Error(pay.error || 'Unable to start payment')

        const form = document.createElement('form')
        form.method = 'POST'
        form.action = pay.action
        Object.entries(pay.fields as Record<string, string>).forEach(([name, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = name
          input.value = value
          form.appendChild(input)
        })
        document.body.appendChild(form)
        form.submit()
        return
      }

      const itemsSnapshot = [...items]
      clearCart()
      setConfirmedOrder({
        orderNumber: result.order_number,
        orderId: result.order_id,
        totalAmount: grandTotal,
        shippingAddress: data.shipping_address,
        items: itemsSnapshot,
        paymentMethod: data.payment_method,
      })
      toast.success('Order placed successfully! 🎉', { duration: 6000 })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 text-center animate-fadeIn">
          {/* Animated check badge */}
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            Order Confirmed
          </span>

          <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Thank You for Your Order! 🎉
          </h1>
          <p className="text-gray-600 text-sm mt-2 max-w-md mx-auto">
            We have received your order and are preparing it with care. A confirmation email has been dispatched.
          </p>

          {/* Order reference banner */}
          <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Order Number</p>
              <p className="text-base font-extrabold text-gray-900 font-mono">#{confirmedOrder.orderNumber}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment Method</p>
              <p className="text-xs font-bold text-emerald-700 capitalize">
                {confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
              <p className="text-base font-black text-brand-red">{formatPrice(confirmedOrder.totalAmount)}</p>
            </div>
          </div>

          {/* Shipping destination summary */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-white text-left mb-6 text-xs text-gray-600 space-y-1">
            <p className="font-bold text-gray-900 text-sm mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-red" /> Delivery Details
            </p>
            <p className="font-semibold text-gray-800">{confirmedOrder.shippingAddress.full_name}</p>
            <p>{confirmedOrder.shippingAddress.address_line1}{confirmedOrder.shippingAddress.address_line2 ? `, ${confirmedOrder.shippingAddress.address_line2}` : ''}</p>
            <p>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.pincode}</p>
            <p className="text-gray-500 pt-1">Contact: {confirmedOrder.shippingAddress.phone} {confirmedOrder.shippingAddress.email ? `• ${confirmedOrder.shippingAddress.email}` : ''}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-red hover:bg-[#991B1B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/orders?success=${confirmedOrder.orderNumber}`}
              className="w-full sm:w-auto px-7 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center"
            >
              View in My Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-red" />
                  </div>
                  <h2 className="font-heading font-bold text-xl">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    {...register('shipping_address.full_name')}
                    error={errors.shipping_address?.full_name?.message}
                    id="checkout-name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    {...register('shipping_address.email')}
                    error={errors.shipping_address?.email?.message}
                    id="checkout-email"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    {...register('shipping_address.phone')}
                    error={errors.shipping_address?.phone?.message}
                    id="checkout-phone"
                  />
                  <Input
                    label="Pincode"
                    {...register('shipping_address.pincode')}
                    error={errors.shipping_address?.pincode?.message}
                    id="checkout-pincode"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Address Line 1"
                      placeholder="House no, Street name"
                      {...register('shipping_address.address_line1')}
                      error={errors.shipping_address?.address_line1?.message}
                      id="checkout-address1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      label="Address Line 2 (Optional)"
                      placeholder="Apartment, floor, etc."
                      {...register('shipping_address.address_line2')}
                      id="checkout-address2"
                    />
                  </div>
                  <Input
                    label="City"
                    {...register('shipping_address.city')}
                    error={errors.shipping_address?.city?.message}
                    id="checkout-city"
                  />
                  <Input
                    label="State"
                    {...register('shipping_address.state')}
                    error={errors.shipping_address?.state?.message}
                    id="checkout-state"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                  <textarea
                    {...register('customer_notes')}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-brand-red"
                    rows={2}
                    placeholder="Any special instructions..."
                    id="checkout-notes"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-brand-red" />
                  </div>
                  <h2 className="font-heading font-bold text-xl">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-brand-red bg-red-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('payment_method')}
                      value="cod"
                      className="accent-brand-red w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === 'online'
                        ? 'border-brand-red bg-red-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('payment_method')}
                      value="online"
                      className="accent-brand-red w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Online Payment</p>
                      <p className="text-xs text-gray-500">Cards, UPI, Net Banking via PayU</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-card sticky top-24">
                <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 relative">
                        {item.product.thumbnail_url ? (
                          <Image src={item.product.thumbnail_url} alt={item.product.name} fill className="object-cover" />
                        ) : <div className="w-full h-full bg-gray-100" />}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                        {item.variant && <p className="text-xs text-gray-400">{item.variant.name}</p>}
                      </div>
                      <span className="text-sm font-semibold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="divider-gold mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-600">Shipping</span><span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                </div>
                <div className="divider-gold mb-4" />
                <div className="flex justify-between font-bold text-lg mb-6">
                  <span>Total</span>
                  <span className="text-brand-red">{formatPrice(grandTotal)}</span>
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} id="place-order-btn">
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
