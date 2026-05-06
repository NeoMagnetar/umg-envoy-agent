import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeDashboardV0 } from "./dashboard.js";
import type { RuntimeInspectionRequestV0, RuntimeInspectionResultV0 } from "./drilldown-types.js";
import type { RuntimeIRMatrixV0 } from "./ir-matrix-types.js";
import type { RuntimeMOLTMapV0 } from "./molt-map-types.js";
import type { RuntimeSpecV0 } from "./types.js";
export declare function inspectRuntimeDrilldown(input: {
    request: RuntimeInspectionRequestV0;
    registryArtifacts: NormalizedArtifact[];
    runtimeSpec?: RuntimeSpecV0;
    dashboard?: RuntimeDashboardV0;
    irMatrix?: RuntimeIRMatrixV0;
    moltMap?: RuntimeMOLTMapV0;
}): RuntimeInspectionResultV0;
