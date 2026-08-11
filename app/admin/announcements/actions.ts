'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const announcementSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1, 'Text is required').max(200, 'Text is too long').trim(),
  link: z.string().max(300, 'Link is too long').trim().nullable().optional(),
  display_order: z.number().int().min(0, 'Display order must be a non-negative integer'),
  is_active: z.boolean().default(true),
})

export async function createAnnouncementAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = announcementSchema.parse(payload)

    const { error } = await supabase
      .from('announcements')
      .insert({
        text: parsed.text,
        link: parsed.link || null,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/announcements')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateAnnouncementAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = announcementSchema.parse(payload)

    if (!parsed.id) {
      return { success: false, error: 'Announcement ID is required for updates' }
    }

    const { error } = await supabase
      .from('announcements')
      .update({
        text: parsed.text,
        link: parsed.link || null,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/announcements')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid announcement ID is required' }
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/announcements')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleAnnouncementStatusAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid announcement ID is required' }
    }

    const { error } = await supabase
      .from('announcements')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/announcements')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
