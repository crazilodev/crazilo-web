'use client'

import { useWishlistStore } from '@/lib/store/wishlistStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function useWishlist() {
  const store = useWishlistStore()
  const { user } = useAuth()
  const router = useRouter()

  const toggle = (productId: string, productName?: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites!', { duration: 2500 })
      const currentPath = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}&action=favorite&wishlist_item=${productId}`)
      return
    }

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
