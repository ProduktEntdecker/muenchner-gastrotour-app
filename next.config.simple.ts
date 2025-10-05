import type { NextConfig } from 'next'

/**
 * SIMPLIFIED Next.js Configuration
 *
 * Removed:
 * - Sentry (saves $26/month)
 * - Complex instrumentation
 * - Unnecessary webpack plugins
 *
 * This is all you need for 60 users!
 */
const nextConfig: NextConfig = {
  // Basic image optimization
  images: {
    domains: ['localhost'],
    dangerouslyAllowSVG: true,
  },

  // Security headers (the important stuff)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

export default nextConfig