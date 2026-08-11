'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <AdminPageHeader
        title="Site Settings"
        description="Configure global store variables, contact phone, threshold numbers, policy files, and footer descriptions."
      />

      <EmptyState
        icon={Settings}
        title="Global Site Settings Loading"
        description="The store metadata configure form will connect to Supabase site_settings table in the next stage."
      />
    </div>
  )
}
