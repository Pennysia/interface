"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTRACT_ADDRESSES = void 0;
exports.getMarketAddress = getMarketAddress;
exports.getRouterAddress = getRouterAddress;
exports.getContractAddresses = getContractAddresses;
const chains_1 = require("./chains");
// Pennysia contract addresses - Sonic Mainnet only
exports.CONTRACT_ADDRESSES = {
    [chains_1.ChainId.MAINNET]: {},
    [chains_1.ChainId.SEPOLIA]: {},
    [chains_1.ChainId.SONIC]: {
        market: '0xE7fc91070ceE115e4B9dfa97B90603e41D9A2176',
        router: '0x107F61D94A9072c50727E3D6D52A44CDE6AE2f77',
    },
    [chains_1.ChainId.SONIC_BLAZE_TESTNET]: {},
};
function getMarketAddress(chainId) {
    return exports.CONTRACT_ADDRESSES[chainId]?.market;
}
function getRouterAddress(chainId) {
    return exports.CONTRACT_ADDRESSES[chainId]?.router;
}
function getContractAddresses(chainId) {
    return exports.CONTRACT_ADDRESSES[chainId] || {};
}
//# sourceMappingURL=addresses.js.map