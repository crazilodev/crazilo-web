'use client'

import Link from 'next/link'
import { ArrowRight, Flame } from 'lucide-react'
import { useBestSellers } from '@/lib/hooks/useProducts'
import ProductGrid from '@/components/products/ProductGrid'

export default function BestSellers() {
  const { products, loading } = useBestSellers()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-brand-gold fill-brand-gold" />
              <span className="text-brand-gold text-sm font-bold uppercase tracking-widest">
                Most Popular
              </span>
            </div>
            <h2 className="section-heading">Best Sellers</h2>
            <div className="divider-gold w-24 mt-3" />
          </div>
          <Link
            href="/products?sort=popular"
            className="hidden sm:flex items-center gap-2 text-brand-red font-semibold text-sm hover:gap-3 transition-all"
          >
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={products} loading={loading} skeletonCount={8} />
      </div>
    </section>
  )
}
