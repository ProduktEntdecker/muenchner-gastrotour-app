/**
 * Centralized authentication constants
 * Used across auth routes and middleware for consistency
 */

/**
 * Cookie names used for authentication
 * These should be used consistently across all auth-related code
 */
export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  AUTH_TOKEN: 'sb-auth-token',
  CUSTOM_AUTH_TOKEN: 'auth-token',
} as const

/**
 * Array of all auth cookie names for bulk operations
 * Used when clearing all auth cookies on logout
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