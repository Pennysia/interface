"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PennysiaPair = exports.PennysiaLiquidityToken = void 0;
const token_1 = require("./token");
const math_1 = require("./math");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
class PennysiaLiquidityToken extends token_1.Token {
    constructor(chainId, pairAddress, token0, token1, decimals = 18) {
        const [sortedToken0, sortedToken1] = (0, utils_1.sortTokens)(token0, token1);
        const symbol = `PLP-${sortedToken0.symbol}-${sortedToken1.symbol}`;
        const name = `Pennysia LP ${sortedToken0.symbol}/${sortedToken1.symbol}`;
        super(chainId, pairAddress, decimals, symbol, name);
        this.token0 = sortedToken0;
        this.token1 = sortedToken1;
        this.pairAddress = pairAddress;
    }
}
exports.PennysiaLiquidityToken = PennysiaLiquidityToken;
class PennysiaPair {
    constructor(token0, token1, reserves, liquiditySupply, pairAddress) {
        // Ensure tokens are from same chain
        if (token0.chainId !== token1.chainId) {
            throw new errors_1.PennysiaSDKError('Tokens must be from the same chain');
        }
        // Sort tokens for consistent ordering
        const [sortedToken0, sortedToken1] = (0, utils_1.sortTokens)(token0, token1);
        this.token0 = sortedToken0;
        this.token1 = sortedToken1;
        this.chainId = token0.chainId;
        this.pairAddress = pairAddress;
        this._reserves = reserves;
        this._liquiditySupply = liquiditySupply;
        this.liquidityToken = new PennysiaLiquidityToken(this.chainId, pairAddress, this.token0, this.token1);
    }
    // Getters for reserves
    get reserves() {
        return { ...this._reserves };
    }
    get liquiditySupply() {
        return { ...this._liquiditySupply };
    }
    // Total reserves for each token
    get reserve0Total() {
        const longBig = BigInt(this._reserves.reserve0Long);
        const shortBig = BigInt(this._reserves.reserve0Short);
        return (longBig + shortBig).toString();
    }
    get reserve1Total() {
        const longBig = BigInt(this._reserves.reserve1Long);
        const shortBig = BigInt(this._reserves.reserve1Short);
        return (longBig + shortBig).toString();
    }
    // Price calculations
    get token0Price() {
        return (0, utils_1.calculatePrice)(this.reserve0Total, this.reserve1Total, this.token0.decimals, this.token1.decimals);
    }
    get token1Price() {
        return (0, utils_1.calculatePrice)(this.reserve1Total, this.reserve0Total, this.token1.decimals, this.token0.decimals);
    }
    // Directional price calculations (long vs short positions)
    getDirectionalPrice(isToken0, isLong) {
        if (isToken0) {
            const reserveIn = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short;
            const reserveOut = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short;
            return (0, utils_1.calculatePrice)(reserveIn, reserveOut, this.token0.decimals, this.token1.decimals);
        }
        else {
            const reserveIn = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short;
            const reserveOut = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short;
            return (0, utils_1.calculatePrice)(reserveIn, reserveOut, this.token1.decimals, this.token0.decimals);
        }
    }
    // Swap calculations using AMM math
    getOutputAmount(inputToken, inputAmount, isLong) {
        (0, errors_1.validateAmount)(inputAmount, 'Input amount');
        const isToken0Input = inputToken.equals(this.token0);
        let reserveIn;
        let reserveOut;
        if (isToken0Input) {
            reserveIn = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short;
            reserveOut = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short;
        }
        else {
            reserveIn = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short;
            reserveOut = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short;
        }
        const outputAmount = math_1.PennysiaAMM.getAmountOut(inputAmount, reserveIn, reserveOut);
        const priceImpact = math_1.PennysiaAMM.getPriceImpact(inputAmount, reserveIn, reserveOut);
        return { outputAmount, priceImpact };
    }
    getInputAmount(outputToken, outputAmount, isLong) {
        (0, errors_1.validateAmount)(outputAmount, 'Output amount');
        const isToken0Output = outputToken.equals(this.token0);
        let reserveIn;
        let reserveOut;
        if (isToken0Output) {
            reserveOut = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short;
            reserveIn = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short;
        }
        else {
            reserveOut = isLong ? this._reserves.reserve1Long : this._reserves.reserve1Short;
            reserveIn = isLong ? this._reserves.reserve0Long : this._reserves.reserve0Short;
        }
        const inputAmount = math_1.PennysiaAMM.getAmountIn(outputAmount, reserveIn, reserveOut);
        const priceImpact = math_1.PennysiaAMM.getPriceImpact(inputAmount, reserveIn, reserveOut);
        return { inputAmount, priceImpact };
    }
    // Liquidity calculations
    getLiquidityMinted(amount0Long, amount0Short, amount1Long, amount1Short) {
        (0, errors_1.validateAmount)(amount0Long, 'Amount 0 Long');
        (0, errors_1.validateAmount)(amount0Short, 'Amount 0 Short');
        (0, errors_1.validateAmount)(amount1Long, 'Amount 1 Long');
        (0, errors_1.validateAmount)(amount1Short, 'Amount 1 Short');
        const longXMinted = math_1.PennysiaAMM.getLiquidityMinted(this._liquiditySupply.longX, amount0Long, amount1Long, this._reserves.reserve0Long, this._reserves.reserve1Long);
        const shortXMinted = math_1.PennysiaAMM.getLiquidityMinted(this._liquiditySupply.shortX, amount0Short, amount1Short, this._reserves.reserve0Short, this._reserves.reserve1Short);
        const longYMinted = math_1.PennysiaAMM.getLiquidityMinted(this._liquiditySupply.longY, amount1Long, amount0Long, this._reserves.reserve1Long, this._reserves.reserve0Long);
        const shortYMinted = math_1.PennysiaAMM.getLiquidityMinted(this._liquiditySupply.shortY, amount1Short, amount0Short, this._reserves.reserve1Short, this._reserves.reserve0Short);
        return {
            longXMinted,
            shortXMinted,
            longYMinted,
            shortYMinted
        };
    }
    getLiquidityValue(longX, shortX, longY, shortY) {
        const { amountA: amount0Long } = math_1.PennysiaAMM.getLiquidityValue(longX, this._liquiditySupply.longX, this._reserves.reserve0Long, this._reserves.reserve1Long);
        const { amountA: amount0Short } = math_1.PennysiaAMM.getLiquidityValue(shortX, this._liquiditySupply.shortX, this._reserves.reserve0Short, this._reserves.reserve1Short);
        const { amountA: amount1Long } = math_1.PennysiaAMM.getLiquidityValue(longY, this._liquiditySupply.longY, this._reserves.reserve1Long, this._reserves.reserve0Long);
        const { amountA: amount1Short } = math_1.PennysiaAMM.getLiquidityValue(shortY, this._liquiditySupply.shortY, this._reserves.reserve1Short, this._reserves.reserve0Short);
        return {
            amount0Long,
            amount0Short,
            amount1Long,
            amount1Short
        };
    }
    // Utility methods
    involvesToken(token) {
        return token.equals(this.token0) || token.equals(this.token1);
    }
    otherToken(token) {
        if (token.equals(this.token0)) {
            return this.token1;
        }
        else if (token.equals(this.token1)) {
            return this.token0;
        }
        else {
            throw new errors_1.PennysiaSDKError('Token is not part of this pair');
        }
    }
    // Update reserves (for when new data is fetched)
    updateReserves(newReserves) {
        this._reserves = { ...newReserves };
    }
    updateLiquiditySupply(newSupply) {
        this._liquiditySupply = { ...newSupply };
    }
    // Static factory method
    static create(token0, token1, reserves, liquiditySupply, pairAddress) {
        return new PennysiaPair(token0, token1, reserves, liquiditySupply, pairAddress);
    }
    // Check if pair has sufficient liquidity for trade
    hasSufficientLiquidity(inputToken, inputAmount, isLong) {
        try {
            this.getOutputAmount(inputToken, inputAmount, isLong);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Get pair identifier
    get pairKey() {
        return `${this.token0.address}-${this.token1.address}`;
    }
    toString() {
        return `${this.token0.symbol}/${this.token1.symbol}`;
    }
}
exports.PennysiaPair = PennysiaPair;
//# sourceMappingURL=pair.js.map