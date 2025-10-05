/**
 * Simple Error Logger for Hobby Projects
 *
 * Why this instead of Sentry?
 * - FREE (uses your existing Supabase)
 * - No 14-day trial limitations
 * - Perfect for <100 users
 * - You can actually see and query your errors
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ErrorLog {
  id?: string
  message: string
  stack?: string
  level: 'error' | 'warning' | 'info'
  context?: Record<string, any>
  user_email?: string
  url?: string
  user_agent?: string
  created_at?: Date
}

class SimpleErrorLogger {
  private queue: ErrorLog[] = []
  private isProcessing = false

  /**
   * Log an error to Supabase (or console in development)
   */
  async logError(
    error: Error | string,
    context?: Record<string, any>,
    level: 'error' | 'warning' | 'info' = 'error'
  ) {
    const errorLog: ErrorLog = {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      level,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      created_at: new Date()
    }

    // In development, just console log
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error:', errorLog)
      return
    }

    // Add to queue for batch processing
    this.queue.push(errorLog)
    this.processQueue()
  }

  /**
   * Process error queue (batched for performance)
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true
    const batch = this.queue.splice(0, 10) // Process up to 10 at once

    try {
      await supabase.from('error_logs').insert(batch)
    } catch (err) {
      // If error logging fails, don't create infinite loop
      console.error('Failed to log errors to Supabase:', err)
    }

    this.isProcessing = false

    // Process remaining if any
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000)
    }
  }

  /**
   * Get recent errors for admin dashboard
   */
  async getRecentErrors(limit = 50) {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Failed to fetch error logs:', error)
      return []
    }

    return data
  }

  /**
   * Clear old error logs (run weekly)
   */
  async clearOldLogs(daysToKeep = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const { error } = await supabase
      .from('error_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (error) {
      console.error('Failed to clear old logs:', error)
    }
  }

  /**
   * Get error statistics for monitoring
   */
  async getErrorStats() {
    const { data, error } = await supabase
      .from('error_logs')
      .select('level, count')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Failed to fetch error stats:', error)
      return null
    }

    return data
  }
}

// Singleton instance
export const errorLogger = new SimpleErrorLogger()

/**
 * Convenience functions for different log levels
 */
export const logError = (error: Error | string, context?: Record<string, any>) =>
  errorLogger.logError(error, context, 'error')

export const logWarning = (message: string, context?: Record<string, any>) =>
  errorLogger.logError(message, context, 'warning')

export const logInfo = (message: string, context?: Record<string, any>) =>
  errorLogger.logError(message, context, 'info')

/**
 * React Error Boundary Integration
 */
export function logErrorBoundary(error: Error, errorInfo: any) {
  errorLogger.logError(error, {
    componentStack: errorInfo.componentStack,
    type: 'React Error Boundary'
  })
}

/**
 * Next.js API Route Error Handler
 */
export function withErrorLogging(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      await errorLogger.logError(error as Error, {
        url: req.url,
        method: req.method,
        type: 'API Route Error'
      })
      throw error
    }
  }
}