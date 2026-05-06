import type { RuntimeDashboardV0 } from "./dashboard.js";
import type { UMGRuntimeDisplayContractV0, UMGRuntimeDisplayMode } from "./runtime-display-types.js";
export declare function buildUMGRuntimeDisplayContract(input: {
    dashboard: RuntimeDashboardV0;
    mode?: UMGRuntimeDisplayMode;
}): UMGRuntimeDisplayContractV0;
export declare function renderUMGRuntimeDisplay(display: UMGRuntimeDisplayContractV0): string;
