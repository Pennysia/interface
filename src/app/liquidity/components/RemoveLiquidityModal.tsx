'use client'

import React from 'react'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLiquidity, LiquidityPosition } from '../hooks/useLiquidity'
import { useLiquidityActions } from '../hooks/useLiquidityActions'
import { useScrollLock } from '../hooks/useScrollLock'
import TransactionLoadingOverlay from '../../../components/ui/TransactionLoadingOverlay'
import toast from 'react-hot-toast'

interface RemoveLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  position?: LiquidityPosition | null
  onAddLiquidity?: () => void
  onTransactionComplete?: () => Promise<void>
}

interface WithdrawalAmount {
  percentage: number
  amount: string
  usePercentage: boolean
}

// TokenWithdrawalControl component - moved outside to fix Rules of Hooks
const TokenWithdrawalControl = memo(({ 
  tokenSymbol, 
  positionType, 
  maxAmount, 
  onAmountChange, 
  onPercentageChange, 
  currentAmount, 
  currentPercentage, 
  usePercentage,
  color 
}: {
  tokenSymbol: string
  positionType: string
  maxAmount: string
  onAmountChange: (amount: string) => void
  onPercentageChange: (percentage: number) => void
  currentAmount: string
  currentPercentage: number
  usePercentage: boolean
  color?: string
}) => {
  // Initialize with empty string to show placeholder, or use currentAmount if it has a value
  const [localAmount, setLocalAmount] = useState(currentAmount || '')
  const [isUserTyping, setIsUserTyping] = useState(false)
  const maxAmountNum = parseFloat(maxAmount)

  useEffect(() => {
    // Only update localAmount if user is not actively typing
    if (!isUserTyping && usePercentage) {
      const calculatedAmount = (maxAmountNum * currentPercentage / 100)
      // Don't show "0" - let placeholder show instead when amount is 0
      const displayAmount = calculatedAmount === 0 ? '' : calculatedAmount.toString()
      setLocalAmount(displayAmount)
      onAmountChange(calculatedAmount.toString())
    } else if (!isUserTyping && !usePercentage) {
      // Don't show "0" - let placeholder show instead when amount is empty or "0"
      const displayAmount = (!currentAmount || currentAmount === '0') ? '' : currentAmount
      setLocalAmount(displayAmount)
    }
  }, [currentAmount, currentPercentage, usePercentage, maxAmountNum, isUserTyping, onAmountChange])

  const handlePercentageChange = (percentage: number) => {
    setIsUserTyping(false) // User clicked percentage, not typing
    onPercentageChange(percentage)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIsUserTyping(true) // User is actively typing
    setLocalAmount(value) // Update local state for smooth typing

    // Only allow numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value)
      if (value === '' || isNaN(numValue)) {
        onAmountChange('')
      } else {
        // Enhanced max balance enforcement with user feedback
        if (numValue > maxAmountNum) {
          const clampedValue = maxAmountNum
          setLocalAmount(clampedValue.toString())
          onAmountChange(clampedValue.toString())
          toast.success(`Amount capped at max: ${clampedValue.toFixed(6)}`)
        } else if (numValue < 0) {
          onAmountChange('')
          toast.error('Amount cannot be negative')
        } else {
          onAmountChange(numValue.toString())
        }
      }
    }
  }

  const handleInputBlur = () => {
    // User finished typing
    setIsUserTyping(false)
  }

  const handleInputFocus = () => {
    // User started typing
    setIsUserTyping(true)
  }

  return (
    <div className="rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col items-start space-x-2">
          <span className={`text-xs font-normal ${
            positionType === 'Long' ? 'text-green-500' : 'text-red-500'
          }`}>
            {positionType}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {tokenSymbol}
          </span>
        </div>
        <div className="h-full flex flex-row gap-2 text-sm text-gray-400 dark:text-gray-600 items-center">
          <p className="text-sm">{parseFloat(maxAmount).toFixed(12)} </p>
          <button
            type="button"
            onClick={() => handlePercentageChange(100)}
            className="h-full text-xs font-normal text-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Max
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={localAmount}
          onChange={handleAmountChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            // Prevent 'e', 'E', '+', '-' keys
            if (['e', 'E', '+', '-'].includes(e.key)) {
              e.preventDefault()
            }
          }}
          placeholder="0.00"
          className="w-full bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 text-right text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>
      <div className="flex justify-between mt-2 space-x-1 w-full">
        {[25, 50, 75, 100].map((percent) => (
          <button
            key={percent}
            onClick={() => handlePercentageChange(percent)}
            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
          >
            {percent}%
          </button>
        ))}
      </div>
    </div>
  )
})

TokenWithdrawalControl.displayName = 'TokenWithdrawalControl'

export default function RemoveLiquidityModal({ isOpen, onClose, position, onAddLiquidity, onTransactionComplete }: RemoveLiquidityModalProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [withdrawalMode, setWithdrawalMode] = useState<'percentage' | 'amount'>('percentage')
  const [showTransactionResult, setShowTransactionResult] = useState(false)
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean
    txHash?: string
    error?: string
    amount0?: string
    amount1?: string
    token0Symbol?: string
    token1Symbol?: string
    liquidity0Long?: string
    liquidity0Short?: string
    liquidity1Long?: string
    liquidity1Short?: string
  } | null>(null)

  // Individual withdrawal amounts for each LP token type - managed locally
  const [token0Long, setToken0Long] = useState<WithdrawalAmount>({ percentage: 0, amount: '', usePercentage: true })
  const [token0Short, setToken0Short] = useState<WithdrawalAmount>({ percentage: 0, amount: '', usePercentage: true })
  const [token1Long, setToken1Long] = useState<WithdrawalAmount>({ percentage: 0, amount: '', usePercentage: true })
  const [token1Short, setToken1Short] = useState<WithdrawalAmount>({ percentage: 0, amount: '', usePercentage: true })

  const { performRemoveLiquidity } = useLiquidityActions()
  const { isAuthenticated, removeLiquidity } = useLiquidity()

  // Lock background scroll when modal is open
  useScrollLock(isOpen)

  // Memoized event handlers to prevent unnecessary re-renders - MOVED BEFORE EARLY RETURN
  const handleToken0LongAmountChange = useCallback((amount: string) => {
    setToken0Long(prev => ({ ...prev, amount, usePercentage: false }))
  }, [])

  const handleToken0LongPercentageChange = useCallback((percentage: number) => {
    setToken0Long(prev => ({ ...prev, percentage, usePercentage: true }))
  }, [])

  const handleToken0ShortAmountChange = useCallback((amount: string) => {
    setToken0Short(prev => ({ ...prev, amount, usePercentage: false }))
  }, [])

  const handleToken0ShortPercentageChange = useCallback((percentage: number) => {
    setToken0Short(prev => ({ ...prev, percentage, usePercentage: true }))
  }, [])

  const handleToken1LongAmountChange = useCallback((amount: string) => {
    setToken1Long(prev => ({ ...prev, amount, usePercentage: false }))
  }, [])

  const handleToken1LongPercentageChange = useCallback((percentage: number) => {
    setToken1Long(prev => ({ ...prev, percentage, usePercentage: true }))
  }, [])

  const handleToken1ShortAmountChange = useCallback((amount: string) => {
    setToken1Short(prev => ({ ...prev, amount, usePercentage: false }))
  }, [])

  const handleToken1ShortPercentageChange = useCallback((percentage: number) => {
    setToken1Short(prev => ({ ...prev, percentage, usePercentage: true }))
  }, [])

  // Calculate withdrawal amount based on percentage or absolute amount
  const calculateWithdrawalAmount = (amount: string, percentage: number, usePercentage: boolean, maxAmount: string): string => {
    if (usePercentage) {
      const max = parseFloat(maxAmount)
      const calculatedAmount = (max * percentage) / 100
      return calculatedAmount.toString()
    } else {
      return amount || '0'
    }
  }

  // Handle liquidity removal
  const handleRemoveLiquidity = async () => {
    if (!isAuthenticated || !position) {
      toast.error('Please connect your wallet')
      return
    }

    // Calculate actual LP token withdrawal amounts (not underlying token amounts)
    const liquidity0Long = calculateWithdrawalAmount(token0Long.amount, token0Long.percentage, token0Long.usePercentage, position.userLongX)
    const liquidity0Short = calculateWithdrawalAmount(token0Short.amount, token0Short.percentage, token0Short.usePercentage, position.userShortX)
    const liquidity1Long = calculateWithdrawalAmount(token1Long.amount, token1Long.percentage, token1Long.usePercentage, position.userLongY)
    const liquidity1Short = calculateWithdrawalAmount(token1Short.amount, token1Short.percentage, token1Short.usePercentage, position.userShortY)

    // Check if any amount is being withdrawn
    const totalWithdrawal = parseFloat(liquidity0Long) + parseFloat(liquidity0Short) + parseFloat(liquidity1Long) + parseFloat(liquidity1Short)
    if (totalWithdrawal === 0) {
      toast.error('Please specify amounts to withdraw')
      return
    }

    setIsRemoving(true)

    try {
      // Call removeLiquidity directly to get transaction results
      const result = await removeLiquidity(
        position.token0Address,
        position.token1Address,
        liquidity0Long,
        liquidity0Short,
        liquidity1Long,
        liquidity1Short
      )

      // Show success result with actual withdrawal amounts from contract return data
      setTransactionResult({
        success: true,
        txHash: result.txHash,
        token0Symbol: position.token0Symbol,
        token1Symbol: position.token1Symbol,
        liquidity0Long,
        liquidity0Short,
        liquidity1Long,
        liquidity1Short,
        // Use actual return values from the contract (amount0, amount1)
        amount0: result.amount0,
        amount1: result.amount1
      })
      setShowTransactionResult(true)
      
      // Refresh positions and close modal after showing success
      setTimeout(async () => {
        if (onTransactionComplete) {
          await onTransactionComplete()
        }
        // Don't close modal immediately - let user see the success widget
      }, 1000)
      
    } catch (error) {
      console.error('Error removing liquidity:', error)
      
      // Show error result
      setTransactionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove liquidity',
        token0Symbol: position.token0Symbol,
        token1Symbol: position.token1Symbol,
        liquidity0Long,
        liquidity0Short,
        liquidity1Long,
        liquidity1Short
      })
      setShowTransactionResult(true)
    } finally {
      setIsRemoving(false)
    }
  }

  // Helper function to set percentage for all tokens
  const setAllPercentages = (percentage: number) => {
    setToken0Long({ percentage, amount: '', usePercentage: true })
    setToken0Short({ percentage, amount: '', usePercentage: true })
    setToken1Long({ percentage, amount: '', usePercentage: true })
    setToken1Short({ percentage, amount: '', usePercentage: true })
  }

  useEffect(() => {
    if (!isOpen) {
      // Reset all withdrawal states to empty
      setToken0Long({ percentage: 0, amount: '', usePercentage: true });
      setToken0Short({ percentage: 0, amount: '', usePercentage: true });
      setToken1Long({ percentage: 0, amount: '', usePercentage: true });
      setToken1Short({ percentage: 0, amount: '', usePercentage: true });
      setWithdrawalMode('percentage');
    }
  }, [isOpen]);

  // Early return after all hooks
  if (!isOpen || !position) return null



  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 md:pb-0">
      <div className="bg-white dark:bg-[var(--background)] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto relative p-4">
        {/* Loading Overlay */}
        <TransactionLoadingOverlay
          isVisible={isRemoving}
          title="Removing Liquidity..."
          subtitle="Please confirm the transactions in your wallet"
        />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Withdraw Liquidity</h2>
              <p className="text-sm font-light text-gray-600 dark:text-gray-400">
                Withdraw your liquidity position for {position.token0Symbol}/{position.token1Symbol}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="flex space-x-2">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => setAllPercentages(percent)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium cursor-pointer"
                >
                  {percent}% All
                </button>
              ))}
            </div>
          </div>

          {/* Individual Token Controls */}
          <div className="mb-6">
            {/* <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Withdraw by Token Type</h3> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Token 0 Long */}
              <div className="bg-gray-200/30 dark:bg-gray-800/30 rounded-lg p-4 space-y-4">
                <TokenWithdrawalControl
                  tokenSymbol={position.token0Symbol}
                  positionType="Long"
                  maxAmount={position.userLongX}
                  onAmountChange={(amount) => setToken0Long(prev => ({ ...prev, amount, usePercentage: false }))}
                  onPercentageChange={(percentage) => setToken0Long(prev => ({ ...prev, percentage, usePercentage: true }))}
                  currentAmount={token0Long.amount}
                  currentPercentage={token0Long.percentage}
                  usePercentage={token0Long.usePercentage}
                  color="bg-green-500"
                />

                {/* Token 0 Short */}
                <TokenWithdrawalControl
                  tokenSymbol={position.token0Symbol}
                  positionType="Short"
                  maxAmount={position.userShortX}
                  onAmountChange={(amount) => setToken0Short(prev => ({ ...prev, amount, usePercentage: false }))}
                  onPercentageChange={(percentage) => setToken0Short(prev => ({ ...prev, percentage, usePercentage: true }))}
                  currentAmount={token0Short.amount}
                  currentPercentage={token0Short.percentage}
                  usePercentage={token0Short.usePercentage}
                  color="bg-red-500"
                />
              </div>

              <div className="bg-gray-200/30 dark:bg-gray-800/30 rounded-lg p-4 space-y-4">
                {/* Token 1 Long */}
                <TokenWithdrawalControl
                  tokenSymbol={position.token1Symbol}
                  positionType="Long"
                  maxAmount={position.userLongY}
                  onAmountChange={(amount) => setToken1Long(prev => ({ ...prev, amount, usePercentage: false }))}
                  onPercentageChange={(percentage) => setToken1Long(prev => ({ ...prev, percentage, usePercentage: true }))}
                  currentAmount={token1Long.amount}
                  currentPercentage={token1Long.percentage}
                  usePercentage={token1Long.usePercentage}
                  color="bg-green-500"
                />

                {/* Token 1 Short */}
                <TokenWithdrawalControl
                  tokenSymbol={position.token1Symbol}
                  positionType="Short"
                  maxAmount={position.userShortY}
                  onAmountChange={(amount) => setToken1Short(prev => ({ ...prev, amount, usePercentage: false }))}
                  onPercentageChange={(percentage) => setToken1Short(prev => ({ ...prev, percentage, usePercentage: true }))}
                  currentAmount={token1Short.amount}
                  currentPercentage={token1Short.percentage}
                  usePercentage={token1Short.usePercentage}
                  color="bg-red-500"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">i</span>
              </div>
              <div>
                <h4 className="text-blue-800 dark:text-blue-200 font-semibold mb-1">Withdrawal Summary</h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  You can withdraw specific amounts from each LP token type (Long/Short positions for each token). Use percentage sliders or enter exact amounts.
                </p>
              </div>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-4 px-6 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
            onClick={handleRemoveLiquidity}
            disabled={isRemoving}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              {isRemoving ? 'Removing Liquidity...' : 'Confirm Removal'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Transaction Result Modal */}
      {showTransactionResult && transactionResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {transactionResult.success ? 'Withdrawal Successful!' : 'Withdrawal Failed'}
              </h3>
              <button
                onClick={() => {
                  setShowTransactionResult(false)
                  if (transactionResult.success) {
                    onClose()
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              {transactionResult.success ? (
                <>
                  {/* Success Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Transaction Details */}
                  <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="text-center mb-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Liquidity Withdrawn</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transactionResult.token0Symbol}/{transactionResult.token1Symbol} Pool
                      </p>
                    </div>
                    
                    {/* Withdrawn Amounts */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{transactionResult.token0Symbol} Withdrawn</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(transactionResult.amount0 || '0').toFixed(6)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{transactionResult.token1Symbol} Withdrawn</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {parseFloat(transactionResult.amount1 || '0').toFixed(6)}
                        </div>
                      </div>
                    </div>
                    
                    {/* LP Token Details */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">LP Tokens Burned:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-green-600 dark:text-green-400">Long {transactionResult.token0Symbol}:</span>
                          <span className="font-mono">{parseFloat(transactionResult.liquidity0Long || '0').toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600 dark:text-green-400">Long {transactionResult.token1Symbol}:</span>
                          <span className="font-mono">{parseFloat(transactionResult.liquidity1Long || '0').toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600 dark:text-red-400">Short {transactionResult.token0Symbol}:</span>
                          <span className="font-mono">{parseFloat(transactionResult.liquidity0Short || '0').toFixed(6)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600 dark:text-red-400">Short {transactionResult.token1Symbol}:</span>
                          <span className="font-mono">{parseFloat(transactionResult.liquidity1Short || '0').toFixed(6)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {transactionResult.txHash && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">Transaction:</span>
                          <a 
                            href={`https://testnet.sonicscan.org/tx/${transactionResult.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400 font-mono text-sm"
                          >
                            {transactionResult.txHash.slice(0, 6)}...{transactionResult.txHash.slice(-4)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Error Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Error Details */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-center mb-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Transaction Failed</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transactionResult.token0Symbol}/{transactionResult.token1Symbol} Pool
                      </p>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-400 text-center">
                      {transactionResult.error}
                    </div>
                  </div>
                </>
              )}
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowTransactionResult(false)
                  if (transactionResult.success) {
                    onClose() // Close the main modal on success
                  }
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                {transactionResult.success ? 'Done' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
