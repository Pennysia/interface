'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import toast from 'react-hot-toast'

// Import components
import LiquidityPositionCard from './components/LiquidityPositionCard'
import AddLiquidityModal from './components/AddLiquidityModal'
import ImportPositionModal from './components/ImportTokenModal'
import RemoveLiquidityModal from './components/RemoveLiquidityModal'
import PositionOverviewModal from './components/PositionOverviewModal'

// Import hooks
import { useLiquidity, type LiquidityPosition } from './hooks/useLiquidity'

export default function LiquidityPage() {
  const { ready, authenticated } = usePrivy()
  const { positions, loading, error, isAuthenticated, refreshPositions } = useLiquidity()
  const [showAddLiquidityModal, setShowAddLiquidityModal] = useState(false)
  const [showRemoveLiquidityModal, setShowRemoveLiquidityModal] = useState(false)
  const [showImportPositionModal, setShowImportPositionModal] = useState(false)
  const [showPositionOverviewModal, setShowPositionOverviewModal] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<LiquidityPosition | null>(null)

  if (!ready) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[var(--background)] pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[var(--background)] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Page Header
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white ">Overview</h1>
          <p className="font-light text-sm text-gray-600 dark:text-gray-400">Provide liquidity to earn fees and rewards from trading activity</p>
        </div> */}

        {/* Portfolio Stats */}
        {/* <PortfolioStats /> */}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Your Liquidity Position - Takes 2/3 on large screens */}
          <div className="lg:col-span-3">
            <div className="text-sm transition-colors duration-300">
              <div className="flex items-left md:items-center justify-between mb-6 flex-col md:flex-row w-full gap-4">
                <div className="flex flex-col items-left gap-2">
                  <h2 className="text-2xl md:text-3xl font-normal text-gray-900 dark:text-white transition-colors duration-300">Your Positions</h2>
                  <p className="font-light text-sm text-gray-600 dark:text-gray-400">Provide liquidity to earn fees and rewards from trading activity</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowImportPositionModal(true)}
                    className="w-full md:w-auto px-4 py-3 bg-transparent dark:bg-transparent border border-gray-600 dark:border-gray-400 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-400 hover:cursor-pointer"
                  >
                    Import Position
                  </button>
                  <button
                    onClick={() => setShowAddLiquidityModal(true)}
                    className="w-full md:w-auto px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors hover:cursor-pointer"
                  >
                    Create Liquidity
                  </button>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-center items-center">
                {!isAuthenticated || !authenticated ? (
                  <div className="text-center p-12 border border-gray-300 dark:border-gray-600 rounded-2xl w-full">
                    <p className="text-gray-600 dark:text-gray-400">Please connect your wallet to view your liquidity positions</p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Loading your positions...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400 mb-2">Error loading positions</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
                  </div>
                ) : positions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No liquidity positions found</p>
                    <button
                      onClick={() => setShowAddLiquidityModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Add Your First Position
                    </button>
                  </div>
                ) : (
                  positions.map((position: LiquidityPosition) => (
                    <LiquidityPositionCard
                      key={position.id}
                      position={position}
                      onViewPosition={() => {
                        setSelectedPosition(position)
                        setShowPositionOverviewModal(true)
                      }}
                      onAddLiquidity={() => {
                        setSelectedPosition(position)
                        setShowAddLiquidityModal(true)
                      }}
                      onRemoveLiquidity={() => {
                        setSelectedPosition(position)
                        setShowRemoveLiquidityModal(true)
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddLiquidityModal
        isOpen={showAddLiquidityModal}
        onClose={() => setShowAddLiquidityModal(false)}
        selectedPosition={selectedPosition}
        onTransactionComplete={refreshPositions}
      />
      
      <ImportPositionModal
        isOpen={showImportPositionModal}
        onClose={() => setShowImportPositionModal(false)}
        onPositionImported={refreshPositions}
      />
      
      <PositionOverviewModal
        isOpen={showPositionOverviewModal}
        onClose={() => setShowPositionOverviewModal(false)}
        position={selectedPosition}
        onAddLiquidity={() => {
          setShowPositionOverviewModal(false)
          setShowAddLiquidityModal(true)
        }}
        onRemoveLiquidity={() => {
          setShowPositionOverviewModal(false)
          setShowRemoveLiquidityModal(true)
        }}
      />
      
      <RemoveLiquidityModal
        isOpen={showRemoveLiquidityModal}
        onClose={() => setShowRemoveLiquidityModal(false)}
        position={selectedPosition}
        onAddLiquidity={() => {
          setShowRemoveLiquidityModal(false)
          setShowAddLiquidityModal(true)
        }}
        onTransactionComplete={refreshPositions}
      />
    </div>
  )
}
