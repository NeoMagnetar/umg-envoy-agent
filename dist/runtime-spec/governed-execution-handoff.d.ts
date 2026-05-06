import type { RuntimeDashboardV0 } from "./dashboard.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { RuntimeSpecV0 } from "./types.js";
export declare function buildGovernedExecutionHandoffDryRun(input: {
    runtimeSpec: RuntimeSpecV0;
    runtimeDashboard?: RuntimeDashboardV0;
    irMatrixId?: string;
    moltMapId?: string;
}): GovernedExecutionHandoffV0;
