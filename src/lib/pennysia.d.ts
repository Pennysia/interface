import { ethers, Contract, Provider, Signer } from 'ethers';
import { ChainId } from './chains';
import { Token } from './token';
export interface SwapParams {
    path: string[];
    amountIn: string;
    amountOutMin: string;
    to: string;
    deadline: number;
}
export interface AddLiquidityParams {
    token0: Token;
    token1: Token;
    amount0Long: string;
    amount0Short: string;
    amount1Long: string;
    amount1Short: string;
    longXMinimum: string;
    shortXMinimum: string;
    longYMinimum: string;
    shortYMinimum: string;
    to: string;
    deadline: number;
}
export interface RemoveLiquidityParams {
    token0: Token;
    token1: Token;
    longX: string;
    shortX: string;
    longY: string;
    shortY: string;
    amount0Minimum: string;
    amount1Minimum: string;
    to: string;
    deadline: number;
}
export interface LpSwapParams {
    token0: Token;
    token1: Token;
    longToShort0: boolean;
    liquidity0: string;
    longToShort1: boolean;
    liquidity1: string;
    liquidity0OutMinimum: string;
    liquidity1OutMinimum: string;
    to: string;
    deadline: number;
}
export declare class PennysiaSDK {
    readonly chainId: ChainId;
    readonly provider: Provider;
    readonly signer?: Signer;
    readonly marketContract: Contract;
    readonly routerContract: Contract;
    constructor(chainId: ChainId, provider: Provider, signer?: Signer);
    static create(chainId: ChainId, provider: Provider, signer?: Signer): PennysiaSDK;
    getTokenContract(tokenAddress: string): Promise<Contract>;
    getTokenInfo(tokenAddress: string): Promise<{
        name: string;
        symbol: string;
        decimals: number;
        totalSupply: string;
    }>;
    getReserves(token0: Token, token1: Token): Promise<{
        reserve0Long: string;
        reserve0Short: string;
        reserve1Long: string;
        reserve1Short: string;
    }>;
    getPairId(token0: Token, token1: Token): Promise<string>;
    getPairInfo(pairId: string): Promise<{
        reserve0Long: string;
        reserve0Short: string;
        reserve1Long: string;
        reserve1Short: string;
        blockTimestampLast: string;
        cbrtPriceX128CumulativeLast: string;
    }>;
    getAmountOut(amountIn: string, reserveIn: string, reserveOut: string): Promise<string>;
    getAmountIn(amountOut: string, reserveIn: string, reserveOut: string): Promise<string>;
    getAmountsOut(amountIn: string, path: string[]): Promise<string[]>;
    getAmountsIn(amountOut: string, path: string[]): Promise<string[]>;
    quoteLiquidity(token0: Token, token1: Token, amountLong0: string, amountShort0: string, amountLong1: string, amountShort1: string): Promise<{
        longX: string;
        shortX: string;
        longY: string;
        shortY: string;
    }>;
    swap(params: SwapParams): Promise<ethers.ContractTransactionResponse>;
    addLiquidity(params: AddLiquidityParams): Promise<ethers.ContractTransactionResponse>;
    removeLiquidity(params: RemoveLiquidityParams): Promise<ethers.ContractTransactionResponse>;
    lpSwap(params: LpSwapParams): Promise<ethers.ContractTransactionResponse>;
    approveTTL(token: Token, spender: string, value: string, deadline: number): Promise<ethers.ContractTransactionResponse>;
    getAllowanceTTL(token: Token, owner: string, spender: string): Promise<{
        value: string;
        deadline: string;
    }>;
    getNativeCurrency(): Token;
    getWETH(): Token;
    getChainInfo(): import("./chains").ChainInfo | undefined;
    calculatePriceImpact(amountIn: string, tokenIn: Token, tokenOut: Token): Promise<string>;
    static createDeadline(minutesFromNow?: number): number;
}
//# sourceMappingURL=pennysia.d.ts.map