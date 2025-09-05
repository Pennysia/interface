'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/contexts/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = useCallback(() => {
    toggleTheme()
  }, [toggleTheme])

  const buttonContent = useMemo(() => {
    if (!mounted) {
      return (
        <button suppressHydrationWarning className="p-2 rounded-2xl bg-gray-200/10 border border-[#19192A] transition-all duration-200">
          <SunIcon className="h-5 w-5 text-gray-700" />
        </button>
      )
    }

    return (
      <button
        suppressHydrationWarning
        onClick={handleToggle}
        className="cursor-pointer p-2 rounded-2xl bg-gray-200/10 hover:bg-gray-200 dark:bg-[#19192A]/50 dark:hover:bg-[#555C6F]/50 border border-[#19192A]/50 dark:border-gray-400/50 transition-all duration-200"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300 fill-[#19192A]" />
        ) : (
          <SunIcon className="h-5 w-5 text-gray-700 dark:text-gray-300 fill-white" />
        )}
      </button>
    )
  }, [mounted, theme, handleToggle])

  return buttonContent
}

export default React.memo(ThemeToggle)
