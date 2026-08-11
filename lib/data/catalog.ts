import type { Database } from '@/lib/supabase/database.types'
import type { Product, Review, SortOption } from '@/types'

type ProductFilters = {
  categoryId?: string | null
  categoryIds?: string[]
  search?: string
  tags?: string[]
  minPrice?: number
  maxPrice?: number
  sort?: SortOption
  limit?: number
  includeVariants?: boolean
}

function buildProductSelect(includeVariants = false) {
  return includeVariants ? '*, category:categories(*), variants:product_variants(*)' : '*, category:categories(*)'
}

export async function getActiveProducts(
  supabase: any,
  filters: ProductFilters = {}
): Promise<Product[]> {
  let query: any = supabase
    .from('products')
    .select(buildProductSelect(Boolean(filters.includeVariants)), { count: 'exact' })
    .eq('is_active', true)

  if (filters.categoryIds && filters.categoryIds.length > 0) {
    query = query.in('category_id', filters.categoryIds)
  } else if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId)
  }

  if (filters.minPrice != null) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice != null) query = query.lte('price', filters.maxPrice)
  if (filters.search?.trim()) query = query.ilike('name', `%${filters.search.trim()}%`)
  if (filters.tags && filters.tags.length > 0) query = query.overlaps('tags', filters.tags)

  const sort = filters.sort || 'newest'
  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sort === 'popular') query = query.order('total_sold', { ascending: false })
  else if (sort === 'rating') query = query.order('average_rating', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  if (filters.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return (data || []) as Product[]
}

export async function getProductBySlug(
  supabase: any,
  slug: string
): Promise<Product | null> {
  if (!slug?.trim()) {
    throw new Error('Product slug is required')
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), variants:product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return (data || null) as Product | null
}

export async function getProductsByCategory(
  supabase: any,
  categoryId: string
): Promise<Product[]> {
  return getActiveProducts(supabase, { categoryId, sort: 'newest' })
}

export async function getProductsByMainCategory(
  supabase: any,
  categoryId: string
): Promise<Product[]> {
  const { getSubcategories } = await import('./categories')
  const subcategories = await getSubcategories(supabase, categoryId)

  return getActiveProducts(supabase, {
    categoryIds: [categoryId, ...subcategories.map((subcategory) => subcategory.id)],
    sort: 'newest',
  })
}

export async function getProductsByCategorySlug(
  supabase: any,
  slug: string
): Promise<Product[]> {
  const { getCategoryBySlug } = await import('./categories')
  const category = await getCategoryBySlug(supabase, slug)
  if (!category) return []
  return category.parent_id
    ? getProductsByCategory(supabase, category.id)
    : getProductsByMainCategory(supabase, category.id)
}

export async function getRelatedProducts(
  supabase: any,
  categoryId: string | null,
  excludeProductId: string,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return []

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []) as Product[]
}

export async function getProductDetailPageData(
  supabase: any,
  slug: string
): Promise<{
  product: Product | null
  relatedProducts: Product[]
  reviews: Review[]
}> {
  const product = await getProductBySlug(supabase, slug)
  if (!product) {
    return { product: null, relatedProducts: [], reviews: [] }
  }

  const [{ data: reviews, error: reviewsError }, relatedProducts] = await Promise.all([
    supabase
      .from('reviews')
      .select('*, profile:profiles(full_name, avatar_url)')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(10),
    getRelatedProducts(supabase, product.category_id, product.id, 4),
  ])

  if (reviewsError) throw reviewsError

  return {
    product,
    relatedProducts,
    reviews: (reviews || []) as Review[],
  }
}
