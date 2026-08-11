'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { ShoppingBag } from 'lucide-react'

interface Props {
  params: {
    id: string
  }
}

export default function AdminOrderDetailPage({ params }: Props) {
  return (
    <div className="max-w-5xl mx-auto">
      <AdminPageHeader
        title="Order Details"
        description={`View and manage items, shipping, payment breakdown, and status for Order ID: ${params.id}`}
        backLink={{ href: '/admin/orders', label: 'Back to Orders' }}
      />

      <EmptyState
        icon={ShoppingBag}
        title="Order Details Dashboard Loading"
        description="The detailed order fulfillment workflow and customer invoice details will be loaded here in the next stage."
      />
    </div>
  )
}
