import 'server-only'
import { createHash, timingSafeEqual } from 'crypto'

const sha512 = (s: string) => createHash('sha512').update(s).digest('hex')

export type PayuRequestFields = {
  key: string
  txnid: string
  amount: string
  productinfo: string
  firstname: string
  email: string
  udf?: string[] // up to 5 values (udf1..udf5)
}

/** key|txnid|amount|productinfo|firstname|email|udf1..udf5||||||salt */
export function generateRequestHash(f: PayuRequestFields, salt: string): string {
  const udf = Array.from({ length: 5 }, (_, i) => f.udf?.[i] ?? '')
  return sha512([f.key, f.txnid, f.amount, f.productinfo, f.firstname, f.email, ...udf, '', '', '', '', '', salt].join('|'))
}

/** [additionalCharges|]salt|status||||||udf5..udf1|email|firstname|productinfo|amount|txnid|key */
export function generateReverseHash(p: Record<string, string>, salt: string): string {
  const parts = [
    salt,
    p.status ?? '',
    '', '', '', '', '',
    p.udf5 ?? '', p.udf4 ?? '', p.udf3 ?? '', p.udf2 ?? '', p.udf1 ?? '',
    p.email ?? '', p.firstname ?? '', p.productinfo ?? '', p.amount ?? '', p.txnid ?? '', p.key ?? '',
  ]
  if (p.additionalCharges) parts.unshift(p.additionalCharges)
  return sha512(parts.join('|'))
}

export function verifyReverseHash(p: Record<string, string>, salt: string): boolean {
  if (!p.hash) return false
  const expected = Buffer.from(generateReverseHash(p, salt))
  const received = Buffer.from(String(p.hash).toLowerCase())
  return expected.length === received.length && timingSafeEqual(expected, received)
}

/** key|command|var1|salt — for the PayU post-service APIs. */
export function generateApiHash(key: string, command: string, var1: string, salt: string): string {
  return sha512([key, command, var1, salt].join('|'))
}

