import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSecureAuthResponse } from '@/lib/auth-helpers'
import { ALL_AUTH_COOKIES, CLEAR_COOKIE_CONFIG } from '@/lib/auth-constants'

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return createSecureAuthResponse(
        { error: 'Abmeldung fehlgeschlagen' },
        { status: 500 }
      )
    }

    // Create response with proper cookie clearing
    const response = createSecureAuthResponse({
      success: true,
      message: 'Erfolgreich abgemeldet',
    })

    // Clear all auth-related cookies with centralized configuration
    ALL_AUTH_COOKIES.forEach(cookieName => {
      response.cookies.set(cookieName, '', CLEAR_COOKIE_CONFIG)
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return createSecureAuthResponse(
      { error: 'Abmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}