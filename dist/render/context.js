import { coloredBar, getContextColor, label, RESET } from './colors.js';
import { t } from '../i18n/index.js';
import { formatContextValue, formatTokens, formatTokensCompact } from '../utils/format.js';
import { contextUsage } from './derive.js';
import { barLabel } from './labels.js';
function thresholds(f) {
    return {
        warning: f.config?.display?.contextWarningThreshold,
        critical: f.config?.display?.contextCriticalThreshold,
    };
}
/** ` (91.2k tk)` when showContextTokens is on: the used tokens, output included. */
export function tokenSuffix(f) {
    const display = f.config?.display;
    const usage = f.stdin.context_window?.current_usage;
    if (display?.showContextTokens !== true || !usage)
        return '';
    const total = (usage.input_tokens ?? 0)
        + (usage.output_tokens ?? 0)
        + (usage.cache_creation_input_tokens ?? 0)
        + (usage.cache_read_input_tokens ?? 0);
    return label(` (${formatTokensCompact(total)} tk)`, f.config?.colors);
}
/** The context bar (when shown) and value, e.g. `█████░░░░░ 45% (91.2k tk).` */
export function contextBarAndValue(f) {
    const display = f.config?.display;
    const colors = f.config?.colors;
    const context = contextUsage(f);
    const value = `${getContextColor(context.percent, colors, thresholds(f))}${formatContextValue(context, display?.contextValue ?? 'percent')}${RESET}${tokenSuffix(f)}`;
    const bar = display?.showContextBar !== false
        ? coloredBar(context.percent, f.barWidth, colors, thresholds(f))
        : null;
    return { bar, value };
}
/** ` (in: 12k, cache: 180k)` once context reaches the critical threshold. */
export function tokenBreakdown(f) {
    const display = f.config?.display;
    const usage = f.stdin.context_window?.current_usage;
    if (display?.showTokenBreakdown === false || !usage)
        return '';
    if (contextUsage(f).percent < (display?.contextCriticalThreshold ?? 85))
        return '';
    const input = formatTokens(usage.input_tokens ?? 0);
    const cache = formatTokens((usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0));
    return label(` (${t('format.in')}: ${input}, ${t('format.cache')}: ${cache})`, f.config?.colors);
}
/** The label-less `bar value (+ tokens)` part; compact's model cluster and the projectLine position share it. */
export function contextPart(f) {
    const { bar, value } = contextBarAndValue(f);
    return [bar, value].filter(Boolean).join(' ');
}
export function contextLine(f, align = {}) {
    // The bar rides on the first line instead; the Context row stays empty.
    if (f.config?.display?.contextPosition === 'projectLine')
        return null;
    const { bar, value } = contextBarAndValue(f);
    const prefix = barLabel('label.context', f.config?.colors, align, f.config?.display);
    return `${prefix} ${bar ? `${bar} ` : ''}${value}${tokenBreakdown(f)}`;
}
//# sourceMappingURL=context.js.map