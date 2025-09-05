import { ChainId } from './chains';
export interface ContractAddresses {
    market?: string;
    router?: string;
}
export declare const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses>;
export declare function getMarketAddress(chainId: ChainId): string | undefined;
export declare function getRouterAddress(chainId: ChainId): string | undefined;
export declare function getContractAddresses(chainId: ChainId): ContractAddresses;
//# sourceMappingURL=addresses.d.ts.map