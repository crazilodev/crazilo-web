'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const siteSettingsSchema = z.object({
  store_name: z.string().min(1, 'Store Name is required').max(100, 'Store name is too long').trim(),
  support_phone: z.string().max(30, 'Phone is too long').trim().nullable().optional(),
  support_email: z.string().email('Invalid email address').max(100).trim().nullable().optional().or(z.literal('')),
  support_address: z.string().max(300, 'Address is too long').trim().nullable().optional(),
  support_hours: z.string().max(100, 'Hours description is too long').trim().nullable().optional(),
  footer_description: z.string().max(500, 'Footer description is too long').trim().nullable().optional(),
  free_shipping_threshold: z.number().min(0, 'Free shipping threshold must be at least 0'),
  currency_code: z.string().length(3, 'Currency code must be exactly 3 characters').toUpperCase(),
  instagram_url: z.string().url('Invalid Instagram URL').max(500).trim().nullable().optional().or(z.literal('')),
  facebook_url: z.string().url('Invalid Facebook URL').max(500).trim().nullable().optional().or(z.literal('')),
  twitter_url: z.string().url('Invalid Twitter URL').max(500).trim().nullable().optional().or(z.literal('')),
  youtube_url: z.string().url('Invalid YouTube URL').max(500).trim().nullable().optional().or(z.literal('')),
  privacy_policy_url: z.string().max(500).trim().nullable().optional(),
  terms_url: z.string().max(500).trim().nullable().optional(),
  returns_policy_url: z.string().max(500).trim().nullable().optional(),
  store_locator_url: z.string().max(500).trim().nullable().optional(),
  faqs_url: z.string().max(500).trim().nullable().optional(),
})

export async function updateSiteSettingsAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()

    // Parse and validate the settings values
    const parsed = siteSettingsSchema.parse(payload)

    // Normalize empty strings to null for optional database text fields
    const dbPayload = {
      store_name: parsed.store_name,
      support_phone: parsed.support_phone || null,
      support_email: parsed.support_email || null,
      support_address: parsed.support_address || null,
      support_hours: parsed.support_hours || null,
      footer_description: parsed.footer_description || null,
      free_shipping_threshold: parsed.free_shipping_threshold,
      currency_code: parsed.currency_code,
      instagram_url: parsed.instagram_url || null,
      facebook_url: parsed.facebook_url || null,
      twitter_url: parsed.twitter_url || null,
      youtube_url: parsed.youtube_url || null,
      privacy_policy_url: parsed.privacy_policy_url || null,
      terms_url: parsed.terms_url || null,
      returns_policy_url: parsed.returns_policy_url || null,
      store_locator_url: parsed.store_locator_url || null,
      faqs_url: parsed.faqs_url || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('site_settings')
      .update(dbPayload)
      .eq('scope', 'global')

    if (error) {
      return { success: false, error: error.message }
    }

    // Revalidate paths that read site_settings
    revalidatePath('/admin/settings')
    revalidatePath('/') // Revalidates layout (footer, announcement bar)
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid settings values' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}
