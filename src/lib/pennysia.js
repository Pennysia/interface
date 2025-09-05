"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PennysiaSDK = void 0;
const ethers_1 = require("ethers");
const chains_1 = require("./chains");
const addresses_1 = require("./addresses");
const token_1 = require("./token");
const math_1 = require("./math");
const abis_1 = require("./abis");
class PennysiaSDK {
    constructor(chainId, provider, signer) {
        this.chainId = chainId;
        this.provider = provider;
        this.signer = signer;
        const marketAddress = (0, addresses_1.getMarketAddress)(chainId);
        const routerAddress = (0, addresses_1.getRouterAddress)(chainId);
        if (!marketAddress || !routerAddress) {
            throw new Error(`Pennysia contracts not deployed on chain ${chainId}`);
        }
        this.marketContract = new ethers_1.Contract(marketAddress, abis_1.MARKET_ABI, signer || provider);
        this.routerContract = new ethers_1.Contract(routerAddress, abis_1.ROUTER_ABI, signer || provider);
    }
    // Static factory method
    static create(chainId, provider, signer) {
        return new PennysiaSDK(chainId, provider, signer);
    }
    // Token utilities
    async getTokenContract(tokenAddress) {
        return new ethers_1.Contract(tokenAddress, abis_1.ERC20_ABI, this.signer || this.provider);
    }
    async getTokenInfo(tokenAddress) {
        const contract = await this.getTokenContract(tokenAddress);
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.totalSupply()
        ]);
        return {
            name,
            symbol,
            decimals,
            totalSupply: totalSupply.toString()
        };
    }
    // Market data functions
    async getReserves(token0, token1) {
        const pairId = await this.marketContract.getPairId(token0.address, token1.address);
        const reserves = await this.marketContract.getReserves(pairId);
        return {
            reserve0Long: reserves.reserve0Long.toString(),
            reserve0Short: reserves.reserve0Short.toString(),
            reserve1Long: reserves.reserve1Long.toString(),
            reserve1Short: reserves.reserve1Short.toString()
        };
    }
    async getPairId(token0, token1) {
        const pairId = await this.marketContract.getPairId(token0.address, token1.address);
        return pairId.toString();
    }
    async getPairInfo(pairId) {
        const pair = await this.marketContract.pairs(pairId);
        return {
            reserve0Long: pair.reserve0Long.toString(),
            reserve0Short: pair.reserve0Short.toString(),
            reserve1Long: pair.reserve1Long.toString(),
            reserve1Short: pair.reserve1Short.toString(),
            blockTimestampLast: pair.blockTimestampLast.toString(),
            cbrtPriceX128CumulativeLast: pair.cbrtPriceX128CumulativeLast.toString()
        };
    }
    // Price and quote functions
    async getAmountOut(amountIn, reserveIn, reserveOut) {
        const amountOut = await this.routerContract.getAmountOut(amountIn, reserveIn, reserveOut);
        return amountOut.toString();
    }
    async getAmountIn(amountOut, reserveIn, reserveOut) {
        const amountIn = await this.routerContract.getAmountIn(amountOut, reserveIn, reserveOut);
        return amountIn.toString();
    }
    async getAmountsOut(amountIn, path) {
        const amounts = await this.routerContract.getAmountsOut(amountIn, path);
        return amounts.map((amount) => amount.toString());
    }
    async getAmountsIn(amountOut, path) {
        const amounts = await this.routerContract.getAmountsIn(amountOut, path);
        return amounts.map((amount) => amount.toString());
    }
    async quoteLiquidity(token0, token1, amountLong0, amountShort0, amountLong1, amountShort1) {
        const quote = await this.routerContract.quoteLiquidity(token0.address, token1.address, amountLong0, amountShort0, amountLong1, amountShort1);
        return {
            longX: quote.longX.toString(),
            shortX: quote.shortX.toString(),
            longY: quote.longY.toString(),
            shortY: quote.shortY.toString()
        };
    }
    // Trading functions
    async swap(params) {
        if (!this.signer) {
            throw new Error('Signer required for trading operations');
        }
        return await this.routerContract.swap(params.amountIn, params.amountOutMin, params.path, params.to, params.deadline);
    }
    async addLiquidity(params) {
        if (!this.signer) {
            throw new Error('Signer required for liquidity operations');
        }
        return await this.routerContract.addLiquidity(params.token0.address, params.token1.address, params.amount0Long, params.amount0Short, params.amount1Long, params.amount1Short, params.longXMinimum, params.shortXMinimum, params.longYMinimum, params.shortYMinimum, params.to, params.deadline);
    }
    async removeLiquidity(params) {
        if (!this.signer) {
            throw new Error('Signer required for liquidity operations');
        }
        return await this.routerContract.removeLiquidity(params.token0.address, params.token1.address, params.longX, params.shortX, params.longY, params.shortY, params.amount0Minimum, params.amount1Minimum, params.to, params.deadline);
    }
    async lpSwap(params) {
        if (!this.signer) {
            throw new Error('Signer required for liquidity operations');
        }
        return await this.routerContract.liquiditySwap(params.token0.address, params.token1.address, params.longToShort0, params.liquidity0, params.longToShort1, params.liquidity1, params.liquidity0OutMinimum, params.liquidity1OutMinimum, params.to, params.deadline);
    }
    // TTL approval functions
    async approveTTL(token, spender, value, deadline) {
        if (!this.signer) {
            throw new Error('Signer required for approval operations');
        }
        return await this.routerContract.approveTTL(token.address, spender, value, deadline);
    }
    async getAllowanceTTL(token, owner, spender) {
        const allowance = await this.routerContract.getAllowanceTTL(token.address, owner, spender);
        return {
            value: allowance.value.toString(),
            deadline: allowance.deadline.toString()
        };
    }
    // Utility functions
    getNativeCurrency() {
        return token_1.NATIVE_CURRENCY[this.chainId];
    }
    getWETH() {
        return token_1.WETH[this.chainId];
    }
    getChainInfo() {
        return (0, chains_1.getChainInfo)(this.chainId);
    }
    // Calculate price impact for a trade
    async calculatePriceImpact(amountIn, tokenIn, tokenOut) {
        const reserves = await this.getReserves(tokenIn, tokenOut);
        // Determine which reserves to use based on token order
        const [reserveIn, reserveOut] = tokenIn.sortsBefore(tokenOut)
            ? [reserves.reserve0Long, reserves.reserve1Long] // Simplified - using Long reserves
            : [reserves.reserve1Long, reserves.reserve0Long];
        return math_1.PennysiaAMM.getPriceImpact(amountIn, reserveIn, reserveOut);
    }
    // Helper to create deadline timestamp (current time + minutes)
    static createDeadline(minutesFromNow = 20) {
        return Math.floor(Date.now() / 1000) + (minutesFromNow * 60);
    }
}
exports.PennysiaSDK = PennysiaSDK;
//# sourceMappingURL=pennysia.js.map