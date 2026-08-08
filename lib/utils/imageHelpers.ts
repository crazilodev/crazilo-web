import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSupabaseImageUrl(
  bucket: string,
  path: string,
  supabaseUrl?: string
): string {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !path) return '/placeholder.png'
  if (path.startsWith('http')) return path
  return `${url}/storage/v1/object/public/${bucket}/${path}`
}

export function getProductThumbnail(product: {
  thumbnail_url?: string | null
  images?: string[]
}): string | null {
  if (product.thumbnail_url) return product.thumbnail_url
  if (product.images && product.images.length > 0) return product.images[0]
  return null
}
