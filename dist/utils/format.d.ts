import type { ContextUsage } from '../stdin.js';
/** `1.2M`, `45k`, or `800`. */
export declare function formatTokens(n: number): string;
/** `91.2k`, `1.23m`, or `800` - one decimal under a million, two over, zeros trimmed. */
export declare function formatTokensCompact(n: number): string;
export declare function formatContextValue(context: ContextUsage, mode: 'percent' | 'tokens' | 'remaining' | 'both'): string;
export declare function formatSessionDuration(ms: number | null | undefined): string;
//# sourceMappingURL=format.d.ts.map