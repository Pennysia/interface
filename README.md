# Pennysia AMM Frontend

A beautiful, modern frontend for the Pennysia directional AMM protocol built with Next.js, TypeScript, and Tailwind CSS.

**🏆 Built for Sonic S-tier Hackathon | MVP/Prototype Version**

## ⚠️ **HACKATHON MVP - NOT FOR PRODUCTION**

> **🚨 IMPORTANT DISCLAIMER**: This is a **Minimum Viable Product (MVP)** developed during the **Sonic S-tier Hackathon**. 
> 
> **DO NOT USE IN PRODUCTION**:
> - ❌ **No security audits** have been conducted
> - ❌ **Unaudited smart contracts** - funds may be at risk
> - ❌ **Prototype code** - may contain bugs and vulnerabilities
> - ❌ **For demonstration purposes only**
>
> This project is intended to showcase the Pennysia AMM concept and should only be used for testing and evaluation purposes.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask, Brave wallet, or compatible Web3 wallet
- Access to Sonic Mainnet

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
# For HTTP (standard)
npm run dev

# For HTTPS (required for Brave wallet)
npm run dev:https
```

3. Open your browser:
   - HTTP: [http://localhost:3000](http://localhost:3000)
   - HTTPS: [https://localhost:3000](https://localhost:3000) (recommended for Brave wallet)

## 🌐 Network Setup

### Sonic Mainnet Configuration

**Network Details:**
- **Network Name**: Sonic Mainnet
- **RPC URL**: `https://rpc.soniclabs.com`
- **Chain ID**: `146`
- **Currency Symbol**: `S`
- **Block Explorer**: `https://explorer.soniclabs.com`

> **Note**: The app will automatically prompt you to add and switch to Sonic Mainnet when you connect your wallet if you're on a different network.

### Deployed Contracts
- **Market Contract**: `0xE7fc91070ceE115e4B9dfa97B90603e41D9A2176`
- **Router Contract**: `0x107F61D94A9072c50727E3D6D52A44CDE6AE2f77`

## ✨ Features

### 🎯 Directional Trading
- **Long Positions**: Bet on price increases
- **Short Positions**: Bet on price decreases
- **Real-time Price Impact**: Live calculations using Pennysia AMM math
- **Slippage Protection**: Configurable tolerance settings

### 📊 Markets Dashboard
- **Token Overview**: Real-time token balances and contract information
- **Pool Analytics**: Live TVL, long/short liquidity tracking
- **Search & Filter**: Find tokens and pools quickly
- **Responsive Tables**: Clean, modern data presentation

### 💰 Advanced AMM Mechanics
- **Directional Liquidity**: Separate reserves for long/short positions
- **0.3% Protocol Fee**: Consistent across all operations
- **Price Impact Warnings**: Visual alerts for high-impact trades
- **Multi-directional LP Tokens**: Support for complex liquidity positions

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Professional trading interface with theme switching
- **Responsive Design**: Works on all devices
- **Real-time Updates**: Live price and balance updates
- **Toast Notifications**: User-friendly error and success messages
- **Glass Morphism**: Modern visual effects
- **Wallet Integration**: Privy-powered authentication with multiple wallet support

## 🔧 Technical Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Web3 Integration**: Ethers.js v6 + Privy Auth
- **UI Components**: Headless UI + Heroicons
- **SDK**: Custom Pennysia SDK
- **Development**: HTTPS support for wallet compatibility

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Main trading interface
│   ├── market/         # Markets dashboard
│   │   └── page.tsx    # Token and pool analytics
│   ├── swap/           # Trading interface
│   │   └── page.tsx    # Swap functionality
│   └── liquidity/      # Liquidity management
│       └── page.tsx    # LP operations
├── components/         # React components
│   ├── Header.tsx      # Navigation and wallet connection
│   ├── SwapInterface.tsx # Main trading interface
│   └── Navigation.tsx  # App navigation
├── hooks/              # Custom React hooks
│   └── usePools.ts     # Pool and token data fetching
├── services/           # Data services
│   └── poolService.ts  # Pool operations and calculations
└── store/              # State management
    └── useStore.ts     # Zustand store with wallet logic
```

## 🎮 Usage

### Connect Wallet
1. Click "Connect Wallet" in the header
2. Choose your preferred wallet (MetaMask, Brave, or other supported wallets)
3. The app will automatically prompt you to switch to Sonic Mainnet (Chain ID: 146) if needed
4. Approve the network addition/switch in your wallet

### Navigate the App
1. **Markets**: View all available tokens and pools with real-time data
2. **Swap**: Execute directional trades (Long/Short positions)
3. **Liquidity**: Manage your liquidity positions

### Make a Trade
1. Go to the Swap page
2. Select your position type (Long/Short)
3. Enter the amount you want to trade
4. Review price impact and slippage
5. Click "Swap" to execute the trade
6. Confirm the transaction in your wallet

### View Market Data
1. Navigate to the Markets page
2. Switch between "Cryptos" and "Pools" tabs
3. Use the search bar to find specific tokens or pools
4. View real-time balances, TVL, and liquidity information

### Adjust Settings
1. Click the settings icon (⚙️) in the swap interface
2. Adjust slippage tolerance (default: 0.5%)
3. Settings are saved automatically

## 🔍 Monitoring

- **Market Overview**: Real-time volume and liquidity stats
- **Recent Trades**: Live feed of protocol activity
- **Your Positions**: Track your active trades (when connected)
- **Top Pools**: Most active liquidity pools

## 🚨 Important Notes

- **Hackathon MVP**: Built during Sonic S-tier Hackathon - **NOT PRODUCTION READY**
- **No Security Audits**: Smart contracts and frontend code are **UNAUDITED**
- **Prototype Status**: This is experimental code for demonstration purposes only
- **Testnet Recommended**: If testing, use testnet tokens to avoid financial risk
- **Single Chain**: Only Sonic Mainnet (Chain ID: 146) is supported
- **Automatic Network Switching**: App will prompt to switch networks if needed
- **Use at Own Risk**: Any interaction with deployed contracts is at your own risk


## 🛠️ Development

```bash
# Development server (HTTP)
npm run dev

# Development server (HTTPS - recommended for wallet testing)
npm run dev:https

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔗 Links

- **Sonic Explorer**: https://explorer.soniclabs.com
- **Market Contract**: https://explorer.soniclabs.com/address/0xE7fc91070ceE115e4B9dfa97B90603e41D9A2176
- **Router Contract**: https://explorer.soniclabs.com/address/0x107F61D94A9072c50727E3D6D52A44CDE6AE2f77

## 📝 License

MIT License - see LICENSE file for details.
