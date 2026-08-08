'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cartStore'
import { formatPrice } from '@/lib/utils/formatPrice'
import Button from '@/components/ui/Button'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore()
  const totalPrice = getTotalPrice()
  const shipping = totalPrice >= 599 ? 0 : 50
  const grandTotal = totalPrice + shipping

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some delicious products to get started!</p>
            <Link href="/products">
              <Button variant="primary" size="lg">
                Start Shopping <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{items.length} items</p>
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
                  Clear all
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-card">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    {item.product.thumbnail_url ? (
                      <Image src={item.product.thumbnail_url} alt={item.product.name} width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-amber-50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product.slug}`} className="font-semibold text-gray-900 hover:text-brand-red transition-colors line-clamp-1">
                      {item.product.name}
                    </Link>
                    {item.variant && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                    <p className="font-bold text-brand-red mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-card">
                <h2 className="font-heading font-bold text-xl text-gray-900 mb-5">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-600 font-medium' : 'font-medium'}>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      Add {formatPrice(599 - totalPrice)} more for free shipping!
                    </p>
                  )}
                  <div className="divider-gold" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-red">{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="block mt-6">
                  <Button variant="primary" size="lg" fullWidth>
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="ghost" size="md" fullWidth className="mt-3">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
