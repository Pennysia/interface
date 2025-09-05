'use client'

import { useState } from 'react'
import Image from 'next/image'
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useScrollLock } from '../hooks/useScrollLock'
import TokenSelectorModal from '../../../components/TokenSelectorModal'
import { useLiquidity } from '../hooks/useLiquidity'
import { type Token } from '../../../components/TokenSelectorModal'
import toast from 'react-hot-toast'

interface ImportPositionModalProps {
  isOpen: boolean
  onClose: () => void
  onPositionImported?: () => Promise<void>
}

export default function ImportPositionModal({ isOpen, onClose, onPositionImported }: ImportPositionModalProps) {
  const [selectedTokenA, setSelectedTokenA] = useState<Token | null>(null)
  const [selectedTokenB, setSelectedTokenB] = useState<Token | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [showTokenSelectorA, setShowTokenSelectorA] = useState(false)
  const [showTokenSelectorB, setShowTokenSelectorB] = useState(false)
  
  const { fetchPositions } = useLiquidity()
  
  // Lock background scroll when modal is open
  useScrollLock(isOpen)
  
  if (!isOpen) return null

  // Reset state when modal opens
  const handleModalOpen = () => {
    if (isOpen) {
      setSelectedTokenA(null)
      setSelectedTokenB(null)
      setIsImporting(false)
    }
  }

  // Token sorting logic to ensure token0 < token1 (same as AddLiquidityModal)
  const sortTokens = (tokenA: Token, tokenB: Token): [Token, Token] => {
    return tokenA.address.toLowerCase() < tokenB.address.toLowerCase() 
      ? [tokenA, tokenB] 
      : [tokenB, tokenA]
  }

  const handleTokenASelection = (token: Token | null) => {
    if (!token) {
      setSelectedTokenA(null)
      return
    }

    // Prevent selecting the same token
    if (selectedTokenB && token.address.toLowerCase() === selectedTokenB.address.toLowerCase()) {
      toast.error('Cannot select the same token for both positions')
      return
    }

    setSelectedTokenA(token)

    // Auto-sort tokens if both are selected
    if (selectedTokenB) {
      const [token0, token1] = sortTokens(token, selectedTokenB)
      setSelectedTokenA(token0)
      setSelectedTokenB(token1)
    }
  }

  const handleTokenBSelection = (token: Token | null) => {
    if (!token) {
      setSelectedTokenB(null)
      return
    }

    // Prevent selecting the same token
    if (selectedTokenA && token.address.toLowerCase() === selectedTokenA.address.toLowerCase()) {
      toast.error('Cannot select the same token for both positions')
      return
    }

    setSelectedTokenB(token)

    // Auto-sort tokens if both are selected
    if (selectedTokenA) {
      const [token0, token1] = sortTokens(selectedTokenA, token)
      setSelectedTokenA(token0)
      setSelectedTokenB(token1)
    }
  }

  const handleImportPosition = async () => {
    if (!selectedTokenA || !selectedTokenB) {
      toast.error('Please select both tokens')
      return
    }

    setIsImporting(true)
    
    try {
      console.log('🔍 Importing position for pair:', selectedTokenA.symbol, '/', selectedTokenB.symbol)
      
      // Refresh positions to fetch the specific pair
      await fetchPositions()
      
      // Call the callback to refresh main page positions
      if (onPositionImported) {
        await onPositionImported()
      }
      
      toast.success(`Position imported for ${selectedTokenA.symbol}/${selectedTokenB.symbol}`)
      onClose()
    } catch (error) {
      console.error('Error importing position:', error)
      toast.error('Failed to import position')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Import Position</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <p className="text-gray-400 mb-8">
            Select a token pair to import your existing liquidity position.
          </p>
          
          <div className="space-y-4 mb-8">
            {/* First Token Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Token
              </label>
              <button
                onClick={() => setShowTokenSelectorA(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {selectedTokenA ? (
                    <>
                      {/* Image with fallback */}
                      {selectedTokenA.logoURI ? (
                        <Image
                          src={selectedTokenA.logoURI}
                          alt={selectedTokenA.symbol}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            // Hide the image and let the gradient fallback show
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                          selectedTokenA.logoURI ? 'hidden' : 'flex'
                        }`}
                      >
                        {selectedTokenA.symbol[0]}
                      </div>
                      <span className="text-white font-medium">{selectedTokenA.symbol}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select first token</span>
                  )}
                </div>
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Second Token Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Second Token
              </label>
              <button
                onClick={() => setShowTokenSelectorB(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {selectedTokenB ? (
                    <>
                      {selectedTokenB.logoURI ? (
                        <Image
                          src={selectedTokenB.logoURI}
                          alt={selectedTokenB.symbol}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs ${
                          selectedTokenB.logoURI ? 'hidden' : 'flex'
                        }`}
                      >
                        {selectedTokenB.symbol[0]}
                      </div>
                      <span className="text-white font-medium">{selectedTokenB.symbol}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select second token</span>
                  )}
                </div>
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Import Button */}
          <button 
            onClick={handleImportPosition}
            disabled={!selectedTokenA || !selectedTokenB || isImporting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Importing Position...
              </>
            ) : (
              'Import Position'
            )}
          </button>
          
          {/* Help Text */}
          {selectedTokenA && selectedTokenB && (
            <p className="text-gray-400 text-sm text-center mt-4">
              Importing position for {selectedTokenA.symbol}/{selectedTokenB.symbol}
            </p>
          )}
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
    </div>
  )
}
