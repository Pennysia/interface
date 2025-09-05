import { Token } from './token';
import { ChainId } from './chains';
export interface PairReserves {
    reserve0Long: string;
    reserve0Short: string;
    reserve1Long: string;
    reserve1Short: string;
}
export interface LiquiditySupply {
    longX: string;
    shortX: string;
    longY: string;
    shortY: string;
}
export declare class PennysiaLiquidityToken extends Token {
    readonly token0: Token;
    readonly token1: Token;
    readonly pairAddress: string;
    constructor(chainId: ChainId, pairAddress: string, token0: Token, token1: Token, decimals?: number);
}
export declare class PennysiaPair {
    readonly token0: Token;
    readonly token1: Token;
    readonly chainId: ChainId;
    readonly pairAddress: string;
    readonly liquidityToken: PennysiaLiquidityToken;
    private _reserves;
    private _liquiditySupply;
    constructor(token0: Token, token1: Token, reserves: PairReserves, liquiditySupply: LiquiditySupply, pairAddress: string);
    get reserves(): PairReserves;
    get liquiditySupply(): LiquiditySupply;
    get reserve0Total(): string;
    get reserve1Total(): string;
    get token0Price(): string;
    get token1Price(): string;
    getDirectionalPrice(isToken0: boolean, isLong: boolean): string;
    getOutputAmount(inputToken: Token, inputAmount: string, isLong: boolean): {
        outputAmount: string;
        priceImpact: string;
    };
    getInputAmount(outputToken: Token, outputAmount: string, isLong: boolean): {
        inputAmount: string;
        priceImpact: string;
    };
    getLiquidityMinted(amount0Long: string, amount0Short: string, amount1Long: string, amount1Short: string): {
        longXMinted: string;
        shortXMinted: string;
        longYMinted: string;
        shortYMinted: string;
    };
    getLiquidityValue(longX: string, shortX: string, longY: string, shortY: string): {
        amount0Long: string;
        amount0Short: string;
        amount1Long: string;
        amount1Short: string;
    };
    involvesToken(token: Token): boolean;
    otherToken(token: Token): Token;
    updateReserves(newReserves: PairReserves): void;
    updateLiquiditySupply(newSupply: LiquiditySupply): void;
    static create(token0: Token, token1: Token, reserves: PairReserves, liquiditySupply: LiquiditySupply, pairAddress: string): PennysiaPair;
    hasSufficientLiquidity(inputToken: Token, inputAmount: string, isLong: boolean): boolean;
    get pairKey(): string;
    toString(): string;
}
//# sourceMappingURL=pair.d.ts.map