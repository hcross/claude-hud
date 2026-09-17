import type { HudColorOverrides, ProgressLabelKey } from "../../config.js";
import type { MessageKey } from "../../i18n/types.js";
/** Display fragment of the config carrying `labelOverrides`. */
export type LabelOverrideSource = {
    labelOverrides?: Partial<Record<ProgressLabelKey, string>>;
} | undefined;
/**
 * Resolve the text for a progress-bar label: a `display.labelOverrides`
 * entry wins over the locale label.
 */
export declare function resolveLabelText(key: MessageKey, display?: LabelOverrideSource): string;
export interface ProgressLabelOptions {
    align?: boolean;
    includeMemoryInWidth?: boolean;
}
export type ProgressLabelInput = boolean | ProgressLabelOptions;
/**
 * Compute the visual width of a plain-text string (no ANSI).
 * CJK ideographs count as 2 cells; ASCII characters count as 1.
 * In CJK locales, East Asian Ambiguous-width chars also count as 2.
 */
declare function plainTextWidth(str: string): number;
/** Compute the max visual width across the progress-bar labels in view. */
declare function maxLabelWidth(includeMemory?: boolean, display?: LabelOverrideSource): number;
/**
 * Return a label whose visible text is right-padded to align with the widest
 * progress-bar label in the current locale, then wrapped with the `label()`
 * ANSI helper.
 */
export declare function paddedLabel(key: MessageKey, colors?: Partial<HudColorOverrides>, options?: Pick<ProgressLabelOptions, "includeMemoryInWidth">, display?: LabelOverrideSource): string;
export declare function progressLabel(key: MessageKey, colors?: Partial<HudColorOverrides>, options?: ProgressLabelInput, display?: LabelOverrideSource): string;
export { plainTextWidth as _plainTextWidth, maxLabelWidth as _maxLabelWidth };
//# sourceMappingURL=label-align.d.ts.map