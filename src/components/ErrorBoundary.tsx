'use client'

import React, { Component, ReactNode } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                Component Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                This component encountered an error and couldn&apos;t render properly.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-3">
                  <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer hover:underline">
                    Show error details
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-words bg-red-100 dark:bg-red-900/20 p-2 rounded">
                    {this.state.error.message}
                    {this.state.error.stack && '\n\n' + this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors duration-200"
              >
                <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                Retry
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Specialized error boundary for blockchain operations
interface BlockchainErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
}

export function BlockchainErrorBoundary({ children, onRetry }: BlockchainErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                Blockchain Connection Error
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Unable to connect to the blockchain network. This might be due to network issues or wallet connectivity problems.
              </p>
              <div className="flex space-x-2">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors duration-200"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-1.5" />
                    Retry Connection
                  </button>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors duration-200"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
