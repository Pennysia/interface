"use client";

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { usePools, useTokens } from "../../hooks/usePools";
import { ethers } from "ethers";

// Mock data for tokens (Cryptos tab)
const MOCK_TOKENS = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    price: "$107,008.68",
    change: "+1.83%",
    changePositive: true,
    marketCap: "$800.68B",
    volume: "$800.68B",
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    price: "$2,419.39",
    change: "+1.00%",
    changePositive: true,
    marketCap: "$29.3T",
    volume: "$29.3T",
  },
  {
    id: 3,
    name: "BNB",
    symbol: "BNB",
    icon: "B",
    price: "$646.57",
    change: "-0.67%",
    changePositive: false,
    marketCap: "$646.57",
    volume: "$646.57",
  },
  {
    id: 4,
    name: "Tether",
    symbol: "USDT",
    icon: "₮",
    price: "$1.00",
    change: "+1.83%",
    changePositive: true,
    marketCap: "$1.00",
    volume: "$1.00",
  },
  {
    id: 5,
    name: "SUI",
    symbol: "SUI",
    icon: "S",
    price: "$46.34",
    change: "-2.05%",
    changePositive: false,
    marketCap: "$46.34",
    volume: "$46.34",
  },
];

// Mock data for pools
const MOCK_POOLS = [
  {
    id: 1,
    name: "WETH/USDT",
    token0: { symbol: "WETH", icon: "Ξ" },
    token1: { symbol: "USDT", icon: "₮" },
    tvl: "$107,008.68",
    volume: "$800.68B",
    fees: "$800.68",
    apr: "80.68%",
  },
  {
    id: 2,
    name: "WETH/BNB",
    token0: { symbol: "WETH", icon: "Ξ" },
    token1: { symbol: "BNB", icon: "B" },
    tvl: "$2,419.39",
    volume: "$29.3T",
    fees: "$29.30",
    apr: "29.30%",
  },
  {
    id: 3,
    name: "SUI/USDT",
    token0: { symbol: "SUI", icon: "S" },
    token1: { symbol: "USDT", icon: "₮" },
    tvl: "$646.57",
    volume: "$646.57",
    fees: "$646.57",
    apr: "66.57%",
  },
  {
    id: 4,
    name: "BNB/USDT",
    token0: { symbol: "BNB", icon: "B" },
    token1: { symbol: "USDT", icon: "₮" },
    tvl: "$1.00",
    volume: "$1.00T",
    fees: "$1.00",
    apr: "11.00%",
  },
  {
    id: 5,
    name: "BTC/SUI",
    token0: { symbol: "BTC", icon: "₿" },
    token1: { symbol: "SUI", icon: "S" },
    tvl: "$46.34",
    volume: "$46.34B",
    fees: "$46.34",
    apr: "46.34%",
  },
];

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState("cryptos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("1D");
  const [filterBy, setFilterBy] = useState("All Tokens");
  const {
    pools,
    loading: poolsLoading,
    error: poolsError,
    refetch,
  } = usePools();

  const {
    tokens,
    loading: tokensLoading,
    error: tokensError,
    refetch: refetchTokens,
  } = useTokens();

  // Filter pools based on search query
  const filteredPools = pools.filter((pool) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      pool.token0.symbol.toLowerCase().includes(searchLower) ||
      pool.token1.symbol.toLowerCase().includes(searchLower) ||
      pool.token0.name.toLowerCase().includes(searchLower) ||
      pool.token1.name.toLowerCase().includes(searchLower) ||
      `${pool.token0.symbol}/${pool.token1.symbol}`
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Filter tokens based on search query
  const filteredTokens = tokens.filter((token) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(searchLower) ||
      token.name.toLowerCase().includes(searchLower) ||
      token.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="pt-24 min-h-screen bg-gray-50 dark:bg-[var(--background)] ">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Markets
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Providing full range liquidity ensures continuous market
            availability.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full sm:w-fit">
            <button
              onClick={() => setActiveTab("cryptos")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "cryptos"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Cryptos
            </button>
            <button
              onClick={() => setActiveTab("pools")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "pools"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Pools
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 sm:mb-6 flex flex justify-between gap-3 sm:gap-4 ">
          {/* Search */}
          <div className="relative flex w-full  max-w-[360px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder={
                activeTab === "cryptos" ? "Search tokens..." : "Search pools..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 sm:gap-3">
            {/* Filter Dropdown */}
            <div className="relative flex-shrink-0">
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                <span className="text-xs sm:text-sm">{filterBy}</span>
                <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative flex-shrink-0">
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{sortBy}</span>
                <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        {activeTab === "cryptos" ? (
          /* Cryptos Table */
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {tokensLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading tokens...
                </span>
              </div>
            ) : tokensError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-500 dark:text-red-400 mb-2">
                  Error loading tokens
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {tokensError}
                </div>
                <button
                  onClick={refetchTokens}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? "No tokens found matching your search"
                    : "No tokens available"}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-600 dark:text-gray-400 text-sm">
                      <th className="px-6 py-4 font-medium">#</th>
                      <th className="px-6 py-4 font-medium">Token</th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                        Balance in Contract
                        <span className="ml-1">↕</span>
                      </th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                        Address
                        <span className="ml-1">↕</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTokens.map((token, index) => {
                      const tokenIsNative =
                        token.address === ethers.ZeroAddress;
                      const balance = parseFloat(
                        ethers.formatUnits(token.balance, token.decimals)
                      );

                      return (
                        <tr
                          key={token.address}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8">
                                {tokenIsNative ? (
                                  <Image
                                    src="/sonic-logo.avif"
                                    alt="Sonic"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : token.logoURI ? (
                                  <Image
                                    src={token.logoURI}
                                    alt={token.symbol}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                      {token.symbol.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-gray-900 dark:text-white font-medium">
                                  {token.symbol}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">
                                  {token.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {balance.toLocaleString("en-US", {
                              maximumFractionDigits: 6,
                            })}{" "}
                            {token.symbol}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 dark:text-white font-medium font-mono text-sm">
                              {tokenIsNative
                                ? "Native Token"
                                : `${token.address.slice(
                                    0,
                                    6
                                  )}...${token.address.slice(-4)}`}
                            </div>
                            {!tokenIsNative && (
                              <div className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                                {token.address}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Pools Table */
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {poolsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading pools...
                </span>
              </div>
            ) : poolsError ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-500 dark:text-red-400 mb-2">
                  Error loading pools
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  {poolsError}
                </div>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredPools.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  {searchQuery
                    ? "No pools found matching your search"
                    : "No pools available"}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr className="text-left text-gray-600 dark:text-gray-400 text-sm">
                      <th className="px-6 py-4 font-medium">#</th>
                      <th className="px-6 py-4 font-medium">Pool</th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                        TVL
                        <span className="ml-1">↕</span>
                      </th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                        Long Liquidity
                        <span className="ml-1">↕</span>
                      </th>
                      <th className="px-6 py-4 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
                        Short Liquidity
                        <span className="ml-1">↕</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPools.map((pool, index) => {
                      const token0IsNative =
                        pool.token0.address === ethers.ZeroAddress;
                      const token1IsNative =
                        pool.token1.address === ethers.ZeroAddress;

                      // Calculate long and short liquidity totals
                      const longLiquidity0 = parseFloat(
                        ethers.formatUnits(
                          pool.reserves.reserve0Long,
                          pool.token0.decimals
                        )
                      );
                      const shortLiquidity0 = parseFloat(
                        ethers.formatUnits(
                          pool.reserves.reserve0Short,
                          pool.token0.decimals
                        )
                      );
                      const longLiquidity1 = parseFloat(
                        ethers.formatUnits(
                          pool.reserves.reserve1Long,
                          pool.token1.decimals
                        )
                      );
                      const shortLiquidity1 = parseFloat(
                        ethers.formatUnits(
                          pool.reserves.reserve1Short,
                          pool.token1.decimals
                        )
                      );

                      const totalLongLiquidity =
                        longLiquidity0 + longLiquidity1;
                      const totalShortLiquidity =
                        shortLiquidity0 + shortLiquidity1;

                      return (
                        <tr
                          key={pool.pairId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3 flex-col sm:flex-row">
                              <div className="flex items-center">
                                {/* Token 0 Logo */}
                                <div className="w-6 h-6 relative z-10">
                                  {token0IsNative ? (
                                    <Image
                                      src="/sonic-logo.avif"
                                      alt="Sonic"
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                  ) : pool.token0.logoURI ? (
                                    <Image
                                      src={pool.token0.logoURI}
                                      alt={pool.token0.symbol}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {pool.token0.symbol.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {/* Token 1 Logo */}
                                <div className="w-6 h-6 -ml-2">
                                  {token1IsNative ? (
                                    <Image
                                      src="/sonic-logo.avif"
                                      alt="Sonic"
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                  ) : pool.token1.logoURI ? (
                                    <Image
                                      src={pool.token1.logoURI}
                                      alt={pool.token1.symbol}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs font-bold">
                                        {pool.token1.symbol.charAt(0)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-900 dark:text-white font-medium">
                                  {pool.token0.symbol}/{pool.token1.symbol}
                                </div>
                                <div className="hidden sm:block text-gray-500 dark:text-gray-400 text-xs leading-tight">
                                  <div>Pair ID:</div>
                                  <div className="break-all">{pool.pairId}</div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                            {pool.tvl}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-green-600 dark:text-white font-medium text-sm">
                              <div>
                                {longLiquidity0.toFixed(2)} {pool.token0.symbol}
                              </div>
                              <div>
                                {longLiquidity1.toFixed(2)} {pool.token1.symbol}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-red-600 dark:text-white font-medium text-sm">
                              <div>
                                {shortLiquidity0.toFixed(2)}{" "}
                                {pool.token0.symbol}
                              </div>
                              <div>
                                {shortLiquidity1.toFixed(2)}{" "}
                                {pool.token1.symbol}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
