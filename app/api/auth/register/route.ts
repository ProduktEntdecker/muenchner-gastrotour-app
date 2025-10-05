import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeEmail, sanitizeInput, validatePassword } from '@/lib/validation'

/**
 * Handles user registration requests
 * 
 * This endpoint provides secure user registration with:
 * - CSRF protection using explicit origin validation
 * - Comprehensive input validation and sanitization
 * - Email normalization and duplicate detection
 * - Password strength validation (12+ chars, mixed case, numbers, symbols)
 * - Supabase Auth integration with proper error handling
 * 
 * @param request - The incoming HTTP request containing registration data
 * @returns Promise<NextResponse> - JSON response with success/error status
 * 
 * @example
 * ```typescript
 * // Request body
 * {
 *   email: 'user@example.com',
 *   name: 'John Doe', 
 *   password: 'SecurePassword123!'
 * }
 * 
 * // Success response
 * {
 *   success: true,
 *   message: 'Bitte überprüfe deine E-Mail, um deine Registrierung zu bestätigen',
 *   requiresEmailConfirmation: true
 * }
 * ```
 */
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

    const { email, name, password } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'E-Mail, Name und Passwort sind erforderlich' },
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

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Sanitize name input
    const sanitizedName = sanitizeInput(name)
    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Ungültiger Name' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: sanitizedName,
        },
      },
    })

    if (error) {
      console.error('Supabase signup error:', error)
      if (error.message.includes('already registered') || 
          error.message.includes('Email address') && error.message.includes('is invalid')) {
        return NextResponse.json(
          { error: 'Diese E-Mail-Adresse ist bereits registriert' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: error.message || 'Registrierung fehlgeschlagen' },
        { status: 400 }
      )
    }

    // Check if user needs email confirmation
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        message: 'Bitte überprüfe deine E-Mail, um deine Registrierung zu bestätigen',
        requiresEmailConfirmation: true,
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.full_name,
      },
      session: data.session,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen' },
      { status: 500 }
    )
  }
}