import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getPayuConfig } from './config'
import { generateApiHash, verifyReverseHash } from './hash'

export type VerifiedStatus = 'success' | 'pending' | 'failed' | 'cancelled' | 'unknown'

export type VerifyResult = {
  status: VerifiedStatus
  mihpayid: string | null
  amount: number | null
  raw: unknown
}

/** Server-to-server Verify Payment API call. */
export async function verifyPaymentWithPayu(txnid: string): Promise<VerifyResult> {
  const cfg = getPayuConfig()
  const body = new URLSearchParams({
    key: cfg.key,
    command: 'verify_payment',
    var1: txnid,
    hash: generateApiHash(cfg.key, 'verify_payment', txnid, cfg.salt),
  })

  const res = await fetch(cfg.verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`PayU verify API HTTP ${res.status}`)

  const json: any = await res.json()
  const detail = json?.transaction_details?.[txnid]
  if (json?.status !== 1 || !detail || detail.mihpayid === 'Not Found') {
    return { status: 'unknown', mihpayid: null, amount: null, raw: json }
  }

  const s = String(detail.status || '').toLowerCase()
  const unmapped = String(detail.unmappedstatus || '').toLowerCase()
  let status: VerifiedStatus
  if (s === 'success') status = 'success'
  else if (s === 'pending' || unmapped === 'pending' || unmapped === 'initiated') status = 'pending'
  else if (unmapped === 'usercancelled' || s === 'usercancelled') status = 'cancelled'
  else status = 'failed'

  const amount = Number(detail.transaction_amount ?? detail.amt)
  return {
    status,
    mihpayid: detail.mihpayid ? String(detail.mihpayid) : null,
    amount: Number.isFinite(amount) ? amount : null,
    raw: detail,
  }
}

export type SettleOutcome = {
  txnid: string
  result: string
  orderId: string | null
  orderNumber: string | null
}

/**
 * Applies the payment result atomically in the database via the SECURITY DEFINER RPC.
 * Accepts verified payload from authentic PayU reverse-hash callback or verifies via API.
 */
export async function settleTransaction(
  txnid: string,
  verifiedPayload?: { status: string; mihpayid?: string | null; amount?: number | null; raw?: any }
): Promise<SettleOutcome> {
  const supabase = createClient()

  let vStatus = verifiedPayload?.status
  let vMihpayid = verifiedPayload?.mihpayid || null
  let vAmount = verifiedPayload?.amount ?? null
  let vRaw = verifiedPayload?.raw || null

  // If status is not provided, verify with PayU API
  if (!vStatus) {
    try {
      const v = await verifyPaymentWithPayu(txnid)
      if (v.status !== 'unknown') {
        vStatus = v.status
        vMihpayid = v.mihpayid
        vAmount = v.amount
        vRaw = v.raw
      }
    } catch (e: any) {
      console.warn('[payu] verifyPaymentWithPayu call failed:', e?.message)
    }
  }

  if (!vStatus) {
    return { txnid, result: 'unverified', orderId: null, orderNumber: null }
  }

  // Execute atomic DB settlement using SECURITY DEFINER function
  const { data, error } = await supabase.rpc('apply_payu_result', {
    p_txnid: txnid,
    p_status: vStatus,
    p_gateway_payment_id: vMihpayid,
    p_amount: vAmount,
    p_response: vRaw,
  })

  if (error) {
    console.error('[payu] apply_payu_result error:', error)
    throw error
  }

  const resultObj = typeof data === 'object' && data !== null ? data : { result: String(data) }

  return {
    txnid,
    result: String(resultObj.result || 'unknown'),
    orderId: resultObj.order_id || null,
    orderNumber: resultObj.order_number || null,
  }
}

/** Parses PayU callback/webhook body (form-encoded or JSON) into a flat string map. */
export async function parsePayuBody(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get('content-type') || ''
  const out: Record<string, string> = {}
  if (type.includes('application/json')) {
    const json = await request.json().catch(() => ({}))
    for (const [k, v] of Object.entries(json || {})) out[k] = v == null ? '' : String(v)
  } else {
    const form = await request.formData().catch(() => null)
    form?.forEach((v, k) => {
      out[k] = String(v)
    })
  }
  return out
}

/** Callback/webhook authenticity check: reverse hash + merchant key. */
export function isAuthenticPayuPayload(p: Record<string, string>): boolean {
  const cfg = getPayuConfig()
  return !!p.txnid && p.key === cfg.key && verifyReverseHash(p, cfg.salt)
}
