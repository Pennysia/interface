export declare class PennysiaSDKError extends Error {
    code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
export declare class InsufficientLiquidityError extends PennysiaSDKError {
    constructor(message?: string);
}
export declare class SlippageExceededError extends PennysiaSDKError {
    constructor(message?: string);
}
export declare class InvalidTokenError extends PennysiaSDKError {
    constructor(message?: string);
}
export declare class ContractNotDeployedError extends PennysiaSDKError {
    constructor(chainId: number);
}
export declare class UnsupportedChainError extends PennysiaSDKError {
    constructor(chainId: number);
}
export declare class TransactionRevertedError extends PennysiaSDKError {
    txHash?: string | undefined;
    constructor(message: string, txHash?: string | undefined);
}
export declare function parseContractError(error: any): PennysiaSDKError;
export declare function validateTokenAddress(address: string): void;
export declare function validateAmount(amount: string, name?: string): void;
export declare function validateDeadline(deadline: number): void;
//# sourceMappingURL=errors.d.ts.map