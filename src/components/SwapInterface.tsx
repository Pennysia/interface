'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronDownIcon, ArrowsUpDownIcon, ExclamationTriangleIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { usePrivy } from '@privy-io/react-auth'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import {
  PennysiaSDK,
  ChainId,
  PENNYSIA_CONSTANTS,
  parseTokenAmount,
  formatTokenAmount,
  calculateMinimumAmount,
  parseContractError
} from '../lib'
// Constants will be imported from lib
import { CURRENT_CHAIN_ID, CURRENT_RPC_URL, isSonicMainnet } from '@/config/chains'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import TokenSelectorModal, { type Token } from './TokenSelectorModal'
import { ROUTER_ABI, MARKET_ABI } from '../lib/abis'
import { useStore } from '../store/useStore'
import { getMarketAddress, getRouterAddress } from '../lib/sdk-utils'
import TransactionLoadingOverlay from './ui/TransactionLoadingOverlay'

interface SwapInterfaceProps {
  className?: string
}

export default function SwapInterface({ className }: SwapInterfaceProps) {
  const { ready, authenticated, login } = usePrivy()
  const { wallets } = useWallets()
  // Bring in store to determine allowed connection status
  // Only treat as connected when store says so (chain enforced elsewhere)
  
  // Enforce app-level connection status from store
  // If user is authenticated on wrong chain, we will not show as connected

  // Get wallet info strictly via store to enforce chain policy
  const storeState = useStore.getState()
  const isConnected = storeState.isConnected
  const address = storeState.address

  // Detect wrong network from Privy wallet chainId (hex string) or number
  const walletChain = wallets && wallets.length > 0 ? (wallets[0] as any).chainId : undefined
  const walletChainId = typeof walletChain === 'number' ? walletChain : (typeof walletChain === 'string' ? parseInt(walletChain, 16) : undefined)
  const isWrongNetwork = authenticated && wallets.length > 0 && walletChainId !== undefined && !isSonicMainnet(walletChainId)

  // State for token selection and amounts
  const [selectedTokenA, setSelectedTokenA] = useState<Token | null>(null)
  const [selectedTokenB, setSelectedTokenB] = useState<Token | null>(null)
  // Track image load failures for token logos to fall back to initials
  const [tokenAImgError, setTokenAImgError] = useState(false)
  const [tokenBImgError, setTokenBImgError] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const [inputAmount, setInputAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState('')
  const [isCalculatingOutput, setIsCalculatingOutput] = useState(false) // When typing in "You Pay"
  const [isCalculatingInput, setIsCalculatingInput] = useState(false)   // When typing in "You Receive"
  const [activeField, setActiveField] = useState<'input' | 'output' | null>(null) // Track which field user is typing in
  const [swapPrice, setSwapPrice] = useState('')
  const [slippage, setSlippage] = useState(PENNYSIA_CONSTANTS.DEFAULT_SLIPPAGE_BPS / 100) // 0.5%
  const [showSettings, setShowSettings] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [showTokenSelectorA, setShowTokenSelectorA] = useState(false)
  const [showTokenSelectorB, setShowTokenSelectorB] = useState(false)
  const [sdk, setSdk] = useState<PennysiaSDK | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTransactionResult, setShowTransactionResult] = useState(false)
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean
    txHash?: string
    error?: string
    amountIn?: string
    amountOut?: string
    tokenInSymbol?: string
    tokenOutSymbol?: string
  } | null>(null)

  // Add a ref to store the timeout ID
  const calculationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track which field is being actively edited to prevent loops
  const isUpdating = useRef({ input: false, output: false })

  // Reset image error flags when tokens change
  useEffect(() => {
    setTokenAImgError(false)
  }, [selectedTokenA?.logoURI, selectedTokenA?.symbol])
  useEffect(() => {
    setTokenBImgError(false)
  }, [selectedTokenB?.logoURI, selectedTokenB?.symbol])

  // Initialize SDK when wallet is connected
  useEffect(() => {
    const initializeSDK = async () => {
      if (!isConnected || !wallets.length) {
        if (sdk) {
          setSdk(null)
        }
        return
      }

      // Avoid re-initializing if SDK already exists and wallet hasn't changed
      if (sdk && wallets[0]?.address === address) {
        return
      }

      try {
        const wallet = wallets[0]
        const provider = await wallet.getEthereumProvider()
        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()

        // Default to Sonic Mainnet
        const chainId = CURRENT_CHAIN_ID
        const rpcUrl = CURRENT_RPC_URL
        const rpcProvider = new ethers.JsonRpcProvider(rpcUrl)

        const sdkInstance = PennysiaSDK.create(chainId, rpcProvider, signer)
        setSdk(sdkInstance)
        setError(null)
      } catch (err: any) {
        console.error('Failed to initialize SDK:', err)
        setError(err.message || 'Failed to initialize SDK')
        setSdk(null)
      }
    }

    initializeSDK()
  }, [isConnected, address, sdk])

  // Auto-refresh quote every 15 seconds
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null

    const shouldRefresh = () => {
      return (
        inputAmount &&
        selectedTokenA &&
        selectedTokenB &&
        Number(inputAmount) > 0 &&
        !isCalculatingOutput &&
        !isSwapping
      )
    }

    const refreshQuote = async () => {
      if (shouldRefresh() && selectedTokenA && selectedTokenB) {
        console.log('🔄 Auto-refreshing swap quote...')
        try {
          setIsCalculatingOutput(true)
          const calculatedOutput = await calculateOutputAmount(inputAmount, selectedTokenA, selectedTokenB)
          setOutputAmount(calculatedOutput)
          console.log('✅ Quote refreshed successfully')
        } catch (error) {
          console.error('❌ Error refreshing quote:', error)
        } finally {
          setIsCalculatingOutput(false)
        }
      }
    }

    // Set up 15-second interval
    if (shouldRefresh()) {
      refreshInterval = setInterval(refreshQuote, 15000) // 15 seconds
    }

    // Cleanup interval
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [inputAmount, selectedTokenA, selectedTokenB, isCalculatingOutput, isSwapping])

  // Handle click outside settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current)
      }
    }
  }, [])

  // Sort tokens to determine token0/token1 (lexicographic order)
  const sortTokens = (tokenA: Token, tokenB: Token): [Token, Token] => {
    return tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
      ? [tokenA, tokenB]
      : [tokenB, tokenA]
  }

  // Get reserves from Market contract
  const getPoolReserves = async (tokenA: Token, tokenB: Token): Promise<{ reserve0: bigint; reserve1: bigint } | null> => {
    const marketAddress = getMarketAddress(CURRENT_CHAIN_ID)
    try {
      // Sort tokens to ensure token0 < token1 (lexicographic order)
      const [token0, token1] = sortTokens(tokenA, tokenB)

      let provider: ethers.Provider
      if (!isConnected || !wallets.length) {
        provider = new ethers.JsonRpcProvider(CURRENT_RPC_URL)
      } else {
        const wallet = wallets[0]
        const ethersProvider = await wallet.getEthereumProvider()
        provider = new ethers.BrowserProvider(ethersProvider)
      }

      if (!marketAddress) {
        console.error("Market address not found for the current chain.");
        return null;
      }

      const marketContract = new ethers.Contract(marketAddress, MARKET_ABI, provider)

      try {
        const [reserve0Long, reserve0Short, reserve1Long, reserve1Short] = await marketContract.getReserves(token0.address, token1.address)
        
        // Debug logging for reserves
        console.log('🔍 RESERVES FETCHED:', {
          token0: token0.symbol,
          token1: token1.symbol,
          reserve0Long: reserve0Long.toString(),
          reserve0Short: reserve0Short.toString(),
          reserve1Long: reserve1Long.toString(),
          reserve1Short: reserve1Short.toString(),
          totalReserve0: (reserve0Long + reserve0Short).toString(),
          totalReserve1: (reserve1Long + reserve1Short).toString()
        })

        // Return actual available liquidity (Long positions only for swaps)
        // Short positions represent borrowed tokens, not available for swaps
        return {
          reserve0: reserve0Long, // Only long positions are available for swaps
          reserve1: reserve1Long  // Only long positions are available for swaps
        }
      } catch (error) {
        console.warn('Failed to fetch reserves:', error)
        return null
      }
    } catch (error) {
      console.error('Error fetching pool reserves:', error)
      return null
    }
  }

  // Calculate output amount using Router's getAmountOut with proper AMM math
  const calculateOutputAmount = async (inputAmountValue: string, tokenIn: Token, tokenOut: Token): Promise<string> => {
    try {
      if (!inputAmountValue || !tokenIn || !tokenOut || Number(inputAmountValue) <= 0) {
        return ''
      }

      // Parse input amount with correct decimals
      const amountIn = ethers.parseUnits(inputAmountValue, tokenIn.decimals)

      // Get provider for Router contract call
      let provider: ethers.Provider
      if (isConnected && wallets.length > 0) {
        const wallet = wallets[0]
        const ethersProvider = await wallet.getEthereumProvider()
        provider = new ethers.BrowserProvider(ethersProvider)
      } else {
        provider = new ethers.JsonRpcProvider(CURRENT_RPC_URL)
      }

      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID)
      if (!routerAddress) {
        console.error('Router address not found')
        return ''
      }

      // Create Router contract instance
      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, provider)

      try {
        // Call Router's getAmountsOut function with path (same as swap execution)
        const path = [tokenIn.address, tokenOut.address]

        // Debug logging for Router call
        console.log('🔍 ROUTER CONTRACT CALL DEBUG:')
        console.log('tokenIn:', tokenIn.symbol, tokenIn.address)
        console.log('tokenOut:', tokenOut.symbol, tokenOut.address)
        console.log('path:', path)
        console.log('amountIn:', amountIn.toString())

        const amounts = await routerContract.getAmountsOut(amountIn, path)
        const amountOut = amounts[1] // Output amount is the second element

        console.log('Router amounts result:', amounts.map((a: any) => a.toString()))
        console.log('Router amountOut:', amountOut.toString())

        return ethers.formatUnits(amountOut, tokenOut.decimals)
      } catch (contractError) {
        console.warn('Router contract call failed, using fallback calculation:', contractError)

        // Fallback: Manual calculation with proper AMM formula including 0.3% fee
        const reserves = await getPoolReserves(tokenIn, tokenOut)
        
        // More accurate liquidity check - allow small reserves but not zero
        if (!reserves || reserves.reserve0 <= 0n || reserves.reserve1 <= 0n) {
          console.warn('🔍 NO_LIQUIDITY detected - reserves too low:', reserves)
          return 'NO_LIQUIDITY'
        }

        // Sort tokens to determine reserve order
        const [token0, token1] = sortTokens(tokenIn, tokenOut)
        const isToken0Input = tokenIn.address.toLowerCase() === token0.address.toLowerCase()

        const reserveIn = isToken0Input ? reserves.reserve0 : reserves.reserve1
        const reserveOut = isToken0Input ? reserves.reserve1 : reserves.reserve0

        // Debug logging
        console.log('🔍 FALLBACK CALCULATION DEBUG:')
        console.log('tokenIn:', tokenIn.symbol, tokenIn.address)
        console.log('tokenOut:', tokenOut.symbol, tokenOut.address)
        console.log('token0 (sorted):', token0.address)
        console.log('token1 (sorted):', token1.address)
        console.log('isToken0Input:', isToken0Input)
        console.log('reserves.reserve0:', reserves.reserve0.toString())
        console.log('reserves.reserve1:', reserves.reserve1.toString())
        console.log('reserveIn (used):', reserveIn.toString())
        console.log('reserveOut (used):', reserveOut.toString())
        console.log('amountIn:', amountIn.toString())

        // Check if input amount is too large relative to reserves
        if (amountIn >= reserveIn) {
          console.warn('🔍 Input amount exceeds available reserves')
          return 'NO_LIQUIDITY'
        }

        // Proper constant product formula with 0.3% fee (Uniswap v2 style)
        // amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
        const amountInWithFee = amountIn * 997n
        const numerator = amountInWithFee * reserveOut
        const denominator = reserveIn * 1000n + amountInWithFee
        const amountOut = numerator / denominator

        console.log('calculated amountOut:', amountOut.toString())

        return ethers.formatUnits(amountOut, tokenOut.decimals)
      }
    } catch (error) {
      console.error('Error calculating output amount:', error)
      return ''
    }
  }

  // Calculate input amount using Router's getAmountIn with proper AMM math
  const calculateInputAmount = async (outputAmountValue: string, tokenIn: Token, tokenOut: Token): Promise<string> => {
    try {
      if (!outputAmountValue || !tokenIn || !tokenOut || Number(outputAmountValue) <= 0) {
        return ''
      }

      // Parse output amount with correct decimals
      const amountOut = ethers.parseUnits(outputAmountValue, tokenOut.decimals)

      // Get provider for Router contract call
      let provider: ethers.Provider
      if (isConnected && wallets.length > 0) {
        const wallet = wallets[0]
        const ethersProvider = await wallet.getEthereumProvider()
        provider = new ethers.BrowserProvider(ethersProvider)
      } else {
        provider = new ethers.JsonRpcProvider(CURRENT_RPC_URL)
      }

      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID)
      if (!routerAddress) {
        console.error('Router address not found')
        return ''
      }

      // Create Router contract instance
      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, provider)

      try {
        // Get reserves first to pass to getAmountIn
        const reserves = await getPoolReserves(tokenIn, tokenOut)
        if (!reserves || reserves.reserve0 === 0n || reserves.reserve1 === 0n) {
          console.warn('No reserves found, using fallback calculation')
          throw new Error('No reserves')
        }

        // Sort tokens to determine reserve order
        const [token0, token1] = sortTokens(tokenIn, tokenOut)

        // Match RouterLibrary.sol logic: (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0)
        const reserveIn = tokenIn.address.toLowerCase() === token0.address.toLowerCase() ? reserves.reserve0 : reserves.reserve1
        const reserveOut = tokenIn.address.toLowerCase() === token0.address.toLowerCase() ? reserves.reserve1 : reserves.reserve0

        // Call Router's getAmountIn function with correct reserve amounts
        const amountIn = await routerContract.getAmountIn(
          amountOut,
          reserveIn,    // ✅ FIXED: Use reserve amounts
          reserveOut    // ✅ FIXED: Use reserve amounts
        )

        return ethers.formatUnits(amountIn, tokenIn.decimals)
      } catch (contractError) {
        console.warn('Router contract call failed, using fallback calculation:', contractError)

        // Fallback: Manual calculation with proper AMM formula including 0.3% fee
        const reserves = await getPoolReserves(tokenIn, tokenOut)
        
        // More accurate liquidity check - allow small reserves but not zero
        if (!reserves || reserves.reserve0 <= 0n || reserves.reserve1 <= 0n) {
          console.warn('🔍 NO_LIQUIDITY detected - reserves too low:', reserves)
          return 'NO_LIQUIDITY'
        }

        // Sort tokens to determine reserve order
        const [token0, token1] = sortTokens(tokenIn, tokenOut)
        const isToken0Input = tokenIn.address.toLowerCase() === token0.address.toLowerCase()

        const reserveIn = isToken0Input ? reserves.reserve0 : reserves.reserve1
        const reserveOut = isToken0Input ? reserves.reserve1 : reserves.reserve0

        // Reverse calculation with proper fee handling
        // Check if requested output exceeds available reserves
        if (amountOut >= reserveOut) {
          console.error('🔍 Requested output amount exceeds available reserves')
          return 'NO_LIQUIDITY'
        }

        // Proper constant product formula with 0.3% fee (Uniswap v2 style)
        // amountIn = (amountOut * reserveIn * 1000) / ((reserveOut - amountOut) * 997)
        const numerator = amountOut * reserveIn * 1000n
        const denominator = (reserveOut - amountOut) * 997n
        const amountIn = numerator / denominator

        return ethers.formatUnits(amountIn, tokenIn.decimals)
      }
    } catch (error) {
      console.error('Error calculating input amount:', error)
      return ''
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowTokenSelectorA(false)
      setShowTokenSelectorB(false)
    }

    if (showTokenSelectorA || showTokenSelectorB) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showTokenSelectorA, showTokenSelectorB])

  // Note: Scroll locking is now handled by TokenSelectorModal component

  // Handle input amount changes and calculate output
  const handleInputAmountChange = async (value: string) => {
    if (isUpdating.current.input) return // Prevent re-entry

    console.log('📝 User input amount change:', { value, source: 'direct_user_input' })
    setInputAmount(value)
    setActiveField('input')

    if (!value || !selectedTokenA || !selectedTokenB || Number(value) <= 0) {
      setOutputAmount('')
      setSwapPrice('')
      setIsCalculatingOutput(false)
      setActiveField(null)
      return
    }

    try {
      isUpdating.current.input = true
      setIsCalculatingOutput(true)
      const calculatedOutput = await calculateOutputAmount(value, selectedTokenA, selectedTokenB)
      if (!isUpdating.current.output) { // Only update if output isn't being actively edited
        console.log('📊 Auto-updating output amount from input calculation:', {
          inputValue: value,
          calculatedOutput,
          note: 'This should not trigger input recalculation'
        })
        setOutputAmount(calculatedOutput)
      }
    } catch (error) {
      console.error('Error calculating output amount:', error)
    } finally {
      setIsCalculatingOutput(false)
      isUpdating.current.input = false
      setActiveField(null)
    }
  }

  // Handle output amount changes and calculate input
  const handleOutputAmountChange = (value: string) => {
    if (isUpdating.current.output) return // Prevent re-entry

    console.log('📝 User output amount change:', { value, source: 'direct_user_input' })
    setOutputAmount(value)
    setActiveField('output')

    if (!value || !selectedTokenA || !selectedTokenB || Number(value) <= 0) {
      setInputAmount('')
      setSwapPrice('')
      setIsCalculatingInput(false)
      setActiveField(null)
      return
    }

    // User is actively editing output field - proceed with calculation
    console.log('🔄 User typing in output field - calculating required input amount')

    // Debounce the calculation to avoid interfering with typing
    setIsCalculatingInput(true)

    // Clear any existing timeout
    if (calculationTimeoutRef.current) {
      clearTimeout(calculationTimeoutRef.current)
    }

    // Set a new timeout for calculation
    calculationTimeoutRef.current = setTimeout(async () => {
      try {
        isUpdating.current.output = true
        const calculatedInput = await calculateInputAmount(value, selectedTokenA, selectedTokenB)
        // Update input amount since user is editing output field
        if (!isUpdating.current.input) {
          console.log('🔄 Auto-updating input amount from output calculation:', { 
            originalInput: inputAmount,
            calculatedInput,
            outputValue: value,
            note: 'User typed in output field, calculating required input'
          })
          setInputAmount(calculatedInput)
          // Update the swap price when output changes
          if (calculatedInput && value) {
            setSwapPrice(calculateSwapPrice(calculatedInput, value))
          }
        }
      } catch (error) {
        console.error('Error calculating input amount:', error)
        setInputAmount('')
        setSwapPrice('')
      } finally {
        setIsCalculatingInput(false)
        isUpdating.current.output = false
        setActiveField(null)
      }
    }, 500) // 500ms delay
  }

  // Handle token switching
  const handleSwitchTokens = () => {
    if (!selectedTokenA || !selectedTokenB) return

    // Store the current values
    const oldInput = inputAmount
    const oldOutput = outputAmount

    // Switch tokens
    setSelectedTokenA(selectedTokenB)
    setSelectedTokenB(selectedTokenA)

    // Swap the input and output amounts
    setInputAmount(oldOutput)
    setOutputAmount(oldInput)

    // Force a recalculation by setting the active field to 'input'
    setActiveField('input')

    // If there was an input amount, trigger a recalculation
    if (oldOutput) {
      handleInputAmountChange(oldOutput)
    }
  }

  // Calculate output amount when input changes or tokens are switched
  useEffect(() => {
    // Only calculate output if input is being edited or tokens have changed
    if (activeField !== 'input') {
      return
    }

    if (!inputAmount || !selectedTokenA || !selectedTokenB) {
      setOutputAmount('')
      setSwapPrice('')
      return
    }

    let isMounted = true

    const calculateOutput = async () => {
      try {
        setIsCalculatingOutput(true)
        const calculatedOutput = await calculateOutputAmount(inputAmount, selectedTokenA, selectedTokenB)
        if (isMounted) {
          setOutputAmount(calculatedOutput)
          // Calculate and set the average swap price
          setSwapPrice(calculateSwapPrice(inputAmount, calculatedOutput))
        }
      } catch (error: any) {
        console.error('Error calculating output:', error)
        // Fallback to mock calculation if contract call fails
        try {
          const inputAmountWei = parseTokenAmount(inputAmount, selectedTokenA.decimals)
          const mockOutputWei = (BigInt(inputAmountWei) * BigInt(95) / BigInt(100)).toString()
          const formattedOutput = formatTokenAmount(mockOutputWei, selectedTokenB.decimals)
          if (isMounted) {
            setOutputAmount(formattedOutput)
            setSwapPrice(calculateSwapPrice(inputAmount, formattedOutput))
          }
        } catch {
          if (isMounted) {
            setOutputAmount('')
            setSwapPrice('')
          }
        }
      } finally {
        if (isMounted) {
          setIsCalculatingOutput(false)
        }
      }
    }

    // Clear any existing timeout to prevent multiple executions
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(calculateOutput, 100) // Debounce 300ms

    return () => {
      isMounted = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [inputAmount, selectedTokenA, selectedTokenB, sdk])

  const handleSwap = async () => {
    if (!isConnected || !selectedTokenA || !selectedTokenB || !inputAmount || !outputAmount) {
      toast.error('Please connect wallet and enter amounts')
      return
    }

    try {
      setIsSwapping(true)

      // Get provider and signer
      const wallet = wallets[0]
      const provider = await wallet.getEthereumProvider()
      const ethersProvider = new ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()

      const marketAddress = getMarketAddress(CURRENT_CHAIN_ID)
      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID)

      if (!marketAddress || !routerAddress) {
        toast.error('Market or Router address not found for the current chain.')
        setIsSwapping(false)
        return
      }

      // Create Router contract instance with signer
      const routerContract = new ethers.Contract(
        routerAddress,
        ROUTER_ABI,
        signer
      )

      // Safe parseUnits wrapper to handle decimal precision errors
      const safeParseUnits = (value: string, decimals: number): bigint => {
        try {
          if (!value || value === '0') return 0n
          
          // Limit decimal places to prevent ethers.js underflow errors
          const parts = value.split('.')
          let safeValue = value
          
          if (parts.length > 1 && parts[1].length > 18) {
            // Truncate to 18 decimal places maximum
            safeValue = parts[0] + '.' + parts[1].substring(0, 18).replace(/0+$/, '')
            console.log(`⚠️ Truncated swap value from ${value} to ${safeValue} to prevent ethers.js underflow`)
          }
          
          return ethers.parseUnits(safeValue, decimals)
        } catch (error) {
          console.error('Error in safeParseUnits (swap):', error, 'Value:', value, 'Decimals:', decimals)
          return 0n
        }
      }

      // Parse input amount - try both safe and standard parsing for debugging
      const inputAmountWei = safeParseUnits(inputAmount, selectedTokenA.decimals)
      let standardParseWei = 0n
      try {
        standardParseWei = ethers.parseUnits(inputAmount, selectedTokenA.decimals)
      } catch (standardError) {
        console.warn('Standard parseUnits failed:', standardError)
      }
      
      // Validate amount parsing for debugging
      console.log('🔍 Amount parsing comparison:', {
        inputAmount,
        tokenADecimals: selectedTokenA.decimals,
        safeParseResult: inputAmountWei.toString(),
        standardParseResult: standardParseWei.toString(),
        safeBackToString: ethers.formatUnits(inputAmountWei, selectedTokenA.decimals),
        standardBackToString: standardParseWei > 0n ? ethers.formatUnits(standardParseWei, selectedTokenA.decimals) : 'failed',
        resultsMatch: inputAmountWei === standardParseWei,
        recommendedUse: inputAmountWei === standardParseWei ? 'Either' : 'Check which is correct'
      })
      
      // Use standard parsing if both match, otherwise use safe parsing
      const finalInputAmountWei = (inputAmountWei === standardParseWei && standardParseWei > 0n) ? standardParseWei : inputAmountWei

      // Create swap path - contract uses address(0) for native tokens
      const path = [selectedTokenA.address, selectedTokenB.address]

      // Validate path addresses
      console.log('🔍 Validating swap path:', {
        tokenA: selectedTokenA.address,
        tokenB: selectedTokenB.address,
        isTokenANative: selectedTokenA.address === ethers.ZeroAddress,
        isTokenBNative: selectedTokenB.address === ethers.ZeroAddress,
        path,
        note: 'Contract uses address(0) for native tokens'
      })

      // Validate that tokens are different
      if (selectedTokenA.address === selectedTokenB.address) {
        throw new Error('Cannot swap the same token')
      }

      // Use the UI's outputAmount which is now calculated correctly using getAmountsOut
      console.log('🔄 Using UI calculated output amount (now correct)...')
      const expectedOutputWei = safeParseUnits(outputAmount, selectedTokenB.decimals)

      console.log(' Expected output from UI:', {
        outputAmount,
        expectedOutputWei: expectedOutputWei.toString(),
        formatted: ethers.formatUnits(expectedOutputWei, selectedTokenB.decimals)
      })

      // Apply user's slippage tolerance setting
      const effectiveSlippage = slippage // Use user's slippage setting directly
      const slippageBps = Math.floor(effectiveSlippage * 100) // Convert to basis points
      const minOutputAmount = expectedOutputWei * BigInt(10000 - slippageBps) / BigInt(10000)

      console.log('💱 Swap calculation details:', {
        inputAmount,
        expectedOutput: ethers.formatUnits(expectedOutputWei, selectedTokenB.decimals),
        requestedSlippage: `${slippage}%`,
        effectiveSlippage: `${effectiveSlippage}%`,
        slippageBps,
        inputAmountWei: inputAmountWei.toString(),
        expectedOutputWei: expectedOutputWei.toString(),
        minOutputAmount: minOutputAmount.toString(),
        minOutputAmountFormatted: ethers.formatUnits(minOutputAmount, selectedTokenB.decimals),
        note: `Using ${effectiveSlippage}% slippage to account for Market vs getAmountsOut discrepancy`
      })

      // Calculate deadline (15 minutes from now)
      const deadline = Math.floor(Date.now() / 1000) + PENNYSIA_CONSTANTS.DEFAULT_DEADLINE_SECONDS

      // Declare swap transaction variable
      let swapTx: any

      // Check if we need to approve tokens first (skip for native tokens)
      if (selectedTokenA.address !== ethers.ZeroAddress && selectedTokenA.address !== '0x0000000000000000000000000000000000000000') {
        const tokenContract = new ethers.Contract(
          selectedTokenA.address,
          ['function allowance(address owner, address spender) view returns (uint256)', 'function approve(address spender, uint256 amount) returns (bool)'],
          signer
        )

        const currentAllowance = await tokenContract.allowance(address, routerAddress)

        // Approve if needed
        if (BigInt(currentAllowance) < BigInt(inputAmountWei)) {
          const approveTx = await tokenContract.approve(routerAddress, inputAmountWei)
          await approveTx.wait()
        }
      } else {
        console.log('✅ Native token detected in swap, skipping approval')
      }

      // First, simulate the swap to see what the market would actually return
      let actualMarketOutput;
      try {
        // Calculate native token value for simulation
        let simulationValue = 0n
        if (selectedTokenA.address === ethers.ZeroAddress || selectedTokenA.address === '0x0000000000000000000000000000000000000000') {
          simulationValue = finalInputAmountWei
        }

        console.log('🧪 SIMULATION CALL with value:', {
          inputAmountWei: inputAmountWei.toString(),
          finalInputAmountWei: finalInputAmountWei.toString(),
          simulationValue: simulationValue.toString(),
          isNativeToken: selectedTokenA.address === ethers.ZeroAddress,
          note: 'staticCall must include value parameter for native token swaps'
        })

        // Use callStatic to simulate the swap without executing it
        actualMarketOutput = await routerContract.swap.staticCall(
          inputAmountWei,
          '1', // Use 1 wei as minimum to see actual output
          path,
          address,
          deadline,
          { value: simulationValue } // ✅ Include value parameter for native token simulation
        );
        console.log('🔍 Actual market simulation result:', {
          inputWei: inputAmountWei,
          actualMarketOutputWei: actualMarketOutput.toString(),
          actualMarketOutputFormatted: ethers.formatUnits(actualMarketOutput, selectedTokenB.decimals),
          getAmountsOutPrediction: outputAmount,
          difference: ((BigInt(actualMarketOutput) - BigInt(expectedOutputWei)) * 100n / BigInt(expectedOutputWei)).toString() + '%'
        });

        // Use the actual market output with user's slippage setting
        const slippageMultiplier = BigInt(Math.floor((100 - effectiveSlippage) * 100)) // Convert to basis points
        const actualMinOutput = (BigInt(actualMarketOutput) * slippageMultiplier) / 10000n;
        console.log('📊 Using actual market output for slippage:', {
          actualMarketOutput: actualMarketOutput.toString(),
          userSlippage: `${effectiveSlippage}%`,
          slippageMultiplier: slippageMultiplier.toString(),
          finalMinOutput: actualMinOutput.toString(),
          finalMinOutputFormatted: ethers.formatUnits(actualMinOutput, selectedTokenB.decimals)
        });

        // Calculate native token value to send with transaction
        let nativeTokenValue = 0n
        if (selectedTokenA.address === ethers.ZeroAddress || selectedTokenA.address === '0x0000000000000000000000000000000000000000') {
          nativeTokenValue = finalInputAmountWei // Use the validated amount
        }

        console.log('🚀 Executing swap after simulation with parameters:', {
          inputAmount: inputAmount,
          finalInputAmountWei: finalInputAmountWei.toString(),
          actualMinOutput: actualMinOutput.toString(),
          path,
          address,
          deadline,
          isNativeSwap: selectedTokenA.address === ethers.ZeroAddress,
          nativeTokenValue: nativeTokenValue.toString(),
          nativeTokenValueFormatted: ethers.formatEther(nativeTokenValue),
          mustMatch: 'nativeTokenValue must equal finalInputAmountWei for native swaps',
          valuesMatch: nativeTokenValue === finalInputAmountWei,
          nativeTokenValueType: typeof nativeTokenValue,
          finalInputAmountWeiType: typeof finalInputAmountWei,
          gasLimit: '300000'
        })
        
        // Additional validation
        if (selectedTokenA.address === ethers.ZeroAddress) {
          console.log('🔍 CRITICAL: Native token swap validation:', {
            contractFunction: 'swap(uint256 amountIn, uint256 amountOutMinimum, address[] path, address to, uint256 deadline)',
            parameterAmountIn: finalInputAmountWei.toString(),
            transactionMsgValue: nativeTokenValue.toString(),
            MUST_BE_EQUAL: 'These two values must be exactly equal for native swaps',
            equalityCheck: finalInputAmountWei === nativeTokenValue,
            difference: finalInputAmountWei > nativeTokenValue ? 
              `amountIn is ${finalInputAmountWei - nativeTokenValue} wei larger` :
              nativeTokenValue > finalInputAmountWei ? 
                `msg.value is ${nativeTokenValue - finalInputAmountWei} wei larger` : 
                'PERFECT MATCH'
          })
        }

        // Execute swap with the corrected minimum output and higher gas limit
        const transactionParams = {
          value: nativeTokenValue, // ✅ Include native token value for ETH/S swaps
          gasLimit: 300000 // Increase gas limit to prevent out-of-gas reverts
        }
        
        console.log('📡 FINAL TRANSACTION CALL:', {
          contractMethod: 'routerContract.swap',
          parameters: {
            amountIn: finalInputAmountWei.toString(),
            amountOutMinimum: actualMinOutput.toString(),
            path: path,
            to: address,
            deadline: deadline
          },
          transactionOptions: {
            value: transactionParams.value.toString(),
            gasLimit: transactionParams.gasLimit,
            valueInEther: ethers.formatEther(transactionParams.value)
          },
          criticalCheck: `msg.value (${transactionParams.value.toString()}) MUST equal amountIn (${finalInputAmountWei.toString()})`
        })
        
        swapTx = await routerContract.swap(
          finalInputAmountWei,
          actualMinOutput.toString(),
          path,
          address,
          deadline,
          transactionParams
        );
      } catch (simulationError) {
        console.error('❌ Swap simulation failed:', simulationError);
        const errorMessage = simulationError instanceof Error ? simulationError.message : String(simulationError);
        throw new Error(`Swap simulation failed: ${errorMessage}`);
      }

      // Fallback: If simulation didn't return output, use original calculation
      if (!actualMarketOutput) {
        // Calculate native token value to send with transaction  
        let nativeTokenValue = 0n
        if (selectedTokenA.address === ethers.ZeroAddress || selectedTokenA.address === '0x0000000000000000000000000000000000000000') {
          nativeTokenValue = finalInputAmountWei // Use the validated amount
        }

        console.log('🚀 Executing swap (fallback path) with parameters:', {
          inputAmount: inputAmount,
          finalInputAmountWei: finalInputAmountWei.toString(),
          minOutputAmount: minOutputAmount.toString(),
          path,
          address,
          deadline,
          isNativeSwap: selectedTokenA.address === ethers.ZeroAddress,
          nativeTokenValue: nativeTokenValue.toString(),
          nativeTokenValueFormatted: ethers.formatEther(nativeTokenValue),
          mustMatch: 'nativeTokenValue must equal finalInputAmountWei for native swaps',
          valuesMatch: nativeTokenValue === finalInputAmountWei,
          gasLimit: '500000'
        })
        
        // Additional validation for fallback path
        if (selectedTokenA.address === ethers.ZeroAddress) {
          console.log('🔍 CRITICAL: Native token swap validation (FALLBACK):', {
            contractFunction: 'swap(uint256 amountIn, uint256 amountOutMinimum, address[] path, address to, uint256 deadline)',
            parameterAmountIn: finalInputAmountWei.toString(),
            transactionMsgValue: nativeTokenValue.toString(),
            MUST_BE_EQUAL: 'These two values must be exactly equal for native swaps',
            equalityCheck: finalInputAmountWei === nativeTokenValue,
            difference: finalInputAmountWei > nativeTokenValue ? 
              `amountIn is ${finalInputAmountWei - nativeTokenValue} wei larger` :
              nativeTokenValue > finalInputAmountWei ? 
                `msg.value is ${nativeTokenValue - finalInputAmountWei} wei larger` : 
                'PERFECT MATCH'
          })
        }

        try {
          const fallbackTransactionParams = { 
            value: nativeTokenValue, // Send native token value if needed
            gasLimit: 500000 // Increase gas limit to prevent out-of-gas
          }
          
          console.log('📡 FINAL TRANSACTION CALL (FALLBACK):', {
            contractMethod: 'routerContract.swap',
            parameters: {
              amountIn: finalInputAmountWei.toString(),
              amountOutMinimum: minOutputAmount.toString(),
              path: path,
              to: address,
              deadline: deadline
            },
            transactionOptions: {
              value: fallbackTransactionParams.value.toString(),
              gasLimit: fallbackTransactionParams.gasLimit,
              valueInEther: ethers.formatEther(fallbackTransactionParams.value)
            },
            criticalCheck: `msg.value (${fallbackTransactionParams.value.toString()}) MUST equal amountIn (${finalInputAmountWei.toString()})`
          })
          
          swapTx = await routerContract.swap(
            finalInputAmountWei,
            minOutputAmount,
            path,
            address,
            deadline,
            fallbackTransactionParams
          )
        } catch (contractError: any) {
          console.error('❌ Contract execution error:', contractError)
          
          // Try to decode the error
          let errorMessage = 'Unknown contract error'
          if (contractError?.data) {
            console.log('Error data:', contractError.data)
            // Check for known error selectors
            if (contractError.data === '0x3e032a3b') {
              errorMessage = 'Slippage tolerance exceeded - try increasing slippage or reducing amount'
            } else if (contractError.data === '0x8679b0c0') {
              errorMessage = 'Forbidden - insufficient permissions or invalid operation'
            } else if (contractError.data === '0xa04eeb03') {
              errorMessage = 'Pair not found - this trading pair may not exist'
            } else if (contractError.data === '0x009e2872') {
              errorMessage = 'Invalid path - check token addresses'
            } else if (contractError.data === '0xc24d2823') {
              errorMessage = 'Custom contract error (0xc24d2823) - possible insufficient liquidity or invalid parameters'
            }
          }
          
          throw new Error(`Swap failed: ${errorMessage}. Original error: ${contractError?.message || contractError}`)
        }
      }

      // Wait for transaction confirmation
      const receipt = await swapTx.wait()

      if (receipt.status === 1) {
        // Get the actual amount received from the swap transaction
        let actualAmountOut = outputAmount;

        try {
          // Create interface using the actual Market ABI
          const marketInterface = new ethers.Interface(MARKET_ABI);

          // Parse all logs to find the Swap event from Market contract
          for (const log of receipt.logs || []) {
            try {
              const parsed = marketInterface.parseLog(log);
              if (parsed && parsed.name === 'Swap') {
                // Verify this is the correct swap event for our token pair
                const tokenOutAddress = parsed.args.tokenOut;
                if (tokenOutAddress && tokenOutAddress.toLowerCase() === selectedTokenB.address.toLowerCase()) {
                  const amountOutBN = parsed.args.amountOut;
                  actualAmountOut = ethers.formatUnits(amountOutBN, selectedTokenB.decimals);
                  break;
                }
              }
            } catch {
              // Continue to next log if parsing fails
            }
          }
        } catch (error) {
          console.warn('Could not extract actual swap amount from transaction:', error);
        }

        // Show success result with actual received amount
        setTransactionResult({
          success: true,
          txHash: receipt.hash,
          amountIn: inputAmount,
          amountOut: actualAmountOut,
          tokenInSymbol: selectedTokenA.symbol,
          tokenOutSymbol: selectedTokenB.symbol
        })
        setShowTransactionResult(true)

        // Clear form
        setInputAmount('')
        setOutputAmount('')
        setSwapPrice('')
      } else {
        throw new Error('Transaction failed')
      }

    } catch (error: any) {
      console.error('Swap error:', error)

      // Show error result
      setTransactionResult({
        success: false,
        error: error.message || 'Transaction failed',
        amountIn: inputAmount,
        amountOut: outputAmount,
        tokenInSymbol: selectedTokenA.symbol,
        tokenOutSymbol: selectedTokenB.symbol
      })
      setShowTransactionResult(true)
    } finally {
      setIsSwapping(false)
    }
  }

  const handleTokenASelection = (token: Token | null) => {
    if (!token) {
      setSelectedTokenA(null)
      setShowTokenSelectorA(false)
      return
    }

    if (selectedTokenB && token.address === selectedTokenB.address) {
      toast.error('Cannot select the same token for both positions')
      return
    }

    // Create a new token object with the balance from the selected token
    const tokenWithBalance = {
      ...token,
      balance: token.balance || '0.00'
    }

    setSelectedTokenA(tokenWithBalance)
    setShowTokenSelectorA(false)
  }

  const handleTokenBSelection = (token: Token | null) => {
    if (!token) {
      setSelectedTokenB(null)
      setShowTokenSelectorB(false)
      return
    }

    if (selectedTokenA && token.address === selectedTokenA.address) {
      toast.error('Cannot select the same token for both positions')
      return
    }

    // Create a new token object with the balance from the selected token
    const tokenWithBalance = {
      ...token,
      balance: token.balance || '0.00'
    }

    setSelectedTokenB(tokenWithBalance)
    setShowTokenSelectorB(false)
  }

  const handleTokenSelectorAClick = () => {
    setShowTokenSelectorA(true)
  }

  const handleTokenSelectorBClick = () => {
    setShowTokenSelectorB(true)
  }

  const handleFlipTokens = () => {
    // Swap token positions
    const tempTokenA = selectedTokenA
    const tempAmount = outputAmount
    setSelectedTokenA(selectedTokenB)
    setSelectedTokenB(tempTokenA)
    setInputAmount(tempAmount)
    setOutputAmount('')
  }

  // Calculate average swap price (output/input)
  const calculateSwapPrice = (input: string, output: string): string => {
    if (!input || !output || parseFloat(input) === 0) return ''
    const price = parseFloat(output) / parseFloat(input)
    return price.toFixed(6)
  }

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div className={clsx('relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-4 w-full max-w-md mx-auto', className)}>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={clsx('relative dark:bg-[var(--background)] backdrop-blur-sm rounded-2xl border border-gray-800 p-4 w-full max-w-md mx-auto', className)}>
        {/* Header with Settings */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Swap</h3>
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              aria-label="Settings"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            
            {/* Settings Dropdown */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Transaction Settings</h4>
                  
                  {/* Slippage Tolerance */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600 dark:text-gray-400">Slippage Tolerance</label>
                    <div className="flex items-center space-x-2">
                      {/* Preset buttons */}
                      <div className="flex space-x-1">
                        {[0.1, 0.5, 1.0].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setSlippage(preset)}
                            className={clsx(
                              'px-2 py-1 text-xs rounded transition-colors cursor-pointer',
                              slippage === preset
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            )}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                      
                      {/* Custom input */}
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={slippage}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value)
                            if (!isNaN(value) && value >= 0 && value <= 50) {
                              setSlippage(value)
                            }
                          }}
                          className="w-16 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder="0.5"
                          min="0"
                          max="50"
                          step="0.1"
                        />
                        <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">%</span>
                      </div>
                    </div>
                    
                    {/* Slippage warning */}
                    {slippage > 5 && (
                      <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span>High slippage tolerance</span>
                      </div>
                    )}
                    {slippage < 0.1 && (
                      <div className="flex items-center space-x-1 text-xs text-amber-600 dark:text-amber-400">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span>Very low slippage may cause transaction failures</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Input Token */}
        <div className="space-y-2 mb-2">
          <div className="relative bg-gray-200/50 dark:bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">You pay</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  Balance: {selectedTokenA ? (selectedTokenA.balance || '0.00') : '0.00'}
                </span>
                {selectedTokenA?.balance && parseFloat(selectedTokenA.balance) > 0 && (
                  <button
                    onClick={() => {
                      const maxAmount = selectedTokenA.balance || '0';
                      setInputAmount(maxAmount);
                      handleInputAmountChange(maxAmount);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300"
                    disabled={isSwapping || isCalculatingInput || isCalculatingOutput}
                  >
                    Max
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                inputMode="decimal"
                value={isCalculatingInput && activeField !== 'input' ? 'Calculating...' : inputAmount}
                onChange={(e) => {
                  const value = e.target.value
                  // Only allow numbers, decimal point, and prevent negative values
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleInputAmountChange(value)
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent 'e', 'E', '+', '-' keys
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                placeholder="0.0"
                className="flex-1 bg-transparent text-xl sm:text-2xl font-semibold placeholder-gray-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
              />
              <div className="flex-shrink-0">
                <button
                  onClick={handleTokenSelectorAClick}
                  className="cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg transition-colors bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 w-[120px]"
                >
                  <div className="flex items-center space-x-2">
                    {selectedTokenA ? (
                      <>
                        {selectedTokenA.logoURI && !tokenAImgError ? (
                          <Image
                            src={selectedTokenA.logoURI}
                            alt={selectedTokenA.symbol}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                            onError={() => setTokenAImgError(true)}
                          />
                        ) : null}
                        <div
                          className={`w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs ${selectedTokenA.logoURI && !tokenAImgError ? 'hidden' : 'flex'
                            }`}
                        >
                          {selectedTokenA.symbol[0]}
                        </div>
                        <span className="font-semibold text-sm">{selectedTokenA.symbol}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 font-normal text-xs">Select Token</span>
                    )}
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Switch tokens button */}
          <button
            onClick={handleSwitchTokens}
            className="cursor-pointer border border-white dark:border-gray-600 absolute left-1/2 -translate-x-1/2 -translate-y-2/3 z-10 p-2 rounded-xl dark:bg-[var(--background)] bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowsUpDownIcon className="h-5 w-5 text-gray-500" />
          </button>

          {/* Output Token */}
          <div className="relative bg-gray-200/50 dark:bg-gray-800/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">You receive</span>
              <span className="text-sm text-gray-400">
                Balance: {selectedTokenB ? (selectedTokenB.balance || '0.00') : '0.00'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                inputMode="decimal"
                value={isCalculatingOutput && activeField !== 'output' ? 'Calculating...' : outputAmount === 'NO_LIQUIDITY' ? 'No liquidity available' : outputAmount}
                onChange={(e) => {
                  const value = e.target.value
                  // Only allow numbers, decimal point, and prevent negative values
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleOutputAmountChange(value)
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent 'e', 'E', '+', '-' keys
                  if (['e', 'E', '+', '-'].includes(e.key)) {
                    e.preventDefault()
                  }
                }}
                placeholder="0.0"
                className="flex-1 bg-transparent text-xl sm:text-2xl font-semibold placeholder-gray-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0"
                disabled={isCalculatingOutput}
              />
              <div className="flex-shrink-0">
                <button
                  onClick={handleTokenSelectorBClick}
                  className="cursor-pointer flex items-center justify-between px-3 py-2 rounded-lg transition-colors bg-white dark:bg-gray-800  hover:bg-gray-300 dark:hover:bg-gray-600 w-[120px]"
                >
                  <div className="flex items-center space-x-2">
                    {selectedTokenB ? (
                      <>
                        {selectedTokenB.logoURI && !tokenBImgError ? (
                          <Image
                            src={selectedTokenB.logoURI}
                            alt={selectedTokenB.symbol}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                            onError={() => setTokenBImgError(true)}
                          />
                        ) : null}
                        <div
                          className={`w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs ${selectedTokenB.logoURI && !tokenBImgError ? 'hidden' : 'flex'
                            }`}
                        >
                          {selectedTokenB.symbol[0]}
                        </div>
                        <span className="font-semibold text-sm">{selectedTokenB.symbol}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 font-normal text-xs">Select Token</span>
                    )}
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-800 dark:text-gray-400" />
                </button>
              </div>
            </div>


          </div>
        </div>

        {/* Price Impact Warning */}
        {swapPrice && (
          <div className=" p-3 rounded-lg space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-light text-xs">Average Price:</span>
              <span className="text-gray-900 dark:text-gray-200 font-light text-xs">
                1 {selectedTokenA?.symbol} = {swapPrice} {selectedTokenB?.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-light text-xs">Inverse Price:</span>
              <span className="text-gray-900 dark:text-gray-200 font-light text-xs">
                1 {selectedTokenB?.symbol} = {(1 / parseFloat(swapPrice) || 0).toFixed(6)} {selectedTokenA?.symbol}
              </span>
            </div>
          </div>
        )}

        {/* No Liquidity Warning */}
        {selectedTokenA && selectedTokenB && outputAmount === 'NO_LIQUIDITY' && (
          <div className="bg-[var(--background)] dark:bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center space-x-3 my-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-400 font-medium text-sm">No Liquidity Available</p>
              <p className="text-yellow-300/80 text-xs mt-1">
                There is no liquidity pool for {selectedTokenA.symbol}/{selectedTokenB.symbol}.
                Consider adding liquidity first or try a different token pair.
              </p>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <button
          onClick={!isConnected ? login : handleSwap}
          disabled={isWrongNetwork || (isConnected && (!inputAmount || !outputAmount || outputAmount === 'NO_LIQUIDITY' || isSwapping || isCalculatingInput || isCalculatingOutput))}
          className={clsx(
            'w-full py-3 px-4 rounded-xl text-white font-medium transition-all',
            'focus:outline-none focus:ring-opacity-50',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700 disabled:hover:text-white disabled:hover:border-gray-600',
            'flex items-center justify-center space-x-2',
            'border-2',
            !isConnected
              ? 'border-transparent bg-blue-500 hover:bg-blue-600'
              : !inputAmount || !outputAmount || outputAmount === 'NO_LIQUIDITY' || isSwapping
                ? 'border-gray-600 bg-gray-700 cursor-not-allowed'
                : 'border-purple-500 bg-purple-500 hover:bg-purple-500/20 hover:text-purple-500 focus:ring-2 focus:ring-purple-500'
          )}
        >
          {isWrongNetwork
            ? 'Wrong Network'
            : (!isConnected
            ? 'Connect Wallet'
            : isSwapping
              ? 'Swapping...'
              : (isCalculatingOutput || isCalculatingInput)
                ? 'Calculating...'
                : 'Swap')}
        </button>
      </div>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        isOpen={showTokenSelectorA}
        onClose={() => setShowTokenSelectorA(false)}
        onTokenSelect={handleTokenASelection}
        title="Select a token to pay"
        excludeToken={selectedTokenB}
      />

      <TokenSelectorModal
        isOpen={showTokenSelectorB}
        onClose={() => setShowTokenSelectorB(false)}
        onTokenSelect={handleTokenBSelection}
        title="Select a token to receive"
        excludeToken={selectedTokenA}
      />

      {/* Transaction Loading Overlay */}
      <TransactionLoadingOverlay
        isVisible={isSwapping}
        title="Processing Swap..."
        subtitle="Please confirm the transaction in your wallet"
      />

      {/* Transaction Result Modal */}
      {showTransactionResult && transactionResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm sm:max-w-md max-h-full flex flex-col">
            {/* Scrollable Content Container */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {transactionResult.success ? 'Swap Successful!' : 'Swap Failed'}
                </h3>
                <button
                  onClick={() => setShowTransactionResult(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
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
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">You Paid:</span>
                        <span className="text-white font-medium">
                          {transactionResult.amountIn} {transactionResult.tokenInSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">You Received:</span>
                        <span className="text-white font-medium">
                          {transactionResult.amountOut} {transactionResult.tokenOutSymbol}
                        </span>
                      </div>
                      {transactionResult.txHash && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Transaction:</span>
                          <a
                            href={`https://testnet.sonicscan.org/tx/${transactionResult.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                          >
                            {transactionResult.txHash.slice(0, 6)}...{transactionResult.txHash.slice(-4)}
                          </a>
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
                      <p className="text-red-400 text-sm mb-2">Error:</p>
                      <p className="text-white text-sm break-words">{transactionResult.error}</p>
                    </div>

                    {/* Attempted Transaction Details */}
                    <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Attempted to Pay:</span>
                        <span className="text-white font-medium">
                          {transactionResult.amountIn} {transactionResult.tokenInSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expected to Receive:</span>
                        <span className="text-white font-medium">
                          {transactionResult.amountOut} {transactionResult.tokenOutSymbol}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Fixed Close Button */}
            <div className="border-t border-gray-700 p-4">
              <button
                onClick={() => setShowTransactionResult(false)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
