export declare const PENNYSIA_CONSTANTS: {
    readonly FEE_NUMERATOR: 3;
    readonly FEE_DENOMINATOR: 1000;
    readonly FEE_PERCENTAGE: 0.3;
    readonly MINIMUM_LIQUIDITY: 1000;
    readonly DEFAULT_DEADLINE_MINUTES: 20;
    readonly DEFAULT_DEADLINE_SECONDS: number;
    readonly DEFAULT_SLIPPAGE_BPS: 50;
    readonly HIGH_SLIPPAGE_BPS: 300;
    readonly GAS_LIMITS: {
        readonly SWAP: 200000;
        readonly ADD_LIQUIDITY: 300000;
        readonly REMOVE_LIQUIDITY: 250000;
        readonly APPROVE: 50000;
    };
    readonly ZERO_ADDRESS: "0x0000000000000000000000000000000000000000";
    readonly DEAD_ADDRESS: "0x000000000000000000000000000000000000dEaD";
    readonly PRECISION_DECIMALS: 18;
    readonly MAX_UINT256: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
};
export declare function calculateMinimumAmount(amount: string, slippageBps: number): string;
export declare function calculateMaximumAmount(amount: string, slippageBps: number): string;
export declare function createDeadline(minutesFromNow?: number): number;
export declare function formatTokenAmount(amount: string, decimals: number): string;
export declare function parseTokenAmount(amount: string, decimals: number): string;
//# sourceMappingURL=constants.d.ts.map