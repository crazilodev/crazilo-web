'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Heart, Star, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useWishlist } from '@/lib/hooks/useWishlist'
import type { Category, Product } from '@/types'
import toast from 'react-hot-toast'

interface CashewStoreSectionProps {
  category: Category | null
  subcategories: Category[]
  products: Product[]
}

const WEIGHTS = ['200g', '450g', '900g']

export default function CashewStoreSection({
  category,
  subcategories,
  products,
}: CashewStoreSectionProps) {
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({})
  const { addItem } = useCartStore()
  const { toggle, hasItem } = useWishlist()
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!category || products.length === 0) return null

  const handleWeightSelect = (productId: string, weight: string) => {
    setSelectedWeights((prev) => ({ ...prev, [productId]: weight }))
  }

  const handleAddToCart = (product: Product) => {
    const chosenWeight = selectedWeights[product.id] || WEIGHTS[0]
    addItem(product)
    toast.success(`Added ${product.name} (${chosenWeight}) to Cart!`, {
      style: { background: '#8B0000', color: '#fff', borderRadius: '12px' },
      icon: '🛒',
    })
  }

  return (
    <section className="py-12 bg-[#FFFDF9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            <div className="bg-[#8B0000] text-white p-4 rounded-2xl shadow-md">
              <h3 className="font-heading text-lg font-black tracking-wider uppercase">
                {category.name}
              </h3>
            </div>

            {/* Subcategories horizontal sliding rail on mobile, sidebar list on desktop */}
            <div className="bg-[#FAF4ED] border border-[#EFE5D8] rounded-2xl p-2 flex flex-row overflow-x-auto hide-scrollbar gap-2 lg:flex-col lg:overflow-x-visible lg:space-y-1 lg:gap-0">
              {(subcategories.length > 0 ? subcategories : [category]).map((cat, index) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`flex-shrink-0 flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black tracking-wide transition-all lg:w-full ${
                    index === 0
                      ? 'bg-white text-[#A61919] shadow-sm border border-[#EFE7DD]'
                      : 'text-[#1A1A1A] hover:bg-white/60 hover:text-[#A61919]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className={`w-4 h-4 ml-2 lg:ml-0 ${index === 0 ? 'text-[#A61919]' : 'text-gray-400'}`} />
                </Link>
              ))}
            </div>

            {/* Promo Combo Offer Box (Hidden on mobile for visual speed/density) */}
            <div className="hidden lg:block relative overflow-hidden bg-gradient-to-br from-[#8B0000] to-[#5C0000] text-white rounded-3xl p-6 shadow-xl space-y-4">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">
                COMBO OFFERS
              </span>

              <h4 className="font-heading text-2xl font-black leading-tight">
                More Goodness.
                <br />
                Better Value.
              </h4>

              <Link
                href="/category/combos"
                className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-amber-300 hover:text-white transition-colors"
              >
                <span>EXPLORE COMBOS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="relative w-full h-32 mt-2 rounded-2xl overflow-hidden shadow-md">
                <Image
                  src="/images/cat-combos.png"
                  alt="Combo Gift Box Offers"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EFE7DD] pb-4">
              <div>
                <span className="text-[11px] font-black text-[#A65E2E] uppercase tracking-widest block mb-1">
                  {category.slug.toUpperCase().replace(/-/g, ' ')}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                  Our Cashew Range
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Sort by:</span>
                <select className="bg-white border border-[#EFE7DD] text-xs font-bold text-[#1A1A1A] py-2 px-3 rounded-xl focus:outline-none focus:border-[#A61919]">
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Changed from grid-cols-1 to grid-cols-2 by default for mobile viewports */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((product) => {
                const currentWeight = selectedWeights[product.id] || WEIGHTS[0]
                const isWishlisted = mounted ? hasItem(product.id) : false
                const image = product.thumbnail_url || product.images?.[0] || '/images/cat-dryfruits.png'

                return (
                  <div
                    key={product.id}
                    className="bg-[#FFFBF5] border border-[#EFE7DD] rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between hover:shadow-xl hover:border-[#A61919]/40 transition-all duration-300 relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {product.is_new ? (
                        <span className="bg-[#A61919] text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                          NEW
                        </span>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => {
                          toggle(product.id, product.name)
                        }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 border border-[#EFE7DD] flex items-center justify-center text-gray-400 hover:text-[#A61919] transition-colors shadow-sm"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#A61919] text-[#A61919]' : ''}`} />
                      </button>
                    </div>

                    <Link href={`/products/${product.slug}`} className="block relative w-full h-28 sm:h-40 mb-3 overflow-hidden rounded-xl bg-white/60 p-2">
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="font-heading text-[10px] sm:text-xs font-black text-[#1A1A1A] group-hover:text-[#A61919] transition-colors uppercase tracking-wider line-clamp-2 min-h-[30px] sm:min-h-[36px]">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {WEIGHTS.map((weight) => (
                          <button
                            key={weight}
                            onClick={() => handleWeightSelect(product.id, weight)}
                            className={`text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border transition-all ${
                              currentWeight === weight
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {weight}
                          </button>
                        ))}
                      </div>

                      {/* Stacks vertically on mobile to prevent overlapping */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5">
                        <div>
                          <span className="text-xs sm:text-base font-black text-[#1A1A1A]">₹{product.price}</span>
                          {product.compare_price && (
                            <span className="text-[10px] sm:text-xs text-gray-400 line-through ml-1 font-medium">
                              ₹{product.compare_price}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-0.5 text-[9px] sm:text-[11px] font-extrabold text-[#1A1A1A]">
                          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.average_rating}</span>
                          <span className="text-gray-400 font-normal hidden sm:inline">({product.review_count})</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full mt-2 bg-[#A61919] hover:bg-[#8B0000] text-white font-extrabold text-[9px] sm:text-[11px] uppercase tracking-wider py-2 sm:py-2.5 rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <span>ADD TO CART</span>
                        <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
