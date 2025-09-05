'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { ChainId, getMarketAddress, getRouterAddress } from '../../../lib'
import { MARKET_ABI, ROUTER_ABI, ERC20_ABI, LIQUIDITY_ABI } from '../../../lib/abis'
import { CURRENT_CHAIN_ID } from '@/config/chains'
import { useStore } from '../../../store/useStore'

// Use proper ABIs from lib directory

export interface LiquidityPosition {
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
  // Pool reserves (total)
  reserve0Long: string
  reserve0Short: string
  reserve1Long: string
  reserve1Short: string
  // User's LP token amounts
  userLongX: string    // User's longX LP tokens (Token0 Long)
  userShortX: string   // User's shortX LP tokens (Token0 Short)
  userLongY: string    // User's longY LP tokens (Token1 Long)
  userShortY: string   // User's shortY LP tokens (Token1 Short)
  totalShares: string
  myShares: string
  sharePercent: string
}

export interface TokenInfo {
  address: string
  symbol: string
  decimals: number
  balance: string
}

export function useLiquidity() {
  const { isConnected, address, provider, signer, chainId } = useStore()
  
  // Debug: Log the actual values from useStore
  console.log('useLiquidity - useStore values:', {
    isConnected,
    address,
    provider: !!provider,
    signer: !!signer,
    chainId
  })
  const [positions, setPositions] = useState<LiquidityPosition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize SDK and contracts
  const getProvider = useCallback(async () => {
    if (!isConnected || !address || !provider) return null
    
    // Use the provider from useStore
    return provider
  }, [isConnected, address, provider])

  const getSigner = useCallback(async () => {
    if (!isConnected || !address || !signer) return null
    
    // Use the signer from useStore
    return signer
  }, [isConnected, address, signer])

  // Check token allowance
  const checkTokenAllowance = useCallback(async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    decimals: number = 18
  ): Promise<boolean> => {
    try {
      const provider = await getProvider()
      if (!provider || !address) return false

      // Native token (address(0)) doesn't need allowance - it's sent directly
      if (tokenAddress === ethers.ZeroAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        console.log('✅ Native token detected, skipping allowance check')
        return true
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      const allowance = await tokenContract.allowance(address, spenderAddress)
      
      // Convert amount to BigInt for comparison
      let amountInWei: bigint
      try {
        amountInWei = ethers.parseUnits(amount, decimals)
      } catch (parseError) {
        console.error('Error parsing amount:', { amount, decimals, error: parseError })
        return false
      }
      
      // Log for debugging
      console.log('Allowance check:', {
        tokenAddress,
        spenderAddress,
        amount: amountInWei.toString(),
        allowance: allowance.toString(),
        hasSufficientAllowance: allowance >= amountInWei
      })
      
      return allowance >= amountInWei
    } catch (error) {
      console.error('Error checking allowance:', error)
      return false
    }
  }, [getProvider, address])

  // Approve token spending with better error handling and confirmation
  const approveToken = useCallback(async (
    tokenAddress: string,
    spenderAddress: string,
    amount?: string,
    decimals: number = 18
  ): Promise<boolean> => {
    try {
      const signer = await getSigner()
      if (!signer) {
        throw new Error('No signer available')
      }
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error(`Invalid token address: ${tokenAddress}`)
      }
      if (!ethers.isAddress(spenderAddress)) {
        throw new Error(`Invalid spender address: ${spenderAddress}`)
      }

      // Native token (address(0)) doesn't need approval - it's sent directly
      if (tokenAddress === ethers.ZeroAddress || tokenAddress === '0x0000000000000000000000000000000000000000') {
        console.log('✅ Native token detected, skipping approval')
        return true
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      
      console.log(`🔍 Approving token ${tokenAddress} for spender ${spenderAddress}`)
      
      // Get current allowance to check if approval is needed
      const userAddress = await signer.getAddress()
      const currentAllowance = await tokenContract.allowance(userAddress, spenderAddress)
      console.log(`📊 Current allowance: ${currentAllowance.toString()}`)
      
      // Use maximum uint256 value for approval to avoid precision issues
      const maxApproval = ethers.MaxUint256
      
      // Check if we already have sufficient allowance
      const requiredAmount = ethers.parseUnits(amount || '0', decimals)
      if (currentAllowance >= requiredAmount) {
        console.log('✅ Already has sufficient allowance, skipping approval')
        return true
      }
      
      // 1. First, try to set allowance to 0 to reset any existing approval (for tokens like USDT)
      try {
        console.log('🔄 Resetting existing approval to 0...')
        const resetTx = await tokenContract.approve(spenderAddress, 0)
        const resetReceipt = await resetTx.wait()
        console.log('✅ Reset approval to 0 confirmed:', resetReceipt.hash)
      } catch (resetError) {
        console.warn('⚠️ Could not reset approval to 0, continuing anyway:', resetError)
        // Continue anyway - some tokens don't require reset
      }
      
      // 2. Set new approval to max amount
      console.log('🎯 Setting new approval to max...')
      const tx = await tokenContract.approve(spenderAddress, maxApproval)
      console.log('📤 Approval transaction sent:', tx.hash)
      
      // Wait for confirmation with timeout
      const receipt = await Promise.race([
        tx.wait(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Approval transaction timeout after 60 seconds')), 60000)
        )
      ]) as ethers.ContractTransactionReceipt
      
      if (!receipt) {
        throw new Error('Approval transaction failed - no receipt received')
      }
      
      if (!receipt.status || receipt.status === 0) {
        throw new Error('Approval transaction failed - transaction reverted')
      }
      
      console.log('✅ Approval transaction confirmed:', receipt.hash)
      
      // 3. Verify the new allowance
      const newAllowance = await tokenContract.allowance(userAddress, spenderAddress)
      console.log('📈 New allowance set to:', newAllowance.toString())
      
      return true
    } catch (error) {
      // Enhanced error handling with detailed context
      const errorDetails = {
        tokenAddress,
        spenderAddress,
        amount,
        decimals,
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : String(error),
        timestamp: new Date().toISOString()
      }
      
      console.error('❌ Error in approveToken:', errorDetails)
      
      // Provide user-friendly error message
      let userMessage = 'Token approval failed'
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          userMessage = 'Transaction was rejected by user'
        } else if (error.message.includes('timeout')) {
          userMessage = 'Transaction timed out - please try again'
        } else if (error.message.includes('insufficient funds')) {
          userMessage = 'Insufficient funds for transaction'
        } else if (error.message.includes('Invalid token address')) {
          userMessage = 'Invalid token address provided'
        } else {
          userMessage = error.message
        }
      }
      
      throw new Error(userMessage)
    }
  }, [getSigner])

  // Get token info
  const getTokenInfo = useCallback(async (tokenAddress: string): Promise<TokenInfo | null> => {
    try {
      const provider = await getProvider()
      if (!provider || !address) return null

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      const [symbol, decimals, balance] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.balanceOf(address)
      ])

      return {
        address: tokenAddress,
        symbol,
        decimals,
        balance: ethers.formatUnits(balance, decimals)
      }
    } catch (error) {
      console.error('Error getting token info:', error)
      return null
    }
  }, [getProvider, address])

  // Fetch user's liquidity positions
  const fetchPositions = useCallback(async () => {
    if (!isConnected || !address) {
      console.log('fetchPositions: Not connected or no wallet address')
      return
    }

    console.log('fetchPositions: Starting to fetch positions for', address)
    setLoading(true)
    setError(null)

    try {
      const provider = await getProvider()
      if (!provider) throw new Error('No provider available')

      const marketAddress = getMarketAddress(CURRENT_CHAIN_ID)
      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID)
      if (!marketAddress || !routerAddress) throw new Error('Market or Router contract not deployed on this network')
      
      console.log('fetchPositions: Using market address:', marketAddress)
      const marketContract = new ethers.Contract(marketAddress, MARKET_ABI, provider)
      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, provider)
      
      // Optimized approach: First get Create events to find existing pairs, then check user balances
      // This is much faster than checking 1000+ pairs sequentially
      console.log('fetchPositions: Finding existing pairs through Create events...')
      
      const userPositions: LiquidityPosition[] = []
      
      // Alternative approach: Query Mint events filtered by user address
      // This finds pairs where the user has actually added liquidity
      console.log('fetchPositions: Querying Mint events for user positions...')
      
      try {
        // Get Mint events from a much larger block range to catch older positions
        const currentBlock = await provider.getBlockNumber()
        const fromBlock = Math.max(0, currentBlock - 5000000) // Increased to 5M blocks
        
        console.log(`fetchPositions: Searching Mint events from block ${fromBlock} to ${currentBlock}`)
        
        // Query Mint events where the user is the 'to' address (received LP tokens)
        const mintFilter = marketContract.filters.Mint(null, address, null)
        const mintEvents = await marketContract.queryFilter(mintFilter, fromBlock, currentBlock)
        
        console.log(`fetchPositions: Found ${mintEvents.length} Mint events for user`)
        
        // Track unique pair IDs to avoid duplicates
        const processedPairs = new Set<string>()
        
        // Check user's current balance for each pair they've minted in
        for (const event of mintEvents) {
          try {
            // Type guard to ensure we have an EventLog with args
            if (!('args' in event) || !event.args) {
              console.log('fetchPositions: Skipping Mint event with no args')
              continue
            }
            
            const pairId = event.args[2] // pairId is the third argument in Mint event
            const pairIdStr = pairId.toString()
            
            // Skip if we've already processed this pair
            if (processedPairs.has(pairIdStr)) {
              continue
            }
            processedPairs.add(pairIdStr)
            
            console.log(`fetchPositions: Checking current balance for pair ${pairIdStr}`)
            
            // Get user's current LP token balance for this pair
            const [longX, shortX, longY, shortY] = await marketContract.balanceOf(address, pairId)
            
            // Only create position if user currently has balance
            if (longX > 0n || shortX > 0n || longY > 0n || shortY > 0n) {
              console.log(`fetchPositions: Found current balance in pair ${pairIdStr}:`, {
                longX: longX.toString(),
                shortX: shortX.toString(),
                longY: longY.toString(),
                shortY: shortY.toString()
              })
              
              // Find the Create event for this pair to get token addresses
              let token0Address = '0x0000000000000000000000000000000000000000'
              let token1Address = '0x0000000000000000000000000000000000000000'
              let token0Symbol = 'TKN0'
              let token1Symbol = 'TKN1'
              
              // Store reserves data for later use
              let reserveData = {
                reserve0Long: '0',
                reserve0Short: '0', 
                reserve1Long: '0',
                reserve1Short: '0'
              }
              
              try {
                console.log(`fetchPositions: Looking for Create event for pair ${pairIdStr}`)
                
                // Query Create events to find the one with matching pairId
                const createFilter = marketContract.filters.Create()
                const createEvents = await marketContract.queryFilter(createFilter, fromBlock, currentBlock)
                
                for (const createEvent of createEvents) {
                  if ('args' in createEvent && createEvent.args) {
                    const createPairId = createEvent.args[2]?.toString()
                    if (createPairId === pairIdStr) {
                      const rawToken0 = createEvent.args[0]?.toString() || token0Address
                      const rawToken1 = createEvent.args[1]?.toString() || token1Address
                      
                      // Ensure proper token ordering (token0 < token1) as required by Pennysia AMM
                      if (rawToken0.toLowerCase() < rawToken1.toLowerCase()) {
                        token0Address = rawToken0
                        token1Address = rawToken1
                      } else {
                        token0Address = rawToken1
                        token1Address = rawToken0
                      }
                      
                      console.log(`fetchPositions: Found and ordered token addresses for pair ${pairIdStr}:`, {
                        token0Address,
                        token1Address,
                        rawToken0,
                        rawToken1
                      })
                      
                      // Verify that these token addresses will generate the same pair ID
                      try {
                        const computedPairId = await marketContract.getPairId(token0Address, token1Address)
                        console.log(`fetchPositions: Verification - computed pair ID: ${computedPairId.toString()}, original: ${pairIdStr}`)
                        if (computedPairId.toString() !== pairIdStr) {
                          console.warn(`fetchPositions: PAIR ID MISMATCH! Computed: ${computedPairId.toString()}, Original: ${pairIdStr}`)
                        } else {
                          console.log(`fetchPositions: ✅ Pair ID verification PASSED!`)
                        }
                      } catch (verifyError) {
                        console.error(`fetchPositions: Could not verify pair ID for ${pairIdStr}:`, verifyError)
                      }
                      
                      // Get token symbols with native token handling
                      try {
                        // Handle token0 symbol (can be native)
                        if (token0Address === ethers.ZeroAddress || token0Address === '0x0000000000000000000000000000000000000000') {
                          // Use chain-specific native currency symbol
                          const network = await provider.getNetwork()
                          const chainId = Number(network.chainId)
                          
                          // Map chain ID to native currency symbol
                          const nativeSymbols: { [key: number]: string } = {
                            1: 'ETH',        // Ethereum Mainnet
                            11155111: 'ETH', // Sepolia Testnet  
                            [CURRENT_CHAIN_ID]: 'S',        // Current supported chain
                          }
                          
                          token0Symbol = nativeSymbols[chainId] || 'ETH' // Fallback to ETH
                          console.log(`fetchPositions: Using native token symbol '${token0Symbol}' for chain ${chainId}`)
                        } else {
                          const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider)
                          token0Symbol = await token0Contract.symbol()
                        }
                        
                        // Handle token1 symbol (should always be ERC20 according to your constraint)
                        if (token1Address === ethers.ZeroAddress || token1Address === '0x0000000000000000000000000000000000000000') {
                          console.warn(`fetchPositions: WARNING - token1 should not be native token according to protocol constraints!`)
                          token1Symbol = 'ETH' // Fallback, but this shouldn't happen
                        } else {
                          const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider)
                          token1Symbol = await token1Contract.symbol()
                        }
                        
                        console.log(`fetchPositions: Token symbols fetched:`, {
                          token0Address,
                          token0Symbol,
                          token1Address, 
                          token1Symbol
                        })
                      } catch (symbolError) {
                        console.warn(`fetchPositions: Could not fetch token symbols for pair ${pairIdStr}:`, symbolError)
                        // Keep the fallback values TKN0/TKN1 only if we really can't fetch anything
                      }
                      
                      // Calculate actual token values using quoteReserve
                      try {
                        const reserves = await routerContract.quoteReserve(
                          token0Address, 
                          token1Address, 
                          longX, 
                          shortX, 
                          longY, 
                          shortY
                        )
                        const [amountLong0, amountShort0, amountLong1, amountShort1] = reserves
                        
                        console.log(`fetchPositions: Token values for pair ${pairIdStr}:`, {
                          amountLong0: amountLong0.toString(),
                          amountShort0: amountShort0.toString(),
                          amountLong1: amountLong1.toString(),
                          amountShort1: amountShort1.toString()
                        })
                        
                        reserveData = {
                          reserve0Long: ethers.formatUnits(amountLong0, 18),
                          reserve0Short: ethers.formatUnits(amountShort0, 18),
                          reserve1Long: ethers.formatUnits(amountLong1, 18),
                          reserve1Short: ethers.formatUnits(amountShort1, 18)
                        }
                      } catch (reserveError) {
                        console.warn(`fetchPositions: Could not fetch token values for pair ${pairIdStr}:`, reserveError)
                        // Fallback to default values
                        reserveData = {
                          reserve0Long: '0',
                          reserve0Short: '0',
                          reserve1Long: '0',
                          reserve1Short: '0'
                        }
                      }
                      
                      break
                    }
                  }
                }
              } catch (createError) {
                console.warn(`fetchPositions: Could not find Create event for pair ${pairIdStr}:`, createError)
              }
              
              const position: LiquidityPosition = {
                id: Number(pairId),
                pair: `${token0Symbol}/${token1Symbol}`,
                token0Symbol,
                token1Symbol,
                token0Address, // Real token0 address
                token1Address, // Real token1 address
                liquidity: ethers.formatUnits(longX + shortX + longY + shortY, 18),
                value: reserveData ? (
                  parseFloat(reserveData.reserve0Long) + 
                  parseFloat(reserveData.reserve0Short) + 
                  parseFloat(reserveData.reserve1Long) + 
                  parseFloat(reserveData.reserve1Short)
                ).toFixed(2) : '0.00',
                apr: '0.00%',
                fees24h: '0.00',
                pnl: '0.00',
                pnlPercent: '0.00%',
                isProfit: false,
                reserve0Long: reserveData.reserve0Long,
                reserve0Short: reserveData.reserve0Short,
                reserve1Long: reserveData.reserve1Long,
                reserve1Short: reserveData.reserve1Short,
                userLongX: ethers.formatUnits(longX, 18),
                userShortX: ethers.formatUnits(shortX, 18),
                userLongY: ethers.formatUnits(longY, 18),
                userShortY: ethers.formatUnits(shortY, 18),
                totalShares: ethers.formatUnits(longX + shortX + longY + shortY, 18),
                myShares: ethers.formatUnits(longX + shortX + longY + shortY, 18),
                sharePercent: '100.00%'
              }
              
              userPositions.push(position)
              console.log(`fetchPositions: Added position for pair ${pairIdStr}`)
            } else {
              console.log(`fetchPositions: No current balance in pair ${pairIdStr}, skipping`)
            }
          } catch (pairError) {
            console.error(`fetchPositions: Error processing Mint event:`, pairError)
            continue
          }
        }
        
        if (userPositions.length === 0) {
          console.log('fetchPositions: No current positions found from Mint events')
        }
        
      } catch (error) {
        console.error('fetchPositions: Error querying Mint events:', error)
        throw error
      }
      
      console.log('fetchPositions: Final user positions:', userPositions.length, 'positions found')
      setPositions(userPositions)
    } catch (error) {
      console.error('Error fetching positions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch positions')
    } finally {
      setLoading(false)
    }
  }, [isConnected, address, getProvider, getTokenInfo])

  // Add liquidity
  const addLiquidity = useCallback(async (
    token0Address: string,
    token1Address: string,
    amount0Long: string,
    amount0Short: string,
    amount1Long: string,
    amount1Short: string,
    token0Decimals: number = 18,
    token1Decimals: number = 18
  ) => {
    try {
      console.log('🔄 Starting addLiquidity with params:', {
        token0Address,
        token1Address,
        amount0Long,
        amount0Short,
        amount1Long,
        amount1Short,
        token0Decimals,
        token1Decimals
      })

      const signer = await getSigner()
      if (!signer) throw new Error('No signer available')

      // Get Router address
      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID)
      if (!routerAddress) throw new Error('Router contract not deployed')

      // Validate token addresses
      if (!ethers.isAddress(token0Address) || !ethers.isAddress(token1Address)) {
        throw new Error('Invalid token addresses provided')
      }

      // Calculate total amounts needed for approval
      const totalAmount0 = (parseFloat(amount0Long) + parseFloat(amount0Short) || 0).toString()
      const totalAmount1 = (parseFloat(amount1Long) + parseFloat(amount1Short) || 0).toString()

      console.log('🔍 Token approval check:', {
        token0Address,
        token1Address,
        routerAddress,
        totalAmount0,
        totalAmount1,
        token0Decimals,
        token1Decimals
      })

      // Always approve tokens (don't check allowance first to avoid race conditions)
      console.log('🔄 Approving tokens...')
      
      // Approve both tokens in parallel
      await Promise.all([
        totalAmount0 > '0' ? approveToken(token0Address, routerAddress, totalAmount0, token0Decimals) : Promise.resolve(),
        totalAmount1 > '0' ? approveToken(token1Address, routerAddress, totalAmount1, token1Decimals) : Promise.resolve()
      ])

      console.log('✅ Token approvals completed')

      // Execute add liquidity using Router contract
      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, signer)
      const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now

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
            console.log(`⚠️ Truncated value from ${value} to ${safeValue} to prevent ethers.js underflow`)
          }
          
          return ethers.parseUnits(safeValue, decimals)
        } catch (error) {
          console.error('Error in safeParseUnits:', error, 'Value:', value, 'Decimals:', decimals)
          return 0n
        }
      }

      // Parse amounts with correct decimals using safe wrapper
      const parsedAmount0Long = safeParseUnits(amount0Long || '0', token0Decimals)
      const parsedAmount0Short = safeParseUnits(amount0Short || '0', token0Decimals)
      const parsedAmount1Long = safeParseUnits(amount1Long || '0', token1Decimals)
      const parsedAmount1Short = safeParseUnits(amount1Short || '0', token1Decimals)

      // Calculate minimum amounts with slippage protection (95% of expected)
      // For initial liquidity provision, we can estimate minimums based on input amounts
      const slippageTolerance = 5 // 5% slippage tolerance
      const slippageMultiplier = BigInt(10000 - slippageTolerance * 100) // 9500 for 5%
      
      // Estimate minimum LP tokens based on input amounts (conservative estimate)
      // For new pairs, LP tokens are roughly proportional to input amounts
      const estimatedLongX = (parsedAmount0Long + parsedAmount1Long) / 2n
      const estimatedShortX = (parsedAmount0Short + parsedAmount1Short) / 2n
      const estimatedLongY = (parsedAmount0Long + parsedAmount1Long) / 2n
      const estimatedShortY = (parsedAmount0Short + parsedAmount1Short) / 2n
      
      const longXMinimum = (estimatedLongX * slippageMultiplier) / 10000n
      const shortXMinimum = (estimatedShortX * slippageMultiplier) / 10000n
      const longYMinimum = (estimatedLongY * slippageMultiplier) / 10000n
      const shortYMinimum = (estimatedShortY * slippageMultiplier) / 10000n

      // Calculate native token value to send with transaction
      let nativeTokenValue = 0n
      if (token0Address === ethers.ZeroAddress || token0Address === '0x0000000000000000000000000000000000000000') {
        nativeTokenValue += parsedAmount0Long + parsedAmount0Short
      }
      if (token1Address === ethers.ZeroAddress || token1Address === '0x0000000000000000000000000000000000000000') {
        nativeTokenValue += parsedAmount1Long + parsedAmount1Short
      }

      console.log('📝 Calling addLiquidity with:', {
        token0Address,
        token1Address,
        parsedAmount0Long: parsedAmount0Long.toString(),
        parsedAmount0Short: parsedAmount0Short.toString(),
        parsedAmount1Long: parsedAmount1Long.toString(),
        parsedAmount1Short: parsedAmount1Short.toString(),
        nativeTokenValue: nativeTokenValue.toString(),
        deadline
      })

      // Pre-flight checks before executing addLiquidity
      console.log('🔍 Performing pre-flight checks...')
      
      // Check native token balance if needed
      if (nativeTokenValue > 0n) {
        const balance = await provider!.getBalance(address!)
        console.log('💰 Native token balance check:', {
          required: ethers.formatEther(nativeTokenValue),
          available: ethers.formatEther(balance),
          sufficient: balance >= nativeTokenValue
        })
        
        if (balance < nativeTokenValue) {
          throw new Error(`Insufficient native token balance. Required: ${ethers.formatEther(nativeTokenValue)} ETH, Available: ${ethers.formatEther(balance)} ETH`)
        }
      }
      
      // Check ERC20 token balance and allowance if needed
      const checkAmount0 = parsedAmount0Long + parsedAmount0Short
      const checkAmount1 = parsedAmount1Long + parsedAmount1Short
      
      if (token0Address !== ethers.ZeroAddress && checkAmount0 > 0n) {
        const token0Contract = new ethers.Contract(token0Address, ['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)'], provider!)
        const balance0 = await token0Contract.balanceOf(address!)
        const allowance0 = await token0Contract.allowance(address!, routerAddress)
        
        console.log('💰 Token0 balance/allowance check:', {
          token: token0Address,
          required: checkAmount0.toString(),
          balance: balance0.toString(),
          allowance: allowance0.toString(),
          balanceSufficient: BigInt(balance0.toString()) >= checkAmount0,
          allowanceSufficient: BigInt(allowance0.toString()) >= checkAmount0
        })
        
        if (BigInt(balance0.toString()) < checkAmount0) {
          throw new Error(`Insufficient token0 balance. Required: ${checkAmount0.toString()}, Available: ${balance0.toString()}`)
        }
        if (BigInt(allowance0.toString()) < checkAmount0) {
          throw new Error(`Insufficient token0 allowance. Required: ${checkAmount0.toString()}, Allowed: ${allowance0.toString()}`)
        }
      }
      
      if (token1Address !== ethers.ZeroAddress && checkAmount1 > 0n) {
        const token1Contract = new ethers.Contract(token1Address, ['function balanceOf(address) view returns (uint256)', 'function allowance(address,address) view returns (uint256)'], provider!)
        const balance1 = await token1Contract.balanceOf(address!)
        const allowance1 = await token1Contract.allowance(address!, routerAddress)
        
        console.log('💰 Token1 balance/allowance check:', {
          token: token1Address,
          required: checkAmount1.toString(),
          balance: balance1.toString(),
          allowance: allowance1.toString(),
          balanceSufficient: BigInt(balance1.toString()) >= checkAmount1,
          allowanceSufficient: BigInt(allowance1.toString()) >= checkAmount1
        })
        
        if (BigInt(balance1.toString()) < checkAmount1) {
          throw new Error(`Insufficient token1 balance. Required: ${checkAmount1.toString()}, Available: ${balance1.toString()}`)
        }
        if (BigInt(allowance1.toString()) < checkAmount1) {
          throw new Error(`Insufficient token1 allowance. Required: ${checkAmount1.toString()}, Allowed: ${allowance1.toString()}`)
        }
      }
      
      console.log('✅ All pre-flight checks passed!')
      
      console.log('🚀 Executing addLiquidity with final parameters:', {
        token0Address,
        token1Address,
        parsedAmount0Long: parsedAmount0Long.toString(),
        parsedAmount0Short: parsedAmount0Short.toString(),
        parsedAmount1Long: parsedAmount1Long.toString(),
        parsedAmount1Short: parsedAmount1Short.toString(),
        longXMinimum: longXMinimum.toString(),
        shortXMinimum: shortXMinimum.toString(),
        longYMinimum: longYMinimum.toString(),
        shortYMinimum: shortYMinimum.toString(),
        to: address,
        deadline,
        nativeTokenValue: nativeTokenValue.toString(),
        gasLimit: '800000'
      })

      let tx
      try {
        tx = await routerContract.addLiquidity(
          token0Address,
          token1Address,
          parsedAmount0Long,
          parsedAmount0Short,
          parsedAmount1Long,
          parsedAmount1Short,
          longXMinimum,
          shortXMinimum,
          longYMinimum,
          shortYMinimum,
          address || '', // to
          deadline,
          { 
            value: nativeTokenValue, // Send native token value if needed
            gasLimit: 800000 // Increase gas limit
          }
        )
      } catch (contractError: any) {
        console.error('❌ AddLiquidity contract execution error:', contractError)
        
        // Try to decode the error
        let errorMessage = 'Unknown contract error'
        if (contractError?.data) {
          console.log('Error data:', contractError.data)
          // Check for known error selectors
          if (contractError.data === '0x3e032a3b') {
            errorMessage = 'Slippage tolerance exceeded - try reducing amounts or increasing slippage'
          } else if (contractError.data === '0x8679b0c0') {
            errorMessage = 'Forbidden - insufficient permissions or invalid operation'
          } else if (contractError.data === '0xa04eeb03') {
            errorMessage = 'Pair not found - this trading pair may not exist'
          } else if (contractError.data === '0x009e2872') {
            errorMessage = 'Invalid path - check token addresses'
          } else if (contractError.data === '0xb56cf011') {
            errorMessage = 'Minimum liquidity requirement not met - try increasing amounts'
          } else if (contractError.data === '0xc24d2823') {
            errorMessage = 'Custom contract error (0xc24d2823) - possible issues: insufficient balance, invalid token pair, or contract state issue'
          }
        }
        
        throw new Error(`AddLiquidity failed: ${errorMessage}. Original error: ${contractError?.message || contractError}`)
      }

      console.log('✅ AddLiquidity transaction submitted:', tx.hash)
      
      const receipt = await tx.wait()
      
      // Check if transaction was successful
      if (receipt.status === 0) {
        console.error('❌ Transaction reverted:', {
          hash: tx.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          logs: receipt.logs,
          status: receipt.status
        })
        
        // Analyze the failure
        let failureReason = 'Unknown reason'
        if (receipt.gasUsed < 50000n) {
          failureReason = 'Transaction failed very early - likely a require() or revert() in the contract'
        } else if (receipt.logs.length === 0) {
          failureReason = 'No events emitted - transaction reverted before completing any operations'
        }
        
        throw new Error(`AddLiquidity transaction reverted. ${failureReason}. Transaction hash: ${tx.hash}. Check the blockchain explorer for more details.`)
      }
      
      console.log('✅ AddLiquidity transaction confirmed:', {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      })
      
      // Refresh positions after successful transaction
      await fetchPositions()
      
      return tx.hash
    } catch (error) {
      console.error('Error adding liquidity:', error)
      throw error
    }
  }, [getSigner, checkTokenAllowance, approveToken, fetchPositions, address])

  // Remove liquidity
  const removeLiquidity = useCallback(async (
    token0Address: string,
    token1Address: string,
    liquidity0Long: string,
    liquidity0Short: string,
    liquidity1Long: string,
    liquidity1Short: string
  ) => {
    try {
      const signer = await getSigner()
      if (!signer) throw new Error('No signer available')

      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID)
      if (!routerAddress) throw new Error('Router contract not deployed')
      
      const marketAddress = getMarketAddress(CURRENT_CHAIN_ID)
      if (!marketAddress) throw new Error('Market contract not deployed')

      const routerContract = new ethers.Contract(routerAddress, ROUTER_ABI, signer)
      const marketContract = new ethers.Contract(marketAddress, MARKET_ABI, signer)
      const liquidityContract = new ethers.Contract(marketAddress, LIQUIDITY_ABI, signer)
      const deadline = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      
      // Calculate poolId for LP token approval using Market ABI
      const poolId = await marketContract.getPairId(token0Address, token1Address)
      
      console.log('🔐 Approving Router to transfer LP tokens for poolId:', poolId.toString())
      
      // Approve Router to transfer LP tokens (TTL-based approval) using Liquidity ABI
      const approvalDeadline = Math.floor(Date.now() / 1000) + 7200 // 2 hours from now
      const approvalTx = await liquidityContract.approve(routerAddress, poolId, approvalDeadline)
      await approvalTx.wait()
      
      console.log('✅ LP token approval successful')

      console.log('🔄 Calling Router.removeLiquidity with:', {
        token0Address,
        token1Address,
        liquidity0Long,
        liquidity0Short,
        liquidity1Long,
        liquidity1Short,
        userAddress: address,
        deadline
      })

      // First, simulate the call to get the return values (amount0, amount1)
      console.log('🔍 Simulating removeLiquidity call to get return values...')
      const [simulatedAmount0, simulatedAmount1] = await routerContract.removeLiquidity.staticCall(
        token0Address,
        token1Address,
        ethers.parseUnits(liquidity0Long, 18), // longX - LP tokens to remove
        ethers.parseUnits(liquidity0Short, 18), // shortX
        ethers.parseUnits(liquidity1Long, 18), // longY
        ethers.parseUnits(liquidity1Short, 18), // shortY
        0n, // amount0Minimum - minimum token0 to receive
        0n, // amount1Minimum - minimum token1 to receive
        address, // to - recipient
        deadline
      )
      
      console.log('📊 Simulated return values:', {
        amount0: ethers.formatUnits(simulatedAmount0, 18),
        amount1: ethers.formatUnits(simulatedAmount1, 18)
      })

      // Now execute the actual transaction
      console.log('🚀 Executing actual removeLiquidity transaction...')
      const tx = await routerContract.removeLiquidity(
        token0Address,
        token1Address,
        ethers.parseUnits(liquidity0Long, 18), // longX - LP tokens to remove
        ethers.parseUnits(liquidity0Short, 18), // shortX
        ethers.parseUnits(liquidity1Long, 18), // longY
        ethers.parseUnits(liquidity1Short, 18), // shortY
        0n, // amount0Minimum - minimum token0 to receive
        0n, // amount1Minimum - minimum token1 to receive
        address, // to - recipient
        deadline,
        { value: 0n } // No native token value needed for removeLiquidity
      )

      const receipt = await tx.wait()
      
      // Refresh positions after successful transaction
      await fetchPositions()
      
      // Return both transaction hash and the actual withdrawal amounts
      return {
        txHash: tx.hash,
        amount0: ethers.formatUnits(simulatedAmount0, 18),
        amount1: ethers.formatUnits(simulatedAmount1, 18)
      }
    } catch (error) {
      console.error('Error removing liquidity:', error)
      throw error
    }
  }, [getSigner, fetchPositions])

  // Load positions on mount and when authentication changes
  useEffect(() => {
    console.log('useLiquidity useEffect triggered:', { isConnected, address, provider, signer })
    if (isConnected && address) {
      console.log('Wallet connected, fetching positions...')
      fetchPositions()
    } else {
      console.log('Wallet not connected, clearing state...')
      // Immediately clear all state when not connected
      setLoading(false)
      setPositions([])
      setError(null)
    }
  }, [isConnected, address, fetchPositions])

  // Additional effect to immediately clear positions when wallet disconnects
  useEffect(() => {
    if (!isConnected || !address) {
      console.log('Wallet disconnected, immediately clearing positions...')
      setPositions([])
      setLoading(false)
      setError(null)
    }
  }, [isConnected, address])

  // Manual refresh function with delay for better reliability
  const refreshPositions = useCallback(async () => {
    console.log('Manual position refresh requested...')
    setLoading(true)
    
    // Wait a bit for blockchain state to update
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await fetchPositions()
    console.log('Manual position refresh completed')
  }, [fetchPositions])

  return {
    positions,
    loading,
    error,
    fetchPositions,
    refreshPositions, // New manual refresh function
    addLiquidity,
    removeLiquidity,
    getTokenInfo,
    checkTokenAllowance,
    approveToken,
    isAuthenticated: isConnected && !!address
  }
}
