"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PennysiaAMM = void 0;
const big_js_1 = __importDefault(require("big.js"));
// Configure Big.js for precision
big_js_1.default.DP = 40; // decimal places
big_js_1.default.RM = big_js_1.default.roundHalfUp; // rounding mode
class PennysiaAMM {
    /**
     * Calculate output amount for a given input amount
     * Based on Market.sol logic: fee is deducted from output
     */
    static getAmountOut(amountIn, reserveIn, reserveOut) {
        if (new big_js_1.default(amountIn).lte(0)) {
            throw new Error('Amount in must be greater than 0');
        }
        if (new big_js_1.default(reserveIn).lte(0) || new big_js_1.default(reserveOut).lte(0)) {
            throw new Error('Reserves must be greater than 0');
        }
        const amountInBig = new big_js_1.default(amountIn);
        const reserveInBig = new big_js_1.default(reserveIn);
        const reserveOutBig = new big_js_1.default(reserveOut);
        // Calculate new reserve after input
        const newReserveIn = reserveInBig.plus(amountInBig);
        // Calculate new reserve out using constant product formula
        const newReserveOut = reserveInBig.times(reserveOutBig).div(newReserveIn);
        // Calculate gross amount out
        const grossAmountOut = reserveOutBig.minus(newReserveOut);
        // Deduct fee from output (fee = grossAmountOut * 3/1000)
        const fee = grossAmountOut.times(this.FEE_NUMERATOR).div(this.FEE_DENOMINATOR);
        const netAmountOut = grossAmountOut.minus(fee);
        return netAmountOut.toFixed(0); // Return as integer string
    }
    /**
     * Calculate input amount needed for a given output amount
     * Based on RouterLibrary.sol logic: fee-inclusive calculation
     */
    static getAmountIn(amountOut, reserveIn, reserveOut) {
        if (new big_js_1.default(amountOut).lte(0)) {
            throw new Error('Amount out must be greater than 0');
        }
        if (new big_js_1.default(reserveIn).lte(0) || new big_js_1.default(reserveOut).lte(0)) {
            throw new Error('Reserves must be greater than 0');
        }
        const amountOutBig = new big_js_1.default(amountOut);
        const reserveInBig = new big_js_1.default(reserveIn);
        const reserveOutBig = new big_js_1.default(reserveOut);
        // Calculate fee-inclusive amount out (divUp equivalent)
        const amountOutWithFee = amountOutBig.times(this.FEE_DENOMINATOR + this.FEE_NUMERATOR).div(this.FEE_DENOMINATOR);
        // Check if we have enough reserves
        if (amountOutWithFee.gte(reserveOutBig)) {
            throw new Error('Insufficient reserves for requested output');
        }
        // Calculate new reserve out after withdrawal
        const newReserveOut = reserveOutBig.minus(amountOutWithFee);
        // Calculate required input using constant product formula
        const newReserveIn = reserveInBig.times(reserveOutBig).div(newReserveOut);
        const amountIn = newReserveIn.minus(reserveInBig);
        return amountIn.toFixed(0); // Return as integer string
    }
    /**
     * Calculate liquidity tokens to mint for given token amounts
     * Based on Market.sol addLiquidity logic
     */
    static getLiquidityMinted(totalSupply, tokenAAmount, tokenBAmount, reserveA, reserveB) {
        const totalSupplyBig = new big_js_1.default(totalSupply);
        if (totalSupplyBig.eq(0)) {
            // First liquidity provision - use geometric mean
            const tokenABig = new big_js_1.default(tokenAAmount);
            const tokenBBig = new big_js_1.default(tokenBAmount);
            return tokenABig.times(tokenBBig).sqrt().toFixed(0);
        }
        // Subsequent liquidity provision - proportional to existing reserves
        const tokenABig = new big_js_1.default(tokenAAmount);
        const tokenBBig = new big_js_1.default(tokenBAmount);
        const reserveABig = new big_js_1.default(reserveA);
        const reserveBBig = new big_js_1.default(reserveB);
        const liquidityA = tokenABig.times(totalSupplyBig).div(reserveABig);
        const liquidityB = tokenBBig.times(totalSupplyBig).div(reserveBBig);
        // Return the minimum to ensure both tokens are fully utilized
        return liquidityA.lt(liquidityB) ? liquidityA.toFixed(0) : liquidityB.toFixed(0);
    }
    /**
     * Calculate token amounts to receive when burning liquidity
     */
    static getLiquidityValue(liquidity, totalSupply, reserveA, reserveB) {
        const liquidityBig = new big_js_1.default(liquidity);
        const totalSupplyBig = new big_js_1.default(totalSupply);
        const reserveABig = new big_js_1.default(reserveA);
        const reserveBBig = new big_js_1.default(reserveB);
        const amountA = liquidityBig.times(reserveABig).div(totalSupplyBig);
        const amountB = liquidityBig.times(reserveBBig).div(totalSupplyBig);
        return {
            amountA: amountA.toFixed(0),
            amountB: amountB.toFixed(0)
        };
    }
    /**
     * Calculate price impact for a trade
     */
    static getPriceImpact(amountIn, reserveIn, reserveOut) {
        const amountInBig = new big_js_1.default(amountIn);
        const reserveInBig = new big_js_1.default(reserveIn);
        const reserveOutBig = new big_js_1.default(reserveOut);
        // Price before trade
        const priceBefore = reserveOutBig.div(reserveInBig);
        // Price after trade
        const newReserveIn = reserveInBig.plus(amountInBig);
        const amountOut = this.getAmountOut(amountIn, reserveIn, reserveOut);
        const newReserveOut = reserveOutBig.minus(amountOut);
        const priceAfter = newReserveOut.div(newReserveIn);
        // Price impact as percentage
        const priceImpact = priceBefore.minus(priceAfter).div(priceBefore).times(100);
        return priceImpact.toFixed(4); // Return as percentage with 4 decimal places
    }
}
exports.PennysiaAMM = PennysiaAMM;
// Fee is 0.3% (3/1000)
PennysiaAMM.FEE_NUMERATOR = 3;
PennysiaAMM.FEE_DENOMINATOR = 1000;
//# sourceMappingURL=math.js.map