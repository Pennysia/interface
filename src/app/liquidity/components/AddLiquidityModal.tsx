'use client'

import { useState, useEffect, useCallback } from 'react'
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import TokenSelectorModal from '../../../components/TokenSelectorModal'
import { useLiquidity } from '../hooks/useLiquidity'
import { useLiquidityActions } from '../hooks/useLiquidityActions'
import { useScrollLock } from '../hooks/useScrollLock'
import toast from 'react-hot-toast'
import { type Token } from '../../../components/TokenSelectorModal'
import TransactionLoadingOverlay from '../../../components/ui/TransactionLoadingOverlay'
import { ethers } from 'ethers'
import { useStore } from '../../../store/useStore'
import { getMarketAddress } from '../../../lib/sdk-utils'
import { MARKET_ABI, ERC20_ABI } from '../../../lib/abis'
import { CURRENT_CHAIN_ID } from '@/config/chains'

interface LiquidityPosition {
  id: number
  pair: string
  token0Symbol: string
  token1Symbol: string
  token0Address: string
  token1Address: string
  liquidity: string
  value: string
  apr: string
  fees24h: string
  pnl: string
  pnlPercent: string
  isProfit: boolean
  reserve0Long: string
  reserve0Short: string
  reserve1Long: string
  reserve1Short: string
  totalShares: string
  myShares: string
  sharePercent: string
}

interface AddLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPosition?: LiquidityPosition | null
  onTransactionComplete?: () => Promise<void>
}

export default function AddLiquidityModal({ isOpen, onClose, selectedPosition, onTransactionComplete }: AddLiquidityModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTokenA, setSelectedTokenA] = useState<Token | null>(null)
  const [selectedTokenB, setSelectedTokenB] = useState<Token | null>(null)
  const [amountA, setAmountA] = useState<string>('')
  const [amountB, setAmountB] = useState<string>('')
  const [maxAmountA, setMaxAmountA] = useState<string>('')
  const [maxAmountB, setMaxAmountB] = useState<string>('')
  const [bullishPercentage, setBullishPercentage] = useState(50)
  const [bearishPercentage, setBearishPercentage] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTokenSelectorA, setShowTokenSelectorA] = useState(false)
  const [showTokenSelectorB, setShowTokenSelectorB] = useState(false)
  const [poolReserves, setPoolReserves] = useState<{ reserve0: bigint; reserve1: bigint } | null>(null)
  const [isLoadingPoolData, setIsLoadingPoolData] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState<{ tokenAToB: number; tokenBToA: number } | null>(null)
  const [showTransactionResult, setShowTransactionResult] = useState(false)
  const [expandErrorMessage, setExpandErrorMessage] = useState(false)
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean
    error?: string
    amount0Long?: string
    amount0Short?: string
    amount1Long?: string
    amount1Short?: string
    token0Symbol?: string
    token1Symbol?: string
    liquidityMinted?: string
    txHash?: string
  } | null>(null)

  const { isAuthenticated } = useLiquidity()
  const { performAddLiquidity } = useLiquidityActions()
  
  // Pool key for identification (still useful for debugging)
  const poolKey = selectedTokenA && selectedTokenB ? `${selectedTokenA.symbol}-${selectedTokenB.symbol}` : ''
  
  // Calculate pool price from actual reserves (price = totalReserve1 / totalReserve0)
  const poolPrice = poolReserves && selectedTokenA && selectedTokenB 
    ? Number(ethers.formatUnits(poolReserves.reserve1, selectedTokenB.decimals)) / 
      Number(ethers.formatUnits(poolReserves.reserve0, selectedTokenA.decimals))
    : 0
  
  // Lock background scroll when modal is open
  useScrollLock(isOpen)
  
  // Smart number formatting with appropriate precision for ethers.js compatibility
  const formatSafeNumber = (value: string | number): string => {
    try {
      if (!value || value === '0' || value === 0) {
        return '0'
      }
      
      // Convert to string first to handle precision issues
      let strValue = String(value)
      
      // Handle scientific notation
      if (strValue.includes('e') || strValue.includes('E')) {
        const num = parseFloat(strValue)
        if (isNaN(num) || num <= 0) return '0'
        strValue = num.toFixed(20) // Use high precision first
      }
      
      // Convert to number for validation
      const num = Number(strValue)
      if (isNaN(num) || num < 0) return '0'
      if (num === 0) return '0'
      
      // For extremely small numbers, set a minimum threshold
      if (num < 1e-18) {
        return '0'
      }
      
      // CRITICAL: Limit to maximum 18 decimal places to prevent ethers.js underflow
      // Count decimal places in the string representation
      const parts = strValue.split('.')
      if (parts.length > 1 && parts[1].length > 18) {
        // Truncate to 18 decimal places (don't round to avoid precision issues)
        strValue = parts[0] + '.' + parts[1].substring(0, 18)
      }
      
      // Re-parse the truncated value
      const truncatedNum = Number(strValue)
      if (isNaN(truncatedNum) || truncatedNum <= 0) return '0'
      
      // Determine appropriate decimal places for display
      let decimals: number
      if (truncatedNum >= 1000) {
        decimals = 2
      } else if (truncatedNum >= 100) {
        decimals = 3
      } else if (truncatedNum >= 10) {
        decimals = 4
      } else if (truncatedNum >= 1) {
        decimals = 5
      } else if (truncatedNum >= 0.1) {
        decimals = 6
      } else if (truncatedNum >= 0.01) {
        decimals = 7
      } else if (truncatedNum >= 0.001) {
        decimals = 8
      } else if (truncatedNum >= 0.0001) {
        decimals = 10
      } else if (truncatedNum >= 0.00001) {
        decimals = 12
      } else {
        // For very small numbers, limit to 18 decimals max
        decimals = Math.min(18, 15)
      }
      
      // Format with the determined decimal places
      const formatted = truncatedNum.toFixed(decimals)
      
      // Remove trailing zeros and unnecessary decimal point
      const cleaned = formatted.replace(/\.?0+$/, '')
      
      // Final validation
      if (cleaned.includes('e') || cleaned.includes('E') || cleaned === '' || cleaned === '.') {
        return '0'
      }
      
      // Double-check: ensure we don't have more than 18 decimal places
      const finalParts = cleaned.split('.')
      if (finalParts.length > 1 && finalParts[1].length > 18) {
        return finalParts[0] + '.' + finalParts[1].substring(0, 18).replace(/0+$/, '')
      }
      
      return cleaned
      
    } catch (error) {
      console.error('Error formatting number:', error, 'Input:', value)
      return '0'
    }
  }

  // Token sorting and validation functions
  const sortTokens = (tokenA: Token, tokenB: Token): [Token, Token] => {
    // Sort tokens by address (lexicographic order)
    return tokenA.address.toLowerCase() < tokenB.address.toLowerCase() 
      ? [tokenA, tokenB] 
      : [tokenB, tokenA]
  }

  const handleTokenASelection = (token: Token | null) => {
    if (!token) {
      setSelectedTokenA(null)
      setShowTokenSelectorA(false)
      return
    }

    // Check if same as TokenB
    if (selectedTokenB && token.address === selectedTokenB.address) {
      toast.error('Cannot select the same token for both positions')
      setShowTokenSelectorA(false)
      return
    }

    setSelectedTokenA(token)
    setShowTokenSelectorA(false)
    
    // If both tokens are selected, sort them
    if (selectedTokenB) {
      const [token0, token1] = sortTokens(token, selectedTokenB)
      if (token0.address !== token.address) {
        // Need to swap: current selection becomes TokenB
        setSelectedTokenA(token1)
        setSelectedTokenB(token0)
        // Also swap amounts if they exist
        if (amountA || amountB) {
          const tempAmount = amountA
          setAmountA(amountB)
          setAmountB(tempAmount)
        }
      }
    }
  }

  const handleTokenBSelection = (token: Token | null) => {
    if (!token) {
      setSelectedTokenB(null)
      setShowTokenSelectorB(false)
      return
    }

    // Check if same as TokenA
    if (selectedTokenA && token.address === selectedTokenA.address) {
      toast.error('Cannot select the same token for both positions')
      setShowTokenSelectorB(false)
      return
    }

    setSelectedTokenB(token)
    setShowTokenSelectorB(false)
    
    // If both tokens are selected, sort them
    if (selectedTokenA) {
      const [token0, token1] = sortTokens(selectedTokenA, token)
      if (token0.address !== selectedTokenA.address) {
        // Need to swap: TokenA becomes TokenB and vice versa
        setSelectedTokenA(token0)
        setSelectedTokenB(token1)
        // Also swap amounts if they exist
        if (amountA || amountB) {
          const tempAmount = amountA
          setAmountA(amountB)
          setAmountB(tempAmount)
        }
      }
    }
  }

  // Calculate decimal-aware price for new pools
  const calculateDecimalAwarePrice = useCallback(() => {
    if (!selectedTokenA || !selectedTokenB || !amountA || !amountB) {
      setCalculatedPrice(null)
      return
    }

    try {
      const amountANum = Number(amountA)
      const amountBNum = Number(amountB)
      
      if (amountANum <= 0 || amountBNum <= 0) {
        setCalculatedPrice(null)
        return
      }

      // Normalize amounts using token decimals
      const amountABase = amountANum * Math.pow(10, selectedTokenA.decimals)
      const amountBBase = amountBNum * Math.pow(10, selectedTokenB.decimals)
      
      // Calculate exchange rates (decimal-adjusted)
      const tokenAToB = amountBBase / amountABase
      const tokenBToA = amountABase / amountBBase
      
      setCalculatedPrice({ tokenAToB, tokenBToA })
    } catch (error) {
      console.error('Error calculating decimal-aware price:', error)
      setCalculatedPrice(null)
    }
  }, [selectedTokenA, selectedTokenB, amountA, amountB])

  // Direct pool detection using getReserves() - simplified approach
  const checkPoolExistence = useCallback(async () => {
    if (!selectedTokenA || !selectedTokenB) {
      setPoolReserves(null)
      setIsLoadingPoolData(false)
      return
    }

    setIsLoadingPoolData(true)
    console.log('🔍 Checking pool existence for:', selectedTokenA.symbol, selectedTokenB.symbol)
    
    try {
      const { provider, isConnected } = useStore.getState()
      
      if (!isConnected || !provider) {
        console.log('❌ Wallet not connected')
        setIsLoadingPoolData(false)
        return
      }

      const marketAddress = getMarketAddress(CURRENT_CHAIN_ID)
      if (!marketAddress) {
        console.error(`Market address not found for chain ID ${CURRENT_CHAIN_ID}`)
        toast.error("Market address not found for the current chain.")
        setIsSubmitting(false)
        return
      }
      const marketContract = new ethers.Contract(marketAddress, MARKET_ABI, provider)
      
      // Sort tokens to ensure proper order
      const [token0, token1] = sortTokens(selectedTokenA, selectedTokenB)
      
      console.log('📞 Calling getReserves() for:', token0.symbol, token1.symbol)
      
      let poolExists = false
      let reserve0Long = 0n, reserve0Short = 0n, reserve1Long = 0n, reserve1Short = 0n
      
      try {
        const reserves = await marketContract.getReserves(token0.address, token1.address)
        ;[reserve0Long, reserve0Short, reserve1Long, reserve1Short] = reserves
        
        console.log('📊 Reserves received:', {
          reserve0Long: reserve0Long.toString(),
          reserve0Short: reserve0Short.toString(), 
          reserve1Long: reserve1Long.toString(),
          reserve1Short: reserve1Short.toString()
        })
        
        // Pool exists if any reserves > 0
        poolExists = reserve0Long > 0n || reserve0Short > 0n || reserve1Long > 0n || reserve1Short > 0n
      } catch (error: unknown) {
        console.log('📝 Pool does not exist yet (getReserves failed):', error instanceof Error ? error.message : 'Unknown error')
        // Pool doesn't exist - all reserves remain 0n, poolExists remains false
        poolExists = false
      }
      console.log('✅ Pool exists:', poolExists)
      
      if (poolExists) {
        // Calculate total reserves: totalReserveX = reserve0Long + reserve0Short
        const totalReserve0 = reserve0Long + reserve0Short
        const totalReserve1 = reserve1Long + reserve1Short
        
        setPoolReserves({
          reserve0: totalReserve0,
          reserve1: totalReserve1
        })
        
        console.log('💰 Total reserves:', {
          token0: totalReserve0.toString(),
          token1: totalReserve1.toString()
        })
      } else {
        setPoolReserves(null)
        console.log('🆕 New pool - no reserves')
      }
    } catch (error) {
      console.error('❌ Pool detection failed:', error)
      setPoolReserves(null)
    } finally {
      setIsLoadingPoolData(false)
    }
  }, [selectedTokenA, selectedTokenB])

  // Calculate decimal-aware price when tokens and amounts change
  useEffect(() => {
    if (selectedTokenA && selectedTokenB && amountA && amountB && Number(amountA) > 0 && Number(amountB) > 0) {
      calculateDecimalAwarePrice()
    } else {
      setCalculatedPrice(null)
    }
  }, [selectedTokenA, selectedTokenB, amountA, amountB, calculateDecimalAwarePrice])

  // Fetch token balances when tokens are selected
  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (!selectedTokenA || !selectedTokenB) return
      
      try {
        const { provider, isConnected } = useStore.getState()
        if (!isConnected || !provider) return

        const signer = await provider.getSigner()
        const userAddress = await signer.getAddress()

        // Fetch balance for Token A
        if (selectedTokenA) {
          const tokenAContract = new ethers.Contract(selectedTokenA.address, ERC20_ABI, provider)
          const balanceA = await tokenAContract.balanceOf(userAddress)
          const formattedBalanceA = ethers.formatUnits(balanceA, selectedTokenA.decimals)
          setMaxAmountA(formattedBalanceA)
        }

        // Fetch balance for Token B
        if (selectedTokenB) {
          const tokenBContract = new ethers.Contract(selectedTokenB.address, ERC20_ABI, provider)
          const balanceB = await tokenBContract.balanceOf(userAddress)
          const formattedBalanceB = ethers.formatUnits(balanceB, selectedTokenB.decimals)
          setMaxAmountB(formattedBalanceB)
        }
      } catch (error) {
        console.error('Error fetching token balances:', error)
        setMaxAmountA('')
        setMaxAmountB('')
      }
    }

    fetchTokenBalances()
  }, [selectedTokenA, selectedTokenB])

  // Check pool existence when tokens change
  useEffect(() => {
    if (selectedTokenA && selectedTokenB) {
      checkPoolExistence()
    } else {
      setPoolReserves(null)
      setIsLoadingPoolData(false)
    }
  }, [selectedTokenA, selectedTokenB, checkPoolExistence])

  // Handle liquidity submission
  const handleLiquiditySubmission = async () => {
    if (!isAuthenticated) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!selectedTokenA || !selectedTokenB || !amountA || !amountB) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    // Calculate directional amounts based on mirrored percentages (same logic as step 3 display)
    const totalAmountA = parseFloat(amountA)
    const totalAmountB = parseFloat(amountB)
    const sliderValue = bullishPercentage // Current slider position
    
    // Mirrored allocation logic: Token A and Token B have opposite allocations
    // When slider is at 80%, it means 80% bullish on Token A, 20% bullish on Token B
    const tokenABullishRatio = sliderValue / 100 // Token A bullish percentage
    const tokenABearishRatio = (100 - sliderValue) / 100 // Token A bearish percentage
    const tokenBBullishRatio = (100 - sliderValue) / 100 // Token B bullish percentage (mirrored)
    const tokenBBearishRatio = sliderValue / 100 // Token B bearish percentage (mirrored)
    
    // Calculate raw amounts first
    const rawAmount0Long = totalAmountA * tokenABullishRatio
    const rawAmount0Short = totalAmountA * tokenABearishRatio
    const rawAmount1Long = totalAmountB * tokenBBullishRatio
    const rawAmount1Short = totalAmountB * tokenBBearishRatio
    
    // Simple function to avoid scientific notation
    const toSafeString = (value: number): string => {
      if (value === 0) return '0'
      
      // Convert to string and check for scientific notation
      let str = value.toString()
      if (str.includes('e') || str.includes('E')) {
        // If very small, just return '0'
        if (value < 0.000001) {
          return '0'
        }
        // Use toFixed with high precision to expand scientific notation
        str = value.toFixed(20).replace(/\.?0+$/, '')
      }
      
      return str
    }
    
    // Use ethers.js parseUnits to properly format amounts for contract calls
    // This avoids scientific notation and precision issues
    const amount0Long = toSafeString(rawAmount0Long)
    const amount0Short = toSafeString(rawAmount0Short)
    const amount1Long = toSafeString(rawAmount1Long)
    const amount1Short = toSafeString(rawAmount1Short)
    
    try {

      // Use actual token addresses from selected tokens
      const token0Address = selectedTokenA.address
      const token1Address = selectedTokenB.address

      // Use the reusable performAddLiquidity function that handles refresh automatically
      const result = await performAddLiquidity(
        {
          token0Address,
          token1Address,
          amount0Long,
          amount0Short,
          amount1Long,
          amount1Short,
          token0Decimals: selectedTokenA.decimals,
          token1Decimals: selectedTokenB.decimals
        },
        async () => {
          // Don't close modal immediately - show success popup first
          if (onTransactionComplete) {
            await onTransactionComplete()
          }
        }
      )
      
      console.log('✅ Add liquidity result:', result)
      
      // Show success result immediately without closing main modal
      setTransactionResult({
        success: true,
        txHash: result?.txHash,
        amount0Long,
        amount0Short,
        amount1Long,
        amount1Short,
        token0Symbol: selectedTokenA.symbol,
        token1Symbol: selectedTokenB.symbol,
        liquidityMinted: result?.liquidityMinted || 'N/A'
      })
      setShowTransactionResult(true)
      console.log('✅ Success popup state set!')
    } catch (error) {
      console.error('Error adding liquidity:', error)
      
      // Show error result
      setTransactionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add liquidity',
        amount0Long,
        amount0Short,
        amount1Long,
        amount1Short,
        token0Symbol: selectedTokenA.symbol,
        token1Symbol: selectedTokenB.symbol,
        txHash: ''
      })
      setShowTransactionResult(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-select tokens when selectedPosition is provided
  useEffect(() => {
    if (selectedPosition && isOpen) {
      // Create Token objects directly from position data
      const token0: Token = {
        address: selectedPosition.token0Address,
        symbol: selectedPosition.token0Symbol,
        name: selectedPosition.token0Symbol, // Use symbol as name for now
        decimals: 18, // Default to 18, could be improved by fetching actual decimals
        chainId: CURRENT_CHAIN_ID,
        logoURI: '' // No logo for now
      }
      
      const token1: Token = {
        address: selectedPosition.token1Address,
        symbol: selectedPosition.token1Symbol,
        name: selectedPosition.token1Symbol, // Use symbol as name for now
        decimals: 18, // Default to 18, could be improved by fetching actual decimals
        chainId: CURRENT_CHAIN_ID,
        logoURI: '' // No logo for now
      }
      
      // Sort tokens to ensure proper order (token0 < token1)
      const [sortedToken0, sortedToken1] = sortTokens(token0, token1)
      setSelectedTokenA(sortedToken0)
      setSelectedTokenB(sortedToken1)
      
      console.log('Pre-selected tokens from position:', {
        token0: sortedToken0,
        token1: sortedToken1
      })
    }
  }, [selectedPosition, isOpen])

  // Token fetching is now handled by TokenSelectorModal

  if (!isOpen) return null



  const canProceedToStep2 = selectedTokenA && selectedTokenB && selectedTokenA.address !== selectedTokenB.address
  const canProceedToStep3 = canProceedToStep2 && amountA && amountB && Number(amountA) > 0 && Number(amountB) > 0
  const canComplete = canProceedToStep3 && (bullishPercentage + bearishPercentage === 100)

  const handleClose = () => {
    onClose()
    // Reset form state when closing
    setCurrentStep(1)
    setSelectedTokenA(null)
    setSelectedTokenB(null)
    setAmountA('')
    setAmountB('')
    setBullishPercentage(50)
    setBearishPercentage(50)
    setCalculatedPrice(null)
    setShowTransactionResult(false)
    setTransactionResult(null)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Select Token Pair</h2>
        <p className="text-gray-400">Choose the tokens you want to provide liquidity for</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Token</label>
          <button
            onClick={() => setShowTokenSelectorA(true)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {selectedTokenA ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {selectedTokenA.symbol.charAt(0)}
                  </div>
                  <span className="text-gray-900 dark:text-white">{selectedTokenA.symbol}</span>
                </>
              ) : (
                <span className="text-gray-400">Select first token</span>
              )}
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Second Token</label>
          <button
            onClick={() => setShowTokenSelectorB(true)}
            className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {selectedTokenB ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {selectedTokenB.symbol.charAt(0)}
                  </div>
                  <span className="text-gray-900 dark:text-white">{selectedTokenB.symbol}</span>
                </>
              ) : (
                <span className="text-gray-400">Select second token</span>
              )}
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {poolKey && (
          <div className="bg-gray-200/30 dark:bg-gray-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              {isLoadingPoolData ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-blue-400">Checking Pool...</span>
                </>
              ) : poolReserves ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-400">Pool Exists</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-yellow-400">New Pool</span>
                </>
              )}
            </div>
            {poolReserves && !isLoadingPoolData && (
              <div className="mt-2 text-sm text-gray-400">
                Pool has reserves - ratio will be enforced
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Set Token Amounts</h2>
        <p className="text-gray-400">
          {poolReserves ? 'Enter amounts (ratio will be enforced)' : 'Set initial pool ratio'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {selectedTokenA?.symbol || 'Token A'} Amount
            {maxAmountA && (
              <span className="text-xs text-gray-400 ml-2">
                <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => {
                  if (maxAmountA) {
                    setAmountA(maxAmountA)
                    // Trigger ratio enforcement
                    const [token0, token1] = sortTokens(selectedTokenA!, selectedTokenB!)
                    const isTokenAFirst = selectedTokenA!.address.toLowerCase() === token0.address.toLowerCase()
                    
                    if (poolReserves && maxAmountA && Number(maxAmountA) > 0) {
                      const reserve0Formatted = Number(ethers.formatUnits(poolReserves.reserve0, token0.decimals))
                      const reserve1Formatted = Number(ethers.formatUnits(poolReserves.reserve1, token1.decimals))
                      
                      let expectedB: number
                      if (isTokenAFirst) {
                        expectedB = (Number(maxAmountA) * reserve1Formatted) / reserve0Formatted
                      } else {
                        expectedB = (Number(maxAmountA) * reserve0Formatted) / reserve1Formatted
                      }
                      
                      // Check if token B amount would exceed max balance
                      if (maxAmountB && expectedB > Number(maxAmountB)) {
                        const cappedB = Number(maxAmountB)
                        setAmountB(formatSafeNumber(cappedB.toString()))
                        
                        let recalculatedA: number
                        if (isTokenAFirst) {
                          recalculatedA = (cappedB * reserve0Formatted) / reserve1Formatted
                        } else {
                          recalculatedA = (cappedB * reserve1Formatted) / reserve0Formatted
                        }
                        setAmountA(formatSafeNumber(recalculatedA.toString()))
                        toast.success('Both amounts set to max within balance limits')
                      } else {
                        setAmountB(formatSafeNumber(expectedB.toString()))
                        toast.success(`Set Token A to max: ${formatSafeNumber(maxAmountA)}`)
                      }
                    } else {
                      setAmountB('')
                      toast.success(`Set Token A to max: ${formatSafeNumber(maxAmountA)}`)
                    }
                  }
                }}
              >
                Max: {formatSafeNumber(maxAmountA)}
              </button>
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amountA}
              onChange={(e) => {
                const value = e.target.value
                // Prevent negative amounts
                const numValue = Number(value)
                if (numValue < 0) {
                  toast.error('Amount cannot be negative')
                  return
                }
                
                // Enforce max amount for token A
                let cappedValue = value
                if (maxAmountA && numValue > Number(maxAmountA)) {
                  cappedValue = maxAmountA
                  toast.success(`Amount capped at max balance: ${formatSafeNumber(maxAmountA)}`)
                }
                
                setAmountA(cappedValue)
                
                // Smart ratio enforcement that respects both token balances
                if (poolReserves && cappedValue && Number(cappedValue) > 0) {
                  const [token0, token1] = sortTokens(selectedTokenA!, selectedTokenB!)
                  const isTokenAFirst = selectedTokenA!.address.toLowerCase() === token0.address.toLowerCase()
                  
                  // Calculate ratio based on actual reserves
                  const reserve0Formatted = Number(ethers.formatUnits(poolReserves.reserve0, token0.decimals))
                  const reserve1Formatted = Number(ethers.formatUnits(poolReserves.reserve1, token1.decimals))
                  
                  let expectedB: number
                  if (isTokenAFirst) {
                    expectedB = (Number(cappedValue) * reserve1Formatted) / reserve0Formatted
                  } else {
                    expectedB = (Number(cappedValue) * reserve0Formatted) / reserve1Formatted
                  }
                  
                  // Check if token B amount would exceed max balance
                  if (maxAmountB && expectedB > Number(maxAmountB)) {
                    // Cap token B amount and recalculate token A amount
                    const cappedB = Number(maxAmountB)
                    setAmountB(formatSafeNumber(cappedB.toString()))
                    
                    // Recalculate token A amount based on capped token B
                    let recalculatedA: number
                    if (isTokenAFirst) {
                      recalculatedA = (cappedB * reserve0Formatted) / reserve1Formatted
                    } else {
                      recalculatedA = (cappedB * reserve1Formatted) / reserve0Formatted
                    }
                    setAmountA(formatSafeNumber(recalculatedA.toString()))
                    toast.success('Both amounts adjusted to stay within balance limits')
                  } else {
                    setAmountB(formatSafeNumber(expectedB.toString()))
                  }
                }
              }}
              placeholder="0.0"
              min="0"
              max={maxAmountA || undefined}
              step="any"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {selectedTokenA?.symbol?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {selectedTokenB?.symbol || 'Token B'} Amount
            {maxAmountB && (
              <span className="text-xs text-gray-400 ml-2">
                <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => {
                  if (maxAmountB) {
                    setAmountB(maxAmountB)
                    // Trigger ratio enforcement
                    const [token0, token1] = sortTokens(selectedTokenA!, selectedTokenB!)
                    const isTokenAFirst = selectedTokenA!.address.toLowerCase() === token0.address.toLowerCase()
                    
                    if (poolReserves && maxAmountB && Number(maxAmountB) > 0) {
                      const reserve0Formatted = Number(ethers.formatUnits(poolReserves.reserve0, token0.decimals))
                      const reserve1Formatted = Number(ethers.formatUnits(poolReserves.reserve1, token1.decimals))
                      
                      let expectedA: number
                      if (isTokenAFirst) {
                        expectedA = (Number(maxAmountB) * reserve0Formatted) / reserve1Formatted
                      } else {
                        expectedA = (Number(maxAmountB) * reserve1Formatted) / reserve0Formatted
                      }
                      
                      // Check if token A amount would exceed max balance
                      if (maxAmountA && expectedA > Number(maxAmountA)) {
                        const cappedA = Number(maxAmountA)
                        setAmountA(formatSafeNumber(cappedA.toString()))
                        
                        let recalculatedB: number
                        if (isTokenAFirst) {
                          recalculatedB = (cappedA * reserve1Formatted) / reserve0Formatted
                        } else {
                          recalculatedB = (cappedA * reserve0Formatted) / reserve1Formatted
                        }
                        setAmountB(formatSafeNumber(recalculatedB.toString()))
                        toast.success('Both amounts set to max within balance limits')
                      } else {
                        setAmountA(formatSafeNumber(expectedA.toString()))
                        toast.success(`Set Token B to max: ${formatSafeNumber(maxAmountB)}`)
                      }
                    } else {
                      setAmountA('')
                      toast.success(`Set Token B to max: ${formatSafeNumber(maxAmountB)}`)
                    }
                  }
                }}
              >
                Max: {formatSafeNumber(maxAmountB)}
              </button>
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              value={amountB}
              onChange={(e) => {
                const value = e.target.value
                // Prevent negative amounts
                const numValue = Number(value)
                if (numValue < 0) {
                  toast.error('Amount cannot be negative')
                  return
                }
                
                // Enforce max amount for token B
                let cappedValue = value
                if (maxAmountB && numValue > Number(maxAmountB)) {
                  cappedValue = maxAmountB
                  toast.success(`Amount capped at max balance: ${formatSafeNumber(maxAmountB)}`)
                }
                
                setAmountB(cappedValue)
                
                // Smart ratio enforcement that respects both token balances
                if (poolReserves && cappedValue && Number(cappedValue) > 0) {
                  const [token0, token1] = sortTokens(selectedTokenA!, selectedTokenB!)
                  const isTokenAFirst = selectedTokenA!.address.toLowerCase() === token0.address.toLowerCase()
                  
                  // Calculate ratio based on actual reserves
                  const reserve0Formatted = Number(ethers.formatUnits(poolReserves.reserve0, token0.decimals))
                  const reserve1Formatted = Number(ethers.formatUnits(poolReserves.reserve1, token1.decimals))
                  
                  let expectedA: number
                  if (isTokenAFirst) {
                    expectedA = (Number(cappedValue) * reserve0Formatted) / reserve1Formatted
                  } else {
                    expectedA = (Number(cappedValue) * reserve1Formatted) / reserve0Formatted
                  }
                  
                  // Check if token A amount would exceed max balance
                  if (maxAmountA && expectedA > Number(maxAmountA)) {
                    // Cap token A amount and recalculate token B amount
                    const cappedA = Number(maxAmountA)
                    setAmountA(formatSafeNumber(cappedA.toString()))
                    
                    // Recalculate token B amount based on capped token A
                    let recalculatedB: number
                    if (isTokenAFirst) {
                      recalculatedB = (cappedA * reserve1Formatted) / reserve0Formatted
                    } else {
                      recalculatedB = (cappedA * reserve0Formatted) / reserve1Formatted
                    }
                    setAmountB(formatSafeNumber(recalculatedB.toString()))
                    toast.success('Both amounts adjusted to stay within balance limits')
                  } else {
                    setAmountA(formatSafeNumber(expectedA.toString()))
                  }
                }
              }}
              placeholder="0.0"
              min="0"
              max={maxAmountB || undefined}
              step="any"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {selectedTokenB?.symbol?.charAt(0) || 'B'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {poolReserves && selectedTokenA && selectedTokenB && amountA && amountB && (
        <div className="bg-gray-200/30 dark:bg-gray-800/30 rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-2">Pool Price Impact</div>
          <div className="text-green-400 text-sm">
            Current ratio maintained: 1 {selectedTokenA.symbol} = {poolPrice.toLocaleString()} {selectedTokenB.symbol}
          </div>
        </div>
      )}

      {/* Only show Initial Pool Price widget for NEW pools */}
      {!poolReserves && !isLoadingPoolData && selectedTokenA && selectedTokenB && calculatedPrice && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="text-sm text-blue-300 mb-2">Initial Pool Price (Decimal-Adjusted)</div>
          <div className="space-y-2">
            <div className="text-blue-400 text-sm">
              1 {selectedTokenA.symbol} = {calculatedPrice.tokenAToB.toLocaleString(undefined, { maximumFractionDigits: 8 })} {selectedTokenB.symbol}
            </div>
            <div className="text-blue-400 text-sm">
              1 {selectedTokenB.symbol} = {calculatedPrice.tokenBToA.toLocaleString(undefined, { maximumFractionDigits: 8 })} {selectedTokenA.symbol}
            </div>
          </div>
          <div className="text-xs text-blue-300/70 mt-2">
            This exchange rate accounts for token decimals ({selectedTokenA.symbol}: {selectedTokenA.decimals}, {selectedTokenB.symbol}: {selectedTokenB.decimals})
          </div>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => {
    // Calculate proportional amounts based on slider position (0-100)
    // 0 = 100% TokenA Bullish/TokenB Bearish, 100 = 100% TokenB Bullish/TokenA Bearish
    const sliderValue = bullishPercentage // Reuse existing state
    
    // Calculate directional amounts
    const totalAmountA = Number(amountA) || 0
    const totalAmountB = Number(amountB) || 0
    
    // Calculate directional amounts based on slider position (mirrored)
    // When slider is at 80%, it means 80% bullish on Token A
    const tokenABullishRatio = sliderValue / 100 // Token A bullish percentage
    const tokenABearishRatio = (100 - sliderValue) / 100 // Token A bearish percentage
    const tokenBBullishRatio = (100 - sliderValue) / 100 // Token B bullish percentage (mirrored)
    const tokenBBearishRatio = sliderValue / 100 // Token B bearish percentage (mirrored)
    
    const amountALong = totalAmountA * tokenABullishRatio
    const amountAShort = totalAmountA * tokenABearishRatio
    const amountBLong = totalAmountB * tokenBBullishRatio
    const amountBShort = totalAmountB * tokenBBearishRatio

    // TODO: Calculate actual LP tokens using quoteLiquidity from Router
    // For now, use placeholder calculations
    // const estimatedLongLP = (amountALong + amountBLong) * 0.1
    // const estimatedShortLP = (amountAShort + amountBShort) * 0.1

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Set Position Allocation</h2>
          <p className="text-gray-400">Choose your directional bias for this liquidity position</p>
        </div>

        {/* Single Slider */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="text-gray-400">Bearish on {selectedTokenA?.symbol}</span>
            <span className="text-gray-400">Bullish on {selectedTokenA?.symbol}</span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => {
                const value = Number(e.target.value)
                setBullishPercentage(value)
                setBearishPercentage(100 - value)
              }}
              className="w-full h-3 bg-gradient-to-r from-red-500 to-green-500 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-300">
            Current: {sliderValue.toFixed(0)}% {selectedTokenA?.symbol} Bullish / {(100 - sliderValue).toFixed(0)}% {selectedTokenB?.symbol} Bullish
          </div>
        </div>

        {/* Token Amount Breakdown */}
        <div className="bg-gray-200/30 dark:bg-gray-800/30 rounded-lg p-4">
          <div className="text-sm text-gray-300 mb-3">Token Allocation Breakdown</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-gray-400">{selectedTokenA?.symbol} Distribution</div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Long:</span>
                <span className="text-green-400 font-mono">{amountALong.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Short:</span>
                <span className="text-red-400 font-mono">{amountAShort.toFixed(8)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">{selectedTokenB?.symbol} Distribution</div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">Long:</span>
                <span className="text-green-600 dark:text-green-400 font-mono">{amountBLong.toFixed(8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600 dark:text-red-400">Short:</span>
                <span className="text-red-600 dark:text-red-400 font-mono">{amountBShort.toFixed(8)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="text-yellow-800 dark:text-yellow-400 text-sm">
            <strong>Position Explanation:</strong> Moving the slider left favors {selectedTokenA?.symbol} bullish positions, 
            while moving right favors {selectedTokenB?.symbol} bullish positions. Your liquidity will be allocated 
            proportionally across long and short positions for both tokens.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[var(--background)] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md md:max-w-xl max-h-[calc(100vh-4rem)] overflow-y-auto relative">
        {/* Loading Overlay */}
        <TransactionLoadingOverlay 
          isVisible={isSubmitting}
          title="Adding Liquidity..."
          subtitle="Please confirm the transaction in your wallet"
        />
        <div className="p-6 pb-24 md:pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add Liquidity</h2>
            <button
              onClick={handleClose}
              className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === currentStep
                      ? 'bg-blue-500 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 gap-4">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              hidden={currentStep === 1}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => {
                if (currentStep === 3) {
                  handleLiquiditySubmission()
                } else {
                  setCurrentStep(currentStep + 1)
                }
              }}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3) ||
                (currentStep === 3 && (!canComplete || isSubmitting))
              }
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>
                {currentStep === 3 
                  ? (isSubmitting ? 'Adding Liquidity...' : 'Provide Liquidity') 
                  : (currentStep === 2 ? 'Review' : 'Next')}
              </span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Token Selector Modals */}
      <TokenSelectorModal
        isOpen={showTokenSelectorA}
        onClose={() => setShowTokenSelectorA(false)}
        onTokenSelect={handleTokenASelection}
        title="Select first token"
        excludeToken={selectedTokenB}
      />
      
      <TokenSelectorModal
        isOpen={showTokenSelectorB}
        onClose={() => setShowTokenSelectorB(false)}
        onTokenSelect={handleTokenBSelection}
        title="Select second token"
        excludeToken={selectedTokenA}
      />
      
      {/* Transaction Result Modal */}
      {showTransactionResult && transactionResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {transactionResult.success ? 'Liquidity Added Successfully!' : 'Transaction Failed'}
              </h3>
              <button
                onClick={() => {
                  setShowTransactionResult(false)
                  if (transactionResult.success) {
                    handleClose() // Close the main modal on success
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
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Liquidity Added</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transactionResult.token0Symbol}/{transactionResult.token1Symbol} Pool
                      </p>
                    </div>
                    
                    {/* Added Amounts */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{transactionResult.token0Symbol} Added</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400">Long:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount0Long || '0')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-red-600 dark:text-red-400">Short:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount0Short || '0')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{transactionResult.token1Symbol} Added</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400">Long:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount1Long || '0')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-red-600 dark:text-red-400">Short:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount1Short || '0')}</span>
                          </div>
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
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-red-400 text-sm">Error:</p>
                      {transactionResult.error && transactionResult.error.length > 100 && (
                        <button
                          onClick={() => setExpandErrorMessage(!expandErrorMessage)}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {expandErrorMessage ? 'Collapse' : 'Expand'}
                          <svg 
                            className={`w-3 h-3 transition-transform ${expandErrorMessage ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="text-red-300 text-sm break-words">
                      {transactionResult.error && transactionResult.error.length > 100 ? (
                        expandErrorMessage ? (
                          transactionResult.error
                        ) : (
                          `${transactionResult.error.slice(0, 100)}...`
                        )
                      ) : (
                        transactionResult.error
                      )}
                    </div>
                  </div>
                  
                  {/* Attempted Transaction Details */}
                  <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="text-center mb-3">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Attempted to Add</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transactionResult.token0Symbol}/{transactionResult.token1Symbol} Pool
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{transactionResult.token0Symbol}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400">Long:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount0Long || '0')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-red-600 dark:text-red-400">Short:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount0Short || '0')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{transactionResult.token1Symbol}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400">Long:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount1Long || '0')}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-red-600 dark:text-red-400">Short:</span>
                            <span className="font-mono">{formatSafeNumber(transactionResult.amount1Short || '0')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Close Button */}
            <div className="mt-6">
              <button
                onClick={() => {
                  setShowTransactionResult(false)
                  if (transactionResult.success) {
                    handleClose() // Close the main modal on success
                  }
                }}
                className="cursor-pointer w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white font-medium transition-colors cursor-pointer"
              >
                {transactionResult.success ? 'Done' : 'Try Again'}
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
