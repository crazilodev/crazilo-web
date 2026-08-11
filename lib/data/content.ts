import type { Database } from '@/lib/supabase/database.types'
import type {
  Announcement,
  Banner,
  HomeFeatureCard,
  HomeHighlight,
  SiteSettings,
  Testimonial,
} from '@/types'

export async function getSiteSettings(
  supabase: any
): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('scope', 'global')
    .maybeSingle()

  if (error) throw error
  return (data || null) as SiteSettings | null
}

export async function getActiveBanners(
  supabase: any
): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as Banner[]
}

export async function getActiveAnnouncements(
  supabase: any
): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as Announcement[]
}

export async function getActiveTestimonials(
  supabase: any
): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as Testimonial[]
}

export async function getHomeFeatureCards(
  supabase: any,
  sectionKey?: string
): Promise<HomeFeatureCard[]> {
  let query: any = supabase
    .from('home_feature_cards')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (sectionKey) {
    query = query.eq('section_key', sectionKey)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as HomeFeatureCard[]
}

export async function getHomeHighlights(
  supabase: any
): Promise<HomeHighlight[]> {
  const { data, error } = await supabase
    .from('home_highlights')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []) as HomeHighlight[]
}
