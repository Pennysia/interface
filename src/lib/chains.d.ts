export declare enum ChainId {
    MAINNET = 1,
    SEPOLIA = 11155111,
    SONIC = 146,
    SONIC_BLAZE_TESTNET = 57054
}
export interface ChainInfo {
    id: ChainId;
    name: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
}
export declare const CHAIN_INFO: Record<ChainId, ChainInfo>;
export declare function getChainInfoWithRpc(chainId: ChainId, rpcUrls?: string[]): ChainInfo;
export declare const SUPPORTED_CHAINS: ChainId[];
export declare function getChainInfo(chainId: ChainId): ChainInfo | undefined;
export declare function isChainSupported(chainId: number): chainId is ChainId;
//# sourceMappingURL=chains.d.ts.map