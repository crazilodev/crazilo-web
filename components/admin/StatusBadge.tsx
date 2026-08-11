'use client'

import { cn } from '@/lib/utils/imageHelpers'

type StatusType =
  | 'order'
  | 'payment'
  | 'generic'

interface StatusBadgeProps {
  status: string
  type: StatusType
  className?: string
}

export default function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase()

  const styles: Record<string, string> = {
    // Order Status
    'order-pending': 'bg-amber-50 text-amber-700 border border-amber-200/50',
    'order-confirmed': 'bg-blue-50 text-blue-700 border border-blue-200/50',
    'order-processing': 'bg-purple-50 text-purple-700 border border-purple-200/50',
    'order-shipped': 'bg-indigo-50 text-indigo-700 border border-indigo-200/50',
    'order-delivered': 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    'order-cancelled': 'bg-red-50 text-red-700 border border-red-200/50',
    'order-refunded': 'bg-gray-100 text-gray-700 border border-gray-200',

    // Payment Status
    'payment-pending': 'bg-amber-50 text-amber-700 border border-amber-200/50',
    'payment-paid': 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    'payment-failed': 'bg-red-50 text-red-700 border border-red-200/50',
    'payment-refunded': 'bg-gray-100 text-gray-700 border border-gray-200',

    // Generic Status
    'generic-active': 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    'generic-inactive': 'bg-gray-100 text-gray-600 border border-gray-200',
    'generic-true': 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    'generic-false': 'bg-gray-100 text-gray-600 border border-gray-200',
  }

  const styleKey = `${type}-${normalized}`
  const badgeStyle = styles[styleKey] || 'bg-gray-100 text-gray-800'

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
        badgeStyle,
        className
      )}
    >
      {status}
    </span>
  )
}
