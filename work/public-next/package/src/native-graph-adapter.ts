// src/native-graph-adapter.ts
// Adapter utilities for reading and projecting sleeve-native graph roots.
// This module performs in-memory validation only. It has no side effects.

import {
  type NativeGraphRoot,
  type NativeGraphSummary,
  type NativeGraphValidationResult,
  NATIVE_GRAPH_SCHEMA_VERSION,
  isRecord,
  summarizeNativeGraph,
  validateNativeGraphRoot,
} from "./native-graph-types.js";

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

export function readNativeGraphFromSleeve(candidate: unknown): NativeGraphRoot | null {
  if (!isRecord(candidate)) {
    return null;
  }

  const directNativeGraph = candidate.nativeGraph;

  if (isRecord(directNativeGraph) && directNativeGraph.schemaVersion === NATIVE_GRAPH_SCHEMA_VERSION) {
    return directNativeGraph as unknown as NativeGraphRoot;
  }

  const graph = candidate.graph;

  if (isRecord(graph) && isRecord(graph.nativeGraph) && graph.nativeGraph.schemaVersion === NATIVE_GRAPH_SCHEMA_VERSION) {
    return graph.nativeGraph as unknown as NativeGraphRoot;
  }

  return null;
}

export function projectNativeSleeveGraph(candidate: unknown): NativeSleeveGraphProjection {
  const nativeGraph = readNativeGraphFromSleeve(candidate);

  if (!nativeGraph) {
    return {
      outputContract: {
        contractId: "umg.runtime.sleeve_graph.native_projection.v1",
        contractStatus: "NORMALIZED",
      },
      projectionStatus: "NATIVE_GRAPH_HELD",
      sleeveId: null,
      nativeGraphAvailable: false,
      sourceMode: "unavailable",
      routePurity: "unknown",
      validation: {
        valid: false,
        sourceMode: "unavailable",
        routePurity: "unknown",
        sampleFallbackUsed: false,
        legacyPreviewResidueDetected: false,
        legacyPreviewResiduePaths: [],
        issues: [
          {
            code: "NATIVE_GRAPH_ROOT_MISSING",
            path: "nativeGraph",
            severity: "error",
            message: "Sleeve does not expose a native graph root.",
          },
        ],
      },
      summary: null,
      nativeGraph: null,
      audit: standardAudit(),
    };
  }

  const validation = validateNativeGraphRoot(nativeGraph);
  const summary = summarizeNativeGraph(nativeGraph);

  return {
    outputContract: {
      contractId: "umg.runtime.sleeve_graph.native_projection.v1",
      contractStatus: "NORMALIZED",
    },
    projectionStatus: validation.valid ? "NATIVE_GRAPH_READY" : "NATIVE_GRAPH_HELD",
    sleeveId: nativeGraph.sleeveId,
    nativeGraphAvailable: true,
    sourceMode: validation.sourceMode,
    routePurity: validation.routePurity,
    validation,
    summary,
    nativeGraph,
    audit: standardAudit(),
  };
}

export function assertCleanNativeGraph(candidate: unknown): NativeSleeveGraphProjection {
  const projection = projectNativeSleeveGraph(candidate);

  if (!projection.validation.valid) {
    const errors = projection.validation.issues
      .map((issue) => `${issue.severity}:${issue.code}:${issue.path}:${issue.message}`)
      .join("\n");

    throw new Error(`Native graph is not clean-native.\n${errors}`);
  }

  if (projection.sourceMode !== "sleeve_native" || projection.routePurity !== "clean_native") {
    throw new Error(
      `Native graph did not reach clean_native. sourceMode=${projection.sourceMode}, routePurity=${projection.routePurity}`,
    );
  }

  return projection;
}

function standardAudit(): NativeSleeveGraphProjection["audit"] {
  return {
    execution: "not_performed",
    directSource: "disabled",
    automaticResponseTakeover: false,
    umgBlockLibraryMutation: "not_performed",
    externalMoltBlockFileLoading: "not_performed",
    fullLibraryScan: "not_performed",
    unboundedRecursiveTraversal: "not_performed",
  };
}
