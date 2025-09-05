export declare class PennysiaAMM {
    private static readonly FEE_NUMERATOR;
    private static readonly FEE_DENOMINATOR;
    /**
     * Calculate output amount for a given input amount
     * Based on Market.sol logic: fee is deducted from output
     */
    static getAmountOut(amountIn: string, reserveIn: string, reserveOut: string): string;
    /**
     * Calculate input amount needed for a given output amount
     * Based on RouterLibrary.sol logic: fee-inclusive calculation
     */
    static getAmountIn(amountOut: string, reserveIn: string, reserveOut: string): string;
    /**
     * Calculate liquidity tokens to mint for given token amounts
     * Based on Market.sol addLiquidity logic
     */
    static getLiquidityMinted(totalSupply: string, tokenAAmount: string, tokenBAmount: string, reserveA: string, reserveB: string): string;
    /**
     * Calculate token amounts to receive when burning liquidity
     */
    static getLiquidityValue(liquidity: string, totalSupply: string, reserveA: string, reserveB: string): {
        amountA: string;
        amountB: string;
    };
    /**
     * Calculate price impact for a trade
     */
    static getPriceImpact(amountIn: string, reserveIn: string, reserveOut: string): string;
}
//# sourceMappingURL=math.d.ts.map