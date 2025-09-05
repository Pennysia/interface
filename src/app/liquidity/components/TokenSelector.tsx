'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { tokenService, type Token } from '../services/tokenService'
import { ChainId } from '@/lib'
import { CURRENT_CHAIN_ID } from '@/config/chains'

interface TokenSelectorProps {
  value: Token | null
  onChange: (token: Token | null) => void
  placeholder: string
  chainId?: number
  excludeToken?: Token | null // Token to exclude from selection
}

export default function TokenSelector({ value, onChange, placeholder, chainId = CURRENT_CHAIN_ID, excludeToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(value)
  const [selectedImgError, setSelectedImgError] = useState(false)
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({})
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load initial tokens when component mounts
  useEffect(() => {
    loadInitialTokens()
  }, [chainId])

  // Update selected token when value prop changes
  useEffect(() => {
    setSelectedToken(value)
    setSelectedImgError(false)
  }, [value])

  // Search tokens when query changes
  useEffect(() => {
    if (isOpen) {
      searchTokens()
    }
  }, [searchQuery, isOpen, chainId])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const loadInitialTokens = async () => {
    setLoading(true)
    try {
      const popularTokens = await tokenService.getPopularTokens(chainId)
      // Filter out excluded token
      const filteredTokens = excludeToken 
        ? popularTokens.filter(token => token.address !== excludeToken.address)
        : popularTokens
      setTokens(filteredTokens)
    } catch (error) {
      console.error('Error loading tokens:', error)
      setTokens([])
    } finally {
      setLoading(false)
    }
  }

  const searchTokens = async () => {
    console.log('TokenSelector: searchTokens called with query:', searchQuery, 'chainId:', chainId)
    setLoading(true)
    try {
      console.log('TokenSelector: About to call tokenService.searchTokens')
      const searchResults = await tokenService.searchTokens(searchQuery, chainId)
      console.log('TokenSelector: searchTokens returned:', searchResults.length, 'results')
      // Filter out excluded token
      const filteredResults = excludeToken 
        ? searchResults.filter(token => token.address !== excludeToken.address)
        : searchResults
      setTokens(filteredResults)
    } catch (error) {
      console.error('TokenSelector: Error searching tokens:', error)
      setTokens([])
    } finally {
      setLoading(false)
    }
  }

  const handleTokenSelect = (token: Token) => {
    onChange(token)
    setSelectedToken(token)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleDropdownToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchQuery('')
      loadInitialTokens()
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleDropdownToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-800 dark:bg-gray-700 border border-gray-700 dark:border-gray-600 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        {selectedToken ? (
          <div className="flex items-center space-x-3">
            {selectedToken.logoURI ? (
              <Image 
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
                onError={() => setSelectedImgError(true)}
              />
            ) : null}
            <div 
              className={`w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                selectedToken.logoURI && !selectedImgError ? 'hidden' : 'flex'
              }`}
            >
              {selectedToken.symbol[0]}
            </div>
            <div className="text-left">
              <div className="text-white font-medium">{selectedToken.symbol}</div>
              <div className="text-gray-400 text-sm truncate max-w-32">{selectedToken.name}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Dark blurred backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 dark:bg-gray-700 border border-gray-700 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-700 dark:border-gray-600">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 dark:bg-gray-600 border border-gray-600 dark:border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Token List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading tokens...
              </div>
            ) : tokens.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchQuery ? 'No tokens found' : 'No tokens available'}
              </div>
            ) : (
              tokens.map((token) => (
                <button
                  key={`${token.chainId}-${token.address}`}
                  onClick={() => handleTokenSelect(token)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {token.logoURI ? (
                      <Image 
                        src={token.logoURI}
                        alt={token.symbol}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                        onError={() => setImgErrorMap((m) => ({ ...m, [token.address]: true }))}
                      />
                    ) : null}
                    <div 
                      className={`w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        token.logoURI && !imgErrorMap[token.address] ? 'hidden' : 'flex'
                      }`}
                    >
                      {token.symbol[0]}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">{token.symbol}</div>
                      <div className="text-gray-400 text-sm truncate max-w-40">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{token.decimals} decimals</div>
                    <div className="text-gray-400 text-xs truncate max-w-24">{token.address.slice(0, 6)}...{token.address.slice(-4)}</div>
                  </div>
                </button>
              ))
            )}
          </div>
          </div>
        </>
      )}
    </div>
  )
}
