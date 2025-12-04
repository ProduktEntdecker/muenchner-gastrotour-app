import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let supabaseResponse = NextResponse.next({
    request,
  })

  // Add security headers to all responses (including redirects)
  const headers = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  Object.entries(headers).forEach(([key, value]) => {
    supabaseResponse.headers.set(key, value)
  })

  // If Supabase is not configured, skip authentication checks
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured')
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // refreshing the auth token
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes that require authentication
    const protectedPaths = ['/bookings', '/admin', '/events']
    const isProtectedPath = protectedPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )

    // Auth routes that should always be accessible
    const authPaths = ['/login', '/register', '/auth/confirm', '/auth/callback', '/auth/reset']
    const isAuthPath = authPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    )

    // If user is not authenticated and trying to access protected route
    if (!user && isProtectedPath) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)

      const redirectResponse = NextResponse.redirect(redirectUrl)

      // Apply security headers to redirect response
      Object.entries(headers).forEach(([key, value]) => {
        redirectResponse.headers.set(key, value)
      })

      return redirectResponse
    }
  } catch (error) {
    console.error('Middleware error:', error)
    // In case of error, allow the request to proceed but log it
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}