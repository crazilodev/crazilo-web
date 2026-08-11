import type { Database } from '@/lib/supabase/database.types'

export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']

export async function subscribeToNewsletter(
  supabase: any,
  email: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new Error('Email is required')
  }

  const { error } = await supabase
    .from('newsletter_subscribers')
    .insert({ email: normalizedEmail, is_active: true })

  if (error && !/duplicate|unique/i.test(error.message)) {
    throw error
  }
}

export interface NewsletterListOptions {
  page: number
  limit: number
  search?: string
  status?: 'all' | 'active' | 'inactive'
}

export async function getAdminNewsletterList(
  supabase: any,
  options: NewsletterListOptions
) {
  const { page, limit, search, status } = options

  let query = supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })

  // Status Filter (is_active is a boolean in schema)
  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }

  // Search Filter (email is the primary searchable field)
  if (search?.trim()) {
    query = query.ilike('email', `%${search.trim()}%`)
  }

  // Sort order (most recent subscriptions first)
  query = query.order('subscribed_at', { ascending: false })

  // Pagination Range
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) throw error

  return {
    subscribers: (data || []) as NewsletterSubscriber[],
    totalCount: count || 0,
  }
}
