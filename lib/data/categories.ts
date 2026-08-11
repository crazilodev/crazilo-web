import type { Database } from '@/lib/supabase/database.types'
import type { Category, Product } from '@/types'

export async function getMainCategories(
  supabase: any
): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []) as Category[]
}

export async function getSubcategories(
  supabase: any,
  parentId: string,
  activeOnly = true
): Promise<Category[]> {
  if (!parentId?.trim()) {
    throw new Error('Category parent id is required')
  }

  let query = supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as Category[]
}

export async function getCategoryBySlug(
  supabase: any,
  slug: string,
  activeOnly = true
): Promise<Category | null> {
  if (!slug?.trim()) {
    throw new Error('Category slug is required')
  }

  let query = supabase.from('categories').select('*').eq('slug', slug)
  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return (data || null) as Category | null
}

export async function getCategoryWithSubcategories(
  supabase: any,
  slug: string
): Promise<{ category: Category; subcategories: Category[] } | null> {
  const category = await getCategoryBySlug(supabase, slug)
  if (!category) return null

  if (category.parent_id) {
    return { category, subcategories: [] }
  }

  const subcategories = await getSubcategories(supabase, category.id)
  return { category, subcategories }
}

export async function getCategoryProducts(
  supabase: any,
  category: Category
): Promise<Product[]> {
  const { getProductsByCategory, getProductsByMainCategory } = await import('./catalog')

  if (category.parent_id) {
    return getProductsByCategory(supabase, category.id)
  }

  return getProductsByMainCategory(supabase, category.id)
}
