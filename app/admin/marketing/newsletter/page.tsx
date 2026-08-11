'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { Mail } from 'lucide-react'

export default function AdminNewsletterPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Newsletter Subscribers"
        description="View, search, or delete subscribers registered for store updates."
      />

      <EmptyState
        icon={Mail}
        title="Newsletter Subscribers Registry Loading"
        description="The subscriber data table will connect to Supabase newsletter_subscribers table in the next stage."
      />
    </div>
  )
}
