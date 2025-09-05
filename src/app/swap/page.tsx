'use client'

import SwapInterface from '@/components/SwapInterface'

export default function SwapPage() {
  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[var(--background)] pb-20">
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Swap Interface */}
          <div className="lg:col-span-3">
            <div className="dark:bg-[var(--background)]/50">
              <h1 className="text-2xl md:text-3xl font-normal text-gray-900 dark:text-white mb-2 transition-colors duration-300">Swap Tokens</h1>
              <p className="text-gray-600 text-sm font-light dark:text-gray-300 mb-8 transition-colors duration-300">
                Exchange tokens instantly by selecting both tokens and amounts. Configure slippage tolerance and confirm the transaction.
              </p>
              <SwapInterface />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
