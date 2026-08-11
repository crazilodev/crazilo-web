'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { MessageSquare } from 'lucide-react'

export default function AdminReviewsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Product Reviews & Moderation"
        description="Moderate, approve, reject, or delete customer product reviews."
      />

      <EmptyState
        icon={MessageSquare}
        title="Review Moderation Queue Loading"
        description="The customer reviews moderation queue will connect to Supabase reviews table in the next stage."
      />
    </div>
  )
}
