'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { Users } from 'lucide-react'

export default function AdminCustomersPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <AdminPageHeader
        title="Customers"
        description="View and manage registered customers and accounts."
      />
      
      <EmptyState
        icon={Users}
        title="No Customers Displayed"
        description="The customer management directory is connected to Supabase and will be fully implemented in the next development stage."
      />
    </div>
  )
}
