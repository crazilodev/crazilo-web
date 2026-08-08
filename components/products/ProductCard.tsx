'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Eye, Flame, Leaf } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils/formatPrice'
import { useCart } from '@/lib/hooks/useCart'
import { useWishlist } from '@/lib/hooks/useWishlist'
import Badge from '@/components/ui/Badge'

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <Badge variant="red" size="sm">{discount}% OFF</Badge>
        )}
        {product.is_new && <Badge variant="gold" size="sm">NEW</Badge>}
        {product.is_bestseller && (
          <Badge variant="dark" size="sm">
            <Flame className="w-3 h-3 mr-1 inline" /> Best Seller
          </Badge>
        )}
        {product.is_organic && (
          <Badge variant="organic" size="sm">
            <Leaf className="w-3 h-3 mr-1 inline" /> Organic
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          toggle(product.id, product.name)
        }}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm ${
          isWishlisted
            ? 'bg-red-50 text-brand-red'
            : 'bg-white/90 text-gray-400 hover:bg-red-50 hover:text-brand-red opacity-0 group-hover:opacity-100'
        }`}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-brand-red' : ''}`} />
      </button>

      {/* Image */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden bg-gray-50" style={{ paddingBottom: '80%' }}>
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.name}
            fill
            className="object-cover product-image"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg text-sm font-semibold text-gray-800">
            <Eye className="w-4 h-4" /> Quick View
          </div>
        </div>

        {/* Out of stock overlay */}
        {product.stock_quantity === 0 && product.track_inventory && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {product.category && (
          <p className="text-[10px] font-semibold text-brand-gold uppercase tracking-widest mb-1">
            {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-heading font-bold text-gray-900 text-sm leading-snug hover:text-brand-red transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.average_rating)
                      ? 'fill-brand-gold text-brand-gold'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-brand-red">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
          {product.weight_grams && (
            <span className="text-xs text-gray-400 ml-auto">
              {product.weight_grams >= 1000
                ? `${product.weight_grams / 1000}kg`
                : `${product.weight_grams}g`}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock_quantity === 0 && product.track_inventory}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 btn-premium ${
            product.stock_quantity === 0 && product.track_inventory
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-brand-red hover:bg-brand-red-dark text-white shadow-sm hover:shadow-md'
          }`}
          id={`add-to-cart-${product.id}`}
        >
          {product.stock_quantity === 0 && product.track_inventory ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}
