'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils/formatPrice'
import { orderSchema, OrderFormData } from '@/lib/validations/orderSchema'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'address' | 'review'>('address')
  const totalPrice = getTotalPrice()
  const shipping = totalPrice >= 599 ? 0 : 50
  const grandTotal = totalPrice + shipping

  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { payment_method: 'cod', same_as_shipping: true },
  })

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const onSubmit = async (data: OrderFormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login?redirect=/checkout'); return }

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

      clearCart()
      toast.success('Order placed successfully!')
      router.push(`/orders?success=${result.order_number}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
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
                  <Input label="Full Name" {...register('shipping_address.full_name')} error={errors.shipping_address?.full_name?.message} id="checkout-name" />
                  <Input label="Phone Number" type="tel" {...register('shipping_address.phone')} error={errors.shipping_address?.phone?.message} id="checkout-phone" />
                  <div className="sm:col-span-2">
                    <Input label="Address Line 1" placeholder="House no, Street name" {...register('shipping_address.address_line1')} error={errors.shipping_address?.address_line1?.message} id="checkout-address1" />
                  </div>
                  <div className="sm:col-span-2">
                    <Input label="Address Line 2 (Optional)" placeholder="Apartment, floor, etc." {...register('shipping_address.address_line2')} id="checkout-address2" />
                  </div>
                  <Input label="City" {...register('shipping_address.city')} error={errors.shipping_address?.city?.message} id="checkout-city" />
                  <Input label="State" {...register('shipping_address.state')} error={errors.shipping_address?.state?.message} id="checkout-state" />
                  <Input label="Pincode" {...register('shipping_address.pincode')} error={errors.shipping_address?.pincode?.message} id="checkout-pincode" />
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
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand-red bg-red-50 cursor-pointer">
                    <input type="radio" {...register('payment_method')} value="cod" defaultChecked className="accent-brand-red" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer opacity-50">
                    <input type="radio" {...register('payment_method')} value="online" disabled className="accent-brand-red" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Online Payment</p>
                      <p className="text-xs text-gray-500">Coming soon</p>
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
