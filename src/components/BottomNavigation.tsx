'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ArrowsRightLeftIcon, 
  BeakerIcon, 
  HomeIcon,
} from '@heroicons/react/24/outline'
import {
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  BeakerIcon as BeakerIconSolid,
  HomeIcon as HomeIconSolid,
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
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/10 transition-colors duration-300">
      <div className="relative flex justify-around items-center px-4 py-2 safe-area-pb">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'relative flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 min-w-0 flex-1',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
              title={item.description}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-lg bg-blue-300/30 shadow-sm shadow-blue-500/20 dark:bg-blue-400/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 1 }}
                />
              )}
              <Icon className={clsx(
                'h-5 w-5 mb-1 transition-colors',
                isActive ? 'text-blue-600 dark:text-blue-400' : ''
              )} />
              <span className="text-xs truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
