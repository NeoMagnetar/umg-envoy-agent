import type { UMGEnvoyAlphaDemoReportV0 } from "./alpha-demo-types.js";
import type { UMGRuntimeDisplayMode } from "./runtime-display-types.js";
export declare function buildUMGEnvoyAlphaDemo(input?: {
    query?: string;
    kind?: string;
    limit?: number;
    display_mode?: UMGRuntimeDisplayMode;
    include_display?: boolean;
}): UMGEnvoyAlphaDemoReportV0;
