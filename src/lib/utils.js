"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortTokens = sortTokens;
exports.createTokenPairKey = createTokenPairKey;
exports.calculatePrice = calculatePrice;
exports.invertPrice = invertPrice;
exports.calculatePercentageChange = calculatePercentageChange;
exports.calculateLiquidityShare = calculateLiquidityShare;
exports.validateSwapPath = validateSwapPath;
exports.createSwapPath = createSwapPath;
exports.estimateGasWithBuffer = estimateGasWithBuffer;
exports.isDeadlineExpired = isDeadlineExpired;
exports.formatTimeRemaining = formatTimeRemaining;
exports.shortenAddress = shortenAddress;
exports.isAddressEqual = isAddressEqual;
exports.getExplorerUrl = getExplorerUrl;
const chains_1 = require("./chains");
const errors_1 = require("./errors");
// Token utilities
function sortTokens(tokenA, tokenB) {
    if (tokenA.chainId !== tokenB.chainId) {
        throw new Error('Cannot sort tokens from different chains');
    }
    return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
}
function createTokenPairKey(tokenA, tokenB) {
    const [token0, token1] = sortTokens(tokenA, tokenB);
    return `${token0.address}-${token1.address}`;
}
// Price utilities
function calculatePrice(reserve0, reserve1, decimals0, decimals1) {
    const reserve0Big = BigInt(reserve0);
    const reserve1Big = BigInt(reserve1);
    if (reserve0Big === BigInt(0)) {
        return '0';
    }
    // Adjust for decimal differences
    const decimalDiff = decimals1 - decimals0;
    const adjustedReserve1 = decimalDiff >= 0
        ? reserve1Big * BigInt(10 ** Math.abs(decimalDiff))
        : reserve1Big / BigInt(10 ** Math.abs(decimalDiff));
    // Calculate price as reserve1/reserve0
    const price = (adjustedReserve1 * BigInt(10 ** 18)) / reserve0Big;
    return price.toString();
}
function invertPrice(price) {
    const priceBig = BigInt(price);
    if (priceBig === BigInt(0)) {
        return '0';
    }
    const inverted = (BigInt(10 ** 18) * BigInt(10 ** 18)) / priceBig;
    return inverted.toString();
}
// Percentage utilities
function calculatePercentageChange(oldValue, newValue) {
    const oldBig = BigInt(oldValue);
    const newBig = BigInt(newValue);
    if (oldBig === BigInt(0)) {
        return newBig > BigInt(0) ? '100' : '0';
    }
    const change = newBig - oldBig;
    const percentage = (change * BigInt(10000)) / oldBig; // 100 for percentage, 100 for 2 decimal places
    return percentage.toString();
}
// Liquidity utilities
function calculateLiquidityShare(userLiquidity, totalLiquidity, decimals = 18) {
    const userBig = BigInt(userLiquidity);
    const totalBig = BigInt(totalLiquidity);
    if (totalBig === BigInt(0)) {
        return '0';
    }
    // Calculate percentage with 4 decimal places precision
    const share = (userBig * BigInt(10 ** (decimals + 4))) / totalBig;
    return share.toString();
}
// Path utilities for multi-hop swaps
function validateSwapPath(path) {
    if (!path || path.length < 2) {
        throw new Error('Swap path must contain at least 2 tokens');
    }
    if (path.length > 4) {
        throw new Error('Swap path cannot contain more than 4 tokens');
    }
    // Validate each address in path
    path.forEach((address, index) => {
        try {
            (0, errors_1.validateTokenAddress)(address);
        }
        catch (error) {
            throw new Error(`Invalid token address at path index ${index}: ${address}`);
        }
    });
    // Check for duplicate consecutive tokens
    for (let i = 0; i < path.length - 1; i++) {
        if (path[i].toLowerCase() === path[i + 1].toLowerCase()) {
            throw new Error(`Duplicate consecutive tokens in path at index ${i}`);
        }
    }
}
function createSwapPath(tokenIn, tokenOut, intermediateTokens = []) {
    const path = [tokenIn.address];
    // Add intermediate tokens
    intermediateTokens.forEach(token => {
        if (token.chainId !== tokenIn.chainId) {
            throw new Error('All tokens in swap path must be on the same chain');
        }
        path.push(token.address);
    });
    path.push(tokenOut.address);
    validateSwapPath(path);
    return path;
}
// Gas estimation utilities
function estimateGasWithBuffer(estimatedGas, bufferPercent = 20) {
    const buffer = (estimatedGas * BigInt(bufferPercent)) / BigInt(100);
    return estimatedGas + buffer;
}
// Time utilities
function isDeadlineExpired(deadline) {
    return Math.floor(Date.now() / 1000) >= deadline;
}
function formatTimeRemaining(deadline) {
    const now = Math.floor(Date.now() / 1000);
    const remaining = deadline - now;
    if (remaining <= 0) {
        return 'Expired';
    }
    if (remaining < 60) {
        return `${remaining}s`;
    }
    if (remaining < 3600) {
        const minutes = Math.floor(remaining / 60);
        return `${minutes}m`;
    }
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    return `${hours}h ${minutes}m`;
}
// Address utilities
function shortenAddress(address, startLength = 6, endLength = 4) {
    if (!address || address.length < startLength + endLength) {
        return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}
function isAddressEqual(address1, address2) {
    return address1.toLowerCase() === address2.toLowerCase();
}
// Network utilities
function getExplorerUrl(chainId, hash, type = 'tx') {
    const baseUrls = {
        [chains_1.ChainId.MAINNET]: 'https://etherscan.io',
        [chains_1.ChainId.SEPOLIA]: 'https://sepolia.etherscan.io',
        [chains_1.ChainId.SONIC]: 'https://explorer.soniclabs.com',
        [chains_1.ChainId.SONIC_BLAZE_TESTNET]: 'https://explorer.blaze.soniclabs.com',
    };
    const baseUrl = baseUrls[chainId];
    if (!baseUrl) {
        return '';
    }
    switch (type) {
        case 'tx':
            return `${baseUrl}/tx/${hash}`;
        case 'address':
            return `${baseUrl}/address/${hash}`;
        case 'token':
            return `${baseUrl}/token/${hash}`;
        default:
            return `${baseUrl}/tx/${hash}`;
    }
}
//# sourceMappingURL=utils.js.map