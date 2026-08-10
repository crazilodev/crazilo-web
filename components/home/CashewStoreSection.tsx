'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Heart, Star, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import { Product } from '@/types'
import toast from 'react-hot-toast'

interface ProductItem {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number
  rating: number
  reviewsCount: number
  badge?: string
  image: string
  weights: string[]
}

const CASHEW_PRODUCTS: ProductItem[] = [
  {
    id: 'c-180',
    name: 'CASHEW 180 GRADE',
    slug: 'cashew-180-grade',
    price: 199,
    comparePrice: 249,
    rating: 4.8,
    reviewsCount: 138,
    image: '/images/cat-dryfruits.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-240',
    name: 'CASHEW 240 GRADE',
    slug: 'cashew-240-grade',
    price: 229,
    comparePrice: 279,
    rating: 4.8,
    reviewsCount: 156,
    image: '/images/hero-cashews.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-320',
    name: 'CASHEW 320 GRADE',
    slug: 'cashew-320-grade',
    price: 259,
    comparePrice: 319,
    rating: 4.9,
    reviewsCount: 112,
    image: '/images/cat-nuts.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-salted',
    name: 'CASHEW SALTED',
    slug: 'cashew-salted',
    price: 219,
    comparePrice: 269,
    rating: 4.7,
    reviewsCount: 94,
    image: '/images/cat-dryfruits.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-chilly',
    name: 'CASHEW CHILLY ROASTED',
    slug: 'cashew-chilly-roasted',
    price: 249,
    comparePrice: 299,
    rating: 4.8,
    reviewsCount: 98,
    badge: 'NEW',
    image: '/images/cat-spices.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-pepper',
    name: 'CASHEW PEPPER ROASTED',
    slug: 'cashew-pepper-roasted',
    price: 249,
    comparePrice: 299,
    rating: 4.8,
    reviewsCount: 87,
    badge: 'NEW',
    image: '/images/cat-nuts.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-green-chilly',
    name: 'CASHEW GREEN CHILLY ROASTED',
    slug: 'cashew-green-chilly-roasted',
    price: 249,
    comparePrice: 299,
    rating: 4.7,
    reviewsCount: 76,
    badge: 'NEW',
    image: '/images/cat-spices.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-barbeque',
    name: 'CASHEW BARBEQUE ROASTED',
    slug: 'cashew-barbeque-roasted',
    price: 249,
    comparePrice: 299,
    rating: 4.8,
    reviewsCount: 63,
    badge: 'NEW',
    image: '/images/cat-spices.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-cheese',
    name: 'CHEESE ROASTED CASHEW',
    slug: 'cheese-roasted-cashew',
    price: 259,
    comparePrice: 319,
    rating: 4.8,
    reviewsCount: 82,
    badge: 'NEW',
    image: '/images/cat-[#EFE7DD]cat-dryfruits.png',
    weights: ['200g', '450g', '900g'],
  },
  {
    id: 'c-borma',
    name: 'BORMA CASHEW',
    slug: 'borma-cashew',
    price: 279,
    comparePrice: 349,
    rating: 4.9,
    reviewsCount: 91,
    image: '/images/hero-cashews.png',
    weights: ['200g', '450g', '900g'],
  },
]

const SIDEBAR_CATEGORIES = [
  { name: 'Cashews', active: true },
  { name: 'Almonds', active: false },
  { name: 'Pistachios', active: false },
  { name: 'Walnuts', active: false },
  { name: 'Raisins', active: false },
  { name: 'Dates', active: false },
  { name: 'Dried Berries', active: false },
  { name: 'More Dry Fruits', active: false },
]

export default function CashewStoreSection() {
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({})
  const { addItem } = useCartStore()
  const { toggleItem, hasItem } = useWishlistStore()

  const handleWeightSelect = (productId: string, weight: string) => {
    setSelectedWeights((prev) => ({ ...prev, [productId]: weight }))
  }

  const handleAddToCart = (product: ProductItem) => {
    const chosenWeight = selectedWeights[product.id] || '200g'
    const dummyProduct = {
      id: product.id,
      name: `${product.name} (${chosenWeight})`,
      slug: product.slug,
      price: product.price,
      compare_price: product.comparePrice,
      images: [product.image],
      category_id: 'c-1',
      description: 'Premium roasted cashews',
      stock_quantity: 50,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as Product

    addItem(dummyProduct, undefined, 1)
    toast.success(`Added ${product.name} (${chosenWeight}) to Cart!`, {
      style: { background: '#8B0000', color: '#fff', borderRadius: '12px' },
      icon: '🛒',
    })
  }

  return (
    <section className="py-12 bg-[#FFFDF9]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Left Sidebar (3 Cols) + Right Product Range (9 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
            
            {/* Top Red Sidebar Title Card */}
            <div className="bg-[#8B0000] text-white p-4 rounded-2xl shadow-md">
              <h3 className="font-heading text-lg font-black tracking-wider uppercase">
                DRY FRUITS
              </h3>
            </div>

            {/* Vertical Sub-category List */}
            <div className="bg-[#FAF4ED] border border-[#EFE5D8] rounded-2xl p-2 space-y-1">
              {SIDEBAR_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href="/category/dry-fruits"
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-black tracking-wide transition-all ${
                    cat.active
                      ? 'bg-white text-[#A61919] shadow-sm border border-[#EFE7DD]'
                      : 'text-[#1A1A1A] hover:bg-white/60 hover:text-[#A61919]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <ChevronRight className={`w-4 h-4 ${cat.active ? 'text-[#A61919]' : 'text-gray-400'}`} />
                </Link>
              ))}
            </div>

            {/* Bottom COMBO OFFERS Banner Card inside Sidebar */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#8B0000] to-[#5C0000] text-white rounded-3xl p-6 shadow-xl space-y-4">
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-300">
                COMBO OFFERS
              </span>

              <h4 className="font-heading text-2xl font-black leading-tight">
                More Goodness.<br />Better Value.
              </h4>

              <Link
                href="/category/combos"
                className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-amber-300 hover:text-white transition-colors"
              >
                <span>EXPLORE COMBOS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Gift Box Graphic Image Cutout */}
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

          {/* RIGHT PRODUCT GRID SECTION */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Header & Sorting Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EFE7DD] pb-4">
              <div>
                <span className="text-[11px] font-black text-[#A65E2E] uppercase tracking-widest block mb-1">
                  CASHEWS
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
                  Our Cashew Range
                </h2>
              </div>

              {/* Sort Dropdown */}
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

            {/* 4-Column Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CASHEW_PRODUCTS.map((product) => {
                const currentWeight = selectedWeights[product.id] || '200g'
                const isWishlisted = hasItem(product.id)

                return (
                  <div
                    key={product.id}
                    className="bg-[#FFFBF5] border border-[#EFE7DD] rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-[#A61919]/40 transition-all duration-300 relative group"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-2">
                      {product.badge ? (
                        <span className="bg-[#A61919] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {product.badge}
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Wishlist Heart */}
                      <button
                        onClick={() => {
                          toggleItem(product.id)
                          toast.success('Wishlist updated!')
                        }}
                        className="w-8 h-8 rounded-full bg-white/80 border border-[#EFE7DD] flex items-center justify-center text-gray-400 hover:text-[#A61919] transition-colors shadow-sm"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#A61919] text-[#A61919]' : ''}`} />
                      </button>
                    </div>

                    {/* Product Image Cutout Container */}
                    <Link href={`/products/${product.slug}`} className="block relative w-full h-40 mb-3 overflow-hidden rounded-xl bg-white/60 p-2">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="space-y-2 flex-1 flex flex-col justify-between">
                      <Link href={`/products/${product.slug}`} className="block">
                        <h3 className="font-heading text-xs font-black text-[#1A1A1A] group-hover:text-[#A61919] transition-colors uppercase tracking-wider line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Weight Selector Pills */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {product.weights.map((w) => (
                          <button
                            key={w}
                            onClick={() => handleWeightSelect(product.id, w)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                              currentWeight === w
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>

                      {/* Pricing & Rating */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-base font-black text-[#1A1A1A]">
                            ₹{product.price}
                          </span>
                          <span className="text-xs text-gray-400 line-through ml-1 font-medium">
                            ₹{product.comparePrice}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#1A1A1A]">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                          <span className="text-gray-400 font-normal">({product.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Add to Cart Red Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full mt-3 bg-[#A61919] hover:bg-[#8B0000] text-white font-extrabold text-[11px] uppercase tracking-wider py-2.5 rounded-full flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <span>ADD TO CART</span>
                        <ShoppingCart className="w-3.5 h-3.5" />
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
