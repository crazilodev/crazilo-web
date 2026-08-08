import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import CategoryPageClient from './CategoryPageClient'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: cat } = await supabase.from('categories').select('name, meta_title, meta_description').eq('slug', params.slug).single()
  if (!cat) return { title: 'Category Not Found' }
  return { title: cat.meta_title || cat.name, description: cat.meta_description || '' }
}

export default async function CategoryPage({ params }: Props) {
  const supabase = createClient()
  const { data: category } = await supabase.from('categories').select('*').eq('slug', params.slug).eq('is_active', true).single()
  if (!category) notFound()
  return <CategoryPageClient category={category} />
}
