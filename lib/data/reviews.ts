import type { Database } from '@/lib/supabase/database.types'

export type Review = Database['public']['Tables']['reviews']['Row']

export interface ReviewListOptions {
  page: number
  limit: number
  search?: string
  rating?: number | 'all'
  status?: 'all' | 'approved' | 'pending'
}

export async function getAdminReviewsList(
  supabase: any,
  options: ReviewListOptions
) {
  const { page, limit, search, rating, status } = options

  // Join products on name and profiles on email & full_name
  let query = supabase
    .from('reviews')
    .select('*, products(name), profiles(email, full_name)', { count: 'exact' })

  // Status Filter (is_approved is boolean in reviews schema)
  if (status === 'approved') {
    query = query.eq('is_approved', true)
  } else if (status === 'pending') {
    query = query.eq('is_approved', false)
  }

  // Rating Filter
  if (rating && rating !== 'all') {
    query = query.eq('rating', Number(rating))
  }

  // Search Filter
  if (search?.trim()) {
    const s = `%${search.trim()}%`
    query = query.or(`title.ilike.${s},body.ilike.${s}`)
  }

  // Sort order (most recent reviews first)
  query = query.order('created_at', { ascending: false })

  // Pagination Range
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) throw error

  return {
    reviews: data || [],
    totalCount: count || 0,
  }
}
