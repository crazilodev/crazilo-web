'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { Sparkles } from 'lucide-react'

export default function AdminHighlightsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Homepage Highlights"
        description="Manage the key brand trust highlights (e.g. Free Shipping, 100% Organic, Quality Spices)."
      />

      <EmptyState
        icon={Sparkles}
        title="Highlights CMS Loading"
        description="The brand trust highlights component will connect to Supabase home_highlights table in the next stage."
      />
    </div>
  )
}
