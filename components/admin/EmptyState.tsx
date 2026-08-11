'use client'

import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 text-gray-400">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="font-heading text-lg font-bold text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
