import React from 'react'
import toast from 'react-hot-toast'

// Common error types in DeFi applications
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  WALLET_ERROR = 'WALLET_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  USER_REJECTED = 'USER_REJECTED',
  SLIPPAGE_ERROR = 'SLIPPAGE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error
  code?: string | number
  details?: Record<string, any>
}

// Error classification function
export function classifyError(error: any): AppError {
  const errorMessage = error?.message || error?.toString() || 'Unknown error occurred'
  const errorCode = error?.code || error?.error?.code

  // User rejected transaction
  if (errorCode === 4001 || errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
    return {
      type: ErrorType.USER_REJECTED,
      message: 'Transaction was cancelled by user',
      originalError: error,
      code: errorCode
    }
  }

  // Network/RPC errors
  if (errorCode === -32603 || errorMessage.includes('network') || errorMessage.includes('RPC')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network connection error. Please check your internet connection and try again.',
      originalError: error,
      code: errorCode
    }
  }

  // Wallet connection errors
  if (errorMessage.includes('wallet') || errorMessage.includes('provider') || errorCode === -32002) {
    return {
      type: ErrorType.WALLET_ERROR,
      message: 'Wallet connection error. Please reconnect your wallet and try again.',
      originalError: error,
      code: errorCode
    }
  }

  // Insufficient balance
  if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
    return {
      type: ErrorType.INSUFFICIENT_BALANCE,
      message: 'Insufficient balance to complete this transaction.',
      originalError: error,
      code: errorCode
    }
  }

  // Slippage/price impact errors
  if (errorMessage.includes('slippage') || errorMessage.includes('price impact') || errorMessage.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
    return {
      type: ErrorType.SLIPPAGE_ERROR,
      message: 'Transaction failed due to price changes. Try adjusting your slippage tolerance.',
      originalError: error,
      code: errorCode
    }
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      type: ErrorType.TIMEOUT_ERROR,
      message: 'Transaction timed out. Please try again.',
      originalError: error,
      code: errorCode
    }
  }

  // Contract/execution errors
  if (errorCode === 3 || errorMessage.includes('execution reverted') || errorMessage.includes('contract')) {
    return {
      type: ErrorType.CONTRACT_ERROR,
      message: 'Smart contract execution failed. Please check your transaction parameters.',
      originalError: error,
      code: errorCode,
      details: { revertReason: errorMessage }
    }
  }

  // Default to unknown error
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    originalError: error,
    code: errorCode
  }
}

// User-friendly error messages
export function getErrorMessage(appError: AppError): string {
  switch (appError.type) {
    case ErrorType.USER_REJECTED:
      return 'Transaction cancelled'
    case ErrorType.NETWORK_ERROR:
      return 'Network error - please check your connection'
    case ErrorType.WALLET_ERROR:
      return 'Wallet connection issue - please reconnect'
    case ErrorType.INSUFFICIENT_BALANCE:
      return 'Insufficient balance for this transaction'
    case ErrorType.SLIPPAGE_ERROR:
      return 'Price changed - try adjusting slippage tolerance'
    case ErrorType.TIMEOUT_ERROR:
      return 'Transaction timed out - please try again'
    case ErrorType.CONTRACT_ERROR:
      return 'Transaction failed - please check parameters'
    default:
      return appError.message || 'An unexpected error occurred'
  }
}

// Toast notification helper
export function showErrorToast(error: any, customMessage?: string) {
  const appError = classifyError(error)
  const message = customMessage || getErrorMessage(appError)
  
  // Don't show toast for user rejected transactions (they know they cancelled)
  if (appError.type === ErrorType.USER_REJECTED) {
    return
  }

  toast.error(message, {
    duration: 5000,
    id: `error-${appError.type}`, // Prevent duplicate toasts
  })

  // Log detailed error for debugging
  console.error('Error details:', {
    type: appError.type,
    message: appError.message,
    code: appError.code,
    originalError: appError.originalError
  })
}

// Retry mechanism with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw lastError
      }

      // Don't retry user rejected transactions
      const appError = classifyError(error)
      if (appError.type === ErrorType.USER_REJECTED) {
        throw lastError
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Safe async wrapper that handles errors gracefully
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  onError?: (error: AppError) => void
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    const appError = classifyError(error)
    onError?.(appError)
    
    if (fallback !== undefined) {
      return fallback
    }
    
    return undefined
  }
}

// Error boundary helper for React components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: AppError; retry: () => void }>
) {
  return function WrappedComponent(props: P) {
    const [error, setError] = React.useState<AppError | null>(null)

    const retry = () => setError(null)

    if (error && fallback) {
      const FallbackComponent = fallback
      return React.createElement(FallbackComponent, { error, retry })
    }

    if (error) {
      throw error.originalError || new Error(error.message)
    }

    try {
      // Use createElement to avoid JSX in .ts file
      return React.createElement(Component as React.ComponentType<any>, props as any)
    } catch (err) {
      const appError = classifyError(err)
      setError(appError)
      return null
    }
  }
}
