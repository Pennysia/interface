'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { LiquidityPosition } from '../hooks/useLiquidity'
import { useScrollLock } from '../hooks/useScrollLock'
import PositionOverview from './PositionOverview'

interface PositionOverviewModalProps {
    isOpen: boolean
    onClose: () => void
    position: LiquidityPosition | null
    onAddLiquidity?: () => void
    onRemoveLiquidity?: () => void
}

export default function PositionOverviewModal({
    isOpen,
    onClose,
    position,
    onAddLiquidity,
    onRemoveLiquidity
}: PositionOverviewModalProps) {
    // Lock background scroll when modal is open
    useScrollLock(isOpen)
    
    // Early return after all hooks
    if (!isOpen || !position) return null

    return (
        <div className="fixed inset-0 bg-gray-200/30 dark:bg-gray-800/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[var(--background)] rounded-2xl w-full max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto md:overflow-y-hidden">
                <div className="p-6 pb-8">
                    {/* Header */}
                    <div className="flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="p-2 border border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors hover:cursor-pointer"
                        >
                            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Position Overview Component */}
                    <div className="mb-8">
                        <PositionOverview position={position} />
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col gap-4">
                        <button
                            onClick={() => {
                                onClose()
                                onRemoveLiquidity?.()
                            }}
                            className="w-full border border-gray-400 dark:border-gray-600 bg-transparent hover:bg-gray-300 dark:hover:bg-gray-400 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-xl font-semibold transition-colors hover:cursor-pointer"
                        >
                            Withdraw Liquidity
                        </button>
                        <button
                            onClick={() => {
                                onClose()
                                onAddLiquidity?.()
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors hover:cursor-pointer"
                        >
                            Add Liquidity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
