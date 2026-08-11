'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { Star } from 'lucide-react'

export default function AdminTestimonialsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Homepage Testimonials"
        description="Manage customer testimonials, ratings, and featured review cards displayed on the storefront."
      />

      <EmptyState
        icon={Star}
        title="Testimonials CMS Loading"
        description="The testimonials dynamic layout editor will connect to Supabase testimonials table in the next stage."
      />
    </div>
  )
}
