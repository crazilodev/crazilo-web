import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/home/HeroSlider'
import CategoryScroll from '@/components/home/CategoryScroll'
import CollectionGrid from '@/components/home/CollectionGrid'
import PopularPicks from '@/components/home/PopularPicks'
import NewsletterSection from '@/components/home/NewsletterSection'
import { getActiveBanners, getHomeHighlights, getHomeFeatureCards } from '@/lib/data/content'
import { getMainCategories } from '@/lib/data/categories'

export const metadata: Metadata = {
  title: 'Crazilo — Premium Dryfruits & Spices',
  description:
    'Shop premium quality dry fruits, nuts, and spices at Crazilo. 100% natural, no preservatives. Free shipping above ₹699.',
}

export default async function HomePage() {
  const supabase = createClient()
  const [mainCategories, banners, highlights, featuredCollections] = await Promise.all([
    getMainCategories(supabase),
    getActiveBanners(supabase),
    getHomeHighlights(supabase),
    getHomeFeatureCards(supabase, 'featured_collections'),
  ])

  return (
    <>
      <HeroSlider banners={banners} highlights={highlights} />
      <CategoryScroll categories={mainCategories} />
      <CollectionGrid collections={featuredCollections} />
      <PopularPicks />
      <NewsletterSection />
    </>
  )
}


