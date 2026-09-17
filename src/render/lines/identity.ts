import type { RenderContext } from "../../types.js";
import {
  getContextPercent,
  getBufferedPercent,
} from "../../stdin.js";
import { coloredBar, label, getContextColor, RESET } from "../colors.js";
import { getAdaptiveBarWidth } from "../../utils/terminal.js";
import { t } from "../../i18n/index.js";
import {
  progressLabel,
  type ProgressLabelInput,
} from "./label-align.js";
import { formatTokens, formatContextValue, formatTokensCompact } from "../../utils/format.js";
import { createDebug } from "../../debug.js";

const debug = createDebug("context");

/** Context segment without its label: bar + value, optional token-count
 * suffix and the critical-threshold token breakdown. Shared by the identity
 * line and, when `display.contextPosition` is `projectLine`, inlined on the
 * project line. */
export function renderContextSegment(ctx: RenderContext): string {
  const autoCompactWindow = ctx.config?.display?.autoCompactWindow ?? null;
  const rawPercent = getContextPercent(ctx.stdin, autoCompactWindow);
  const bufferedPercent = getBufferedPercent(ctx.stdin, autoCompactWindow);
  const autocompactMode = ctx.config?.display?.autocompactBuffer ?? "enabled";
  const percent = autocompactMode === "disabled" ? rawPercent : bufferedPercent;
  const colors = ctx.config?.colors;

  if (autocompactMode === "disabled") {
    debug(
      `autocompactBuffer=disabled, showing raw ${rawPercent}% (buffered would be ${bufferedPercent}%)`,
    );
  }

  const display = ctx.config?.display;
  const contextThresholds = {
    warning: display?.contextWarningThreshold,
    critical: display?.contextCriticalThreshold,
  };
  const contextValueMode = display?.contextValue ?? "percent";
  const contextValue = formatContextValue(ctx, percent, contextValueMode);
  const contextValueDisplay = `${getContextColor(percent, colors, contextThresholds)}${contextValue}${RESET}`;

  let segment =
    display?.showContextBar !== false
      ? `${coloredBar(percent, getAdaptiveBarWidth(), colors, contextThresholds)} ${contextValueDisplay}`
      : contextValueDisplay;

  if (display?.showContextTokens) {
    const usage = ctx.stdin.context_window?.current_usage;
    if (usage) {
      const totalTokens =
        (usage.input_tokens ?? 0)
        + (usage.cache_creation_input_tokens ?? 0)
        + (usage.cache_read_input_tokens ?? 0)
        + (usage.output_tokens ?? 0);
      segment += label(` (${formatTokensCompact(totalTokens)} tk)`, colors);
    }
  }

  if (display?.showTokenBreakdown !== false && percent >= (display?.contextCriticalThreshold ?? 85)) {
    const usage = ctx.stdin.context_window?.current_usage;
    if (usage) {
      const input = formatTokens(usage.input_tokens ?? 0);
      const cache = formatTokens(
        (usage.cache_creation_input_tokens ?? 0) +
          (usage.cache_read_input_tokens ?? 0),
      );
      segment += label(
        ` (${t("format.in")}: ${input}, ${t("format.cache")}: ${cache})`,
        colors,
      );
    }
  }

  return segment;
}

export function renderIdentityLine(
  ctx: RenderContext,
  labelOptions: ProgressLabelInput = {},
): string | null {
  const display = ctx.config?.display;
  // With `contextPosition: "projectLine"` the bar is inlined on the project
  // line (label suppressed), so there is no standalone context line.
  if (display?.contextPosition === "projectLine") {
    return null;
  }

  const colors = ctx.config?.colors;
  return `${progressLabel("label.context", colors, labelOptions, display)} ${renderContextSegment(ctx)}`;
}