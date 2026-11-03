import { handlePayuCallback } from '@/lib/payu/callback'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  return handlePayuCallback(request)
}

