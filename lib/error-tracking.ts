import * as Sentry from '@sentry/nextjs'

export interface ErrorContext {
  userId?: string
  userEmail?: string
  action?: string
  component?: string
  additionalData?: Record<string, any>
}

export class ErrorTracker {
  /**
   * Track a non-fatal error for monitoring
   */
  static trackError(error: Error, context?: ErrorContext) {
    // Add user context if available
    if (context?.userId || context?.userEmail) {
      Sentry.setUser({
        id: context.userId,
        email: context.userEmail,
      })
    }

    // Add tags for better filtering
    Sentry.setTags({
      action: context?.action,
      component: context?.component,
    })

    // Add additional context
    if (context?.additionalData) {
      Sentry.setContext('additional', context.additionalData)
    }

    // Capture the error
    Sentry.captureException(error)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracker]', error, context)
    }
  }

  /**
   * Track API errors with request context
   */
  static trackAPIError(
    error: Error, 
    endpoint: string, 
    method: string, 
    statusCode?: number,
    context?: ErrorContext
  ) {
    this.trackError(error, {
      ...context,
      action: `API_${method}`,
      component: endpoint,
      additionalData: {
        ...context?.additionalData,
        endpoint,
        method,
        statusCode,
      }
    })
  }

  /**
   * Track authentication errors
   */
  static trackAuthError(error: Error, authAction: string, context?: ErrorContext) {
    this.trackError(error, {
      ...context,
      action: `AUTH_${authAction}`,
      component: 'authentication',
    })
  }

  /**
   * Track database errors
   */
  static trackDatabaseError(error: Error, query: string, context?: ErrorContext) {
    this.trackError(error, {
      ...context,
      action: 'DATABASE_QUERY',
      component: 'database',
      additionalData: {
        ...context?.additionalData,
        query: query.substring(0, 200), // Limit query length for privacy
      }
    })
  }

  /**
   * Track performance issues
   */
  static trackPerformance(name: string, duration: number, context?: ErrorContext) {
    Sentry.addBreadcrumb({
      message: `Performance: ${name}`,
      level: 'info',
      data: {
        duration,
        component: context?.component,
      }
    })

    // Alert on slow operations (>2 seconds)
    if (duration > 2000) {
      Sentry.captureMessage(`Slow operation: ${name} took ${duration}ms`, 'warning')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration}ms`)
    }
  }

  /**
   * Track user actions for debugging
   */
  static trackUserAction(action: string, component: string, userId?: string) {
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      level: 'info',
      data: {
        component,
        userId,
      }
    })
  }

  /**
   * Set user context for all subsequent errors
   */
  static setUser(userId: string, email?: string, name?: string) {
    Sentry.setUser({
      id: userId,
      email,
      username: name,
    })
  }

  /**
   * Clear user context (e.g., on logout)
   */
  static clearUser() {
    Sentry.setUser(null)
  }
}