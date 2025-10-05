import { NextRequest, NextResponse } from 'next/server'
import { validateMagicLinkToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing-token', request.url))
    }

    const result = await validateMagicLinkToken(token)

    // During simplification, magic-link verification is disabled; always redirect with error
    if (!result.valid) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.error)}`, request.url))
    }

    // If you re-enable verification, implement Supabase user provisioning here
    return NextResponse.redirect(new URL('/login?error=verification-disabled', request.url))
  } catch (error) {
    console.error('Magic link verification error:', error)
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url))
  }
}
