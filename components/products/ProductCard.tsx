'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Flame, Leaf } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils/formatPrice'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'

interface ProductCardProps {
  product: Product
  index?: number
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart()
  const { hasItem, toggle } = useWishlist()
  const isWishlisted = hasItem(product.id)
  const discount = calculateDiscount(product.price, product.compare_price)
  const thumbnail = product.thumbnail_url || product.images?.[0] || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300 relative flex flex-col justify-between h-full select-none"
    >
      {/* Badges in Top Left */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {discount > 0 && (
          <span className="text-[9px] font-black tracking-wider uppercase bg-[#B91C1C] text-white px-2 py-0.5 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}
        {!discount && product.is_new && (
          <span className="text-[9px] font-black tracking-wider uppercase bg-[#D97706] text-white px-2 py-0.5 rounded-md shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="block relative bg-[#FAF9F6] aspect-square overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-102 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-gray-250" />
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.stock_quantity === 0 && product.track_inventory && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-left">
        <div>
          {/* Category */}
          {product.category && (
            <p className="text-[9px] font-bold text-[#D97706] uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}

          {/* Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-heading font-black text-gray-800 text-xs sm:text-sm leading-snug hover:text-[#B91C1C] transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Weight */}
          {product.weight_grams && (
            <p className="text-[10px] font-semibold text-gray-400">
              {product.weight_grams >= 1000
                ? `${product.weight_grams / 1000}kg`
                : `${product.weight_grams}g`}
            </p>
          )}

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${
                      i < Math.floor(product.average_rating)
                        ? 'fill-[#D97706] text-[#D97706]'
                        : 'fill-gray-150 text-gray-150'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-semibold text-gray-400">({product.review_count})</span>
            </div>
          )}
        </div>

        {/* Pricing & CTA Row */}
        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-sm sm:text-base font-black text-[#B91C1C]">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-xs text-gray-405 line-through font-medium">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock_quantity === 0 && product.track_inventory}
              className={`flex-1 py-2 px-3 rounded-xl text-[10px] sm:text-xs font-black tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 ${
                product.stock_quantity === 0 && product.track_inventory
                  ? 'bg-gray-105 text-gray-400 cursor-not-allowed border border-gray-100'
                  : 'bg-[#7F1D1D] hover:bg-[#B91C1C] text-white shadow-sm'
              }`}
              id={`add-to-cart-${product.id}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            {/* Wishlist Icon Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                toggle(product.id, product.name)
              }}
              className={`p-2 rounded-xl border flex items-center justify-center transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-[#B91C1C]/35 text-[#B91C1C]'
                  : 'bg-white border-[#EFE7DD] text-gray-400 hover:bg-[#FFF8F0] hover:text-[#B91C1C]'
              }`}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#B91C1C]' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

