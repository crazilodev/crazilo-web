import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetailClient from '@/app/(store)/products/[slug]/ProductDetailClient'
import type { Product, Review } from '@/types'
import { getProductBySlug, getProductDetailPageData } from '@/lib/data/catalog'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = createClient()
    const product = await getProductBySlug(supabase, params.slug)

    if (product) {
      return {
        title: product.meta_title || product.name,
        description: product.meta_description || product.short_description || '',
      }
    }
  } catch {}

  return {
    title: 'Product | Crazilo Dryfruits & Spices',
    description: 'Shop premium quality dry fruits, nuts, and spices at Crazilo.',
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product: Product | null = null
  let relatedProducts: Product[] = []
  let reviews: Review[] = []

  try {
    const supabase = createClient()
    const data = await getProductDetailPageData(supabase, params.slug)
    product = data.product
    relatedProducts = data.relatedProducts
    reviews = data.reviews
  } catch {}

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} reviews={reviews} />
}
