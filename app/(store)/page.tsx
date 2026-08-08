import type { Metadata } from 'next'
import HeroSlider from '@/components/home/HeroSlider'
import CategoryScroll from '@/components/home/CategoryScroll'
import FindYourSnack from '@/components/home/FindYourSnack'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import OfferBanner from '@/components/home/OfferBanner'
import BestSellers from '@/components/home/BestSellers'
import WhyUs from '@/components/home/WhyUs'
import Testimonials from '@/components/home/Testimonials'
import NewsletterSection from '@/components/home/NewsletterSection'

export const metadata: Metadata = {
  title: 'Crazilo — Premium Dryfruits & Spices',
  description:
    'Shop premium quality dry fruits, nuts, and spices at Crazilo. 100% natural, no preservatives. Free shipping above ₹599.',
}

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategoryScroll />
      <FindYourSnack />
      <FeaturedProducts />
      <OfferBanner />
      <BestSellers />
      <WhyUs />
      <Testimonials />
      <NewsletterSection />
    </>
  )
}
