import 'server-only'
import { NextResponse } from 'next/server'
import { isAuthenticPayuPayload, parsePayuBody, settleTransaction } from './settle'

function redirectTo(path: string) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')
  // 303 so the browser follows the PayU POST with a GET.
  return NextResponse.redirect(`${site}${path}`, 303)
}

/**
 * Shared browser-callback handler (surl / furl). The posted status is never trusted:
 * reverse hash must match AND the Verify Payment API decides the final outcome.
 */
export async function handlePayuCallback(request: Request) {
  try {
    const body = await parsePayuBody(request)
    if (!isAuthenticPayuPayload(body)) {
      console.warn('[payu] callback rejected: invalid reverse hash')
      return redirectTo('/checkout?payment=invalid')
    }

    const outcome = await settleTransaction(body.txnid)
    const order = encodeURIComponent(outcome.orderNumber || '')

    switch (outcome.result) {
      case 'success':
      case 'already_success':
        return redirectTo(`/orders?paid=${order}`)
      case 'success_order_cancelled':
      case 'duplicate':
      case 'already_duplicate':
      case 'amount_mismatch':
        return redirectTo(`/orders?payment=review&order=${order}`)
      case 'pending':
      case 'unverified':
        return redirectTo(`/orders?payment=pending&order=${order}`)
      case 'cancelled':
        return redirectTo('/checkout?payment=cancelled')
      default:
        return redirectTo('/checkout?payment=failed')
    }
  } catch (error: any) {
    console.error('[payu] callback error:', error?.message)
    return redirectTo('/orders?payment=pending')
  }
}

