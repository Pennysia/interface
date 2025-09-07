import React, { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from './Navigation'
import ThemeToggle from './client/ThemeToggleIsland'
import PrivyWalletButton from './client/PrivyWalletButtonIsland'
// Logo paths are handled as static assets

function Header() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 transition-colors duration-300 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 dark:bg-[var(--background)]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/20 rounded-xl shadow-md dark:shadow-[#E7E8EB]/5 ">
          <div className="flex justify-between items-center h-16 pr-2">
            {/* Logo */}
              <Link href="/" className="cursor-pointer transition-opacity flex items-center">
                  <Image
                    src="/pennysia-brandkit/full-logo/light-mode-full-logo.svg"
                    alt="Pennysia Logo"
                    width={120}
                    height={40}
                    className="block dark:hidden"
                    style={{ objectFit: "cover" }}
                    priority={true}
                    placeholder="empty"
                  />
                  <Image
                    src="/pennysia-brandkit/full-logo/dark-mode-full-logo.svg"
                    alt="Pennysia Logo"
                    width={120}
                    height={40}
                    className="hidden dark:block"
                    style={{ objectFit: "cover"}}
                    priority={true}
                    placeholder="empty"
                  />
              </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block mx-8">
              <Navigation />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Privy Wallet Button */}
              <PrivyWalletButton />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Custom memo comparison to prevent unnecessary re-renders
const HeaderMemo = memo(Header, () => {
  // Header should never re-render since it has no props that change
  // Navigation handles its own route changes internally
  return true
})

export default HeaderMemo
