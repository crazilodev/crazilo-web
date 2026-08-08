'use client'

import { useWishlistStore } from '@/lib/store/wishlistStore'
import toast from 'react-hot-toast'

export function useWishlist() {
  const store = useWishlistStore()

  const toggle = (productId: string, productName?: string) => {
    const wasInWishlist = store.hasItem(productId)
    store.toggleItem(productId)
    if (wasInWishlist) {
      toast.success('Removed from wishlist', { icon: '💔', duration: 1500 })
    } else {
      toast.success(`${productName || 'Item'} added to wishlist!`, {
        icon: '❤️',
        duration: 1500,
      })
    }
  }

  return {
    ...store,
    toggle,
  }
}
