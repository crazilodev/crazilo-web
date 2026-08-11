'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

export async function deleteReviewAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid review ID is required' }
    }

    // Retrieve product_id before deleting, so we can revalidate its public detail route
    const { data: review } = await supabase
      .from('reviews')
      .select('product_id, products(slug)')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/reviews')
    if (review?.products?.slug) {
      revalidatePath(`/products/${review.products.slug}`)
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleReviewApprovalAction(id: string, isApproved: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid review ID is required' }
    }

    const { error } = await supabase
      .from('reviews')
      .update({
        is_approved: isApproved,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Retrieve product slug to invalidate the specific public page
    const { data: review } = await supabase
      .from('reviews')
      .select('products(slug)')
      .eq('id', id)
      .maybeSingle()

    revalidatePath('/admin/reviews')
    if (review?.products?.slug) {
      revalidatePath(`/products/${review.products.slug}`)
    }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
