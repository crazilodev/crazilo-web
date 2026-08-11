export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded']

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return PAYMENT_STATUSES.includes(status as PaymentStatus)
}
