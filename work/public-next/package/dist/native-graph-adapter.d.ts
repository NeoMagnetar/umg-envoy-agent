import { type NativeGraphRoot, type NativeGraphSummary, type NativeGraphValidationResult } from "./native-graph-types.js";
export interface NativeSleeveGraphProjection {
    outputContract: {
        contractId: "umg.runtime.sleeve_graph.native_projection.v1";
        contractStatus: "NORMALIZED";
    };
    projectionStatus: "NATIVE_GRAPH_READY" | "NATIVE_GRAPH_HELD";
    sleeveId: string | null;
    nativeGraphAvailable: boolean;
    sourceMode: NativeGraphValidationResult["sourceMode"];
    routePurity: NativeGraphValidationResult["routePurity"];
    validation: NativeGraphValidationResult;
    summary: NativeGraphSummary | null;
    nativeGraph: NativeGraphRoot | null;
    audit: {
        execution: "not_performed";
        directSource: "disabled";
        automaticResponseTakeover: false;
        umgBlockLibraryMutation: "not_performed";
        externalMoltBlockFileLoading: "not_performed";
        fullLibraryScan: "not_performed";
        unboundedRecursiveTraversal: "not_performed";
    };
}
export declare function readNativeGraphFromSleeve(candidate: unknown): NativeGraphRoot | null;
export declare function projectNativeSleeveGraph(candidate: unknown): NativeSleeveGraphProjection;
export declare function assertCleanNativeGraph(candidate: unknown): NativeSleeveGraphProjection;
