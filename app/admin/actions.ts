'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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
