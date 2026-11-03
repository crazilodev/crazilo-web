import 'server-only'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getPayuConfig } from './config'
import { generateApiHash, verifyReverseHash } from './hash'

export type VerifiedStatus = 'success' | 'pending' | 'failed' | 'cancelled' | 'unknown'

export type VerifyResult = {
  status: VerifiedStatus
  mihpayid: string | null
  amount: number | null
  raw: unknown
}

/** Server-to-server Verify Payment API call. This is the source of truth for payment state. */
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
  result: string // output of apply_payu_result, or 'unverified'
  orderId: string | null
  orderNumber: string | null
}

/** Verifies a txn with PayU, then applies the result atomically + idempotently in the DB. */
export async function settleTransaction(txnid: string): Promise<SettleOutcome> {
  const { data: txn } = await supabaseAdmin
    .from('payment_transactions')
    .select('order_id, orders(order_number)')
    .eq('txnid', txnid)
    .maybeSingle()

  const base = {
    txnid,
    orderId: txn?.order_id ?? null,
    orderNumber: txn?.orders?.order_number ?? null,
  }
  if (!txn) return { ...base, result: 'unknown_txn' }

  const v = await verifyPaymentWithPayu(txnid)
  if (v.status === 'unknown') return { ...base, result: 'unverified' }

  const { data, error } = await supabaseAdmin.rpc('apply_payu_result', {
    p_txnid: txnid,
    p_status: v.status,
    p_gateway_payment_id: v.mihpayid,
    p_amount: v.amount,
    p_response: v.raw,
  })
  if (error) throw error
  return { ...base, result: String(data) }
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
    form?.forEach((v, k) => { out[k] = String(v) })
  }
  return out
}

/** Callback/webhook authenticity check: reverse hash + merchant key. */
export function isAuthenticPayuPayload(p: Record<string, string>): boolean {
  const cfg = getPayuConfig()
  return !!p.txnid && p.key === cfg.key && verifyReverseHash(p, cfg.salt)
}

