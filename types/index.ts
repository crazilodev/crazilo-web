import type { Database } from '@/lib/supabase/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

export type Category = Database['public']['Tables']['categories']['Row']

export type ProductVariant = Database['public']['Tables']['product_variants']['Row']

export type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Category | null
  variants?: ProductVariant[]
}

export type Banner = Database['public']['Tables']['banners']['Row']

export type Announcement = Database['public']['Tables']['announcements']['Row']

export type Testimonial = Database['public']['Tables']['testimonials']['Row']

export type HomeFeatureCard = Database['public']['Tables']['home_feature_cards']['Row']

export type HomeHighlight = Database['public']['Tables']['home_highlights']['Row']

export type Coupon = Database['public']['Tables']['coupons']['Row']

export type Address = Database['public']['Tables']['addresses']['Row']

export type OrderItem = Database['public']['Tables']['order_items']['Row']

export type Review = Database['public']['Tables']['reviews']['Row'] & {
  profile?: Pick<Profile, 'full_name' | 'avatar_url'> | null
}

export type Order = Database['public']['Tables']['orders']['Row'] & {
  items?: OrderItem[]
  profile?: Profile | null
}

export interface CartItem {
  id: string
  product: Product
  variant: ProductVariant | null
  quantity: number
  price: number
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export interface WishlistState {
  items: string[]
  addItem: (productId: string) => void
  removeItem: (productId: string) => void
  hasItem: (productId: string) => boolean
  toggleItem: (productId: string) => void
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating'

export interface FilterState {
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  tags: string[]
  sort: SortOption
  search: string
}

export type SiteSettings = Database['public']['Tables']['site_settings']['Row']
