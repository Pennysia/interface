import { ethers } from 'ethers'
import { PennysiaSDK } from '../lib/pennysia'
import { ChainId } from '../lib/chains'
import { Token } from '../lib/token'

export interface PoolData {
  pairId: string
  token0: {
    address: string
    symbol: string
    name: string
    decimals: number
    logoURI?: string
  }
  token1: {
    address: string
    symbol: string
    name: string
    decimals: number
    logoURI?: string
  }
  reserves: {
    reserve0Long: string
    reserve0Short: string
    reserve1Long: string
    reserve1Short: string
  }
  tvl: string
  volume24h: string
  fees24h: string
  apr: string
}

export interface CreateEvent {
  token0: string
  token1: string
  pairId: string
  blockNumber: number
  transactionHash: string
}

export interface TokenData {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  logoURI?: string
}

export class PoolService {
  private sdk: PennysiaSDK
  private provider: ethers.Provider

  constructor(provider: ethers.Provider, chainId: ChainId = ChainId.SONIC) {
    this.provider = provider
    this.sdk = PennysiaSDK.create(chainId, provider)
  }

  /**
   * Discover all pools by filtering Create events from the Market contract
   */
  async discoverPools(fromBlock: number = 0, toBlock: number | 'latest' = 'latest'): Promise<CreateEvent[]> {
    try {
      // Get Create events from the Market contract
      const filter = this.sdk.marketContract.filters.Create()
      const events = await this.sdk.marketContract.queryFilter(filter, fromBlock, toBlock)

      return events.map(event => {
        const eventLog = event as ethers.EventLog
        return {
          token0: eventLog.args?.token0 || '',
          token1: eventLog.args?.token1 || '',
          pairId: eventLog.args?.pairId?.toString() || '',
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        }
      })
    } catch (error) {
      console.error('Error discovering pools:', error)
      return []
    }
  }

  /**
   * Get token information for a given address
   */
  async getTokenInfo(tokenAddress: string): Promise<{
    address: string
    symbol: string
    name: string
    decimals: number
    logoURI?: string
  }> {
    try {
      // Handle native token (Sonic)
      if (tokenAddress === ethers.ZeroAddress) {
        return {
          address: tokenAddress,
          symbol: 'S',
          name: 'Sonic',
          decimals: 18,
          logoURI: '/sonic-logo.avif'
        }
      }

      // Get token info from contract
      const tokenInfo = await this.sdk.getTokenInfo(tokenAddress)
      
      return {
        address: tokenAddress,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        logoURI: undefined // Could be enhanced with a token list
      }
    } catch (error) {
      console.error(`Error getting token info for ${tokenAddress}:`, error)
      return {
        address: tokenAddress,
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        decimals: 18
      }
    }
  }

  /**
   * Calculate token amounts from reserves
   */
  private calculateTokenAmounts(reserves: {
    reserve0Long: string
    reserve0Short: string
    reserve1Long: string
    reserve1Short: string
  }, token0Decimals: number, token1Decimals: number, token0Symbol: string, token1Symbol: string): string {
    try {
      // Sum all reserves for both tokens
      const total0 = BigInt(reserves.reserve0Long) + BigInt(reserves.reserve0Short)
      const total1 = BigInt(reserves.reserve1Long) + BigInt(reserves.reserve1Short)

      // Format token amounts
      const amount0 = parseFloat(ethers.formatUnits(total0, token0Decimals))
      const amount1 = parseFloat(ethers.formatUnits(total1, token1Decimals))
      
      // Return formatted token amounts
      return `${amount0.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${token0Symbol} + ${amount1.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${token1Symbol}`
    } catch (error) {
      console.error('Error calculating token amounts:', error)
      return '0 + 0'
    }
  }

  /**
   * Get detailed pool data for a specific pair
   */
  async getPoolData(pairId: string, token0Address: string, token1Address: string): Promise<PoolData | null> {
    try {
      // Get token information
      const [token0Info, token1Info, pairInfo] = await Promise.all([
        this.getTokenInfo(token0Address),
        this.getTokenInfo(token1Address),
        this.sdk.getPairInfo(pairId)
      ])

      // Calculate token amounts for TVL display
      const tvl = this.calculateTokenAmounts(pairInfo, token0Info.decimals, token1Info.decimals, token0Info.symbol, token1Info.symbol)

      return {
        pairId,
        token0: token0Info,
        token1: token1Info,
        reserves: {
          reserve0Long: pairInfo.reserve0Long,
          reserve0Short: pairInfo.reserve0Short,
          reserve1Long: pairInfo.reserve1Long,
          reserve1Short: pairInfo.reserve1Short
        },
        tvl,
        volume24h: '$0.00', // Would need historical data or events
        fees24h: '$0.00',   // Would need fee calculation from events
        apr: '0.00%'        // Would need historical performance data
      }
    } catch (error) {
      console.error(`Error getting pool data for pair ${pairId}:`, error)
      return null
    }
  }

  /**
   * Get all pools with their data
   */
  async getAllPools(fromBlock: number = 0): Promise<PoolData[]> {
    try {
      // Discover all pools
      const createEvents = await this.discoverPools(fromBlock)
      
      // Get detailed data for each pool
      const poolDataPromises = createEvents.map(event =>
        this.getPoolData(event.pairId, event.token0, event.token1)
      )

      const poolDataResults = await Promise.allSettled(poolDataPromises)
      
      // Filter out failed requests and null results
      return poolDataResults
        .filter((result): result is PromiseFulfilledResult<PoolData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
    } catch (error) {
      console.error('Error getting all pools:', error)
      return []
    }
  }

  /**
   * Discover all unique tokens from pool creation events
   */
  async discoverTokens(fromBlock: number = 0): Promise<string[]> {
    try {
      const createEvents = await this.discoverPools(fromBlock)
      const tokenAddresses = new Set<string>()
      
      // Always include native token (represented as zero address)
      tokenAddresses.add(ethers.ZeroAddress)
      
      // Collect all unique token addresses from pools
      createEvents.forEach(event => {
        tokenAddresses.add(event.token0)
        tokenAddresses.add(event.token1)
      })
      
      return Array.from(tokenAddresses)
    } catch (error) {
      console.error('Error discovering tokens:', error)
      return []
    }
  }

  /**
   * Get token balance in the market contract
   */
  async getTokenBalance(tokenAddress: string): Promise<string> {
    try {
      // For native token (zero address), get ETH balance of the contract
      if (tokenAddress === ethers.ZeroAddress) {
        const balance = await this.sdk.provider.getBalance(this.sdk.marketContract.target)
        return balance.toString()
      }
      
      // For ERC20 tokens, get balance from contract
      const balance = await this.sdk.marketContract.tokenBalances(tokenAddress)
      return balance.toString()
    } catch (error) {
      console.error(`Error getting token balance for ${tokenAddress}:`, error)
      return '0'
    }
  }

  /**
   * Get detailed token data including balance
   */
  async getTokenData(tokenAddress: string): Promise<TokenData | null> {
    try {
      const [tokenInfo, balance] = await Promise.all([
        this.getTokenInfo(tokenAddress),
        this.getTokenBalance(tokenAddress)
      ])

      return {
        address: tokenAddress,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        balance: balance,
        logoURI: tokenInfo.logoURI
      }
    } catch (error) {
      console.error(`Error getting token data for ${tokenAddress}:`, error)
      return null
    }
  }

  /**
   * Get all tokens with their data
   */
  async getAllTokens(fromBlock: number = 0): Promise<TokenData[]> {
    try {
      // Discover all token addresses
      const tokenAddresses = await this.discoverTokens(fromBlock)
      
      // Get detailed data for each token
      const tokenDataPromises = tokenAddresses.map(address =>
        this.getTokenData(address)
      )

      const tokenDataResults = await Promise.allSettled(tokenDataPromises)
      
      // Filter out failed requests and null results
      return tokenDataResults
        .filter((result): result is PromiseFulfilledResult<TokenData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .filter(token => parseFloat(ethers.formatUnits(token.balance, token.decimals)) > 0) // Only show tokens with balance
    } catch (error) {
      console.error('Error getting all tokens:', error)
      return []
    }
  }

  /**
   * Get liquidity breakdown for a specific pool
   */
  async getLiquidityBreakdown(pairId: string): Promise<{
    token0Long: string
    token0Short: string
    token1Long: string
    token1Short: string
    totalLiquidity: string
  } | null> {
    try {
      const pairInfo = await this.sdk.getPairInfo(pairId)
      
      // Calculate total liquidity
      const total0 = BigInt(pairInfo.reserve0Long) + BigInt(pairInfo.reserve0Short)
      const total1 = BigInt(pairInfo.reserve1Long) + BigInt(pairInfo.reserve1Short)
      
      const totalLiquidity = total0 + total1

      return {
        token0Long: pairInfo.reserve0Long,
        token0Short: pairInfo.reserve0Short,
        token1Long: pairInfo.reserve1Long,
        token1Short: pairInfo.reserve1Short,
        totalLiquidity: totalLiquidity.toString()
      }
    } catch (error) {
      console.error(`Error getting liquidity breakdown for pair ${pairId}:`, error)
      return null
    }
  }
}

// Singleton instance for the app
let poolServiceInstance: PoolService | null = null

export function getPoolService(provider?: ethers.Provider): PoolService {
  if (!poolServiceInstance && provider) {
    poolServiceInstance = new PoolService(provider)
  }
  if (!poolServiceInstance) {
    throw new Error('PoolService not initialized. Provide a provider on first call.')
  }
  return poolServiceInstance
}
