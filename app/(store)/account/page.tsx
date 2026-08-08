'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { User, Mail, Phone, Save, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm<Partial<Profile>>()

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); reset(data) }
    }
    fetchProfile()
  }, [reset])

  const onSubmit = async (data: Partial<Profile>) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('profiles').update({ full_name: data.full_name, phone: data.phone }).eq('id', user.id)
      if (error) throw error
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.charAt(0) || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{profile?.full_name || 'User'}</p>
              <p className="text-gray-500 text-sm">{profile?.email}</p>
              {profile?.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-xs bg-brand-red/10 text-brand-red font-semibold px-2 py-0.5 rounded-full mt-1">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" {...register('full_name')} icon={<User className="w-4 h-4" />} id="account-name" />
            <Input label="Email (cannot change)" value={profile?.email || ''} disabled icon={<Mail className="w-4 h-4" />} id="account-email" />
            <Input label="Phone Number" {...register('phone')} icon={<Phone className="w-4 h-4" />} id="account-phone" />
            <Button type="submit" variant="primary" loading={loading} id="save-profile-btn">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
