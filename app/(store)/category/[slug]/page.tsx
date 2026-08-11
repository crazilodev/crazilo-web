import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CategoryPageClient from './CategoryPageClient'
import { getCategoryBySlug } from '@/lib/data/categories'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const cat = await getCategoryBySlug(supabase, params.slug, false)
  if (!cat) return { title: 'Category Not Found' }
  return { title: cat.meta_title || cat.name, description: cat.meta_description || '' }
}

export default async function CategoryPage({ params }: Props) {
  const supabase = createClient()
  const category = await getCategoryBySlug(supabase, params.slug)
  if (!category) notFound()
  return <CategoryPageClient category={category} />
}
