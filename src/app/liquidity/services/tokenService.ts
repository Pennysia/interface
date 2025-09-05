'use client'

import { ethers } from 'ethers'
import { CURRENT_CHAIN_ID, CURRENT_RPC_URL } from '@/config/chains'

export interface Token {
  chainId: number
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI?: string
  extensions?: {
    bridgeInfo?: Record<string, { tokenAddress: string }>
  }
}

export interface TokenList {
  name: string
  timestamp: string
  version: {
    major: number
    minor: number
    patch: number
  }
  tags: Record<string, any>
  logoURI: string
  keywords: string[]
  tokens: Token[]
}

class TokenService {
  private tokenList: TokenList | null = null
  private popularTokens: Token[] = []
  private loading = false
  private popularTokensLoaded = false
  private readonly UNISWAP_TOKEN_LIST_URL = 'https://tokens.uniswap.org'
  
  // Cache duration: 1 hour
  private readonly CACHE_DURATION = 60 * 60 * 1000
  private lastFetchTime = 0
  
  // Search debouncing
  private searchTimeout: NodeJS.Timeout | null = null
  private readonly SEARCH_DEBOUNCE_MS = 300
  
  // ERC-20 ABI for fetching token metadata
  private readonly ERC20_ABI = [
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)'
  ]
  
  // RPC URLs for different chains
  private readonly RPC_URLS: Record<number, string> = {
    1: 'https://eth.llamarpc.com', // Ethereum mainnet
    [CURRENT_CHAIN_ID]: CURRENT_RPC_URL // Current supported chain
  }

  async getTokenList(): Promise<TokenList> {
    const now = Date.now()
    
    // Return cached list if still valid
    if (this.tokenList && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      console.log('Returning cached token list')
      return this.tokenList
    }

    // Prevent multiple simultaneous requests
    if (this.loading) {
      // Wait for ongoing request
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (this.tokenList) return this.tokenList
    }

    this.loading = true

    try {
      console.log('Attempting to fetch Uniswap token list')
      const response = await fetch(this.UNISWAP_TOKEN_LIST_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token list: ${response.status} ${response.statusText}`)
      }

      const tokenList: TokenList = await response.json()
      console.log('Successfully fetched Uniswap token list with', tokenList.tokens.length, 'tokens')
      this.tokenList = tokenList
      this.lastFetchTime = now
      
      return tokenList
    } catch (error) {
      console.error('Error fetching Uniswap token list, using fallback:', error)
      // Return fallback tokens if fetch fails
      const fallbackList = this.getFallbackTokenList()
      this.tokenList = fallbackList
      this.lastFetchTime = now
      return fallbackList
    } finally {
      this.loading = false
    }
  }

  async getTokensForChain(chainId: number): Promise<Token[]> {
    const tokenList = await this.getTokenList()
    const tokens = tokenList.tokens.filter(token => token.chainId === chainId)
    
    // If no tokens found for the specific chain, return fallback tokens
    if (tokens.length === 0) {
      const fallbackList = this.getFallbackTokenList()
      return fallbackList.tokens.filter(token => token.chainId === chainId)
    }
    
    return tokens
  }

  async searchTokens(query: string, chainId?: number): Promise<Token[]> {
    console.log('searchTokens called with query:', query, 'chainId:', chainId)
    const tokenList = await this.getTokenList()
    let tokens = tokenList.tokens
    console.log('Total tokens in list:', tokens.length)

    if (chainId) {
      tokens = tokens.filter(token => token.chainId === chainId)
      console.log('Tokens after filtering by chainId', chainId, ':', tokens.length)
      
      // If no tokens found for the specific chain, use fallback tokens
      if (tokens.length === 0) {
        console.log('No tokens found for chainId, using fallback')
        const fallbackList = this.getFallbackTokenList()
        tokens = fallbackList.tokens.filter(token => token.chainId === chainId)
        console.log('Fallback tokens for chainId', chainId, ':', tokens.length)
      }
    }

    if (!query.trim()) {
      console.log('Empty query, returning first 50 tokens')
      return tokens.slice(0, 50) // Return first 50 tokens if no query
    }

    const lowerQuery = query.toLowerCase()
    console.log('Processing query:', lowerQuery)
    
    // Check if query looks like an address
    const isAddress = ethers.isAddress(query)
    console.log('Is address check:', isAddress, 'for query:', query)
    
    if (isAddress && chainId) {
      console.log('Query looks like an address, checking existing tokens first')
      
      // First check if we already have this token in our list
      const existingToken = tokens.find(token => 
        token.address.toLowerCase() === lowerQuery
      )
      
      if (existingToken) {
        console.log('Found existing token for address:', existingToken)
        return [existingToken]
      }
      
      // If not found in list, try to fetch from chain
      console.log('Token not found in list, fetching from chain with address:', query, 'chainId:', chainId)
      const chainToken = await this.fetchTokenFromChain(query, chainId)
      if (chainToken) {
        console.log('Successfully fetched token from chain:', chainToken)
        return [chainToken]
      } else {
        console.log('Failed to fetch token from chain')
      }
    }
    
    // Regular search by symbol, name, or address
    console.log('Performing regular search')
    const results = tokens.filter(token => 
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery) ||
      token.address.toLowerCase() === lowerQuery
    ).slice(0, 50) // Limit results to 50
    
    console.log('Search results:', results.length, 'tokens found')
    return results
  }

  async getTokenByAddress(address: string, chainId?: number): Promise<Token | null> {
    const tokenList = await this.getTokenList()
    return tokenList.tokens.find(token => 
      token.address.toLowerCase() === address.toLowerCase() &&
      (!chainId || token.chainId === chainId)
    ) || null
  }

  async getTokenBySymbol(symbol: string, chainId?: number): Promise<Token | null> {
    const tokenList = await this.getTokenList()
    return tokenList.tokens.find(token => 
      token.symbol.toLowerCase() === symbol.toLowerCase() &&
      (!chainId || token.chainId === chainId)
    ) || null
  }

  // Fetch token metadata directly from blockchain
  async fetchTokenFromChain(address: string, chainId: number): Promise<Token | null> {
    try {
      console.log('Fetching token from chain:', address, 'on chainId:', chainId)
      
      // Validate address format
      if (!ethers.isAddress(address)) {
        console.log('Invalid address format:', address)
        return null
      }
      
      // Get RPC URL for the chain
      const rpcUrl = this.RPC_URLS[chainId]
      if (!rpcUrl) {
        console.log('No RPC URL configured for chainId:', chainId)
        return null
      }
      
      // Create provider and contract
      const provider = new ethers.JsonRpcProvider(rpcUrl)
      const contract = new ethers.Contract(address, this.ERC20_ABI, provider)
      
      // Fetch token metadata
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
      ])
      
      const token: Token = {
        chainId,
        address: address.toLowerCase(),
        name,
        symbol,
        decimals: Number(decimals)
      }
      
      console.log('Successfully fetched token from chain:', token)
      return token
    } catch (error) {
      console.error('Error fetching token from chain:', error)
      return null
    }
  }

  private getFallbackTokenList(): TokenList {
    // Fallback tokens for common chains (Ethereum mainnet, Sonic mainnet)
    return {
      name: "Fallback Token List",
      timestamp: new Date().toISOString(),
      version: { major: 1, minor: 0, patch: 0 },
      tags: {},
      logoURI: "",
      keywords: ["fallback"],
      tokens: [
        // Ethereum Mainnet (chainId: 1)
        {
          chainId: 1,
          address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          name: "Wrapped Ether",
          symbol: "WETH",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1628852295"
        },
        {
          chainId: 1,
          address: "0xA0b86a33E6441b8C4C4183b4c3Bb8C1e4E2d5f2c",
          name: "USD Coin",
          symbol: "USDC",
          decimals: 6,
          logoURI: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389"
        },
        {
          chainId: 1,
          address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          name: "Tether USD",
          symbol: "USDT",
          decimals: 6,
          logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707"
        },
        {
          chainId: 1,
          address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          name: "Wrapped BTC",
          symbol: "WBTC",
          decimals: 8,
          logoURI: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744"
        },
        // Current supported chain
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x0000000000000000000000000000000000000000", // Native S
          name: "Sonic",
          symbol: "S",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png?1595348880"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894", // WETH on Sonic Blaze
          name: "Wrapped Ether",
          symbol: "WETH",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png?1628852295"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x4A3E164684812dfB109B85F5515DA4db2aD2d0A9", // USDC on Sonic Blaze
          name: "USD Coin",
          symbol: "USDC",
          decimals: 6,
          logoURI: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x8D97Cea50351Fb4329d591682b148D43a0C3611b", // USDT on Sonic Blaze
          name: "Tether USD",
          symbol: "USDT",
          decimals: 6,
          logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x1234567890123456789012345678901234567890", // Mock WBTC
          name: "Wrapped Bitcoin",
          symbol: "WBTC",
          decimals: 8,
          logoURI: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x2345678901234567890123456789012345678901", // Mock DAI
          name: "Dai Stablecoin",
          symbol: "DAI",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x3456789012345678901234567890123456789012", // Mock LINK
          name: "Chainlink",
          symbol: "LINK",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-new-logo.png?1547034700"
        },
        {
          chainId: CURRENT_CHAIN_ID,
          address: "0x4567890123456789012345678901234567890123", // Mock UNI
          name: "Uniswap",
          symbol: "UNI",
          decimals: 18,
          logoURI: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png?1600306604"
        }
      ]
    }
  }

  // Get popular tokens for quick selection
  async getPopularTokens(chainId?: number): Promise<Token[]> {
    const popularSymbols = ['WETH', 'USDC', 'USDT', 'WBTC', 'DAI', 'LINK', 'UNI', 'AAVE', 'COMP', 'MKR']
    const tokenList = await this.getTokenList()
    let tokens = tokenList.tokens

    if (chainId) {
      tokens = tokens.filter(token => token.chainId === chainId)
      
      // If no tokens found for the specific chain, use fallback tokens
      if (tokens.length === 0) {
        const fallbackList = this.getFallbackTokenList()
        tokens = fallbackList.tokens.filter(token => token.chainId === chainId)
      }
    }

    const popularTokens = popularSymbols
      .map(symbol => tokens.find(token => token.symbol === symbol))
      .filter((token): token is Token => token !== undefined)

    // Fill remaining slots with other tokens if we don't have enough popular ones
    const remaining = Math.max(0, 10 - popularTokens.length)
    const otherTokens = tokens
      .filter(token => !popularSymbols.includes(token.symbol))
      .slice(0, remaining)

    return [...popularTokens, ...otherTokens]
  }
}

// Export singleton instance
export const tokenService = new TokenService()
