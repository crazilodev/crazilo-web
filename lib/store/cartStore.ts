import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem, CartState, Product, ProductVariant } from '@/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product: Product, variant?: ProductVariant, quantity = 1) => {
        const { items } = get()
        const itemId = variant ? `${product.id}-${variant.id}` : product.id
        const existingItem = items.find((item) => item.id === itemId)

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === itemId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            isOpen: true,
          })
        } else {
          const newItem: CartItem = {
            id: itemId,
            product,
            variant: variant || null,
            quantity,
            price: variant ? variant.price : product.price,
          }
          set({ items: [...items, newItem], isOpen: true })
        }
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })
      },

      clearCart: () => set({ items: [], isOpen: false }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      openCart: () => set({ isOpen: true }),

      closeCart: () => set({ isOpen: false }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: 'crazilo-cart',
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
