// Temporary SDK utilities to resolve Turbopack module resolution issues
// This file contains the essential exports from pennysia-sdk that are needed by the frontend
import { ChainId } from './index'

export interface ContractAddresses {
  market?: string
  router?: string
}

// Pennysia contract addresses - deployed on Sonic Blaze Testnet
export const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  [ChainId.MAINNET]: {},
  [ChainId.SEPOLIA]: {},
  [ChainId.SONIC]: {
    market: '0xE7fc91070ceE115e4B9dfa97B90603e41D9A2176',
    router: '0x107F61D94A9072c50727E3D6D52A44CDE6AE2f77',
  },
  [ChainId.SONIC_BLAZE_TESTNET]: {},
}

export function getMarketAddress(chainId: ChainId): string | undefined {
  return CONTRACT_ADDRESSES[chainId]?.market
}

export function getRouterAddress(chainId: ChainId): string | undefined {
  return CONTRACT_ADDRESSES[chainId]?.router
}

export function getContractAddresses(chainId: ChainId): ContractAddresses {
  return CONTRACT_ADDRESSES[chainId] || {}
}
