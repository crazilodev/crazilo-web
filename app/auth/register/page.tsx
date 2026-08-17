'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useWishlistStore } from '@/lib/store/wishlistStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface RegisterForm {
  full_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
}

function RegisterClient() {
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
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async ({ email, password, full_name, phone }: RegisterForm) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name, phone } },
      })
      if (error) throw error
      toast.success('Account created! Welcome to Crazilo')

      // Handle post-signup wishlist action
      const action = searchParams.get('action')
      const wishlistItem = searchParams.get('wishlist_item')
      if (action === 'favorite' && wishlistItem) {
        useWishlistStore.getState().addItem(wishlistItem)
      }

      router.push(cleanRedirect)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-br from-brand-red to-brand-red-dark p-8 text-center">
            <Image src="/logo/logo-white bg.png" alt="Crazilo" width={140} height={48} className="h-12 w-auto object-contain mx-auto mb-3" />
            <p className="text-white/80 text-sm">Create your Crazilo account</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full Name" id="register-name" icon={<User className="w-4 h-4" />}
                {...register('full_name', { required: 'Full name is required' })}
                error={errors.full_name?.message} />
              <Input label="Email Address" type="email" id="register-email" icon={<Mail className="w-4 h-4" />}
                {...register('email', { required: 'Email is required' })}
                error={errors.email?.message} />
              <Input label="Phone Number" type="tel" id="register-phone" icon={<Phone className="w-4 h-4" />}
                {...register('phone')} />
              <Input label="Password" type={showPassword ? 'text' : 'password'} id="register-password" icon={<Lock className="w-4 h-4" />}
                suffix={<button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                error={errors.password?.message} />
              <Input label="Confirm Password" type="password" id="register-confirm-password" icon={<Lock className="w-4 h-4" />}
                {...register('confirm_password', { validate: (v) => v === password || 'Passwords do not match' })}
                error={errors.confirm_password?.message} />

              <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} id="register-submit-btn">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href={`/auth/login${searchParams.toString() ? `?${searchParams.toString()}` : ''}`} className="text-brand-red font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterClient />
    </Suspense>
  )
}
