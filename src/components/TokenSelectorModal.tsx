'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ethers } from 'ethers'
import { usePrivy } from '@privy-io/react-auth'
import { useWallets } from '@privy-io/react-auth'
import { useStore } from '../store/useStore'
import { ERC20_ABI } from '../lib/abis'
import { CURRENT_CHAIN_ID, CURRENT_RPC_URL, CURRENT_NATIVE_CURRENCY } from '@/config/chains'

// Token interface
interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  chainId: number
  balance?: string
}

interface TokenSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onTokenSelect: (token: Token) => void
  title?: string
  excludeToken?: Token | null
}

// TokenItem component for consistent token display
interface TokenItemProps {
  token: Token
  balance: string
  onClick: () => void
  showAddress?: boolean
  isWalletToken?: boolean
}

function TokenItem({ token, balance, onClick, showAddress = false, isWalletToken = false }: TokenItemProps) {
  const [imgError, setImgError] = useState(false)
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-700 transition-colors group ${
        isWalletToken ? 'bg-gray-700/30' : ''
      }`}
    >
      {/* Show Sonic logo for native token, otherwise use token's logoURI or fallback */}
      {token.address === ethers.ZeroAddress ? (
        <Image
          src="/sonic-logo.avif"
          alt="Sonic"
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
        />
      ) : token.logoURI && !imgError ? (
        <Image
          src={token.logoURI}
          alt={token.symbol}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {token.symbol.charAt(0)}
        </div>
      )}
      <div className="flex-1 text-left">
        <div className="text-white font-medium flex items-center">
          {token.symbol}
          {isWalletToken && (
            <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
          )}
        </div>
        <div className="text-gray-400 text-sm">{token.name}</div>
        {showAddress && token.address && (
          <div className="text-gray-500 text-xs font-mono">
            {token.address.slice(0, 6)}...{token.address.slice(-4)}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className={`font-medium ${
          parseFloat(balance) > 0 ? 'text-white' : 'text-gray-500'
        }`}>
          {balance}
        </div>
        <div className="text-gray-400 text-sm">Balance</div>
      </div>
    </button>
  )
}

export default function TokenSelectorModal({ 
  isOpen, 
  onClose, 
  onTokenSelect, 
  title = "Select a token",
  excludeToken 
}: TokenSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Token[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [walletTokens, setWalletTokens] = useState<Token[]>([])
  const [isLoadingWalletTokens, setIsLoadingWalletTokens] = useState(false)
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({})
  
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const { isConnected } = useStore()
  
  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow
      
      // Disable scrolling
      document.body.style.overflow = 'hidden'
      
      // Cleanup function to restore scrolling
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  // Using ERC20_ABI from abis.js

  // Native token definition
  const NATIVE_TOKEN: Token = {
    address: '0x0000000000000000000000000000000000000000',
    symbol: CURRENT_NATIVE_CURRENCY.symbol,
    name: CURRENT_NATIVE_CURRENCY.name,
    decimals: CURRENT_NATIVE_CURRENCY.decimals,
    chainId: CURRENT_CHAIN_ID,
    logoURI: '/tokens/sonic.png'
  }

  // Pure dynamic ERC20 discovery - no hardcoded tokens
  const discoverERC20TokensDynamic = async (
    provider: ethers.Provider, 
    userAddress: string, 
    tokens: Token[], 
    balances: Record<string, string>
  ) => {
    try {
      console.log('🔍 Starting comprehensive transaction scan...')
      
      // Get current block and determine scan range
      const currentBlock = await provider.getBlockNumber()
      const scanBlocks = 700000 // Scan last 100k blocks for comprehensive coverage
      const fromBlock = Math.max(0, currentBlock - scanBlocks)
      
      console.log(`📊 Scanning blocks ${fromBlock} to ${currentBlock} (${currentBlock - fromBlock} blocks)`)
      
      // ERC20 Transfer event signature: Transfer(address,address,uint256)
      const transferTopic = ethers.id('Transfer(address,address,uint256)')
      
      // Scan for transfers TO the user
      console.log('📡 Scanning for incoming transfers...')
      const incomingFilter = {
        topics: [
          transferTopic,
          null, // from (any address)
          ethers.zeroPadValue(userAddress, 32) // to (user address)
        ],
        fromBlock: fromBlock,
        toBlock: 'latest'
      }
      
      // Scan for transfers FROM the user
      console.log('📡 Scanning for outgoing transfers...')
      const outgoingFilter = {
        topics: [
          transferTopic,
          ethers.zeroPadValue(userAddress, 32), // from (user address)
          null // to (any address)
        ],
        fromBlock: fromBlock,
        toBlock: 'latest'
      }
      
      // Get both sets of logs in parallel
      const [incomingLogs, outgoingLogs] = await Promise.all([
        provider.getLogs(incomingFilter),
        provider.getLogs(outgoingFilter)
      ])
      
      console.log(`📋 Found ${incomingLogs.length} incoming + ${outgoingLogs.length} outgoing transfers`)
      
      // Combine and extract unique token contract addresses
      const allLogs = [...incomingLogs, ...outgoingLogs]
      const tokenAddresses = new Set<string>()
      
      allLogs.forEach(log => {
        if (log.address && ethers.isAddress(log.address)) {
          tokenAddresses.add(log.address.toLowerCase())
        }
      })
      
      console.log(`🪙 Discovered ${tokenAddresses.size} unique token contracts`)
      
      // Check current balance for each discovered token
      let foundTokens = 0
      for (const tokenAddress of tokenAddresses) {
        try {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
          
          // Get token metadata and current balance
          const [balance, symbol, name, decimals] = await Promise.all([
            contract.balanceOf(userAddress),
            contract.symbol().catch(() => `TOKEN_${tokenAddress.slice(0, 6)}`),
            contract.name().catch(() => `Token ${tokenAddress.slice(0, 6)}`),
            contract.decimals().catch(() => 18)
          ])
          
          // Only include tokens with positive balance
          if (balance > 0n) {
            const formattedBalance = ethers.formatUnits(balance, decimals)
            const balanceNum = parseFloat(formattedBalance)
            
            if (balanceNum > 0) {
              const tokenWithBalance = {
                address: tokenAddress,
                symbol: symbol,
                name: name,
                decimals: Number(decimals),
                chainId: CURRENT_CHAIN_ID,
                balance: balanceNum.toFixed(4)
              }
              tokens.push(tokenWithBalance)
              balances[tokenAddress] = balanceNum.toFixed(4)
              foundTokens++
              console.log(`✅ ${symbol} (${name}): ${formattedBalance}`)
            }
          }
        } catch (error) {
          // Silently skip tokens that fail (might not be valid ERC20)
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.debug(`Skipping ${tokenAddress}:`, errorMessage)
        }
      }
      
      console.log(`🎉 Successfully discovered ${foundTokens} ERC20 tokens with balances`)
      
    } catch (error) {
      console.error('❌ Error in dynamic token discovery:', error)
      throw error
    }
  }

  // Load wallet tokens (native + ERC20s)
  const loadWalletTokens = async () => {
    if (!isConnected || !authenticated || !wallets.length) {
      setWalletTokens([])
      setTokenBalances({})
      return
    }

    setIsLoadingWalletTokens(true)
    try {
      const wallet = wallets[0]
      const ethersProvider = await wallet.getEthereumProvider()
      const provider = new ethers.BrowserProvider(ethersProvider)
      const userAddress = wallet.address

      const tokens: Token[] = []
      const balances: Record<string, string> = {}

      // 1. Get native token balance
      try {
        const nativeBalance = await provider.getBalance(userAddress)
        const formattedBalance = ethers.formatEther(nativeBalance)
        const balanceNum = parseFloat(formattedBalance)
        if (balanceNum > 0) {
          const nativeTokenWithBalance = {
            ...NATIVE_TOKEN,
            balance: balanceNum.toFixed(4)
          }
          tokens.push(nativeTokenWithBalance)
        }
        // Always set the balances entry so UI reads a numeric value instead of undefined
        balances[NATIVE_TOKEN.address] = balanceNum.toFixed(4)
      } catch (error) {
        console.error('Error fetching native balance:', error)
        // Ensure key exists even on error
        balances[NATIVE_TOKEN.address] = '0.00'
      }

      // 2. Get ERC20 tokens by scanning transaction history (no hardcoded lists)
      console.log('🔍 Starting dynamic ERC20 token discovery for address:', userAddress)
      
      try {
        await discoverERC20TokensDynamic(provider, userAddress, tokens, balances)
        const erc20Count = tokens.length - (tokens.find(t => t.symbol === 'S') ? 1 : 0)
        console.log(`✅ Token discovery completed. Found ${erc20Count} ERC20 tokens`)
      } catch (error) {
        console.error('❌ Error discovering ERC20 tokens:', error)
        console.log('ℹ️ No fallback - discovery is purely transaction-based')
      }

      setWalletTokens(tokens)
      setTokenBalances(balances)
    } catch (error) {
      console.error('Error loading wallet tokens:', error)
    } finally {
      setIsLoadingWalletTokens(false)
    }
  }

  // Load wallet tokens when modal opens and user is authenticated
  useEffect(() => {
    if (isOpen && authenticated && wallets.length > 0) {
      loadWalletTokens()
    }
  }, [isOpen, authenticated, wallets.length])

  // On-chain token lookup function
  const lookupTokenByAddress = async (address: string): Promise<Token | null> => {
    try {
      if (!ethers.isAddress(address)) {
        return null
      }

      // Get provider from wallet or use public RPC
      let provider: ethers.Provider
      let userAddress: string | undefined
      
      if (authenticated && wallets.length > 0) {
        const wallet = wallets[0]
        const ethersProvider = await wallet.getEthereumProvider()
        provider = new ethers.BrowserProvider(ethersProvider)
        userAddress = wallet.address
      } else {
        // Fallback to public RPC
        provider = new ethers.JsonRpcProvider(CURRENT_RPC_URL)
      }

      const contract = new ethers.Contract(address, ERC20_ABI, provider)
      
      // Fetch token info and balance in parallel
      const [name, symbol, decimals, balance] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        userAddress ? contract.balanceOf(userAddress) : Promise.resolve('0')
      ])

      // Format the balance
      const formattedBalance = userAddress 
        ? parseFloat(ethers.formatUnits(balance, decimals)).toFixed(4)
        : '0.00'

      return {
        address: address,
        name: name,
        symbol: symbol,
        decimals: Number(decimals),
        chainId: CURRENT_CHAIN_ID,
        balance: formattedBalance
      }
    } catch (error) {
      console.error('Error looking up token:', error)
      return null
    }
  }

  // Handle search input changes
  const handleSearchChange = async (query: string) => {
    setSearchQuery(query)
    setSearchError(null)
    
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    // Check if query looks like an address
    if (query.startsWith('0x') && query.length >= 10) {
      setIsSearching(true)
      const token = await lookupTokenByAddress(query)
      
      if (token) {
        setSearchResults([token])
      } else {
        setSearchResults([])
        setSearchError('Token not found or invalid contract address')
      }
      setIsSearching(false)
    } else {
      // For non-address queries, filter popular tokens
      const filtered = popularTokens.filter(token => 
        token.symbol.toLowerCase().includes(query.toLowerCase()) ||
        token.name.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
    }
  }

  // Popular tokens data with zero balance by default
  const popularTokens = [
    { 
      symbol: CURRENT_NATIVE_CURRENCY.symbol, 
      name: CURRENT_NATIVE_CURRENCY.name, 
      logoURI: '/tokens/sonic.png', 
      address: '0x0000000000000000000000000000000000000000', 
      decimals: CURRENT_NATIVE_CURRENCY.decimals, 
      chainId: CURRENT_CHAIN_ID,
      balance: '0.00'
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin', 
      logoURI: '/tokens/usdc.png', 
      address: '0xa0b86a33e6ba3e5b6b7e3d4b5c6d7e8f9a0b1c2d', 
      decimals: 6, 
      chainId: CURRENT_CHAIN_ID,
      balance: '0.00'
    },
    { 
      symbol: 'USDT', 
      name: 'Tether USD', 
      logoURI: '/tokens/usdt.png', 
      address: '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0', 
      decimals: 6, 
      chainId: CURRENT_CHAIN_ID,
      balance: '0.00'
    },
    { 
      symbol: 'WBTC', 
      name: 'Wrapped Bitcoin', 
      logoURI: '/tokens/wbtc.png', 
      address: '0xc2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1', 
      decimals: 8, 
      chainId: CURRENT_CHAIN_ID,
      balance: '0.00'
    },
  ]

  if (!isOpen) return null

  const handleTokenClick = (token: Token) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden relative">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search name or paste address"
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
        
        {/* Token List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-1">
            {/* Loading wallet tokens */}
            {isLoadingWalletTokens && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">Loading your tokens...</span>
              </div>
            )}

            {/* Loading search */}
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                <span className="ml-3 text-gray-400">Searching...</span>
              </div>
            )}
            
            {/* Error state */}
            {searchError && (
              <div className="text-center py-8">
                <div className="text-red-400 mb-2">⚠️ {searchError}</div>
                <div className="text-gray-500 text-sm">Please check the contract address and try again</div>
              </div>
            )}
            
            {/* Token lists */}
            {!isSearching && !searchError && !isLoadingWalletTokens && (
              <>
                {/* Show search results if searching */}
                {searchQuery && (
                  <>
                    <div className="text-sm font-medium text-gray-400 mb-4">
                      Search Results
                    </div>
                    {searchResults.length > 0 ? (
                      searchResults.map((token) => {
                        const isExcluded = excludeToken?.address === token.address
                        if (isExcluded) return null

                        return (
                          <TokenItem
                            key={token.address}
                            token={token}
                            balance={tokenBalances[token.address] || '0.00'}
                            onClick={() => handleTokenClick(token)}
                            showAddress={true}
                          />
                        )
                      })
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">No tokens found</div>
                        <div className="text-gray-500 text-sm">
                          {searchQuery.startsWith('0x') 
                            ? 'Try pasting a valid contract address'
                            : 'Try searching by token symbol or name'
                          }
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Show wallet tokens and popular tokens when not searching */}
                {!searchQuery && (
                  <>
                    {/* Wallet Tokens Section */}
                    {authenticated && walletTokens.length > 0 && (
                      <>
                        <div className="text-sm font-medium text-gray-400 mb-4 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Your Tokens
                        </div>
                        {walletTokens.map((token) => {
                          const isExcluded = excludeToken?.address === token.address
                          if (isExcluded) return null

                          return (
                            <TokenItem
                              key={token.address}
                              token={token}
                              balance={tokenBalances[token.address] || '0.00'}
                              onClick={() => handleTokenClick(token)}
                              showAddress={false}
                              isWalletToken={true}
                            />
                          )
                        })}
                        
                        {/* Divider */}
                        <div className="border-t border-gray-700 my-6"></div>
                      </>
                    )}

                    {/* Popular Tokens Section */}
                    <div className="text-sm font-medium text-gray-400 mb-4">
                      Popular Tokens
                    </div>
                    {popularTokens.map((token) => {
                      const isExcluded = excludeToken?.address === token.address
                      // Don't show popular tokens that are already in wallet tokens
                      const isInWallet = walletTokens.some(wt => wt.address.toLowerCase() === token.address.toLowerCase())
                      
                      if (isExcluded || isInWallet) return null

                      return (
                        <TokenItem
                          key={token.address}
                          token={token}
                          balance="0.00"
                          onClick={() => handleTokenClick(token)}
                          showAddress={false}
                        />
                      )
                    })}

                    {/* No wallet connection message */}
                    {!authenticated && (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">Connect your wallet</div>
                        <div className="text-gray-500 text-sm">
                          Connect your wallet to see your token balances
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Export the Token type for use in other components
export type { Token }
