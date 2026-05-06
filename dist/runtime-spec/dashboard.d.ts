import type { RuntimeMOLTMapV0 } from "./molt-map-types.js";
import type { RuntimeSpecV0, RuntimeVisibilityMode } from "./types.js";
import type { RuntimeVisibilityHeader } from "./visibility.js";
export interface RuntimeDashboardOptions {
    include_molt_map?: boolean;
    mode?: RuntimeVisibilityMode;
}
export interface RuntimeDashboardV0 {
    header: RuntimeVisibilityHeader;
    molt_map?: RuntimeMOLTMapV0;
    execution_statement: "No tools executed.";
    matrix_available: false;
}
export declare function buildRuntimeDashboard(spec: RuntimeSpecV0, options?: RuntimeDashboardOptions): RuntimeDashboardV0;
export declare function renderRuntimeDashboard(dashboard: RuntimeDashboardV0): string;
