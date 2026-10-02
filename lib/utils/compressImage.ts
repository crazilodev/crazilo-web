export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png'
}

export interface CompressedImageResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Client-side high-performance image compression using HTML5 Canvas & Blob API.
 * Resizes oversized dimensions and converts to modern lightweight WebP format.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    outputFormat = 'image/webp',
  } = options

  // Skip SVG or non-image files
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 0,
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate clamped dimensions while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            maxHeight ? (height = maxHeight) : (height = Math.round(height))
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          // If 2D context fails, fallback to original file
          return resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 0,
          })
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                compressionRatio: 0,
              })
            }

            // Construct new compressed filename with appropriate extension
            const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg'
            const baseName = file.name.replace(/\.[^/.]+$/, '')
            const compressedFilename = `${baseName}.${ext}`

            const compressedFile = new File([blob], compressedFilename, {
              type: outputFormat,
              lastModified: Date.now(),
            })

            const originalSize = file.size
            const compressedSize = compressedFile.size
            const compressionRatio =
              originalSize > 0
                ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
                : 0

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio,
            })
          },
          outputFormat,
          quality
        )
      }

      img.onerror = (error) => reject(error)
    }

    reader.onerror = (error) => reject(error)
  })
}
