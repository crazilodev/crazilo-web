import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from '@/app/(store)/products/[slug]/ProductDetailClient'
import { Product, Review } from '@/types'

interface Props {
  params: { slug: string }
}

const SAMPLE_PRODUCT: Product = {
  id: 'sample-1',
  name: 'Premium Kashmiri Almonds (Mamra Badam)',
  slug: 'premium-kashmiri-almonds',
  description:
    'Handpicked 100% natural, premium Kashmiri Mamra Almonds sourced directly from Kashmir orchards. Rich in vitamin E, magnesium, and healthy omega fatty acids. Vacuum-packed to retain natural oil and crunchiness.',
  short_description: '100% Organic & Raw Kashmiri Almonds. Rich in natural oils and crunchiness.',
  category_id: 'cat-dry-fruits',
  price: 899,
  compare_price: 1199,
  cost_price: 650,
  sku: 'CRZ-ALM-500',
  stock_quantity: 45,
  low_stock_threshold: 10,
  track_inventory: true,
  weight_grams: 500,
  unit: 'g',
  images: [
    'https://images.unsplash.com/photo-1508061252227-142f1f5d6df4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?auto=format&fit=crop&w=800&q=80',
  ],
  thumbnail_url: 'https://images.unsplash.com/photo-1508061252227-142f1f5d6df4?auto=format&fit=crop&w=800&q=80',
  is_active: true,
  is_featured: true,
  is_bestseller: true,
  is_new: false,
  is_organic: true,
  no_added_sugar: true,
  meta_title: 'Premium Kashmiri Almonds | Crazilo',
  meta_description: 'Buy 100% natural Kashmiri Mamra Badam online at best price.',
  tags: ['almonds', 'dryfruits', 'organic', 'bestseller'],
  nutritional_info: {
    Energy: '579 kcal',
    Protein: '21.15 g',
    'Total Fat': '49.93 g',
    Carbohydrates: '21.55 g',
    Fiber: '12.5 g',
    Calcium: '269 mg',
  },
  average_rating: 4.9,
  review_count: 38,
  total_sold: 420,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category: {
    id: 'cat-dry-fruits',
    name: 'Dry Fruits',
    slug: 'dry-fruits',
    description: 'Premium dry fruits',
    image_url: null,
    icon_url: null,
    parent_id: null,
    sort_order: 1,
    is_active: true,
    meta_title: null,
    meta_description: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  variants: [
    {
      id: 'var-250',
      product_id: 'sample-1',
      name: '250g Pack',
      sku: 'CRZ-ALM-250',
      price: 499,
      compare_price: 649,
      stock_quantity: 30,
      weight_grams: 250,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'var-500',
      product_id: 'sample-1',
      name: '500g Pack',
      sku: 'CRZ-ALM-500',
      price: 899,
      compare_price: 1199,
      stock_quantity: 45,
      weight_grams: 500,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'var-1000',
      product_id: 'sample-1',
      name: '1kg Family Pack',
      sku: 'CRZ-ALM-1000',
      price: 1699,
      compare_price: 2299,
      stock_quantity: 20,
      weight_grams: 1000,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ],
}

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'sample-1',
    user_id: 'u-1',
    order_id: 'ord-1',
    rating: 5,
    title: 'Extremely fresh and oil-rich almonds!',
    body: 'These are genuine Kashmiri Mamra almonds. Extremely rich in oil, crisp taste, and zero bitter ones in the entire 500g pack. Superb quality by Crazilo!',
    images: [],
    is_verified_purchase: true,
    is_approved: true,
    helpful_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: 'u-1',
      email: 'customer@example.com',
      full_name: 'Rajesh Sharma',
      phone: null,
      avatar_url: null,
      role: 'customer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'rev-2',
    product_id: 'sample-1',
    user_id: 'u-2',
    order_id: 'ord-2',
    rating: 5,
    title: 'Best quality dry fruits delivered fast',
    body: 'Packaging was vacuum sealed. Delivery took just 2 days to Mumbai. Almonds are crunchier than regular market ones. Highly recommended!',
    images: [],
    is_verified_purchase: true,
    is_approved: true,
    helpful_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profile: {
      id: 'u-2',
      email: 'priya@example.com',
      full_name: 'Priya N.',
      phone: null,
      avatar_url: null,
      role: 'customer',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createClient()
    const { data: product } = await supabase
      .from('products')
      .select('name, short_description, meta_title, meta_description')
      .eq('slug', params.slug)
      .single()

    if (product) {
      return {
        title: product.meta_title || product.name,
        description: product.meta_description || product.short_description || '',
      }
    }
  } catch {}

  return {
    title: `${SAMPLE_PRODUCT.name} | Crazilo Dryfruits & Spices`,
    description: SAMPLE_PRODUCT.short_description || '',
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product: Product | null = null
  let relatedProducts: Product[] = []
  let reviews: Review[] = []

  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*, category:categories(*), variants:product_variants(*)')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (data) {
      product = data
      const [{ data: related }, { data: revs }] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', data.category_id)
          .eq('is_active', true)
          .neq('id', data.id)
          .limit(4),
        supabase
          .from('reviews')
          .select('*, profile:profiles(full_name, avatar_url)')
          .eq('product_id', data.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10),
      ])
      if (related) relatedProducts = related
      if (revs) reviews = revs
    }
  } catch {}

  // Fallback to rich sample product if DB doesn't have this slug yet
  if (!product) {
    product = {
      ...SAMPLE_PRODUCT,
      slug: params.slug,
    }
    reviews = SAMPLE_REVIEWS
  }

  return (
    <ProductDetailClient
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
    />
  )
}
