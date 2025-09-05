'use client'

import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { LiquidityPosition } from '../hooks/useLiquidity'

interface LiquidityPositionCardProps {
  position: LiquidityPosition
  onViewPosition?: () => void
  onAddLiquidity?: () => void
  onRemoveLiquidity?: () => void
}

export default function LiquidityPositionCard({ position, onViewPosition, onAddLiquidity, onRemoveLiquidity }: LiquidityPositionCardProps) {
  return (
    <div 
      onClick={onViewPosition}
      className="w-full max-w-2xl rounded-xl border border-gray-300 dark:border-gray-800 py-4 px-6 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-all duration-200 cursor-pointer group"
    >
      <div className="space-y-4">
        {/* Header - Token pair and total value */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Token pair icons */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center relative z-10">
                <span className="text-white text-xs font-bold">{position.token0Symbol}</span>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center -ml-2">
                <span className="text-white text-xs font-bold">{position.token1Symbol}</span>
              </div>
            </div>
        
            {/* Pair name */}
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{position.pair}</h3>
            </div>
          </div>
        </div>

        {/* User's LP Token Amounts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Token 0 LP Tokens */}
          <div className="bg-gray-200/30 dark:bg-gray-800/40 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-gray-900 dark:text-white font-medium">{position.token0Symbol}-LPTokens</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">Long:</span>
                <span className="text-gray-900 dark:text-white font-mono">{position.userLongX}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600 dark:text-red-400">Short:</span>
                <span className="text-gray-900 dark:text-white font-mono">{position.userShortX}</span>
              </div>
            </div>
          </div>

          {/* Token 1 LP Tokens */}
          <div className="bg-gray-200/30 dark:bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-gray-900 dark:text-white font-medium">{position.token1Symbol}-LP Tokens</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600 dark:text-green-400">Long:</span>
                <span className="text-gray-900 dark:text-white font-mono">{position.userLongY}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600 dark:text-red-400">Short:</span>
                <span className="text-gray-900 dark:text-white font-mono">{position.userShortY}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
