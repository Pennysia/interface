'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ArrowsRightLeftIcon, 
  BeakerIcon, 
  ChartBarIcon,
  WalletIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import {
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  BeakerIcon as BeakerIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  WalletIcon as WalletIconSolid,
  HomeIcon as HomeIconSolid
} from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { motion } from 'framer-motion'

const navigation = [
  { 
    name: 'Home', 
    href: '/', 
    icon: HomeIcon, 
    iconSolid: HomeIconSolid,
    description: 'Welcome to Pennysia'
  },
  { 
    name: 'Market', 
    href: '/market', 
    icon: ChartBarIcon, 
    iconSolid: ChartBarIconSolid,
    description: 'View all pools and market data'
  },
  { 
    name: 'Swap', 
    href: '/swap', 
    icon: ArrowsRightLeftIcon, 
    iconSolid: ArrowsRightLeftIconSolid,
    description: 'Trade tokens with directional positions'
  },
  { 
    name: 'Liquidity', 
    href: '/liquidity', 
    icon: BeakerIcon, 
    iconSolid: BeakerIconSolid,
    description: 'Provide liquidity and manage your portfolio'
  }
]

interface NavigationProps {
  className?: string
}

function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={clsx('relative flex space-x-2 p-1 rounded-xl', className)}>
      {navigation.map((item) => {
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              'relative group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              isActive
                ? 'text-blue-500'
                : 'text-gray-600 dark:text-gray-200 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50'
            )}
            title={item.description}
          >
            {isActive && (
              <motion.span
                layoutId="nav-active-pill-desktop"
                className="absolute inset-0 rounded-lg bg-blue-300/30 shadow-sm shadow-blue-500/20 dark:bg-blue-400/20 z-0"
                transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
              />
            )}
            <span className="hidden sm:block relative z-10">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export default React.memo(Navigation)
