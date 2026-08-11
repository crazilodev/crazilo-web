'use server'

import { requireAdmin } from '@/app/admin/actions'

export async function adjustInventoryAction(payload: {
  productId: string
  variantId: string | null
  quantity: number
  movementType: 'restock' | 'damage' | 'correction'
  reason?: string
  note?: string
}) {
  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase.rpc('adjust_inventory', {
      p_product_id: payload.productId,
      p_variant_id: payload.variantId,
      p_quantity: payload.quantity,
      p_movement_type: payload.movementType,
      p_reason: payload.reason || '',
      p_note: payload.note || '',
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
