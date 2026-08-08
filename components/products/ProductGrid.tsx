import ProductCard from './ProductCard'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/Skeleton'
import { ShoppingBag } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  skeletonCount?: number
  cols?: 2 | 3 | 4 | 5
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
  cols = 4,
}: ProductGridProps) {
  const colsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  }[cols]

  if (loading) return <ProductGridSkeleton count={skeletonCount} />

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-heading font-bold text-gray-700 mb-2">No products found</h3>
        <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div className={`grid ${colsClass} gap-4 lg:gap-6`}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  )
}
