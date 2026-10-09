import { getTotalTokens } from '../stdin.js';
/**
 * Format a token count into a human-readable short string.
 *   >= 1M  → "1.2M"
 *   >= 1k  → "45k"
 *   < 1k   → "800"
 */
export function formatTokens(n) {
    if (n >= 1000000) {
        return `${(n / 1000000).toFixed(1)}M`;
    }
    if (n >= 1000) {
        return `${(n / 1000).toFixed(0)}k`;
    }
    return n.toString();
}
/**
 * Format the context-window value for display.
 *   percent   → "45%"
 *   tokens    → "45k/200k"
 *   remaining → "55%"
 *   both      → "45% (45k/200k)"
 */
export function formatContextValue(ctx, percent, mode) {
    const totalTokens = getTotalTokens(ctx.stdin);
    const autoCompactWindow = ctx.config?.display?.autoCompactWindow ?? null;
    const size = typeof autoCompactWindow === 'number' && autoCompactWindow > 0
        ? autoCompactWindow
        : ctx.stdin.context_window?.context_window_size ?? 0;
    if (mode === 'tokens') {
        if (size > 0) {
            return `${formatTokens(totalTokens)}/${formatTokens(size)}`;
        }
        return formatTokens(totalTokens);
    }
    if (mode === 'both') {
        if (size > 0) {
            return `${percent}% (${formatTokens(totalTokens)}/${formatTokens(size)})`;
        }
        return `${percent}%`;
    }
    if (mode === 'remaining') {
        return `${Math.max(0, 100 - percent)}%`;
    }
    return `${percent}%`;
}
/**
 * Format a token count in a finer human-readable form (with decimals kept):
 *   >= 1M  → "1.23m"   (two decimals, trailing zeros trimmed)
 *   >= 1k  → "3.4k"    (one decimal, trailing zeros trimmed)
 *   < 1k   → "135"
 * Callers append the unit (e.g. " tk").
 */
export function formatTokensCompact(n) {
    if (n >= 1000000) {
        return `${trimTrailingZeros((n / 1000000).toFixed(2))}m`;
    }
    if (n >= 1000) {
        return `${trimTrailingZeros((n / 1000).toFixed(1))}k`;
    }
    return `${n}`;
}
function trimTrailingZeros(s) {
    return s.replace(/\.?0+$/, "");
}
//# sourceMappingURL=format.js.map