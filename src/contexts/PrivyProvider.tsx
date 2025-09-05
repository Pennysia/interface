'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import type { ReactNode } from 'react';
// Replace this with any of the networks listed at https://github.com/wevm/viem/blob/main/src/chains/index.ts
import {sonic} from 'viem/chains';

interface PrivyWrapperProps {
  children: ReactNode;
}

export default function PrivyWrapper({ children }: PrivyWrapperProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  if (!appId) {
    // Surface a clear runtime error in dev if the Privy App ID is missing
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Privy: NEXT_PUBLIC_PRIVY_APP_ID is not set. The connect wallet button will not work.');
    }
  }
  return (
    <PrivyProvider
      appId={(appId ?? '').toString()}
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets'
        },
        // Configure appearance to match our theme
        appearance: {
          theme: 'light',
          logo: "/pennysia-brandkit/full-logo/light-mode-full-logo.svg",
          showWalletLoginFirst: false,
        },
        defaultChain: sonic,
        supportedChains: [sonic],
        // Configure supported login methods
        loginMethods: ['email', 'wallet', 'google', 'passkey'],
      }}
    >
      {children}
    </PrivyProvider>
  );
}



