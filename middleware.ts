import { NextResponse, type NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

const supabaseConfigured = isValidUrl(SUPABASE_URL) && SUPABASE_KEY.length > 10

export async function middleware(request: NextRequest) {
  if (!supabaseConfigured) {
    return NextResponse.next()
  }

  const { createServerClient } = await import('@supabase/ssr')
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 1. ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
    // If user navigates to /admin/login directly, redirect to /admin so URL is always domain/admin
    if (pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // If unauthenticated, rewrite internally to /admin/login
    // The browser URL remains strictly domain/admin
    if (!user) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-is-admin-login', '1')
      return NextResponse.rewrite(new URL('/admin/login', request.url), {
        request: {
          headers: requestHeaders,
        },
      })
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crazilo.com'
    if (user.email === adminEmail && (!profile || profile.role !== 'admin')) {
      try {
        const { createClient: createSupabaseJSClient } = await import('@supabase/supabase-js')
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY
        const supabaseAdminClient = createSupabaseJSClient(SUPABASE_URL, serviceRoleKey)

        await supabaseAdminClient
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Admin',
            role: 'admin',
            is_active: true,
            updated_at: new Date().toISOString(),
          })

        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', user.id)
          .single()
        profile = updatedProfile
      } catch (err) {
        console.error('Error promoting admin in middleware:', err)
      }
    }

    // Suspended admin account
    if (profile && !profile.is_active) {
      await supabase.auth.signOut()
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-is-admin-login', '1')
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'suspended')
      return NextResponse.rewrite(loginUrl, {
        request: {
          headers: requestHeaders,
        },
      })
    }

    // Non-admin users cannot access admin routes
    if (!profile || profile.role !== 'admin') {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-is-admin-login', '1')
      return NextResponse.rewrite(new URL('/admin/login', request.url), {
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  // 2. STORE ROUTES
  // Allow guests to browse, add to cart, checkout, and view order confirmations.
  // Require login only for the account profile page.
  if (pathname.startsWith('/account')) {
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    if (profile && !profile.is_active) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
