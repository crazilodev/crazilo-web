'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Heart, Star, ChevronRight, Leaf, Flame,
  Shield, Truck, Package, Minus, Plus, Share2
} from 'lucide-react'
import { Product, ProductVariant, Review } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils/formatPrice'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ProductCard from '@/components/products/ProductCard'
import toast from 'react-hot-toast'

interface Props {
  product: Product
  relatedProducts: Product[]
  reviews: Review[]
}

export default function ProductDetailClient({ product, relatedProducts, reviews }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  )
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews'>('description')
  const { addToCart } = useCart()
  const { hasItem, toggle } = useWishlist()
  const isWishlisted = hasItem(product.id)

  const images = [
    ...(product.thumbnail_url ? [product.thumbnail_url] : []),
    ...(product.images || []).filter((img) => img !== product.thumbnail_url),
  ]
  if (images.length === 0) images.push('')

  const discount = calculateDiscount(
    selectedVariant?.price || product.price,
    selectedVariant?.compare_price || product.compare_price
  )

  const currentPrice = selectedVariant?.price || product.price
  const comparePrice = selectedVariant?.compare_price || product.compare_price
  const inStock = selectedVariant
    ? selectedVariant.stock_quantity > 0
    : !product.track_inventory || product.stock_quantity > 0

  const handleAddToCart = () => {
    addToCart(product, selectedVariant || undefined, quantity)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        url: window.location.href,
      })
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-red transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-brand-red transition-colors">Products</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link href={`/category/${product.category.slug}`} className="hover:text-brand-red transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-gray-50 aspect-square">
              {images[selectedImage] ? (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-200" />
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="red" size="md">{discount}% OFF</Badge>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === selectedImage ? 'border-brand-red' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {img ? (
                      <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Flags */}
            <div className="flex flex-wrap gap-2">
              {product.is_bestseller && <Badge variant="dark"><Flame className="w-3 h-3 mr-1 inline" />Best Seller</Badge>}
              {product.is_organic && <Badge variant="organic"><Leaf className="w-3 h-3 mr-1" />Organic</Badge>}
              {product.no_added_sugar && <Badge variant="green">No Added Sugar</Badge>}
              {product.is_new && <Badge variant="gold">New Arrival</Badge>}
            </div>

            {/* Category */}
            {product.category && (
              <Link href={`/category/${product.category.slug}`} className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline">
                {product.category.name}
              </Link>
            )}

            {/* Title */}
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.average_rating) ? 'fill-brand-gold text-brand-gold' : 'fill-gray-200 text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">{product.average_rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.review_count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-heading font-bold text-brand-red">
                {formatPrice(currentPrice)}
              </span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(comparePrice)}</span>
              )}
              {discount > 0 && (
                <span className="bg-red-50 text-brand-red text-sm font-bold px-2.5 py-1 rounded-lg">
                  Save {formatPrice(comparePrice! - currentPrice)}
                </span>
              )}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Size / Variant:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.filter(v => v.is_active).map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-brand-red bg-red-50 text-brand-red'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {variant.name}
                      <span className={`ml-1.5 text-xs ${selectedVariant?.id === variant.id ? 'text-brand-red/70' : 'text-gray-400'}`}>
                        {formatPrice(variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${inStock ? 'text-emerald-700' : 'text-red-600'}`}>
                {inStock
                  ? `In Stock${product.stock_quantity <= (product.low_stock_threshold || 10) && product.track_inventory ? ` (Only ${product.stock_quantity} left!)` : ''}`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={!inStock}
                variant="primary"
                size="lg"
                className="flex-1"
                id="product-add-to-cart-btn"
              >
                <ShoppingCart className="w-5 h-5" />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <button
                onClick={() => toggle(product.id, product.name)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  isWishlisted ? 'border-brand-red bg-red-50 text-brand-red' : 'border-gray-200 text-gray-400 hover:border-brand-red hover:text-brand-red'
                }`}
                aria-label="Add to wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-brand-red' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, text: 'Free shipping above ₹599' },
                { icon: Shield, text: '100% authentic products' },
                { icon: Package, text: 'Secure packaging' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center text-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-5 h-5 text-brand-red" />
                  <span className="text-xs text-gray-600 leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <div className="flex gap-0">
              {(['description', 'nutrition', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold capitalize border-b-2 transition-all ${
                    activeTab === tab
                      ? 'border-brand-red text-brand-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'reviews' ? `Reviews (${reviews.length})` : tab === 'nutrition' ? 'Nutrition' : 'Description'}
                </button>
              ))}
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-gray max-w-none">
                {product.description ? (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                ) : (
                  <p className="text-gray-400">No description available.</p>
                )}
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                {product.nutritional_info &&
                typeof product.nutritional_info === 'object' &&
                !Array.isArray(product.nutritional_info) &&
                Object.keys(product.nutritional_info).length > 0 ? (
                  <div className="max-w-md">
                    <h3 className="font-heading font-bold text-lg text-gray-900 mb-4">Nutritional Information</h3>
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                      {Object.entries(product.nutritional_info as Record<string, unknown>).map(([key, value], i) => (
                        <div key={key} className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-semibold text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Nutritional information not available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-brand-red flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {(review.profile as any)?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{(review.profile as any)?.full_name || 'Customer'}</p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-brand-gold text-brand-gold' : 'fill-gray-200 text-gray-200'}`} />
                            ))}
                          </div>
                        </div>
                        {review.is_verified_purchase && (
                          <span className="ml-auto text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 font-semibold">
                            ✓ Verified Purchase
                          </span>
                        )}
                      </div>
                      {review.title && <p className="font-semibold text-gray-800 mb-1">{review.title}</p>}
                      {review.body && <p className="text-gray-600 text-sm leading-relaxed">{review.body}</p>}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
