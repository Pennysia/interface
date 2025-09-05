/**
 * Unified Chain Configuration
 * Single source of truth for all chain-related constants
 */

import { ChainId } from '@/lib'

// Current supported chain (Sonic Mainnet only)
export const CURRENT_CHAIN_ID = ChainId.SONIC

// RPC URLs
export const RPC_URLS: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'https://eth.llamarpc.com',
  [ChainId.SEPOLIA]: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  [ChainId.SONIC]: 'https://rpc.soniclabs.com',
  [ChainId.SONIC_BLAZE_TESTNET]: '', // Not supported
}

// Block Explorer URLs
export const BLOCK_EXPLORER_URLS: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'https://etherscan.io',
  [ChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
  [ChainId.SONIC]: 'https://explorer.soniclabs.com',
  [ChainId.SONIC_BLAZE_TESTNET]: '',
}

// Native Currency Info
export const NATIVE_CURRENCY_INFO: Record<ChainId, {
  name: string
  symbol: string
  decimals: number
}> = {
  [ChainId.MAINNET]: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  [ChainId.SEPOLIA]: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  [ChainId.SONIC]: {
    name: 'Sonic',
    symbol: 'S',
    decimals: 18,
  },
  [ChainId.SONIC_BLAZE_TESTNET]: {
    name: 'Sonic',
    symbol: 'S',
    decimals: 18,
  },
}

// Chain Names
export const CHAIN_NAMES: Record<ChainId, string> = {
  [ChainId.MAINNET]: 'Ethereum Mainnet',
  [ChainId.SEPOLIA]: 'Sepolia Testnet',
  [ChainId.SONIC]: 'Sonic Mainnet',
  [ChainId.SONIC_BLAZE_TESTNET]: 'Sonic Blaze Testnet',
}

// Supported chains array
export const SUPPORTED_CHAINS = [ChainId.SONIC]

// Helper functions
export function getRpcUrl(chainId: ChainId): string {
  const url = RPC_URLS[chainId]
  if (!url) {
    throw new Error(`No RPC URL configured for chain ${chainId}`)
  }
  return url
}

export function getBlockExplorerUrl(chainId: ChainId): string {
  const url = BLOCK_EXPLORER_URLS[chainId]
  if (!url) {
    throw new Error(`No block explorer URL configured for chain ${chainId}`)
  }
  return url
}

export function getNativeCurrency(chainId: ChainId) {
  return NATIVE_CURRENCY_INFO[chainId]
}

export function getChainName(chainId: ChainId): string {
  return CHAIN_NAMES[chainId]
}

export function isChainSupported(chainId: ChainId): boolean {
  return SUPPORTED_CHAINS.includes(chainId)
}

export function isSonicMainnet(chainId: number): boolean {
  return chainId === ChainId.SONIC
}

// Current chain helpers (shortcuts for the current supported chain)
export const CURRENT_RPC_URL = getRpcUrl(CURRENT_CHAIN_ID)
export const CURRENT_BLOCK_EXPLORER_URL = getBlockExplorerUrl(CURRENT_CHAIN_ID)
export const CURRENT_NATIVE_CURRENCY = getNativeCurrency(CURRENT_CHAIN_ID)
export const CURRENT_CHAIN_NAME = getChainName(CURRENT_CHAIN_ID)
