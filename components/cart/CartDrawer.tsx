'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cartStore'
import { formatPrice } from '@/lib/utils/formatPrice'
import Button from '@/components/ui/Button'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, clearCart } =
    useCartStore()
  const totalPrice = getTotalPrice()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-brand-red" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-gray-900">Your Cart</h2>
                  <p className="text-xs text-gray-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-700 mb-1">Your cart is empty</h3>
                    <p className="text-sm text-gray-400">Add some delicious products to get started!</p>
                  </div>
                  <Button onClick={closeCart} variant="primary" size="md">
                    Start Shopping
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 px-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                          {item.product.thumbnail_url ? (
                            <Image
                              src={item.product.thumbnail_url}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          {item.variant && (
                            <p className="text-xs text-gray-500">{item.variant.name}</p>
                          )}
                          <p className="text-sm font-bold text-brand-red mt-0.5">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-red hover:text-brand-red transition-colors font-bold text-sm"
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-brand-red hover:text-brand-red transition-colors font-bold text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-5 space-y-4 bg-white">
                {/* Free shipping progress */}
                {totalPrice < 599 && (
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="flex justify-between text-xs text-amber-700 mb-2">
                      <span>Add {formatPrice(599 - totalPrice)} more for free shipping</span>
                      <span>{Math.round((totalPrice / 599) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalPrice / 599) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/cart" onClick={closeCart}>
                    <Button variant="outline" size="md" fullWidth>
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/checkout" onClick={closeCart}>
                    <Button variant="primary" size="md" fullWidth>
                      Checkout
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
