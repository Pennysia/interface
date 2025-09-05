import { ChainId } from './chains'
import { CURRENT_CHAIN_ID, CURRENT_RPC_URL, CURRENT_CHAIN_NAME, CURRENT_NATIVE_CURRENCY } from '@/config/chains'

export interface NetworkSwitchParams {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls: string[]
}

/**
 * Add Sonic network to wallet and switch to it
 */
export async function addAndSwitchToSonicNetwork(provider: any): Promise<boolean> {
  try {
    const chainIdHex = `0x${CURRENT_CHAIN_ID.toString(16)}`
    
    // First try to switch to the network
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
      return true
    } catch (switchError: any) {
      // If network doesn't exist (4902), add it
      if (switchError.code === 4902) {
        const networkParams: NetworkSwitchParams = {
          chainId: chainIdHex,
          chainName: CURRENT_CHAIN_NAME,
          nativeCurrency: CURRENT_NATIVE_CURRENCY,
          rpcUrls: [CURRENT_RPC_URL],
          blockExplorerUrls: ['https://explorer.soniclabs.com'],
        }

        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [networkParams],
        })
        return true
      }
      throw switchError
    }
  } catch (error) {
    console.error('Failed to add/switch to Sonic network:', error)
    return false
  }
}

/**
 * Check if current network is Sonic
 */
export function isSonicNetwork(chainId: number): boolean {
  return chainId === CURRENT_CHAIN_ID
}

/**
 * Get current network info from provider
 */
export async function getCurrentNetwork(provider: any): Promise<{ chainId: number; name?: string }> {
  try {
    const chainId = await provider.request({ method: 'eth_chainId' })
    return { chainId: parseInt(chainId, 16) }
  } catch (error) {
    console.error('Failed to get current network:', error)
    throw error
  }
}
