import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

function TechnologySection() {
  return (
    <div className="max-w-6xl mx-auto mt-64 mb-16 px-4 md:pt-48">
      <h2 className="text-3xl md:text-4xl font-base text-center text-[#2E2F46] dark:text-white mb-24">
        Built to leverage your on-chain strategy.
      </h2>

      <div className="space-y-4 pb-12">
        {/* Trade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-top border border-[4px] border-gray-200/50 dark:border-[#555C6F]/20 backdrop-blur-sm rounded-2xl p-2">
          <div className=" flex flex-col h-full w-full text-left relative p-6 md:p-8">
            <div className="w-fit flex items-center flex-row bg-gray-200 dark:bg-[#555C6F]/20 rounded-xl py-2 px-2 mb-2">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <p className="text-xs font-medium text-blue-400 px-1">
                TRADE TOKENS
              </p>
            </div>
            <h3 className="text-2xl md:text-3xl font-normal text-[#2E2F46] dark:text-white mb-4">
              Guaranteed liquidity with constant fees.
            </h3>
            <ul className="text-base text-gray-500 dark:text-gray-400 space-y-1">
              <li>• Multi-hop routing for best prices</li>
              <li>• Liquidity available at all price points.</li>
              <li>• 0.3% fixed fee structure</li>
            </ul>
            <Link
              href="/swap"
              className="text-white dark:text-[#19192A] text-sm inline-flex items-center w-fit mt-8 hover:bg-[#A7ADBB] bg-[#19192A] dark:bg-[#E7E8EB] border border-[#555C6F] font-normal py-3 px-10 rounded-full transition-all duration-200 relative z-10"
            >
              Swap now
            </Link>
          </div>
          <div className="flex p-6  flex-col w-full h-full justify-center md:justify-start pointer-events-none ">
            <Image
              src="/homePage/h3.svg"
              alt="Trade Tokens"
              width={500}
              height={500}
              className="h-full w-auto object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-top">
          {/* Provide Liquidity */}
          <div className="flex flex-col h-full w-full text-left relative gap-4 items-top border border-[4px] border-gray-200/50 dark:border-[#555C6F]/20 backdrop-blur-sm rounded-2xl p-2">
          <div className=" flex flex-col h-full w-full text-left relative p-6 md:p-8">
              <div className="w-fit flex items-center flex-row bg-gray-200 dark:bg-[#555C6F]/20 rounded-xl py-2 px-1 mb-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs font-medium text-green-600 px-1">
                  PROVIDE LIQUIDITY
                </p>
              </div>
              <h3 className="text-2xl md:text-3xl font-normal text-[#2E2F46] dark:text-white mb-4">
                Separate liquidity into{" "}
                <span className="text-green-600 dark:text-green-400">
                  Long
                </span>{" "}
                and{" "}
                <span className="text-red-600 dark:text-red-400">
                  Short{" "}
                </span>
                positions.
              </h3>
              <ul className="text-base text-gray-500 dark:text-gray-400 space-y-1">
                <li>• 4-reserve system architecture</li>
                <li>• Long/short liquidity position support</li>
                <li>• Automatic fee distribution and compounding</li>
              </ul>
              <Link
                href="/liquidity"
                className="text-[#19192A] mt-8 text-sm dark:text-white inline-flex items-center w-fit hover:bg-[#A7ADBB] bg-transparent border border-[#555C6F] font-normal py-3 px-6 rounded-full transition-all duration-200 relative z-10"
              >
                Go to Liquidity →
              </Link>
            </div>
            <div className="flex justify-center md:justify-start pointer-events-none">
              <div className="flex flex-col w-full h-full justify-center md:justify-start pointer-events-none ">
                <Image
                  src="/homePage/h1.svg"
                  alt="Long/short Liquidity"
                  width={500}
                  height={500}
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>

          {/* Use Oracle */}
          <div className="flex flex-col h-full w-full text-left relative gap-4 items-top border border-[4px] border-gray-200/50 dark:border-[#555C6F]/20 backdrop-blur-sm rounded-2xl p-2">
          <div className="flex flex-col h-full w-full text-left relative p-6 md:p-8">
              <div className="w-fit flex items-center flex-row bg-gray-200 dark:bg-[#555C6F]/20 rounded-xl py-2 px-1 mb-2">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4.05 11.05l-.707.707m2.122 6.364l-.707.707M12 21v-1m-6.364-1.636l.707-.707M3 12h1m14.95-1.05l.707-.707m-2.122-6.364l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9a3 3 0 100 6 3 3 0 000-6z"
                  />
                </svg>
                <p className="text-xs font-medium text-purple-400 px-1">
                  TWAP PRICE ORACLE
                </p>
              </div>
              <h3 className="text-2xl md:text-3xl font-normal text-[#2E2F46] dark:text-white mb-4">
                Integrate our resilient price oracle.
              </h3>
              <ul className="text-base text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Real-time price feeds</li>
                <li>• Manipulation resistance with cube root.</li>
                <li>• Easily integrate with your dApp.</li>
              </ul>
              <Link
                href="https://docs.pennysia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#19192A] text-sm dark:text-white inline-flex items-center w-fit mt-8 hover:bg-[#A7ADBB] bg-transparent border border-[#555C6F] font-normal py-3 px-6 rounded-full transition-all duration-200 relative z-10"
              >
                Learn more
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
            <div className="flex justify-center md:justify-start pointer-events-none">
              <div className="flex flex-col w-full h-full justify-center md:justify-start pointer-events-none ">
                <Image
                  src="/homePage/h2.svg"
                  alt="Integrate Oracle"
                  width={500}
                  height={500}
                  className="h-full w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(TechnologySection)
