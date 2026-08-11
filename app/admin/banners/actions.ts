'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').trim(),
  subtitle: z.string().max(300, 'Subtitle is too long').trim().nullable().optional(),
  badge_text: z.string().max(100, 'Badge text is too long').trim().nullable().optional(),
  image_url: z.string().url('Image URL must be a valid URL').min(1, 'Image URL is required'),
  mobile_image_url: z.string().url('Mobile Image URL must be a valid URL').trim().nullable().optional().or(z.literal('')),
  cta_text: z.string().min(1, 'CTA Text is required').max(50, 'CTA text is too long').trim().default('Shop Now'),
  cta_link: z.string().min(1, 'CTA Link is required').max(200, 'CTA link is too long').trim().default('/products'),
  display_order: z.number().int().min(0, 'Display order must be a non-negative integer'),
  is_active: z.boolean().default(true),
  bg_color: z.string().max(20).trim().default('#8B0000'),
  text_color: z.string().max(20).trim().default('#FFFFFF'),
  starts_at: z.string().nullable().optional().or(z.literal('')),
  ends_at: z.string().nullable().optional().or(z.literal('')),
})

export async function createBannerAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = bannerSchema.parse(payload)

    const { error } = await supabase
      .from('banners')
      .insert({
        title: parsed.title,
        subtitle: parsed.subtitle || null,
        badge_text: parsed.badge_text || null,
        image_url: parsed.image_url,
        mobile_image_url: parsed.mobile_image_url || null,
        cta_text: parsed.cta_text,
        cta_link: parsed.cta_link,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        bg_color: parsed.bg_color,
        text_color: parsed.text_color,
        starts_at: parsed.starts_at || null,
        ends_at: parsed.ends_at || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateBannerAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = bannerSchema.parse(payload)

    if (!parsed.id) {
      return { success: false, error: 'Banner ID is required for updates' }
    }

    const { error } = await supabase
      .from('banners')
      .update({
        title: parsed.title,
        subtitle: parsed.subtitle || null,
        badge_text: parsed.badge_text || null,
        image_url: parsed.image_url,
        mobile_image_url: parsed.mobile_image_url || null,
        cta_text: parsed.cta_text,
        cta_link: parsed.cta_link,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        bg_color: parsed.bg_color,
        text_color: parsed.text_color,
        starts_at: parsed.starts_at || null,
        ends_at: parsed.ends_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteBannerAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid banner ID is required' }
    }

    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleBannerStatusAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid banner ID is required' }
    }

    const { error } = await supabase
      .from('banners')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function reorderBannerAction(id: string, displayOrder: number) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid banner ID is required' }
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      return { success: false, error: 'Display order must be a non-negative integer' }
    }

    const { error } = await supabase
      .from('banners')
      .update({
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
