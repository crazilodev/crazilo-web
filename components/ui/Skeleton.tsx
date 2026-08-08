import { cn } from '@/lib/utils/imageHelpers'

interface SkeletonProps {
  className?: string
  rounded?: boolean
}

export function Skeleton({ className, rounded }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton',
        rounded ? 'rounded-full' : 'rounded-lg',
        className
      )}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="h-64 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BannerSkeleton() {
  return <Skeleton className="w-full h-[500px] lg:h-[600px] rounded-none" />
}
