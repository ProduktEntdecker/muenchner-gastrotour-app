/**
 * Centralized authentication constants
 * Used across auth routes and middleware for consistency
 */

/**
 * Get the Supabase project reference from the URL
 * Used to construct the correct cookie names
 */
function getSupabaseProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Extract project ref from URL like https://ppypwhnxgphraleorioq.supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
  return match ? match[1] : ''
}

/**
 * Cookie names used for authentication
 * Supabase uses cookies in the format: sb-<project-ref>-auth-token
 */
export const AUTH_COOKIE_NAMES = {
  // Legacy names (kept for backwards compatibility during transition)
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  AUTH_TOKEN: 'sb-auth-token',
  CUSTOM_AUTH_TOKEN: 'auth-token',
} as const

/**
 * Get all auth cookie names including the Supabase project-specific ones
 */
export function getAllAuthCookieNames(): string[] {
  const projectRef = getSupabaseProjectRef()
  const supabaseCookies = projectRef ? [
    `sb-${projectRef}-auth-token`,
    `sb-${projectRef}-auth-token-code-verifier`,
  ] : []

  return [
    ...Object.values(AUTH_COOKIE_NAMES),
    ...supabaseCookies,
  ]
}

/**
 * Array of all auth cookie names for bulk operations
 * @deprecated Use getAllAuthCookieNames() instead for proper Supabase cookie handling
 */
export const ALL_AUTH_COOKIES = Object.values(AUTH_COOKIE_NAMES)

/**
 * Cookie configuration for auth cookies
 * Ensures consistent security settings across the application
 */
export const AUTH_COOKIE_CONFIG = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // 'lax' for Safari compatibility (consistent with server.ts)
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
}

/**
 * Cookie config for clearing cookies
 */
export const CLEAR_COOKIE_CONFIG = {
  ...AUTH_COOKIE_CONFIG,
  expires: new Date(0),
  maxAge: 0,
}