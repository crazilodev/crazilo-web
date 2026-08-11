'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { canTransitionOrderStatus, OrderStatus } from '@/lib/validations/orderStatus'
import { isValidPaymentStatus } from '@/lib/validations/paymentStatus'

export async function syncAdminRole() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@crazilo.com'
  if (user.email === adminEmail) {
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Admin',
        role: 'admin',
        is_active: true,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      console.error('Failed to upsert admin profile:', upsertError)
      return { success: false, error: upsertError.message }
    }
    return { success: true, promoted: true }
  }
  return { success: true, promoted: false }
}

export async function requireAdmin() {
  const supabase = createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }

  return { supabase, user }
}

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!orderId) {
      return { success: false, error: 'Order ID is required' }
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return { success: false, error: `Invalid order status: ${status}` }
    }

    // Retrieve current order status from the database to validate transition authority
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return { success: false, error: 'Failed to retrieve current order status.' }
    }

    // Same-status is a harmless no-op success
    if (currentOrder.status === status) {
      return { success: true }
    }

    // Validate the requested transition using centralized policy
    if (!canTransitionOrderStatus(currentOrder.status as OrderStatus, status as OrderStatus)) {
      return {
        success: false,
        error: `Cannot change order status from "${currentOrder.status}" to "${status}".`
      }
    }

    const updateData: any = { status, updated_at: new Date().toISOString() }

    // Map timestamps based on status
    if (status === 'confirmed') updateData.confirmed_at = new Date().toISOString()
    if (status === 'shipped') updateData.shipped_at = new Date().toISOString()
    if (status === 'delivered') updateData.delivered_at = new Date().toISOString()
    if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString()

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}

export async function getAdminOrderDetailAction(orderId: string) {
  try {
    const { supabase } = await requireAdmin()

    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), profiles(email)')
      .eq('id', orderId)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Order not found')

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve order details' }
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string) {
  try {
    const { supabase } = await requireAdmin()

    if (!orderId) {
      return { success: false, error: 'Order ID is required' }
    }

    if (!isValidPaymentStatus(paymentStatus)) {
      return { success: false, error: `Invalid payment status: ${paymentStatus}` }
    }

    // Read current payment status to handle same-status no-ops
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return { success: false, error: 'Failed to retrieve current payment status.' }
    }

    if (currentOrder.payment_status === paymentStatus) {
      return { success: true }
    }

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
}
