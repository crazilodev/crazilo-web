'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  backLink?: {
    href: string
    label: string
  }
}

export default function AdminPageHeader({
  title,
  description,
  action,
  backLink,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      {backLink && (
        <div className="mb-4">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLink.label}
          </Link>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
