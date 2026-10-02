import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

// Configure Cloudinary using server-side or public environment variables
cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface CloudinaryUploadOptions {
  folder?: string
  tags?: string[]
  publicId?: string
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: CloudinaryUploadOptions = {}
): Promise<UploadApiResponse> {
  const folder = options.folder ? `crazilo/${options.folder}` : 'crazilo/general'

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: options.publicId,
        tags: options.tags || ['crazilo', 'store'],
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]', error)
          reject(error)
        } else if (!result) {
          reject(new Error('Cloudinary upload returned an empty response.'))
        } else {
          resolve(result)
        }
      }
    )

    uploadStream.end(buffer)
  })
}

export { cloudinary }
