'use client'

import { useEffect } from 'react'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Critical Error
              </h1>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Pennysia AMM encountered a critical error that prevented the application from loading properly. 
                This is likely a temporary issue.
              </p>

              {/* Error Details for Development */}
              {process.env.NODE_ENV === 'development' && error.message && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
                    Global Error Details (Development Mode):
                  </h3>
                  <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                    {error.message}
                  </pre>
                  {error.digest && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 group"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Restart Application
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
              >
                Reload Page
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If this error continues to occur, please clear your browser cache and try again.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
