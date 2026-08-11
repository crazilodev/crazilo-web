import type { Database } from '@/lib/supabase/database.types'
import type { Profile } from '@/types'

export async function getProfileById(
  supabase: any,
  profileId: string
): Promise<Profile | null> {
  if (!profileId?.trim()) {
    throw new Error('Profile id is required')
  }

  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).maybeSingle()
  if (error) throw error
  return (data || null) as Profile | null
}

export async function updateProfileContactInfo(
  supabase: any,
  profileId: string,
  fullName: string | null,
  phone: string | null
): Promise<void> {
  if (!profileId?.trim()) {
    throw new Error('Profile id is required')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
    .eq('id', profileId)

  if (error) throw error
}

export interface CustomerListOptions {
  page: number
  limit: number
  search?: string
  status?: 'all' | 'active' | 'inactive'
}

/**
 * Retrieves a paginated, filtered, and searchable list of customer profiles,
 * including a relational outer join to compute order metrics without N+1 queries.
 */
export async function getAdminCustomersList(
  supabase: any,
  options: CustomerListOptions
) {
  const { page, limit, search, status } = options

  let query = supabase
    .from('profiles')
    .select('*, orders(id, total_amount, status, created_at)', { count: 'exact' })

  // Status Filter
  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }

  // Search Filter
  if (search?.trim()) {
    const s = `%${search.trim()}%`
    query = query.or(`full_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`)
  }

  // Order
  query = query.order('created_at', { ascending: false })

  // Pagination Range
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  if (error) throw error

  return {
    profiles: data || [],
    totalCount: count || 0,
  }
}

/**
 * Retrieves details for a specific customer, including address records
 * and their chronological order history.
 */
export async function getAdminCustomerDetail(
  supabase: any,
  customerId: string
) {
  if (!customerId?.trim()) {
    throw new Error('Customer ID is required')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*, orders(*), addresses(*)')
    .eq('id', customerId)
    .maybeSingle()

  if (error) throw error
  return data
}
