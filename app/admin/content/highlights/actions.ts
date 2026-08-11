'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const homeHighlightSchema = z.object({
  id: z.string().uuid().optional(),
  icon_key: z.string().min(1, 'Icon key is required').max(100, 'Icon key is too long').trim(),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long').trim(),
  description: z.string().min(1, 'Description is required').max(200, 'Description is too long').trim(),
  display_order: z.number().int().min(0, 'Display order must be a non-negative number'),
  is_active: z.boolean().default(true)
})

export async function createHomeHighlightAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = homeHighlightSchema.parse(payload)

    const { error } = await supabase
      .from('home_highlights')
      .insert({
        icon_key: parsed.icon_key,
        title: parsed.title,
        description: parsed.description,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString()
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/highlights')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateHomeHighlightAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = homeHighlightSchema.parse(payload)

    if (!parsed.id) {
      return { success: false, error: 'Highlight ID is required for updates' }
    }

    const { error } = await supabase
      .from('home_highlights')
      .update({
        icon_key: parsed.icon_key,
        title: parsed.title,
        description: parsed.description,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/highlights')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteHomeHighlightAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Highlight ID is required' }
    }

    const { error } = await supabase
      .from('home_highlights')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/highlights')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleHomeHighlightStatusAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Highlight ID is required' }
    }

    const { error } = await supabase
      .from('home_highlights')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/highlights')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function reorderHomeHighlightAction(id: string, displayOrder: number) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Highlight ID is required' }
    }

    if (displayOrder < 0) {
      return { success: false, error: 'Display order must be non-negative' }
    }

    const { error } = await supabase
      .from('home_highlights')
      .update({
        display_order: displayOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/highlights')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
