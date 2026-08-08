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
    const { shipping_address, items, coupon_code, customer_notes, payment_method } = body

    if (!shipping_address || !shipping_address.full_name || !shipping_address.address_line1 || !shipping_address.phone) {
      return NextResponse.json({ error: 'Invalid or incomplete shipping address' }, { status: 400 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    const subtotal = items.reduce((s: number, i: any) => s + (Number(i.unit_price) || 0) * (Number(i.quantity) || 1), 0)
    const shipping_amount = subtotal >= 599 ? 0 : 50
    const initialTotal = subtotal + shipping_amount

    let couponId: string | null = null
    let discountAmount = 0

    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', String(coupon_code).toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (coupon) {
        const isNotExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date()
        const isMinMet = subtotal >= (coupon.minimum_order_amount || 0)
        
        if (isNotExpired && isMinMet) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100
            if (coupon.maximum_discount) {
              discountAmount = Math.min(discountAmount, coupon.maximum_discount)
            }
          } else {
            discountAmount = coupon.discount_value
          }
          couponId = coupon.id
        }
      }
    }

    const finalTotal = Math.max(0, initialTotal - discountAmount)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        shipping_address,
        billing_address: shipping_address,
        subtotal,
        discount_amount: discountAmount,
        shipping_amount,
        tax_amount: 0,
        total_amount: finalTotal,
        coupon_code: coupon_code ? String(coupon_code).toUpperCase().trim() : null,
        coupon_id: couponId,
        payment_method: payment_method || 'cod',
        customer_notes: customer_notes || null,
        status: 'pending',
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id || item.product?.id || null,
      variant_id: item.variant_id || item.variant?.id || null,
      product_name: item.product_name || item.product?.name || 'Product',
      variant_name: item.variant_name || item.variant?.name || null,
      sku: item.sku || item.product?.sku || null,
      thumbnail_url: item.thumbnail_url || item.product?.thumbnail_url || null,
      quantity: Number(item.quantity) || 1,
      unit_price: Number(item.unit_price || item.price) || 0,
      total_price: (Number(item.unit_price || item.price) || 0) * (Number(item.quantity) || 1),
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Update coupon usage count
    if (couponId) {
      const { data: cp } = await supabase.from('coupons').select('used_count').eq('id', couponId).single()
      if (cp) {
        await supabase.from('coupons').update({ used_count: (cp.used_count || 0) + 1 }).eq('id', couponId)
      }
    }

    // Update product stock and total_sold count
    for (const item of items) {
      const pId = item.product_id || item.product?.id
      const qty = Number(item.quantity) || 1
      if (pId) {
        const { data: prod } = await supabase.from('products').select('stock_quantity, total_sold').eq('id', pId).single()
        if (prod) {
          await supabase.from('products').update({
            stock_quantity: Math.max(0, (prod.stock_quantity || 0) - qty),
            total_sold: (prod.total_sold || 0) + qty,
          }).eq('id', pId)
        }
      }
    }

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
