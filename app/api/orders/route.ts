import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single()

      if (error || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ order })
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders: orders || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { shipping_address, billing_address, items, coupon_code, customer_notes, payment_method } = body

    if (!shipping_address || !shipping_address.full_name || !shipping_address.address_line1 || !shipping_address.phone) {
      return NextResponse.json({ error: 'Invalid or incomplete shipping address' }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const orderItems = items.map((item: any) => ({
      product_id: item.product_id || item.product?.id || null,
      variant_id: item.variant_id || item.variant?.id || null,
      quantity: Number(item.quantity) || 1,
    }))

    const { data: order, error: orderError } = await supabase.rpc('create_order_with_items', {
      p_shipping_address: shipping_address,
      p_billing_address: billing_address || shipping_address,
      p_coupon_code: coupon_code ? String(coupon_code).toUpperCase().trim() : null,
      p_payment_method: payment_method || 'cod',
      p_customer_notes: customer_notes || null,
      p_items: orderItems,
    })

    if (orderError) throw orderError

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
      order,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
