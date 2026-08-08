import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { WishlistState } from '@/types'

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId: string) => {
        if (!get().items.includes(productId)) {
          set({ items: [...get().items, productId] })
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((id) => id !== productId) })
      },

      hasItem: (productId: string) => get().items.includes(productId),

      toggleItem: (productId: string) => {
        if (get().hasItem(productId)) {
          get().removeItem(productId)
        } else {
          get().addItem(productId)
        }
      },
    }),
    {
      name: 'crazilo-wishlist',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
    }
  )
)
