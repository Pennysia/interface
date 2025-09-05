'use client'

import { useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useStore } from '@/store/useStore'
import { ethers } from 'ethers'
import { ChainId } from '@/lib'
import { CURRENT_CHAIN_ID, isSonicMainnet } from '@/config/chains'
import { addAndSwitchToSonicNetwork } from '@/lib/networkUtils'
import toast from 'react-hot-toast'

/**
 * AuthBridge component synchronizes Privy authentication with useStore state
 * This ensures that when users connect via Privy, the useStore state is updated
 * so that other components (like useLiquidity) can access the wallet connection
 */
export default function AuthBridge() {
  const { ready, authenticated, user } = usePrivy()
  const { wallets } = useWallets()
  
  // Add a simple log to verify the component is running
  console.log('AuthBridge: Component mounted/updated', {
    ready,
    authenticated,
    userExists: !!user,
    walletsCount: wallets.length
  })

  useEffect(() => {
    console.log('AuthBridge: Privy state changed', { 
      ready, 
      authenticated, 
      userExists: !!user,
      walletsCount: wallets.length,
      walletAddresses: wallets.map(w => w.address)
    })
    
    if (!ready) {
      console.log('AuthBridge: Privy not ready yet')
      return
    }

    // Check for wallet connection - either authenticated flag or wallets present
    if ((authenticated && wallets.length > 0) || (!authenticated && wallets.length > 0)) {
      console.log('AuthBridge: Wallet detected, syncing to useStore...', {
        authenticated,
        walletsCount: wallets.length,
        method: authenticated ? 'authenticated-flag' : 'wallet-fallback'
      })
      
      const wallet = wallets[0]
      const address = wallet.address
      
      // Get the Ethereum provider from the wallet
      wallet.getEthereumProvider().then(async (provider) => {
        try {
          console.log('AuthBridge: Got Ethereum provider, creating ethers provider...')
          
          // Create ethers provider and signer
          const ethersProvider = new ethers.BrowserProvider(provider)
          const signer = await ethersProvider.getSigner()
          const network = await ethersProvider.getNetwork()
          
          console.log('AuthBridge: Network info:', { chainId: network.chainId, name: network.name })

          // Check if on Sonic mainnet, if not, prompt to switch
          if (!isSonicMainnet(Number(network.chainId))) {
            console.warn('AuthBridge: Non-Sonic network detected. Prompting network switch.', { chainId: Number(network.chainId) })
            
            toast.error('Please switch to Sonic network to use Pennysia', {
              duration: 6000,
            })
            
            // Attempt to switch network automatically
            try {
              const success = await addAndSwitchToSonicNetwork(provider)
              if (!success) {
                console.warn('AuthBridge: Failed to switch to Sonic network')
                useStore.setState({
                  isConnected: false,
                  address: null,
                  provider: null,
                  signer: null,
                  chainId: null
                })
                return
              }
              
              // If successful, re-get the network info
              const newNetwork = await ethersProvider.getNetwork()
              if (!isSonicMainnet(Number(newNetwork.chainId))) {
                useStore.setState({
                  isConnected: false,
                  address: null,
                  provider: null,
                  signer: null,
                  chainId: null
                })
                return
              }
              
              toast.success('Successfully switched to Sonic network!')
              
            } catch (error) {
              console.error('AuthBridge: Error switching network:', error)
              useStore.setState({
                isConnected: false,
                address: null,
                provider: null,
                signer: null,
                chainId: null
              })
              return
            }
          }
          
          // Since we already validated it's Sonic, directly use the current chain ID
          const mappedChainId = CURRENT_CHAIN_ID
          
          // Update useStore with the wallet connection info
          useStore.setState({
            isConnected: true,
            address,
            provider: ethersProvider,
            signer,
            chainId: mappedChainId
          })
          
          console.log('AuthBridge: Successfully synced wallet to useStore:', {
            address,
            chainId: mappedChainId,
            isConnected: true
          })
          
        } catch (error) {
          console.error('AuthBridge: Error setting up ethers provider:', error)
        }
      }).catch((error) => {
        console.error('AuthBridge: Error getting Ethereum provider:', error)
      })
      
    } else {
      console.log('AuthBridge: User not authenticated, clearing useStore...')
      
      // Clear useStore when not authenticated
      useStore.setState({
        isConnected: false,
        address: null,
        provider: null,
        signer: null,
        chainId: null
      })
    }
  }, [ready, authenticated, wallets, user])

  // React to runtime network changes and update connection state accordingly
  useEffect(() => {
    if (!authenticated || wallets.length === 0) return

    let removeListener: (() => void) | undefined

    const setup = async () => {
      try {
        const wallet = wallets[0]
        const ethereumProvider = await wallet.getEthereumProvider()

        const handler = async (chainIdHex: string) => {
          try {
            const chainIdNum = parseInt(chainIdHex, 16)
            if (!isSonicMainnet(chainIdNum)) {
              // Wrong network → clear state
              useStore.setState({
                isConnected: false,
                address: null,
                provider: null,
                signer: null,
                chainId: null
              })
              return
            }

            // Correct network → rebuild provider/signer and set state
            const ethersProvider = new (require('ethers').BrowserProvider)(ethereumProvider)
            const signer = await ethersProvider.getSigner()
            const address = await signer.getAddress()

            useStore.setState({
              isConnected: true,
              address,
              provider: ethersProvider,
              signer,
              chainId: require('@/lib').ChainId.SONIC
            })
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn('AuthBridge: chainChanged handler error', e)
          }
        }

        if (ethereumProvider && typeof (ethereumProvider as any).on === 'function') {
          ;(ethereumProvider as any).on('chainChanged', handler)
          removeListener = () => {
            try { (ethereumProvider as any).removeListener?.('chainChanged', handler) } catch {}
          }
        }
      } catch {}
    }

    setup()

    return () => { removeListener?.() }
  }, [authenticated, wallets])

  // This component doesn't render anything, it just syncs state
  return null
}
