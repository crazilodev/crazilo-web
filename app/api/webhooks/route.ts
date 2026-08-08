import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Future: Handle payment gateway webhooks (Razorpay, PayU, etc.)
  const payload = await request.json().catch(() => ({}))
  console.log('Webhook received:', payload)
  return NextResponse.json({ received: true })
}
