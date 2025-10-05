import { NextResponse } from 'next/server'

/**
 * Creates a NextResponse with proper security and cache headers
 * @param data - Response data
 * @param init - Response init options
 * @returns NextResponse with security headers
 */
export function createSecureAuthResponse(
  data: any,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, init)

  // Prevent caching of sensitive auth data
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

/**
 * Masks email for logging purposes
 * @param email - Email to mask
 * @returns Masked email showing only first char and domain
 */
export function maskEmail(email: string): string {
  const parts = email.split('@')
  if (parts.length !== 2) return 'invalid@email'

  return parts[0].charAt(0) + '***@' + parts[1]
}

/**
 * Validates request origin for CSRF protection
 * @param request - NextRequest object
 * @returns true if origin is valid
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (!origin) return true // Allow requests without origin (e.g., server-side)

  const expectedOrigin = process.env.NEXT_PUBLIC_APP_URL || `https://${host}`

  // Allow localhost for development
  if (origin.includes('localhost')) return true

  return origin === expectedOrigin
}