import React from 'react'
import Link from 'next/link'

export default function CTASection() {
  return (
    <div className="max-w-6xl mx-auto mt-24 mt-36 mb-24 px-4 sm:px-0">
      <div className="bg-gradient-to-br from-[#5B7AF6]/20 to-[#2E2F46]/20 dark:from-[#5B7AF6]/30 dark:to-[#2E2F46]/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#5B7AF6]/30 dark:border-[#5B7AF6]/40">
        <h3 className="text-2xl md:text-3xl font-semibold text-[#2E2F46] dark:text-white mb-4 text-center">
          Start Building Your Future
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Take full control of your financial future with transparent, decentralized trading.
          Access comprehensive documentation or request custom integrations tailored to your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/docs"
            className="inline-flex items-center bg-[#5B7AF6] hover:bg-[#555C6F] text-white font-medium py-3 px-8 rounded-lg transition-all duration-200"
          >
            Read Doc
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center border border-[#5B7AF6]/30 text-[#5B7AF6] dark:text-white hover:bg-[#5B7AF6]/10 dark:hover:bg-[#5B7AF6]/20 font-medium py-3 px-8 rounded-lg transition-all duration-200"
          >
            Request
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
