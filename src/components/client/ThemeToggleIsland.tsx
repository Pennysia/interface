"use client"

import dynamic from 'next/dynamic'

// Skeleton to match Header's placeholder sizing
const ThemeToggle = dynamic(() => import('../ThemeToggle'), {
  ssr: false,
  loading: () => (
    <div className="h-9 w-9 rounded-2xl border border-gray-200/50 dark:border-white/20 bg-gray-100/40 dark:bg-white/10" />
  ),
})

export default ThemeToggle
