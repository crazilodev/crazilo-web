'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { syncAdminRole } from '@/app/admin/actions'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

export default function LoginClient() {
  function isInternalUrl(url: string | null): boolean {
    if (!url) return false
    if (url.includes('://') || url.startsWith('//') || url.startsWith('\\\\') || url.toLowerCase().startsWith('javascript:')) {
      return false
    }
    return url.startsWith('/')
  }

  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirect')
  const cleanRedirect = isInternalUrl(rawRedirect) ? rawRedirect! : '/'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      if (!user) throw new Error('Failed to retrieve authentication details')

      // Sync/promote admin role if email matches admin email
      await syncAdminRole()

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        throw new Error('Failed to load user account profile details')
      }

      if (!profile.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your account has been suspended by an administrator.')
      }

      toast.success('Welcome back! 👋')

      if (profile.role === 'admin') {
        const dest = cleanRedirect.startsWith('/admin') ? cleanRedirect : '/admin'
        window.location.href = dest
      } else {
        window.location.href = cleanRedirect
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-brand-red to-brand-red-dark p-8 text-center">
            <Image
              src="/logo/crazilo-logo.png"
              alt="Crazilo"
              width={140}
              height={48}
              className="h-12 w-auto object-contain mx-auto mb-3 brightness-0 invert"
            />
            <p className="text-white/80 text-sm">Welcome back! Sign in to continue.</p>
          </div>

          <div className="p-8">
            {searchParams.get('error') === 'suspended' && (
              <div className="mb-5 bg-red-50 border border-red-150 rounded-2xl p-4 text-xs text-red-700 font-semibold leading-relaxed">
                Your account has been suspended by an administrator. Login credentials are locked.
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                id="login-email"
                icon={<Mail className="w-4 h-4" />}
                {...register('email', { required: 'Email is required' })}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                icon={<Lock className="w-4 h-4" />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password', { required: 'Password is required' })}
                error={errors.password?.message}
              />

              <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} id="login-submit-btn">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-brand-red font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
