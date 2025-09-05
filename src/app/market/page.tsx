'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, ChevronDownIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, UserGroupIcon, ChartBarIcon, FireIcon, ClockIcon } from '@heroicons/react/24/outline'

// Mock data for tokens (Cryptos tab)
const MOCK_TOKENS = [
  {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    price: '$107,008.68',
    change: '+1.83%',
    changePositive: true,
    marketCap: '$800.68B',
    volume: '$800.68B'
  },
  {
    id: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    price: '$2,419.39',
    change: '+1.00%',
    changePositive: true,
    marketCap: '$29.3T',
    volume: '$29.3T'
  },
  {
    id: 3,
    name: 'BNB',
    symbol: 'BNB',
    icon: 'B',
    price: '$646.57',
    change: '-0.67%',
    changePositive: false,
    marketCap: '$646.57',
    volume: '$646.57'
  },
  {
    id: 4,
    name: 'Tether',
    symbol: 'USDT',
    icon: '₮',
    price: '$1.00',
    change: '+1.83%',
    changePositive: true,
    marketCap: '$1.00',
    volume: '$1.00'
  },
  {
    id: 5,
    name: 'SUI',
    symbol: 'SUI',
    icon: 'S',
    price: '$46.34',
    change: '-2.05%',
    changePositive: false,
    marketCap: '$46.34',
    volume: '$46.34'
  }
]

// Mock data for pools
const MOCK_POOLS = [
  {
    id: 1,
    name: 'WETH/USDT',
    token0: { symbol: 'WETH', icon: 'Ξ' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: '$107,008.68',
    volume: '$800.68B',
    fees: '$800.68',
    apr: '80.68%'
  },
  {
    id: 2,
    name: 'WETH/BNB',
    token0: { symbol: 'WETH', icon: 'Ξ' },
    token1: { symbol: 'BNB', icon: 'B' },
    tvl: '$2,419.39',
    volume: '$29.3T',
    fees: '$29.30',
    apr: '29.30%'
  },
  {
    id: 3,
    name: 'SUI/USDT',
    token0: { symbol: 'SUI', icon: 'S' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: '$646.57',
    volume: '$646.57',
    fees: '$646.57',
    apr: '66.57%'
  },
  {
    id: 4,
    name: 'BNB/USDT',
    token0: { symbol: 'BNB', icon: 'B' },
    token1: { symbol: 'USDT', icon: '₮' },
    tvl: '$1.00',
    volume: '$1.00T',
    fees: '$1.00',
    apr: '11.00%'
  },
  {
    id: 5,
    name: 'BTC/SUI',
    token0: { symbol: 'BTC', icon: '₿' },
    token1: { symbol: 'SUI', icon: 'S' },
    tvl: '$46.34',
    volume: '$46.34B',
    fees: '$46.34',
    apr: '46.34%'
  }
]

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState('cryptos')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('1D')
  const [filterBy, setFilterBy] = useState('All Tokens')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[var(--background)]">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Markets</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Providing full range liquidity ensures continuous market participation across all possible prices.
          </p>
        </div>

        {/* Tabs and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('cryptos')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'cryptos'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Cryptos
            </button>
            <button
              onClick={() => setActiveTab('pools')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'pools'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Pools
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {filterBy}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {sortBy}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        {activeTab === 'cryptos' ? (
          /* Cryptos Table */
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-600 dark:text-gray-400 text-sm">
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      Price
                      <span className="ml-1">↕</span>
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      Change
                      <span className="ml-1">↕</span>
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      Market Cap
                      <span className="ml-1">↕</span>
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      Volume
                      <span className="ml-1">↕</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {MOCK_TOKENS.map((token, index) => (
                    <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{token.icon}</span>
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-white font-medium">{token.symbol}</div>
                            <div className="text-gray-500 dark:text-gray-400 text-sm">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{token.price}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${
                          token.changePositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {token.change}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{token.marketCap}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{token.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Pools Table */
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr className="text-left text-gray-600 dark:text-gray-400 text-sm">
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      TVL
                      <span className="ml-1">↕</span>
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      Volume
                      <span className="ml-1">↕</span>
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      Fees
                      <span className="ml-1">↕</span>
                    </th>
                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                      APR
                      <span className="ml-1">↕</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {MOCK_POOLS.map((pool, index) => (
                    <tr key={pool.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{index + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center relative z-10">
                              <span className="text-white text-xs font-bold">{pool.token0.icon}</span>
                            </div>
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center -ml-2">
                              <span className="text-white text-xs font-bold">{pool.token1.icon}</span>
                            </div>
                          </div>
                          <div className="text-gray-900 dark:text-white font-medium">{pool.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{pool.tvl}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{pool.volume}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{pool.fees}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{pool.apr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
