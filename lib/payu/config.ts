import 'server-only'

export type PayuConfig = {
  mode: 'test' | 'production'
  key: string
  salt: string
  paymentUrl: string
  verifyUrl: string
  successUrl: string
  failureUrl: string
  webhookUrl: string
  siteUrl: string
}

const HOSTS = {
  production: { base: 'https://secure.payu.in', verify: 'https://info.payu.in/merchant/postservice?form=2' },
  test: { base: 'https://test.payu.in', verify: 'https://test.payu.in/merchant/postservice?form=2' },
} as const

/**
 * Reads PayU settings from server-side env only. Never import from client code.
 * PAYU_MODE=test uses PAYU_TEST_* credentials + test endpoints;
 * PAYU_MODE=production uses PAYU_MERCHANT_* credentials + live endpoints.
 */
export function getPayuConfig(): PayuConfig {
  const mode = (process.env.PAYU_MODE || 'production') as 'test' | 'production'
  if (mode !== 'test' && mode !== 'production') {
    throw new Error('PAYU_MODE must be "test" or "production"')
  }

  const key = (mode === 'test' ? process.env.PAYU_TEST_MERCHANT_KEY : process.env.PAYU_MERCHANT_KEY) || ''
  const salt = (mode === 'test' ? process.env.PAYU_TEST_MERCHANT_SALT : process.env.PAYU_MERCHANT_SALT) || ''
  if (!key || !salt) {
    throw new Error(`PayU (${mode}) merchant key/salt missing in environment`)
  }

  const base = (process.env.PAYU_BASE_URL || HOSTS[mode].base).replace(/\/+$/, '')
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')

  return {
    mode,
    key,
    salt,
    paymentUrl: `${base}/_payment`,
    verifyUrl: process.env.PAYU_VERIFY_PAYMENT_URL || HOSTS[mode].verify,
    successUrl: process.env.PAYU_SUCCESS_URL || `${siteUrl}/api/payment/success`,
    failureUrl: process.env.PAYU_FAILURE_URL || `${siteUrl}/api/payment/failure`,
    webhookUrl: process.env.PAYU_WEBHOOK_URL || `${siteUrl}/api/webhooks`,
    siteUrl,
  }
}
