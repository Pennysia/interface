import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PrivyWrapper from '@/contexts/PrivyProvider'
import AuthBridge from '@/components/AuthBridge'
import Header from '@/components/Header'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import BottomNavigation from '@/components/BottomNavigation'
import Script from 'next/script'
import { CURRENT_RPC_URL } from '@/config/chains'
import "./globals.css"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
})

export const metadata: Metadata = {
  title: "Pennysia AMM - Directional Liquidity Trading",
  description: "Trade with directional liquidity positions on Pennysia AMM. Long and short positions with advanced AMM mechanics.",
  keywords: "DeFi, AMM, DEX, Directional Liquidity, Trading, Ethereum, Sonic",
  authors: [{ name: "Pennysia Team" }],
  metadataBase: new URL('https://mvp.pennysia.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/pennysia-brandkit/full-logo/light-mode-full-logo.svg" as="image" />
        <link rel="preload" href="/pennysia-brandkit/full-logo/dark-mode-full-logo.svg" as="image" />
        <link rel="preconnect" href="https://tokens.uniswap.org" />
        <link rel="dns-prefetch" href="https://eth.llamarpc.com" />
        <link rel="dns-prefetch" href={CURRENT_RPC_URL} />
        {/* Color scheme hints and browser UI theme colors */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f9fafb" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000" />
        {/* Theme setter before React mounts to avoid flash */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(() => { try {
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = (saved === 'light' || saved === 'dark') ? saved : (prefersDark ? 'dark' : 'light');
            document.documentElement.classList.remove('light','dark');
            document.documentElement.classList.add(theme);
          } catch (e) {} })();`}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <PrivyWrapper>
            <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
              <div className="pt-20">
                <AnnouncementBanner />
                <main className="bg-gray-50 dark:bg-[var(--background)]">
                  {children}
                </main>
              </div>
              <AuthBridge />
              <Header />
              <BottomNavigation />
            </div>
          </PrivyWrapper>
        </ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'dark:bg-gray-800 dark:text-white bg-white text-gray-900 dark:border-gray-700 border-gray-200',
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
