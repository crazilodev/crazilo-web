'use client'

import { useCartStore } from '@/lib/store/cartStore'
import { Product, ProductVariant } from '@/types'
import toast from 'react-hot-toast'

export function useCart() {
  const store = useCartStore()

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    quantity = 1
  ) => {
    store.addItem(product, variant, quantity)
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      duration: 2000,
    })
  }

  return {
    ...store,
    addToCart,
  }
}
