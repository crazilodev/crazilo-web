import type { Database, Json } from '@/lib/supabase/database.types'
import type { Order } from '@/types'

export type OrderItemInput = {
  product_id: string
  variant_id?: string | null
  quantity: number
}

export type CreateOrderInput = {
  shippingAddress: Json
  billingAddress: Json | null
  couponCode?: string | null
  paymentMethod?: string | null
  customerNotes?: string | null
  items: OrderItemInput[]
}

export async function getUserOrders(
  supabase: any,
  userId: string
): Promise<Order[]> {
  if (!userId?.trim()) {
    throw new Error('User id is required')
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Order[]
}

export async function getUserOrderById(
  supabase: any,
  userId: string,
  orderId: string
): Promise<Order | null> {
  if (!userId?.trim()) {
    throw new Error('User id is required')
  }
  if (!orderId?.trim()) {
    throw new Error('Order id is required')
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return (data || null) as Order | null
}

export async function createOrderWithItems(
  supabase: any,
  input: CreateOrderInput
): Promise<Order> {
  const { data, error } = await supabase.rpc('create_order_with_items', {
    p_shipping_address: input.shippingAddress,
    p_billing_address: input.billingAddress,
    p_coupon_code: input.couponCode ? input.couponCode.toUpperCase().trim() : null,
    p_payment_method: input.paymentMethod || 'cod',
    p_customer_notes: input.customerNotes || null,
    p_items: input.items,
  })

  if (error) throw error
  return data as Order
}
