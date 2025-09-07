import { useState, useEffect, useCallback } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { getPoolService, type PoolData, type TokenData } from '../services/poolService'

export interface UsePoolsReturn {
  pools: PoolData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePools(): UsePoolsReturn {
  const [pools, setPools] = useState<PoolData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { ready, authenticated } = usePrivy()

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Create a provider for read-only operations
      const provider = new ethers.JsonRpcProvider('https://rpc.soniclabs.com')
      
      const poolService = getPoolService(provider)
      
      // Get all pools from genesis or deployment block
      // Start from block 0 to capture all historical pools
      const fromBlock = 0
      
      const poolData = await poolService.getAllPools(fromBlock)
      setPools(poolData)
    } catch (err) {
      console.error('Error fetching pools:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch pools')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchPools()
  }, [fetchPools])

  useEffect(() => {
    // Fetch pools immediately, don't wait for wallet connection
    fetchPools()
  }, [fetchPools])

  return {
    pools,
    loading,
    error,
    refetch
  }
}

export interface UsePoolDetailsReturn {
  poolData: PoolData | null
  liquidityBreakdown: {
    token0Long: string
    token0Short: string
    token1Long: string
    token1Short: string
    totalLiquidity: string
  } | null
  loading: boolean
  error: string | null
}

export function usePoolDetails(pairId: string | null): UsePoolDetailsReturn {
  const [poolData, setPoolData] = useState<PoolData | null>(null)
  const [liquidityBreakdown, setLiquidityBreakdown] = useState<{
    token0Long: string
    token0Short: string
    token1Long: string
    token1Short: string
    totalLiquidity: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!pairId) {
      setPoolData(null)
      setLiquidityBreakdown(null)
      return
    }

    const fetchPoolDetails = async () => {
      try {
        setLoading(true)
        setError(null)

        const provider = new ethers.JsonRpcProvider('https://rpc.soniclabs.com')
        const poolService = getPoolService(provider)

        const breakdown = await poolService.getLiquidityBreakdown(pairId)
        setLiquidityBreakdown(breakdown)
      } catch (err) {
        console.error('Error fetching pool details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch pool details')
      } finally {
        setLoading(false)
      }
    }

    fetchPoolDetails()
  }, [pairId])

  return {
    poolData,
    liquidityBreakdown,
    loading,
    error
  }
}

export interface UseTokensReturn {
  tokens: TokenData[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTokens(): UseTokensReturn {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { ready } = usePrivy()

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const provider = new ethers.JsonRpcProvider('https://rpc.soniclabs.com')
      const poolService = getPoolService(provider)
      
      // Get all tokens from genesis or deployment block
      // Start from block 0 to capture all historical tokens
      const fromBlock = 0
      
      const tokenData = await poolService.getAllTokens(fromBlock)
      setTokens(tokenData)
    } catch (err) {
      console.error('Error fetching tokens:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens')
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchTokens()
  }, [fetchTokens])

  useEffect(() => {
    // Fetch tokens immediately, don't wait for wallet connection
    fetchTokens()
  }, [fetchTokens])

  return {
    tokens,
    loading,
    error,
    refetch
  }
}
