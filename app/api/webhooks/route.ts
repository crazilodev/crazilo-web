import { NextResponse } from 'next/server'
import { isAuthenticPayuPayload, parsePayuBody, settleTransaction } from '@/lib/payu/settle'

export const dynamic = 'force-dynamic'

/**
 * PayU server-to-server webhook. Authenticity is checked via the reverse hash.
 * Processing is idempotent, so PayU retries are safe.
 */
export async function POST(request: Request) {
  try {
    const body = await parsePayuBody(request)
    if (!isAuthenticPayuPayload(body)) {
      console.warn('[payu] webhook rejected: invalid hash')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payloadStatus =
      String(body.status).toLowerCase() === 'success' ? 'success' : 'failed'

    const outcome = await settleTransaction(body.txnid, {
      status: payloadStatus,
      mihpayid: body.mihpayid || null,
      amount: Number(body.amount) || null,
      raw: body,
    })

    return NextResponse.json({ received: true, result: outcome.result })
  } catch (error: any) {
    console.error('[payu] webhook error:', error?.message)
    // Non-2xx makes PayU retry.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
