import type { RuntimeDashboardV0 } from "./dashboard.js";
import type { RuntimeMOLTMapV0 } from "./molt-map-types.js";
import type { RuntimeIRMatrixV0 } from "./ir-matrix-types.js";
import type { RuntimeSpecV0 } from "./types.js";
export declare function buildRuntimeIRMatrix(input: {
    spec: RuntimeSpecV0;
    molt_map?: RuntimeMOLTMapV0;
    dashboard?: RuntimeDashboardV0;
}): RuntimeIRMatrixV0;
export declare function renderRuntimeIRMatrix(matrix: RuntimeIRMatrixV0): string;
