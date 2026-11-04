'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuthModalStore } from '@/lib/store/authModalStore'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  full_name: string
  email: string
  phone: string
  password: string
  confirm_password: string
}

export default function CustomerAuthModal() {
  const router = useRouter()
  const { isOpen, view, redirectUrl, closeModal, switchView } = useAuthModalStore()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Forms
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    reset: resetLoginForm,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>()

  const {
    register: regRegister,
    handleSubmit: handleRegSubmit,
    reset: resetRegForm,
    watch: watchReg,
    formState: { errors: regErrors },
  } = useForm<RegisterForm>()

  const regPassword = watchReg('password')

  // Reset errors when view changes
  useEffect(() => {
    setErrorMessage(null)
  }, [view])

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeModal])

  const onLogin = async (data: LoginForm) => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      })

      if (error) throw error
      if (!user) throw new Error('Could not authenticate user.')

      // Check account suspension
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active, full_name')
        .eq('id', user.id)
        .single()

      if (profile && !profile.is_active) {
        await supabase.auth.signOut()
        throw new Error('Your account has been suspended. Please contact customer support.')
      }

      toast.success(`Welcome back, ${profile?.full_name || 'Customer'}! 👋`)
      closeModal()
      resetLoginForm()

      // Navigate or refresh
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (data: RegisterForm) => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.full_name.trim(),
            phone: data.phone?.trim() || null,
          },
        },
      })

      if (error) throw error

      toast.success('Account created successfully! Welcome to Crazilo 🎉')
      closeModal()
      resetRegForm()

      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.refresh()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Brand Banner */}
            <div className="relative bg-[#7F1D1D] text-white pt-7 pb-6 px-6 text-center select-none overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Logo display fixed without white box/inversion artifacts */}
              <div className="inline-flex items-center justify-center mb-2.5">
                <div className="bg-white px-3.5 py-1.5 rounded-2xl shadow-sm">
                  <Image
                    src="/logo/crazilo-logo.png"
                    alt="Crazilo"
                    width={115}
                    height={36}
                    className="h-7 w-auto object-contain"
                    priority
                  />
                </div>
              </div>

              <p className="text-white/85 text-xs font-medium">
                {view === 'login'
                  ? 'Sign in to access your orders, saved addresses & wishlist'
                  : 'Create your account for faster checkout & easy order tracking'}
              </p>

              {/* View Tabs */}
              <div className="mt-5 grid grid-cols-2 p-1 bg-black/20 rounded-xl max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    view === 'login'
                      ? 'bg-white text-[#7F1D1D] shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    view === 'register'
                      ? 'bg-white text-[#7F1D1D] shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 sm:p-7 max-h-[calc(85vh-140px)] overflow-y-auto">
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {view === 'login' ? (
                /* Login Form */
                <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    {...loginRegister('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    error={loginErrors.email?.message}
                  />

                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    icon={<Lock className="w-4 h-4" />}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...loginRegister('password', {
                      required: 'Password is required',
                    })}
                    error={loginErrors.password?.message}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={loading}
                      className="rounded-xl font-bold tracking-wide"
                    >
                      Sign In <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <p className="text-center text-xs text-gray-500 pt-2">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="font-bold text-[#B91C1C] hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegSubmit(onRegister)} className="space-y-3.5">
                  <Input
                    label="Full Name"
                    placeholder="e.g. John Doe"
                    icon={<User className="w-4 h-4" />}
                    {...regRegister('full_name', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    error={regErrors.full_name?.message}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    icon={<Mail className="w-4 h-4" />}
                    {...regRegister('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    error={regErrors.email?.message}
                  />

                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="10-digit mobile number"
                    icon={<Phone className="w-4 h-4" />}
                    {...regRegister('phone', {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Enter a valid 10-digit mobile number',
                      },
                    })}
                    error={regErrors.phone?.message}
                  />

                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    icon={<Lock className="w-4 h-4" />}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    {...regRegister('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    error={regErrors.password?.message}
                  />

                  <Input
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    icon={<Lock className="w-4 h-4" />}
                    {...regRegister('confirm_password', {
                      required: 'Please confirm your password',
                      validate: (v) => v === regPassword || 'Passwords do not match',
                    })}
                    error={regErrors.confirm_password?.message}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                      loading={loading}
                      className="rounded-xl font-bold tracking-wide"
                    >
                      Create Account <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <p className="text-center text-xs text-gray-500 pt-2">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="font-bold text-[#B91C1C] hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </form>
              )}

              {/* Guest shopping note */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Guest checkout is always available — account is 100% optional.</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
