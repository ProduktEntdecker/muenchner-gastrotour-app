import { createClient } from '@/lib/supabase/client'

/**
 * Simple Error Tracker - Replaces Sentry for hobby projects
 * 
 * FREE error logging using your existing Supabase database
 * No monthly fees, no trial limitations, query errors with SQL
 * 
 * Perfect for 60 users - upgrade to Sentry when you have 1000+ users
 */

export interface ErrorContext {
  userId?: string
  userEmail?: string
  component?: string
  additionalData?: Record<string, any>
}

export class SimpleErrorTracker {
  /**
   * Log an error to your Supabase database
   */
  static async logError(error: Error, context?: ErrorContext) {
    try {
      const supabase = createClient()
      
      await supabase.from('error_logs').insert({
        level: 'error',
        message: error.message,
        stack_trace: error.stack,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        user_email: context?.userEmail,
        component: context?.component,
        additional_data: context?.additionalData,
      })
      
      // Still log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[SimpleErrorTracker]', error, context)
      }
    } catch (logError) {
      // Don't break the app if logging fails
      console.error('Failed to log error to database:', logError)
      console.error('Original error:', error)
    }
  }
  
  /**
   * Log a warning message
   */
  static async logWarning(message: string, context?: ErrorContext) {
    try {
      const supabase = createClient()
      
      await supabase.from('error_logs').insert({
        level: 'warn',
        message,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        user_email: context?.userEmail,
        component: context?.component,
        additional_data: context?.additionalData,
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SimpleErrorTracker]', message, context)
      }
    } catch (logError) {
      console.warn('Failed to log warning:', logError)
    }
  }
  
  /**
   * Log an info message (for important events)
   */
  static async logInfo(message: string, context?: ErrorContext) {
    try {
      const supabase = createClient()
      
      await supabase.from('error_logs').insert({
        level: 'info',
        message,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_email: context?.userEmail,
        component: context?.component,
        additional_data: context?.additionalData,
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.info('[SimpleErrorTracker]', message, context)
      }
    } catch (logError) {
      console.info('Failed to log info:', logError)
    }
  }
  
  /**
   * Get recent errors (admin only)
   */
  static async getRecentErrors(limit = 50) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }
  
  /**
   * Get error summary (admin only)
   */
  static async getErrorSummary(days = 7) {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('error_logs')
      .select('level, component, message')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Group by level and component
    const summary = data.reduce((acc, log) => {
      const key = `${log.level}-${log.component || 'unknown'}`
      if (!acc[key]) {
        acc[key] = {
          level: log.level,
          component: log.component || 'unknown',
          count: 0,
          latestMessage: log.message
        }
      }
      acc[key].count++
      return acc
    }, {} as Record<string, any>)
    
    return Object.values(summary)
  }
  
  /**
   * Mark error as resolved (admin only)
   */
  static async resolveError(errorId: string, resolvedByUserId: string) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedByUserId // Now expects UUID of user
      })
      .eq('id', errorId)
    
    if (error) throw error
  }
  
  /**
   * Track user actions for debugging context
   */
  static async trackUserAction(action: string, component: string, userId?: string) {
    // Only track in development or for important actions
    if (process.env.NODE_ENV === 'development') {
      console.log(`[UserAction] ${action} in ${component}`, { userId })
    }
    
    // Could store important actions in database for debugging
    // For now, just console.log to avoid database bloat
  }
}

/**
 * Error boundary helper for React components
 */
export function handleComponentError(error: Error, componentName: string, userEmail?: string) {
  SimpleErrorTracker.logError(error, {
    component: componentName,
    userEmail,
    additionalData: { 
      errorBoundary: true,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * API error helper
 */
export function handleApiError(error: Error, endpoint: string, method: string, userEmail?: string) {
  SimpleErrorTracker.logError(error, {
    component: `API_${method.toUpperCase()}`,
    userEmail,
    additionalData: {
      endpoint,
      method,
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Database error helper
 */
export function handleDatabaseError(error: Error, operation: string, table?: string, userEmail?: string) {
  SimpleErrorTracker.logError(error, {
    component: 'DATABASE',
    userEmail,
    additionalData: {
      operation,
      table,
      timestamp: new Date().toISOString()
    }
  })
}