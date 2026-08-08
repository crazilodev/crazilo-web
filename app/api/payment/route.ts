import { NextResponse } from 'next/server'

export async function POST() {
  // Future: Integrate Razorpay/PayU/Cashfree
  return NextResponse.json({
    message: 'Online payment gateway coming soon. COD is available.',
    supported_methods: ['cod'],
  })
}
