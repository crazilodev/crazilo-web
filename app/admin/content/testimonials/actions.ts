'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const testimonialSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').trim(),
  location: z.string().min(1, 'Location is required').max(100, 'Location is too long').trim(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  text: z.string().min(1, 'Testimonial text is required').max(1000, 'Testimonial text is too long').trim(),
  product_name: z.string().min(1, 'Product name is required').max(100, 'Product name is too long').trim(),
  avatar_initial: z.string().min(1, 'Avatar initial is required').max(1, 'Avatar initial must be a single character').toUpperCase(),
  avatar_url: z.string().url('Avatar URL must be a valid URL').nullable().or(z.literal('')),
  display_order: z.number().int().min(0, 'Display order must be a non-negative number'),
  is_active: z.boolean().default(true)
})

export async function createTestimonialAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = testimonialSchema.parse(payload)

    const { error } = await supabase
      .from('testimonials')
      .insert({
        name: parsed.name,
        location: parsed.location,
        rating: parsed.rating,
        text: parsed.text,
        product_name: parsed.product_name,
        avatar_initial: parsed.avatar_initial,
        avatar_url: parsed.avatar_url || null,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString()
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/testimonials')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateTestimonialAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = testimonialSchema.parse(payload)

    if (!parsed.id) {
      return { success: false, error: 'Testimonial ID is required for updates' }
    }

    const { error } = await supabase
      .from('testimonials')
      .update({
        name: parsed.name,
        location: parsed.location,
        rating: parsed.rating,
        text: parsed.text,
        product_name: parsed.product_name,
        avatar_initial: parsed.avatar_initial,
        avatar_url: parsed.avatar_url || null,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/testimonials')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteTestimonialAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Testimonial ID is required' }
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/testimonials')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleTestimonialStatusAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Testimonial ID is required' }
    }

    const { error } = await supabase
      .from('testimonials')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/testimonials')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function reorderTestimonialAction(id: string, displayOrder: number) {
  try {
    const { supabase } = await requireAdmin()

    if (!id) {
      return { success: false, error: 'Testimonial ID is required' }
    }

    if (displayOrder < 0) {
      return { success: false, error: 'Display order must be non-negative' }
    }

    const { error } = await supabase
      .from('testimonials')
      .update({
        display_order: displayOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/admin/content/testimonials')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
