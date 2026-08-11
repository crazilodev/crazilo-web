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
    .update({ full_name: fullName, phone })
    .eq('id', profileId)

  if (error) throw error
}
