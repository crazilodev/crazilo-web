'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { syncAdminRole } from '@/app/admin/actions'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface AdminLoginForm {
  email: string
  password: string
}

function AdminLoginFormContent() {
  function isInternalUrl(url: string | null): boolean {
    if (!url) return false
    if (url.includes('://') || url.startsWith('//') || url.startsWith('\\\\') || url.toLowerCase().startsWith('javascript:')) {
      return false
    }
    return url.startsWith('/admin')
  }

  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  const cleanRedirect = isInternalUrl(rawRedirect) ? rawRedirect! : '/admin'

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get('error') === 'suspended'
      ? 'This administrator account has been suspended.'
      : null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginForm>()

  const onSubmit = async ({ email, password }: AdminLoginForm) => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) throw authError
      if (!user) throw new Error('Failed to retrieve authentication details')

      // Sync/promote admin role if email matches designated ADMIN_EMAIL
      await syncAdminRole()

      // Fetch user profile to verify admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active, full_name')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        await supabase.auth.signOut()
        throw new Error('Unable to verify user permissions.')
      }

      // STRICT AUTHORIZATION: Customers cannot log in to admin
      if (profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access Denied: You do not have administrator permissions to access this portal.')
      }

      if (!profile.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your administrator account has been suspended.')
      }

      toast.success(`Welcome back, ${profile.full_name || 'Admin'}! 👋`)
      window.location.href = cleanRedirect
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid administrator credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Subtle light background ambient accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white border border-gray-200/90 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="pt-9 pb-7 px-8 text-center border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-white">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-[#B91C1C] mb-4 shadow-sm">
              <Shield className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Image
                src="/logo/crazilo-logo.png"
                alt="Crazilo"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-red-100 text-[#B91C1C] border border-red-200">
                ADMIN
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight font-heading">
              Admin Portal
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              Restricted access. Authorized personnel only.
            </p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-5">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-700 font-medium leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@crazilo.com"
                    autoComplete="email"
                    {...register('email', { required: 'Admin email is required' })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-red-100 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-[#B91C1C] focus:ring-2 focus:ring-red-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={loading}
                  className="rounded-xl font-bold tracking-wider uppercase text-xs py-3.5 bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-md hover:shadow-lg transition-all"
                >
                  Sign In to Panel <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-gray-100 text-center">
              <a
                href="/"
                className="text-xs text-gray-500 hover:text-[#B91C1C] transition-colors inline-flex items-center gap-1 font-medium"
              >
                ← Return to Storefront
              </a>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-[11px] text-gray-400 mt-6">
          Crazilo Security Shield • Version 2.4.0 • Authorized Connections Only
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <AdminLoginFormContent />
    </Suspense>
  )
}
