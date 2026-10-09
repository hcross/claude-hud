import type { Frame } from './frame.js';
import { type LabelAlign } from './labels.js';
/** ` (91.2k tk)` when showContextTokens is on: the used tokens, output included. */
export declare function tokenSuffix(f: Frame): string;
/** The context bar (when shown) and value, e.g. `█████░░░░░ 45% (91.2k tk).` */
export declare function contextBarAndValue(f: Frame): {
    bar: string | null;
    value: string;
};
/** ` (in: 12k, cache: 180k)` once context reaches the critical threshold. */
export declare function tokenBreakdown(f: Frame): string;
/** The label-less `bar value (+ tokens)` part; compact's model cluster and the projectLine position share it. */
export declare function contextPart(f: Frame): string;
export declare function contextLine(f: Frame, align?: LabelAlign): string | null;
//# sourceMappingURL=context.d.ts.map