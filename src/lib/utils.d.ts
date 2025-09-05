import { Token } from './token';
import { ChainId } from './chains';
export declare function sortTokens(tokenA: Token, tokenB: Token): [Token, Token];
export declare function createTokenPairKey(tokenA: Token, tokenB: Token): string;
export declare function calculatePrice(reserve0: string, reserve1: string, decimals0: number, decimals1: number): string;
export declare function invertPrice(price: string): string;
export declare function calculatePercentageChange(oldValue: string, newValue: string): string;
export declare function calculateLiquidityShare(userLiquidity: string, totalLiquidity: string, decimals?: number): string;
export declare function validateSwapPath(path: string[]): void;
export declare function createSwapPath(tokenIn: Token, tokenOut: Token, intermediateTokens?: Token[]): string[];
export declare function estimateGasWithBuffer(estimatedGas: bigint, bufferPercent?: number): bigint;
export declare function isDeadlineExpired(deadline: number): boolean;
export declare function formatTimeRemaining(deadline: number): string;
export declare function shortenAddress(address: string, startLength?: number, endLength?: number): string;
export declare function isAddressEqual(address1: string, address2: string): boolean;
export declare function getExplorerUrl(chainId: ChainId, hash: string, type?: 'tx' | 'address' | 'token'): string;
//# sourceMappingURL=utils.d.ts.map