import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrderWithItems, getUserOrderById, getUserOrders } from '@/lib/data/orders'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (orderId) {
      const order = await getUserOrderById(supabase, user.id, orderId)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ order })
    }

    const orders = await getUserOrders(supabase, user.id)
    return NextResponse.json({ orders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Active-account enforcement: suspended users cannot create orders
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .single()

    if (!profile || !profile.is_active) {
      return NextResponse.json({ error: 'Your account has been suspended. Order placement is not permitted.' }, { status: 403 })
    }

    const body = await request.json()
    const { shipping_address, billing_address, items, coupon_code, customer_notes, payment_method } = body

    if (!shipping_address || !shipping_address.full_name || !shipping_address.address_line1 || !shipping_address.phone) {
      return NextResponse.json({ error: 'Invalid or incomplete shipping address' }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const orderItems = items.map((item: any) => ({
      product_id: item.product_id || item.product?.id || '',
      variant_id: item.variant_id || item.variant?.id || null,
      quantity: Number(item.quantity) || 1,
    }))

    if (orderItems.some((item) => !item.product_id || item.quantity <= 0)) {
      return NextResponse.json({ error: 'Invalid order items' }, { status: 400 })
    }

    const order = await createOrderWithItems(supabase, {
      shippingAddress: shipping_address,
      billingAddress: billing_address || shipping_address,
      couponCode: coupon_code || null,
      paymentMethod: payment_method || 'cod',
      customerNotes: customer_notes || null,
      items: orderItems,
    })

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
