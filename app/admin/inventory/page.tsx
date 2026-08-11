'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { AlertOctagon } from 'lucide-react'

export default function AdminInventoryPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Inventory & Stock Alerts"
        description="Monitor product stock levels, view low inventory alerts, and perform manual stock updates."
      />

      <EmptyState
        icon={AlertOctagon}
        title="Inventory Matrix Loading"
        description="The real-time product stock matrix will load here in the next stage."
      />
    </div>
  )
}
