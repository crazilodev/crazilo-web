'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { User } from 'lucide-react'

interface Props {
  params: {
    id: string
  }
}

export default function AdminCustomerDetailPage({ params }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <AdminPageHeader
        title="Customer Profile Details"
        description={`View detailed profile, addresses, and order history for customer ID: ${params.id}`}
        backLink={{ href: '/admin/customers', label: 'Back to Customers' }}
      />

      <EmptyState
        icon={User}
        title="Customer Profile Details Loading"
        description="The customer detailed profile view is integrated with Supabase Auth and will be active in the next stage."
      />
    </div>
  )
}
