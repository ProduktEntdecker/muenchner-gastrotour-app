'use client'

import React, { Component, ReactNode } from 'react'
import { SimpleErrorTracker, handleComponentError } from '@/lib/simple-error-tracker'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error Boundary component that catches React errors and logs them
 * 
 * Usage:
 * <ErrorBoundary componentName="UserDashboard">
 *   <UserDashboard />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to your simple tracker
    await handleComponentError(
      error,
      this.props.componentName || 'UnknownComponent'
    )
    
    // Also log the component stack for debugging
    console.error('React Error Boundary caught an error:', {
      error,
      errorInfo,
      componentName: this.props.componentName
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-32 flex items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
          <div className="text-center">
            <div className="text-red-600 text-2xl mb-2">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Etwas ist schiefgelaufen
            </h3>
            <p className="text-red-600 mb-4">
              Diese Komponente konnte nicht geladen werden.
            </p>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
              }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional wrapper for easier usage with hooks
 */
interface WithErrorBoundaryProps {
  children: ReactNode
  componentName: string
  fallback?: ReactNode
}

export function WithErrorBoundary({ 
  children, 
  componentName, 
  fallback 
}: WithErrorBoundaryProps) {
  return (
    <ErrorBoundary componentName={componentName} fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook to manually report errors from functional components
 */
export function useErrorReporter(componentName: string) {
  const reportError = async (error: Error, context?: any) => {
    await SimpleErrorTracker.logError(error, {
      component: componentName,
      additionalData: {
        context,
        timestamp: new Date().toISOString()
      }
    })
  }

  const reportWarning = async (message: string, context?: any) => {
    await SimpleErrorTracker.logWarning(message, {
      component: componentName,
      additionalData: {
        context,
        timestamp: new Date().toISOString()
      }
    })
  }

  return { reportError, reportWarning }
}

/**
 * HOC (Higher Order Component) version
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary componentName={componentName}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${componentName})`
  
  return WithErrorBoundaryComponent
}

/**
 * Example usage in your app/layout.tsx or components
 */

// Example: Wrap your entire app
export function AppWithErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary 
      componentName="App"
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">💔</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Münchner Gastrotour
            </h1>
            <p className="text-gray-600 mb-4">
              Die Anwendung ist temporär nicht verfügbar.
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              onClick={() => window.location.reload()}
            >
              Seite neu laden
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Example: Wrap specific components
export function DashboardWithErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <WithErrorBoundary componentName="Dashboard">
      {children}
    </WithErrorBoundary>
  )
}

export default ErrorBoundary