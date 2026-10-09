import type { HudConfig, HudColorOverrides, ProgressLabelKey } from '../config.js';
import type { MessageKey } from '../i18n/types.js';
import { t } from '../i18n/index.js';
import { label } from './colors.js';
import { textWidth } from './ansi.js';

const BAR_LABELS: MessageKey[] = ['label.context', 'label.usage', 'label.weekly'];

function resolveLabelText(key: MessageKey, display?: HudConfig['display']): string {
  const override = display?.labelOverrides?.[key.replace(/^label\./, '') as ProgressLabelKey];
  return (typeof override === 'string' && override) || t(key);
}

export interface LabelAlign {
  align?: boolean;
  /** Count the memory label too, when its bar is on screen. */
  includeMemoryInWidth?: boolean;
}

/** A bar label, padded to the widest bar label in view when bars are stacked. */
export function barLabel(
  key: MessageKey,
  colors?: Partial<HudColorOverrides>,
  options: LabelAlign = {},
  display?: HudConfig['display'],
): string {
  const text = resolveLabelText(key, display);
  if (!options.align) return label(text, colors);
  const keys = options.includeMemoryInWidth ? [...BAR_LABELS, 'label.approxRam' as const] : BAR_LABELS;
  const pad = Math.max(...keys.map((k) => textWidth(resolveLabelText(k, display)))) - textWidth(text);
  return label(pad > 0 ? text + ' '.repeat(pad) : text, colors);
}
