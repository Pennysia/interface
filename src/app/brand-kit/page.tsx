"use client";

import React from 'react';
import Image from 'next/image';
import HomeFooter from "@/components/HomeFooter";

export default function BrandKit() {
  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gray-50 dark:bg-[var(--background)] text-xs text-gray-600 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-transparent p-8">
          <h1 className="text-3xl md:text-4xl font-base text-gray-900 dark:text-white mb-4">
            Brand Kit
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-24">
            <p className="mb-4">
              This page contains our official brand assets,
              including logos, color palettes, typography guidelines, and usage instructions
              for maintaining consistent brand representation across all platforms and media.
            </p>
            <p>
              All assets provided here are approved for use by community members, partners,
              and media outlets when representing Pennysia.
            </p>
            <a
              href="/pennysia-brandkit.zip"
              download
              className="inline-flex items-center px-4 py-2 bg-[#5B7AF6] text-white rounded-lg hover:bg-[#4967DC] transition-colors mt-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Full Brand Kit
            </a>
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="mb-24">
              <h2 className="text-2xl md:text-3xl font-base text-gray-900 dark:text-white mb-12">
                Logo
              </h2>
              <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                Full
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 w-full items-start gap-4 mb-12">
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/full-logo/light-mode-full-logo.svg" download className="w-full h-full flex rounded-2xl bg-white border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/full-logo/light-mode-full-logo.svg" alt="Full logo on light" width={200} height={200} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Full logo on light
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/full-logo/dark-mode-full-logo.svg" download className="w-full h-full flex rounded-2xl bg-black border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/full-logo/dark-mode-full-logo.svg" alt="Full logo on dark" width={200} height={200} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Full logo on dark
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/full-logo/light-mode-solid-full-logo.svg" download className="w-full h-full flex rounded-2xl bg-white border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/full-logo/light-mode-solid-full-logo.svg" alt="Solid logo on light" width={200} height={200} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Solid logo on light
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/full-logo/dark-mode-solid-full-logo.svg" download className="w-full h-full flex rounded-2xl bg-black border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/full-logo/dark-mode-solid-full-logo.svg" alt="Solid logo on dark" width={200} height={200} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Solid logo on dark
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                Wordmark
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 w-full items-start mb-12 gap-4">
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/wordmark/light-mode-wordmark.svg" download className="w-full h-full flex rounded-2xl bg-white border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/wordmark/light-mode-wordmark.svg" alt="Wordmark on light" width={200} height={200} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Wordmark on light
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/wordmark/dark-mode-wordmark.svg" download className="w-full h-full flex rounded-2xl bg-black border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/wordmark/dark-mode-wordmark.svg" alt="Wordmark on dark" width={200} height={200} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Wordmark on dark
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                Icon
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 w-full items-start mb-12 gap-4">
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/icon/light-mode-icon.svg" download className="w-full h-full flex  rounded-2xl bg-white border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/icon/light-mode-icon.svg" alt="Icon on light" width={160} height={160} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Icon on light
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/icon/dark-mode-icon.svg" download className="w-full h-full flex  rounded-2xl bg-black border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/icon/dark-mode-icon.svg" alt="Icon on dark" width={160} height={160} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Icon on dark
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/icon/light-mode-solid-icon.svg" download className="w-full h-full flex  rounded-2xl bg-white border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/icon/light-mode-solid-icon.svg" alt="Solid icon on light" width={160} height={160} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Solid icon on light
                  </p>
                </div>
                <div className="flex flex-col">
                  <a href="/pennysia-brandkit/icon/dark-mode-solid-icon.svg" download className="w-full h-full flex rounded-2xl bg-black border border-gray-200 dark:border-gray-800 items-center justify-center group relative">
                    <Image src="/pennysia-brandkit/icon/dark-mode-solid-icon.svg" alt="Solid icon on dark" width={160} height={160} className="w-full h-full object-contain p-4" />
                    <div className="rounded-2xl absolute inset-0 bg-black/50 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </a>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400">
                    Solid icon on dark
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-base text-gray-900 dark:text-white mb-12">
                Color
              </h2>
              <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                Primary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 w-full items-start mb-4">
                <div className="flex flex-col">
                  <div className="w-full h-24 sm:h-36 bg-white border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#FFFFFF')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#FFFFFF')}>
                    #FFFFFF
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-24 sm:h-36 bg-[#EEEEEE] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#EEEEEE')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#EEEEEE')}>
                    #EEEEEE
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-24 sm:h-36 bg-[#19192A] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#19192A')}>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-black bg-white/70 px-2 py-1">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#19192A')}>
                    #19192A
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-24">
              <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                Secondary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 w-full items-start mb-4">
                <div className="flex flex-col">
                  <div className="w-full h-16 sm:h-20 bg-[#F7F7F7] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#F7F7F7')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#F7F7F7')}>
                    #F7F7F7
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-16 sm:h-20 bg-[#E7E8EB] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#E7E8EB')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#E7E8EB')}>
                    #E7E8EB
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-16 sm:h-20 bg-[#CDD0D7] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#CDD0D7')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#CDD0D7')}>
                    #CDD0D7
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 w-full items-start mb-4">
                <div className="flex flex-col">
                  <div className="w-full h-16 sm:h-20 bg-[#A7ADBB] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#A7ADBB')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#A7ADBB')}>
                    #A7ADBB
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-16 sm:h-20 bg-[#555C6F] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#555C6F')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#555C6F')}>
                    #555C6F
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-16 sm:h-20 bg-[#2E2F46] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#2E2F46')}>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-black bg-white/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#2E2F46')}>
                    #2E2F46
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                Accent
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 w-full items-start mb-4">
                <div className="flex flex-col">
                  <div className="w-full h-12 sm:h-14 bg-[#4967DC] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#4967DC')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#4967DC')}>
                    #4967DC
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-12 sm:h-14 bg-[#5B7AF6] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#5B7AF6')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#5B7AF6')}>
                    #5B7AF6
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-12 sm:h-14 bg-[#92A8FF] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#92A8FF')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#92A8FF')}>
                    #92A8FF
                  </p>
                </div>
                <div className="flex flex-col">
                  <div className="w-full h-12 sm:h-14 bg-[#C7D2FF] border border-gray-200 dark:border-gray-800 items-center justify-center cursor-pointer group relative" onClick={() => navigator.clipboard.writeText('#C7D2FF')}>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="text-xs text-white bg-black/70 px-2 py-1 rounded">Copy</span>
                    </div>
                  </div>
                  <p className="text-left py-4 text-sm text-gray-400 dark:text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => navigator.clipboard.writeText('#C7D2FF')}>
                    #C7D2FF
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-24">
              <h2 className="text-2xl md:text-3xl font-base text-gray-900 dark:text-white mb-12">
                Typography
              </h2>
              <div className="mb-8">
                <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                  Headlines
                </h3>
                <div className="w-full items-start mb-4">
                  <p className="text-[32px] font-bold text-gray-900 dark:text-white mb-1">
                    Inter Bold 32px
                  </p>
                  <p className="text-[24px] font-semibold text-gray-900 dark:text-white mb-1">
                    Inter Semi Bold 24px
                  </p>
                  <p className="text-[20px] font-semibold text-gray-900 dark:text-white mb-1">
                    Inter Semi Bold 20px
                  </p>
                  <p className="text-[16px] font-semibold text-gray-900 dark:text-white mb-1">
                    Inter Semi Bold 16px
                  </p>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-base text-gray-900 dark:text-white mb-4 rounded-full px-4 w-fit bg-[#555C6F]/10">
                  Body
                </h3>
                <div className="w-full items-start mb-8">
                  <p className="text-[14px] font-base text-gray-900 dark:text-white mb-1">
                    Inter Medium 14px
                  </p>
                  <p className="text-[12px] font-base text-gray-900 dark:text-white mb-1">
                    Inter Medium 12px
                  </p>
                  <p className="text-[10px] font-base text-gray-900 dark:text-white mb-1">
                    Inter Medium 10px
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
