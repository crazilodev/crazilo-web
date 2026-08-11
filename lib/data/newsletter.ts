import type { Database } from '@/lib/supabase/database.types'

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
