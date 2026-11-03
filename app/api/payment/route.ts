import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPayuConfig } from '@/lib/payu/config'
import { generateRequestHash } from '@/lib/payu/hash'

/**
 * Initiates a PayU checkout for an existing (pending, online) order.
 * Works seamlessly for both authenticated customers and guest checkouts.
 * The amount is always verified on the database level, never from client input.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { order_id } = await request.json().catch(() => ({}))
    if (!order_id || typeof order_id !== 'string') {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }

    const cfg = getPayuConfig()
    const txnid = `CRZ${Date.now()}${randomBytes(4).toString('hex')}`

    // 1. Try atomic SECURITY DEFINER function first (handles RLS and guest orders cleanly)
    const { data: prep, error: prepError } = await supabase.rpc('prepare_payu_payment', {
      p_order_id: order_id,
      p_txnid: txnid,
    })

    let orderInfo: {
      order_number: string
      amount: string
      shipping_address: any
    }

    if (!prepError && prep) {
      if (prep.error) {
        return NextResponse.json({ error: prep.error }, { status: prep.error === 'Order not found' ? 404 : 400 })
      }
      orderInfo = {
        order_number: prep.order_number,
        amount: prep.amount,
        shipping_address: prep.shipping_address,
      }
    } else {
      // Fallback: direct table query
      let query = supabaseAdmin
        .from('orders')
        .select('id, order_number, user_id, total_amount, status, payment_status, payment_method, shipping_address')
        .eq('id', order_id)

      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.is('user_id', null)
      }

      const { data: order, error: orderError } = await query.maybeSingle()

      if (orderError || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      if (order.payment_method !== 'online') {
        return NextResponse.json({ error: 'Order is not an online payment order' }, { status: 400 })
      }
      if (order.payment_status === 'paid') {
        return NextResponse.json({ error: 'Order is already paid' }, { status: 409 })
      }
      if (order.status !== 'pending' || order.payment_status !== 'pending') {
        return NextResponse.json({ error: 'Order is not payable' }, { status: 409 })
      }

      await supabaseAdmin.from('payment_transactions').insert({
        order_id: order.id,
        txnid,
        amount: Number(order.total_amount).toFixed(2),
        status: 'initiated',
      })

      orderInfo = {
        order_number: order.order_number,
        amount: Number(order.total_amount).toFixed(2),
        shipping_address: order.shipping_address,
      }
    }

    const addr = orderInfo.shipping_address || {}
    const clean = (s: unknown, max: number) =>
      String(s ?? '').replace(/[^A-Za-z0-9 .,_@-]/g, '').trim().slice(0, max)
    const firstname = clean(addr.full_name, 60) || 'Customer'
    const email = clean(user?.email || addr.email, 100) || 'customer@craziloonline.com'
    const productinfo = `Crazilo Order ${orderInfo.order_number}`
    const phone = String(addr.phone || '').replace(/\D/g, '').slice(-10)

    const fields = {
      key: cfg.key,
      txnid,
      amount: orderInfo.amount,
      productinfo,
      firstname,
      email,
      phone,
      surl: cfg.successUrl,
      furl: cfg.failureUrl,
      hash: generateRequestHash(
        { key: cfg.key, txnid, amount: orderInfo.amount, productinfo, firstname, email },
        cfg.salt
      ),
    }

    return NextResponse.json({ action: cfg.paymentUrl, fields })
  } catch (error: any) {
    console.error('[payu] initiate failed:', error?.message)
    return NextResponse.json({ error: 'Unable to start payment. Please try again.' }, { status: 500 })
  }
}
