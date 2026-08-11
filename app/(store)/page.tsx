import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/home/HeroSlider'
import CategoryScroll from '@/components/home/CategoryScroll'
import CashewStoreSection from '@/components/home/CashewStoreSection'
import FindYourSnack from '@/components/home/FindYourSnack'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import OfferBanner from '@/components/home/OfferBanner'
import BestSellers from '@/components/home/BestSellers'
import WhyUs from '@/components/home/WhyUs'
import Testimonials from '@/components/home/Testimonials'
import NewsletterSection from '@/components/home/NewsletterSection'
import {
  getActiveBanners,
  getActiveTestimonials,
  getHomeFeatureCards,
  getHomeHighlights,
} from '@/lib/data/content'
import { getCategoryWithSubcategories, getMainCategories } from '@/lib/data/categories'
import { getProductsByMainCategory } from '@/lib/data/catalog'

export const metadata: Metadata = {
  title: 'Crazilo â€” Premium Dryfruits & Spices',
  description:
    'Shop premium quality dry fruits, nuts, and spices at Crazilo. 100% natural, no preservatives. Free shipping above â‚¹599.',
}

export default async function HomePage() {
  const supabase = createClient()
  const [mainCategories, banners, highlights, testimonials, findYourSnackCards, featuredCollections, dryFruitBundle] =
    await Promise.all([
      getMainCategories(supabase),
      getActiveBanners(supabase),
      getHomeHighlights(supabase),
      getActiveTestimonials(supabase),
      getHomeFeatureCards(supabase, 'find_your_snack'),
      getHomeFeatureCards(supabase, 'featured_collections'),
      getCategoryWithSubcategories(supabase, 'dry-fruits'),
    ])

  const cashewProducts = dryFruitBundle
    ? await getProductsByMainCategory(supabase, dryFruitBundle.category.id)
    : []

  return (
    <>
      <HeroSlider banners={banners} highlights={highlights} />
      <CategoryScroll categories={mainCategories} />
      <CashewStoreSection
        category={dryFruitBundle?.category ?? null}
        subcategories={dryFruitBundle?.subcategories ?? []}
        products={cashewProducts}
      />
      <FindYourSnack cards={findYourSnackCards} />
      <FeaturedProducts />
      <OfferBanner cards={featuredCollections} />
      <BestSellers />
      <WhyUs highlights={highlights} />
      <Testimonials testimonials={testimonials} />
      <NewsletterSection />
    </>
  )
}
