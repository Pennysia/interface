'use client'

import React from 'react'

const AnnouncementBanner = () => {
  return (
    <div className="w-full bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200/50 dark:border-amber-700/30 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center p-4">
            <div className="flex items-center space-x-3">
              {/* Warning Icon */}
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-sm font-normal text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">MVP Notice:</span> This is the MVP version developed during{' '}
                  <a 
                    href="https://x.com/SonicWorldHQ/status/1973693995168731624" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-900 dark:hover:text-amber-100 transition-colors font-semibold"
                  >
                    Sonic S-tier Hackathon Aug-Sept 2025
                  </a>. 
                  The code has not undergone security audits and is not intended for production use.{' '}
                  If you want to learn more, please refer to{' '}
                  <a 
                    href="https://docs.pennysia.com/resources/hackathon" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-900 dark:hover:text-amber-100 transition-colors font-semibold"
                  >
                    this page
                  </a>.
                </p>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementBanner
