import { ChainId } from './chains';
export declare class Token {
    readonly chainId: ChainId;
    readonly address: string;
    readonly decimals: number;
    readonly symbol: string;
    readonly name: string;
    constructor(chainId: ChainId, address: string, decimals: number, symbol: string, name: string);
    equals(other: Token): boolean;
    sortsBefore(other: Token): boolean;
}
export declare class NativeCurrency extends Token {
    constructor(chainId: ChainId, decimals: number, symbol: string, name: string);
    get isNative(): boolean;
}
export declare const WETH: Record<ChainId, Token>;
export declare const NATIVE_CURRENCY: Record<ChainId, NativeCurrency>;
//# sourceMappingURL=token.d.ts.map