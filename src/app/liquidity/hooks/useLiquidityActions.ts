'use client'

import { useCallback } from 'react'
import { useLiquidity } from './useLiquidity'
import toast from 'react-hot-toast'

/**
 * Custom hook for handling liquidity actions with automatic position refresh
 * Provides reusable functions for add/withdraw liquidity that refresh positions before completing
 */
export function useLiquidityActions() {
  const liquidityHook = useLiquidity()
  const { addLiquidity, removeLiquidity, refreshPositions, positions, fetchPositions } = liquidityHook

  /**
   * Enhanced position refresh with proper state update handling
   */
  const enhancedRefreshPositions = useCallback(async () => {
    console.log('🔄 Enhanced position refresh starting...')
    console.log('🔍 Current positions before refresh:', positions?.length || 0)
    
    // Wait for blockchain state to update
    console.log('⏳ Waiting 3 seconds for blockchain state update...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Try multiple refresh approaches with proper error handling
    let refreshSuccess = false
    
    // Approach 1: Use refreshPositions
    console.log('🔄 Approach 1: Using refreshPositions...')
    try {
      await refreshPositions()
      console.log('✅ refreshPositions completed')
      refreshSuccess = true
    } catch (error) {
      console.warn('⚠️ refreshPositions failed:', error)
    }
    
    // Approach 2: Direct fetchPositions if first approach failed
    if (!refreshSuccess) {
      console.log('🔄 Approach 2: Using fetchPositions directly...')
      try {
        await fetchPositions()
        console.log('✅ fetchPositions completed')
        refreshSuccess = true
      } catch (error) {
        console.warn('⚠️ fetchPositions failed:', error)
      }
    }
    
    // Wait longer for React state to update and check multiple times
    console.log('⏳ Waiting for React state to update...')
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const currentPositions = liquidityHook.positions
      console.log(`🔍 Check ${i + 1}/5 - Positions count:`, currentPositions?.length || 0)
      
      if (currentPositions && currentPositions.length > 0) {
        console.log('✅ Positions successfully updated!')
        break
      }
    }
    
    console.log('✅ Enhanced refresh process completed')
  }, [refreshPositions, fetchPositions, liquidityHook.positions])

  /**
   * Performs add liquidity action and refreshes positions
   * @param params - Add liquidity parameters
   * @param onComplete - Optional callback to run after successful completion
   */
  const performAddLiquidity = useCallback(async (
    params: {
      token0Address: string
      token1Address: string
      amount0Long: string
      amount0Short: string
      amount1Long: string
      amount1Short: string
      token0Decimals: number
      token1Decimals: number
    },
    onComplete?: () => void
  ) => {
    try {
      console.log('🚀 Starting add liquidity action...')
      
      const txHash = await addLiquidity(
        params.token0Address,
        params.token1Address,
        params.amount0Long,
        params.amount0Short,
        params.amount1Long,
        params.amount1Short,
        params.token0Decimals,
        params.token1Decimals
      )

      // Success notification now handled by AddLiquidityModal popup widget
      
      // Refresh positions with enhanced reliability
      console.log('🔄 Refreshing positions after liquidity addition...')
      await enhancedRefreshPositions()
      
      console.log('✅ Add liquidity action completed successfully')
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete()
      }
      
      return txHash
    } catch (error) {
      console.error('❌ Error in add liquidity action:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add liquidity')
      throw error
    }
  }, [addLiquidity, refreshPositions])

  /**
   * Performs remove liquidity action and refreshes positions
   * @param params - Remove liquidity parameters
   * @param onComplete - Optional callback to run after successful completion
   */
  const performRemoveLiquidity = useCallback(async (
    params: {
      token0Address: string
      token1Address: string
      liquidity0Long: string
      liquidity0Short: string
      liquidity1Long: string
      liquidity1Short: string
    },
    onComplete?: () => void
  ) => {
    try {
      console.log('🚀 Starting remove liquidity action...')
      
      const txHash = await removeLiquidity(
        params.token0Address,
        params.token1Address,
        params.liquidity0Long,
        params.liquidity0Short,
        params.liquidity1Long,
        params.liquidity1Short
      )

      // toast.success(`Liquidity removed successfully! Transaction: ${txHash}`)
      //Success notification now handled by RemoveLiquidityModal popup widget
      
      // Refresh positions with enhanced reliability
      console.log('🔄 Refreshing positions after liquidity removal...')
      await enhancedRefreshPositions()
      
      console.log('✅ Remove liquidity action completed successfully')
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete()
      }
      
      return txHash
    } catch (error) {
      console.error('❌ Error in remove liquidity action:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove liquidity')
      throw error
    }
  }, [removeLiquidity, refreshPositions])

  return {
    performAddLiquidity,
    performRemoveLiquidity
  }
}
