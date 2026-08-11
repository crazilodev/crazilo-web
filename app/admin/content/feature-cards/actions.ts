'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const VALID_SECTION_KEYS = ['find_your_snack', 'featured_collections'] as const

const featureCardSchema = z.object({
  id: z.string().uuid().optional(),
  section_key: z.enum(VALID_SECTION_KEYS, {
    errorMap: () => ({ message: 'Section key must be find_your_snack or featured_collections' }),
  }),
  eyebrow_text: z.string().max(100, 'Eyebrow text is too long').trim().nullable().optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long').trim(),
  subtitle: z.string().min(1, 'Subtitle is required').max(200, 'Subtitle is too long').trim(),
  description: z.string().max(500, 'Description is too long').trim().nullable().optional(),
  image_url: z.string().url('Image URL must be a valid URL').min(1, 'Image URL is required'),
  category_id: z.string().uuid('Category ID must be a valid UUID').nullable().optional(),
  link_url: z.string().max(500, 'Link URL is too long').trim().nullable().optional(),
  display_order: z.number().int().min(0, 'Display order must be a non-negative integer'),
  is_active: z.boolean().default(true),
})

export async function createFeatureCardAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = featureCardSchema.parse(payload)

    const { error } = await supabase
      .from('home_feature_cards')
      .insert({
        section_key: parsed.section_key,
        eyebrow_text: parsed.eyebrow_text || null,
        title: parsed.title,
        subtitle: parsed.subtitle,
        description: parsed.description || null,
        image_url: parsed.image_url,
        category_id: parsed.category_id || null,
        link_url: parsed.link_url || null,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/feature-cards')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateFeatureCardAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = featureCardSchema.parse(payload)

    if (!parsed.id) {
      return { success: false, error: 'Feature card ID is required for updates' }
    }

    const { error } = await supabase
      .from('home_feature_cards')
      .update({
        section_key: parsed.section_key,
        eyebrow_text: parsed.eyebrow_text || null,
        title: parsed.title,
        subtitle: parsed.subtitle,
        description: parsed.description || null,
        image_url: parsed.image_url,
        category_id: parsed.category_id || null,
        link_url: parsed.link_url || null,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/feature-cards')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteFeatureCardAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid feature card ID is required' }
    }

    const { error } = await supabase
      .from('home_feature_cards')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/feature-cards')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleFeatureCardStatusAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid feature card ID is required' }
    }

    const { error } = await supabase
      .from('home_feature_cards')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/feature-cards')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function reorderFeatureCardAction(id: string, displayOrder: number) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid feature card ID is required' }
    }

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      return { success: false, error: 'Display order must be a non-negative integer' }
    }

    const { error } = await supabase
      .from('home_feature_cards')
      .update({
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/feature-cards')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
