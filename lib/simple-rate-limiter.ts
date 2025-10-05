/**
 * Simple In-Memory Rate Limiter - Replaces Redis for hobby projects
 * 
 * FREE rate limiting using server memory
 * Perfect for 60 users - upgrade to Redis when you have 1000+ users
 * 
 * Limitations:
 * - Resets when server restarts (fine for hobby projects)
 * - Only works on single server instance (fine until you need horizontal scaling)
 * - Memory usage grows with unique IPs (automatically cleans old entries)
 */

interface RateLimitEntry {
  count: number
  resetTime: number
  lastAccess: number
}

class SimpleRateLimiter {
  private static instance: SimpleRateLimiter
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout

  private constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  static getInstance(): SimpleRateLimiter {
    if (!SimpleRateLimiter.instance) {
      SimpleRateLimiter.instance = new SimpleRateLimiter()
    }
    return SimpleRateLimiter.instance
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (usually IP address)
   * @param windowMs - Time window in milliseconds (default: 1 minute)
   * @param maxRequests - Max requests per window (default: 60)
   * @returns { allowed: boolean, remaining: number, resetTime: number }
   */
  checkRateLimit(
    key: string, 
    windowMs: number = 60 * 1000, // 1 minute
    maxRequests: number = 60
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const now = Date.now()
    const entry = this.store.get(key)

    // No entry exists, create new one
    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
        lastAccess: now
      })
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      }
    }

    // Window has expired, reset counter
    if (now >= entry.resetTime) {
      entry.count = 1
      entry.resetTime = now + windowMs
      entry.lastAccess = now
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: entry.resetTime
      }
    }

    // Within window, check limit
    entry.lastAccess = now
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    }

    // Allow request and increment counter
    entry.count++
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  /**
   * Clean up old entries (older than 1 hour)
   */
  private cleanup() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000)
    let cleanedCount = 0

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccess < oneHourAgo) {
        this.store.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`[SimpleRateLimiter] Cleaned up ${cleanedCount} old entries. Current size: ${this.store.size}`)
    }
  }

  /**
   * Get current stats (for debugging)
   */
  getStats() {
    return {
      totalEntries: this.store.size,
      memoryUsage: process.memoryUsage(),
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key: key.substring(0, 20) + '...', // Truncate for privacy
        count: entry.count,
        resetTime: new Date(entry.resetTime).toISOString(),
        lastAccess: new Date(entry.lastAccess).toISOString()
      })).slice(0, 10) // Show only first 10 for debugging
    }
  }

  /**
   * Clear all entries (for testing)
   */
  clear() {
    this.store.clear()
  }

  /**
   * Destroy instance and cleanup
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

/**
 * Rate limiting configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH_LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 },    // 5 attempts per 15 minutes
  AUTH_REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 attempts per hour
  AUTH_FORGOT_PASSWORD: { windowMs: 15 * 60 * 1000, maxRequests: 3 }, // 3 attempts per 15 minutes
  
  // API endpoints - moderate limits
  API_GENERAL: { windowMs: 60 * 1000, maxRequests: 60 },       // 60 requests per minute
  API_BOOKING: { windowMs: 60 * 1000, maxRequests: 10 },       // 10 bookings per minute
  API_EVENT_CREATE: { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 events per hour
  
  // Public endpoints - generous limits
  PUBLIC_GENERAL: { windowMs: 60 * 1000, maxRequests: 120 },   // 120 requests per minute
  
  // Email endpoints - very strict limits
  EMAIL_SEND: { windowMs: 60 * 60 * 1000, maxRequests: 10 },   // 10 emails per hour
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  // Fallback to a default if we can't determine the IP
  return 'unknown-ip'
}

/**
 * Helper function to apply rate limiting to API routes
 */
export async function applyRateLimit(
  request: Request,
  limitConfig: { windowMs: number; maxRequests: number },
  keyPrefix: string = ''
): Promise<{
  success: boolean
  headers: Record<string, string>
  error?: string
}> {
  const rateLimiter = SimpleRateLimiter.getInstance()
  const clientIP = getClientIP(request)
  const key = keyPrefix ? `${keyPrefix}:${clientIP}` : clientIP
  
  const result = rateLimiter.checkRateLimit(
    key,
    limitConfig.windowMs,
    limitConfig.maxRequests
  )
  
  const headers = {
    'X-RateLimit-Limit': limitConfig.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  }
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString()
  }
  
  return {
    success: result.allowed,
    headers,
    error: result.allowed ? undefined : `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`
  }
}

export default SimpleRateLimiter