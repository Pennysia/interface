// Mock token data
export const MOCK_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', balance: '2.5', price: 3200 },
  { symbol: 'USDC', name: 'USD Coin', balance: '1000.0', price: 1 },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: '0.1', price: 65000 },
  { symbol: 'LINK', name: 'Chainlink', balance: '50.0', price: 15 },
]

// Mock pool data
export const MOCK_POOLS = {
  'ETH-USDC': { exists: true, price: 3200, liquidity: 1500000 },
  'WBTC-USDC': { exists: true, price: 65000, liquidity: 800000 },
  'LINK-ETH': { exists: false, price: 0, liquidity: 0 },
}

// Comprehensive liquidity positions data
export const LIQUIDITY_POSITIONS = [
  {
    id: 1,
    pair: 'ETH/USDC',
    token0Symbol: 'ETH',
    token1Symbol: 'USDC',
    liquidity: '2.5 ETH',
    value: '$8,125',
    apr: '12.5%',
    fees24h: '$45.20',
    pnl: '+$234.50',
    pnlPercent: '+2.97%',
    isProfit: true,
    reserve0Long: '2.5 ETH',
    reserve0Short: '0 ETH',
    reserve1Long: '8000 USDC',
    reserve1Short: '0 USDC',
    totalShares: '1,250,000',
    myShares: '12,500',
    sharePercent: '1.0%'
  },
  {
    id: 2,
    pair: 'BTC/USDC',
    token0Symbol: 'BTC',
    token1Symbol: 'USDC',
    liquidity: '0.15 BTC',
    value: '$9,750',
    apr: '8.7%',
    fees24h: '$28.90',
    pnl: '-$156.30',
    pnlPercent: '-1.58%',
    isProfit: false,
    reserve0Long: '0 BTC',
    reserve0Short: '0.15 BTC',
    reserve1Long: '9750 USDC',
    reserve1Short: '0 USDC',
    totalShares: '2,100,000',
    myShares: '8,400',
    sharePercent: '0.4%'
  },
  {
    id: 3,
    pair: 'LINK/ETH',
    token0Symbol: 'LINK',
    token1Symbol: 'ETH',
    liquidity: '50 LINK',
    value: '$750',
    apr: '15.2%',
    fees24h: '$12.40',
    pnl: '+$45.80',
    pnlPercent: '+6.5%',
    isProfit: true,
    reserve0Long: '50 LINK',
    reserve0Short: '0 LINK',
    reserve1Long: '0.5 ETH',
    reserve1Short: '0 ETH',
    totalShares: '500,000',
    myShares: '2,500',
    sharePercent: '0.5%'
  },
  {
    id: 4,
    pair: 'SOL/USDC',
    token0Symbol: 'SOL',
    token1Symbol: 'USDC',
    liquidity: '50 SOL',
    value: '$5,500',
    apr: '11.3%',
    fees24h: '$18.75',
    pnl: '+$89.20',
    pnlPercent: '+1.65%',
    isProfit: true,
    reserve0Long: '50 SOL',
    reserve0Short: '0 SOL',
    reserve1Long: '5500 USDC',
    reserve1Short: '0 USDC',
    totalShares: '750,000',
    myShares: '3,750',
    sharePercent: '0.5%'
  }
]

// Mock top pools
export const TOP_POOLS = [
  {
    pair: 'ETH/USDC',
    tvl: '$2.4M',
    volume24h: '$450K',
    fees24h: '$1,350',
    apr: '13.7%'
  },
  {
    pair: 'WBTC/USDC',
    tvl: '$1.8M',
    volume24h: '$320K',
    fees24h: '$960',
    apr: '11.2%'
  },
  {
    pair: 'LINK/ETH',
    tvl: '$890K',
    volume24h: '$180K',
    fees24h: '$540',
    apr: '9.8%'
  }
]
