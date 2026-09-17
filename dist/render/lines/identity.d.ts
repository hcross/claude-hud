import type { RenderContext } from "../../types.js";
import { type ProgressLabelInput } from "./label-align.js";
/** Context segment without its label: bar + value, optional token-count
 * suffix and the critical-threshold token breakdown. Shared by the identity
 * line and, when `display.contextPosition` is `projectLine`, inlined on the
 * project line. */
export declare function renderContextSegment(ctx: RenderContext): string;
export declare function renderIdentityLine(ctx: RenderContext, labelOptions?: ProgressLabelInput): string | null;
//# sourceMappingURL=identity.d.ts.map