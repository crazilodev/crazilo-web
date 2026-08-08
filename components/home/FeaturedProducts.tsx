'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useFeaturedProducts } from '@/lib/hooks/useProducts'
import ProductGrid from '@/components/products/ProductGrid'

export default function FeaturedProducts() {
  const { products, loading } = useFeaturedProducts()

  return (
    <section className="py-16 bg-cream-pattern">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-brand-gold text-sm font-bold uppercase tracking-widest">
              Handpicked for You
            </span>
            <h2 className="section-heading mt-2">Featured Products</h2>
            <div className="divider-gold w-24 mt-3" />
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-brand-red font-semibold text-sm hover:gap-3 transition-all"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={products} loading={loading} skeletonCount={8} />

        <div className="flex justify-center mt-10 sm:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-brand-red text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-red-dark transition-colors"
          >
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
