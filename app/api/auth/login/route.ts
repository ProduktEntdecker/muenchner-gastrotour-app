import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeEmail, validatePassword } from '@/lib/validation'
import { createSecureAuthResponse, maskEmail, validateOrigin } from '@/lib/auth-helpers'

/**
 * Handles user login requests with Supabase Auth
 * 
 * Features:
 * - CSRF protection using explicit origin validation
 * - In-memory rate-limiting (MAX_ATTEMPTS per LOCKOUT_DURATION)
 * - Email normalization and basic password checks
 * - Privacy-conscious logging (masked email)
 * - Profile fetch with non-fatal error handling
 */
// Simple in-memory rate limiting (in production, use Redis or similar)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  if (attempts.count >= MAX_ATTEMPTS) {
    return false
  }

  attempts.count++
  attempts.lastAttempt = now
  return true
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // CSRF protection: validate origin using explicit preconfigured origins
    const origin = request.headers.get('origin')
    
    // Use only explicit, preconfigured origins - never derive from host header
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXT_PUBLIC_PREVIEW_URL,
      'https://muenchner-gastrotour.de',
      'https://www.muenchner-gastrotour.de', 
      'https://nextjs-app-phi-ivory.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
    ]
      .filter(Boolean)
      .map((value) => value!.replace(/\/$/, ''))

    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin?.replace(/\/$/, '')
    if (normalizedOrigin && !allowedOrigins.includes(normalizedOrigin)) {
      return NextResponse.json(
        { error: 'Ungültige Anfrage-Herkunft' },
        { status: 403 }
      )
    }

    // Rate limiting based on IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Zu viele Anmeldeversuche. Versuche es in 15 Minuten erneut.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    // Validate input types and basic format
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten' },
        { status: 400 }
      )
    }

    // Normalize and validate email
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    // Basic password length check (not full validation for login)
    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        { error: 'Ungültiges Passwort' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) {
      // Mask email in logs for privacy (show only first char and domain)
      const emailParts = normalizedEmail.split('@')
      const maskedEmail = emailParts[0].charAt(0) + '***@' + emailParts[1]
      console.error('Login failed for:', maskedEmail, 'Error type:', error.message.substring(0, 20))
      return NextResponse.json(
        { error: 'E-Mail-Adresse oder Passwort falsch' },
        { status: 401 }
      )
    }

    // Reset rate limit on successful login
    loginAttempts.delete(ip)

    // Get user profile with error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, is_admin, email')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error for user:', data.user.id)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.user_metadata?.full_name || '',
        isAdmin: profile?.is_admin || false,
      },
      session: data.session,
    })
  } catch (error) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}