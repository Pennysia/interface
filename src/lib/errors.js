"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRevertedError = exports.UnsupportedChainError = exports.ContractNotDeployedError = exports.InvalidTokenError = exports.SlippageExceededError = exports.InsufficientLiquidityError = exports.PennysiaSDKError = void 0;
exports.parseContractError = parseContractError;
exports.validateTokenAddress = validateTokenAddress;
exports.validateAmount = validateAmount;
exports.validateDeadline = validateDeadline;
// Custom error classes for Pennysia SDK
class PennysiaSDKError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'PennysiaSDKError';
    }
}
exports.PennysiaSDKError = PennysiaSDKError;
class InsufficientLiquidityError extends PennysiaSDKError {
    constructor(message = 'Insufficient liquidity for this trade') {
        super(message, 'INSUFFICIENT_LIQUIDITY');
        this.name = 'InsufficientLiquidityError';
    }
}
exports.InsufficientLiquidityError = InsufficientLiquidityError;
class SlippageExceededError extends PennysiaSDKError {
    constructor(message = 'Transaction would exceed maximum slippage') {
        super(message, 'SLIPPAGE_EXCEEDED');
        this.name = 'SlippageExceededError';
    }
}
exports.SlippageExceededError = SlippageExceededError;
class InvalidTokenError extends PennysiaSDKError {
    constructor(message = 'Invalid token address or configuration') {
        super(message, 'INVALID_TOKEN');
        this.name = 'InvalidTokenError';
    }
}
exports.InvalidTokenError = InvalidTokenError;
class ContractNotDeployedError extends PennysiaSDKError {
    constructor(chainId) {
        super(`Pennysia contracts not deployed on chain ${chainId}`, 'CONTRACT_NOT_DEPLOYED');
        this.name = 'ContractNotDeployedError';
    }
}
exports.ContractNotDeployedError = ContractNotDeployedError;
class UnsupportedChainError extends PennysiaSDKError {
    constructor(chainId) {
        super(`Chain ${chainId} is not supported`, 'UNSUPPORTED_CHAIN');
        this.name = 'UnsupportedChainError';
    }
}
exports.UnsupportedChainError = UnsupportedChainError;
class TransactionRevertedError extends PennysiaSDKError {
    constructor(message, txHash) {
        super(`Transaction reverted: ${message}`, 'TRANSACTION_REVERTED');
        this.txHash = txHash;
        this.name = 'TransactionRevertedError';
        this.txHash = txHash;
    }
}
exports.TransactionRevertedError = TransactionRevertedError;
// Error parsing utilities
function parseContractError(error) {
    const message = error?.message || error?.toString() || 'Unknown contract error';
    // Parse common contract errors
    if (message.includes('slippage')) {
        return new SlippageExceededError();
    }
    if (message.includes('insufficient') || message.includes('InsufficientLiquidity')) {
        return new InsufficientLiquidityError();
    }
    if (message.includes('forbidden')) {
        return new PennysiaSDKError('Transaction forbidden by contract', 'FORBIDDEN');
    }
    if (message.includes('pairNotFound')) {
        return new PennysiaSDKError('Trading pair not found', 'PAIR_NOT_FOUND');
    }
    if (message.includes('minimumLiquidity')) {
        return new PennysiaSDKError('Minimum liquidity requirement not met', 'MINIMUM_LIQUIDITY');
    }
    if (message.includes('invalidPath')) {
        return new PennysiaSDKError('Invalid swap path', 'INVALID_PATH');
    }
    // Generic transaction error
    if (error?.hash) {
        return new TransactionRevertedError(message, error.hash);
    }
    return new PennysiaSDKError(message);
}
// Validation utilities
function validateTokenAddress(address) {
    if (!address || typeof address !== 'string') {
        throw new InvalidTokenError('Token address must be a non-empty string');
    }
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new InvalidTokenError('Invalid token address format');
    }
}
function validateAmount(amount, name = 'Amount') {
    if (!amount || typeof amount !== 'string') {
        throw new PennysiaSDKError(`${name} must be a non-empty string`);
    }
    try {
        const amountBig = BigInt(amount);
        if (amountBig <= 0) {
            throw new PennysiaSDKError(`${name} must be greater than 0`);
        }
    }
    catch (error) {
        throw new PennysiaSDKError(`Invalid ${name.toLowerCase()} format`);
    }
}
function validateDeadline(deadline) {
    const now = Math.floor(Date.now() / 1000);
    if (deadline <= now) {
        throw new PennysiaSDKError('Deadline must be in the future');
    }
    // Warn if deadline is more than 24 hours in the future
    const maxDeadline = now + (24 * 60 * 60);
    if (deadline > maxDeadline) {
        console.warn('Warning: Deadline is more than 24 hours in the future');
    }
}
//# sourceMappingURL=errors.js.map