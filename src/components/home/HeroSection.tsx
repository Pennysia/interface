import React from 'react'
import Image from 'next/image'
import { CURRENT_CHAIN_NAME } from '@/config/chains'

export default function HeroSection() {
  return (
    <div className="relative text-center items-center flex flex-col overflow-visible rounded-3xl">
      <div className="max-w-7xl mx-auto relative z-20">
      {/* Background SVG (proportional height via intrinsic dimensions) */}
      <div className="px-4 pt-5 lg:px-0 w-full max-w-[650px] lg:max-w-[680px] mx-auto pointer-events-none select-none">
        <Image
          src="/homePage/heroBg.svg"
          alt=""
          width={750}
          height={420}
          priority
          sizes="(max-width: 768px) 100vw, 750px"
          className="w-full h-auto"
        />
      </div>

      {/* Content */}
      <div className="relative pb-0 px-4 sm:px-8 flex flex-col items-center md:items-center md:justify-center">
        <div className="flex gap-3 items-center  rounded-full py-2 px-4 mb-2">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
                      <p className="text-xs font-light text-[#2E2F46] dark:text-white/80">
              Live On {CURRENT_CHAIN_NAME}
            </p>
        </div>

        <h1 className="text-3xl md:text-5xl font-semibold text-[#2E2F46] dark:text-white mb-4 max-w-4xl">
          Turn your Crypto into <br />
          <span className="text-4xl md:text-6xl bg-gradient-to-b from-[#2E2F46] via-[#4967DC] to-[#5B7AF6] text-transparent bg-clip-text block mt-1">
            Infinite Passive Income.
          </span>
        </h1>

        <p className="text-sm md:text-base font-light text-[#2E2F46] dark:text-gray-300 mb-8 max-w-3xl mx-auto transition-colors duration-300">
          The first AMM where you can earn from both sides of every trade.
        </p>

        <div className="flex flex-col sm:flex-col gap-2 justify-center w-full items-center">
          {/* <a
            href="/swap"
            className="px-8 py-3 text-white bg-[#5B7AF6] hover:bg-[#4967DC] rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowTrendingUpIcon className="h-5 w-5" />
            <span>Start Trading</span>
          </a> */}
          <a
            href="/liquidity"
            className="w-fit rounded-full px-20 py-4 text-white dark:text-[#19192A] hover:bg-[#A7ADBB] bg-[#19192A] dark:bg-[#E7E8EB] font-medium transition-all duration-200 flex items-center justify-center space-x-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] shadow-lg"
          >
            <span>Get Started</span>
          </a>
          <a
            href="https://docs.pennysia.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 text-base text-[#19192A] dark:text-white opacity-80 hover:opacity-50 rounded-lg font-normal transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>First time? Explore the docs →</span>
          </a>
        </div>
      </div>
      </div>
      {/* Full-width background gradient (light/dark) positioned under content */}
      <div className="pointer-events-none select-none absolute z-10 inset-x-0 2xl:-top-24 xl:top-24 top-118 sm:top-84 lg:top-64 flex justify-center">
      <div className="h-fit pointer-events-none select-none w-full">
        <Image
          src="/homePage/radientLight.svg"
          alt=""
          width={750}
          height={420}
          priority
          sizes="(max-width: 768px) 100vw, 750px"
          className="w-full h-auto block dark:hidden"
        />
        <Image
          src="/homePage/radientDark.svg"
          alt=""
          width={750}
          height={420}
          priority
          sizes="(max-width: 768px) 100vw, 750px"
          className="w-full h-auto hidden dark:block opacity-80"
        />
      </div>
      </div>
    </div>
  )
}
