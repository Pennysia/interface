"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_CHAINS = exports.CHAIN_INFO = exports.ChainId = void 0;
exports.getChainInfoWithRpc = getChainInfoWithRpc;
exports.getChainInfo = getChainInfo;
exports.isChainSupported = isChainSupported;
var ChainId;
(function (ChainId) {
    ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
    ChainId[ChainId["SEPOLIA"] = 11155111] = "SEPOLIA";
    ChainId[ChainId["SONIC"] = 146] = "SONIC";
    ChainId[ChainId["SONIC_BLAZE_TESTNET"] = 57054] = "SONIC_BLAZE_TESTNET";
})(ChainId || (exports.ChainId = ChainId = {}));
// Default chain configurations - RPC URLs should be provided by the application
exports.CHAIN_INFO = {
    [ChainId.MAINNET]: {
        id: ChainId.MAINNET,
        name: 'Ethereum Mainnet',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: [], // To be provided by application
        blockExplorerUrls: ['https://etherscan.io'],
    },
    [ChainId.SEPOLIA]: {
        id: ChainId.SEPOLIA,
        name: 'Sepolia Testnet',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: [], // To be provided by application
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
    [ChainId.SONIC]: {
        id: ChainId.SONIC,
        name: 'Sonic Mainnet',
        nativeCurrency: {
            name: 'Sonic',
            symbol: 'S',
            decimals: 18,
        },
        rpcUrls: ['https://rpc.soniclabs.com'], // Public RPC
        blockExplorerUrls: ['https://explorer.soniclabs.com'],
    },
    [ChainId.SONIC_BLAZE_TESTNET]: {
        id: ChainId.SONIC_BLAZE_TESTNET,
        name: 'Sonic Blaze Testnet',
        nativeCurrency: {
            name: 'Sonic',
            symbol: 'S',
            decimals: 18,
        },
        rpcUrls: [],
        blockExplorerUrls: [],
    },
};
// Helper function to get chain info with custom RPC URLs
function getChainInfoWithRpc(chainId, rpcUrls) {
    const chainInfo = exports.CHAIN_INFO[chainId];
    if (!chainInfo) {
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    return {
        ...chainInfo,
        rpcUrls: rpcUrls && rpcUrls.length > 0 ? rpcUrls : chainInfo.rpcUrls
    };
}
// Supported chains for Pennysia: Sonic Mainnet only
exports.SUPPORTED_CHAINS = [ChainId.SONIC];
function getChainInfo(chainId) {
    return exports.CHAIN_INFO[chainId];
}
function isChainSupported(chainId) {
    return exports.SUPPORTED_CHAINS.includes(chainId);
}
//# sourceMappingURL=chains.js.map