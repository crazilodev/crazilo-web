'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/app/admin/actions'
import { z } from 'zod'

const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Coupon code is required').max(50, 'Code is too long').trim().toUpperCase(),
  description: z.string().max(300, 'Description is too long').trim().nullable().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().positive('Discount value must be greater than 0'),
  minimum_order_amount: z.number().min(0, 'Minimum order amount must be at least 0'),
  maximum_discount: z.number().min(0, 'Maximum discount must be at least 0').nullable().optional(),
  usage_limit: z.number().int().positive('Usage limit must be a positive integer').nullable().optional(),
  is_active: z.boolean().default(true),
  starts_at: z.string().min(1, 'Starts at timestamp is required'),
  expires_at: z.string().nullable().optional().or(z.literal('')),
})

export async function createCouponAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = couponSchema.parse(payload)

    const { error } = await supabase
      .from('coupons')
      .insert({
        code: parsed.code,
        description: parsed.description || null,
        discount_type: parsed.discount_type,
        discount_value: parsed.discount_value,
        minimum_order_amount: parsed.minimum_order_amount,
        maximum_discount: parsed.maximum_discount || null,
        usage_limit: parsed.usage_limit || null,
        is_active: parsed.is_active,
        starts_at: parsed.starts_at,
        expires_at: parsed.expires_at || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function updateCouponAction(payload: any) {
  try {
    const { supabase } = await requireAdmin()
    const parsed = couponSchema.parse(payload)

    if (!parsed.id) {
      return { success: false, error: 'Coupon ID is required for updates' }
    }

    const { error } = await supabase
      .from('coupons')
      .update({
        code: parsed.code,
        description: parsed.description || null,
        discount_type: parsed.discount_type,
        discount_value: parsed.discount_value,
        minimum_order_amount: parsed.minimum_order_amount,
        maximum_discount: parsed.maximum_discount || null,
        usage_limit: parsed.usage_limit || null,
        is_active: parsed.is_active,
        starts_at: parsed.starts_at,
        expires_at: parsed.expires_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { success: false, error: err.errors[0]?.message || 'Invalid parameters' }
    }
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function deleteCouponAction(id: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid coupon ID is required' }
    }

    // Check dependency: Does any order reference this coupon?
    const { count, error: depError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', id)

    if (depError) {
      return { success: false, error: depError.message }
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete coupon: This coupon is referenced by ${count} order(s). Please deactivate it instead.`,
      }
    }

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function toggleCouponStatusAction(id: string, isActive: boolean) {
  try {
    const { supabase } = await requireAdmin()

    if (!id || !z.string().uuid().safeParse(id).success) {
      return { success: false, error: 'Valid coupon ID is required' }
    }

    const { error } = await supabase
      .from('coupons')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/coupons')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
