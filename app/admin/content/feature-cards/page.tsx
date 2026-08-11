'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { LayoutGrid } from 'lucide-react'

export default function AdminFeatureCardsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Homepage Feature Cards"
        description="Manage the featured categories and promotional highlights section cards on the homepage."
      />

      <EmptyState
        icon={LayoutGrid}
        title="Feature Cards CMS Loading"
        description="The grid category cards editor will connect to Supabase home_feature_cards table in the next stage."
      />
    </div>
  )
}
