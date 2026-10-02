import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'general'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in the request.' },
        { status: 400 }
      )
    }

    // Check Cloudinary credentials
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('[Cloudinary Upload] Missing environment variables:', {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret,
      })
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloudinary credentials are not configured on the server. Please check .env.local',
        },
        { status: 500 }
      )
    }

    // Convert file to ArrayBuffer then Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder,
      tags: ['crazilo', folder],
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    })
  } catch (error: any) {
    console.error('[API /api/upload error]:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Image upload to Cloudinary failed.',
      },
      { status: 500 }
    )
  }
}
