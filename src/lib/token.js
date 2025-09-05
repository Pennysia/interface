"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NATIVE_CURRENCY = exports.WETH = exports.NativeCurrency = exports.Token = void 0;
const chains_1 = require("./chains");
class Token {
    constructor(chainId, address, decimals, symbol, name) {
        this.chainId = chainId;
        this.address = address.toLowerCase();
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
    }
    equals(other) {
        return (this.chainId === other.chainId &&
            this.address === other.address);
    }
    sortsBefore(other) {
        if (this.chainId !== other.chainId) {
            throw new Error('Cannot compare tokens from different chains');
        }
        return this.address.toLowerCase() < other.address.toLowerCase();
    }
}
exports.Token = Token;
// Native currency wrapper
class NativeCurrency extends Token {
    constructor(chainId, decimals, symbol, name) {
        super(chainId, '0x0000000000000000000000000000000000000000', decimals, symbol, name);
    }
    get isNative() {
        return true;
    }
}
exports.NativeCurrency = NativeCurrency;
// Common tokens - to be updated with actual deployed addresses
exports.WETH = {
    [chains_1.ChainId.MAINNET]: new Token(chains_1.ChainId.MAINNET, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
    [chains_1.ChainId.SEPOLIA]: new Token(chains_1.ChainId.SEPOLIA, '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9', 18, 'WETH', 'Wrapped Ether'),
    [chains_1.ChainId.SONIC]: new Token(chains_1.ChainId.SONIC, '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', // Placeholder
    18, 'WETH', 'Wrapped Ether'),
    [chains_1.ChainId.SONIC_BLAZE_TESTNET]: new Token(chains_1.ChainId.SONIC_BLAZE_TESTNET, '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38', // Placeholder
    18, 'WETH', 'Wrapped Ether'),
};
exports.NATIVE_CURRENCY = {
    [chains_1.ChainId.MAINNET]: new NativeCurrency(chains_1.ChainId.MAINNET, 18, 'ETH', 'Ether'),
    [chains_1.ChainId.SEPOLIA]: new NativeCurrency(chains_1.ChainId.SEPOLIA, 18, 'SEP', 'Sepolia Ether'),
    [chains_1.ChainId.SONIC]: new NativeCurrency(chains_1.ChainId.SONIC, 18, 'S', 'Sonic'),
    [chains_1.ChainId.SONIC_BLAZE_TESTNET]: new NativeCurrency(chains_1.ChainId.SONIC_BLAZE_TESTNET, 18, 'S', 'Sonic'),
};
//# sourceMappingURL=token.js.map