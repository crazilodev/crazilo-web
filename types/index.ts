export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  category_id: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  sku: string | null
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  weight_grams: number | null
  unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'pack'
  images: string[]
  thumbnail_url: string | null
  is_active: boolean
  is_featured: boolean
  is_bestseller: boolean
  is_new: boolean
  is_organic: boolean
  no_added_sugar: boolean
  meta_title: string | null
  meta_description: string | null
  tags: string[]
  nutritional_info: Record<string, string | number>
  average_rating: number
  review_count: number
  total_sold: number
  created_at: string
  updated_at: string
  category?: Category
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string | null
  price: number
  compare_price: number | null
  stock_quantity: number
  weight_grams: number | null
  is_active: boolean
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  badge_text: string | null
  image_url: string
  mobile_image_url: string | null
  cta_text: string
  cta_link: string
  display_order: number
  is_active: boolean
  bg_color: string
  text_color: string
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  text: string
  link: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  minimum_order_amount: number
  maximum_discount: number | null
  usage_limit: number | null
  used_count: number
  is_active: boolean
  starts_at: string
  expires_at: string | null
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  address_line1: string
  address_line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  shipping_address: Omit<Address, 'id' | 'user_id' | 'created_at'>
  billing_address: Omit<Address, 'id' | 'user_id' | 'created_at'> | null
  subtotal: number
  discount_amount: number
  shipping_amount: number
  tax_amount: number
  total_amount: number
  coupon_code: string | null
  coupon_id: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  payment_id: string | null
  tracking_number: string | null
  tracking_url: string | null
  customer_notes: string | null
  admin_notes: string | null
  confirmed_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  profile?: Profile
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  product_name: string
  variant_name: string | null
  sku: string | null
  thumbnail_url: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  order_id: string | null
  rating: number
  title: string | null
  body: string | null
  images: string[]
  is_verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  profile?: Profile
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
