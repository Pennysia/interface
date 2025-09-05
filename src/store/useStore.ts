import { create } from 'zustand'
import { ethers } from 'ethers'
import { 
  PennysiaSDK, 
  ChainId, 
  Token, 
  PennysiaPair,
  getChainInfoWithRpc,
  getChainInfo,
  NATIVE_CURRENCY,
  WETH
} from '@/lib/index'
import { CURRENT_CHAIN_ID, CURRENT_RPC_URL, getRpcUrl, getChainName, getNativeCurrency, getBlockExplorerUrl } from '@/config/chains'

export interface AppState {
  // Wallet connection
  isConnected: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  chainId: ChainId | null
  
  // SDK instance
  sdk: PennysiaSDK | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Trading state
  selectedTokenA: Token | null
  selectedTokenB: Token | null
  currentPair: PennysiaPair | null
  isLongPosition: boolean
  
  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchChain: (chainId: ChainId) => Promise<void>
  setTokens: (tokenA: Token, tokenB: Token) => void
  setPositionType: (isLong: boolean) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  sdk: null,
  isLoading: false,
  error: null,
  selectedTokenA: null,
  selectedTokenB: null,
  currentPair: null,
  isLongPosition: true,

  // Connect wallet action
  connectWallet: async () => {
    try {
      set({ isLoading: true, error: null })
      
      if (!window.ethereum?.request) {
        throw new Error('Please install MetaMask or another Web3 wallet')
      }

      // Request account access
      await (window.ethereum as any).request({ method: 'eth_requestAccounts' })
      
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId) as ChainId

      // Validate supported chain (support Sonic Mainnet only)
      if (chainId !== CURRENT_CHAIN_ID) {
        throw new Error(`Unsupported chain. Please switch to ${getChainName(CURRENT_CHAIN_ID)} (Chain ID: ${CURRENT_CHAIN_ID}).`)
      }

      // Create SDK instance
      const rpcUrl = getRpcUrl(chainId)
      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl)
      const sdk = PennysiaSDK.create(chainId, rpcProvider, signer)

      // Set default tokens
      const nativeCurrency = NATIVE_CURRENCY[chainId]
      const weth = WETH[chainId]

      set({
        isConnected: true,
        address,
        provider,
        signer,
        chainId,
        sdk,
        selectedTokenA: nativeCurrency,
        selectedTokenB: weth,
        isLoading: false
      })

      // Listen for account changes
      if (window.ethereum?.on) {
        (window.ethereum as any).on('accountsChanged', (accounts: string[]) => {
          if (accounts.length === 0) {
            get().disconnectWallet()
          } else {
            get().connectWallet()
          }
        })

        // Listen for chain changes
        (window.ethereum as any).on('chainChanged', () => {
          get().connectWallet()
        })
      }

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to connect wallet',
        isLoading: false
      })
    }
  },

  // Disconnect wallet action
  disconnectWallet: async () => {
    try {
      // Clear app state first
      set({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        sdk: null,
        selectedTokenA: null,
        selectedTokenB: null,
        currentPair: null
      })
      
      // If MetaMask is available, request account disconnection
      if (typeof window !== 'undefined' && window.ethereum?.request) {
        // Note: MetaMask doesn't have a direct disconnect method
        // The user needs to manually disconnect from MetaMask UI
        // But we can clear any cached permissions
        try {
          // Request permissions to potentially reset the connection state
          await (window.ethereum as any).request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          })
        } catch (error) {
          // User cancelled or other error - this is expected behavior
          console.log('Wallet disconnect completed')
        }
      }
    } catch (error) {
      console.error('Error during wallet disconnect:', error)
      // Still clear the state even if there's an error
      set({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null,
        sdk: null,
        selectedTokenA: null,
        selectedTokenB: null,
        currentPair: null
      })
    }
  },

  // Switch chain action
  switchChain: async (targetChainId: ChainId) => {
    try {
      set({ isLoading: true, error: null })
      
      if (!window.ethereum?.request) {
        throw new Error('MetaMask not available')
      }

      // Enforce current supported chain only
      if (targetChainId !== CURRENT_CHAIN_ID) {
        throw new Error(`Only ${getChainName(CURRENT_CHAIN_ID)} is supported`)
      }

      const chainHex = `0x${targetChainId.toString(16)}`
      
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainHex }],
      })
      
      // Reconnect with new chain
      await get().connectWallet()
      
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to wallet, add it
        try {
          if (!window.ethereum?.request) {
            throw new Error('MetaMask not available')
          }
          
          const chainInfo = getChainInfo(targetChainId)
          if (!chainInfo) {
            throw new Error(`Chain ${targetChainId} not supported`)
          }
          
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: chainInfo.name,
              nativeCurrency: {
                name: chainInfo.nativeCurrency.name,
                symbol: chainInfo.nativeCurrency.symbol,
                decimals: chainInfo.nativeCurrency.decimals,
              },
              rpcUrls: chainInfo.rpcUrls,
              blockExplorerUrls: chainInfo.blockExplorerUrls,
            }],
          })
          await get().connectWallet()
        } catch (addError: any) {
          set({ 
            error: `Failed to add chain: ${addError.message}`,
            isLoading: false
          })
        }
      } else {
        set({ 
          error: `Failed to switch chain: ${error.message}`,
          isLoading: false
        })
      }
    }
  },

  // Set selected tokens
  setTokens: (tokenA: Token, tokenB: Token) => {
    set({ 
      selectedTokenA: tokenA, 
      selectedTokenB: tokenB,
      currentPair: null // Reset pair when tokens change
    })
  },

  // Set position type (long/short)
  setPositionType: (isLong: boolean) => {
    set({ isLongPosition: isLong })
  },

  // Set error
  setError: (error: string | null) => {
    set({ error })
  },

  // Set loading
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  }
}))

// Helper function to get RPC URL for chain
// Note: getRpcUrl is now imported from @/config/chains

// Note: getChainInfo functions are now imported from @/config/chains

// Note: Using type assertions for window.ethereum instead of global interface
// to avoid conflicts with existing type definitions
