import { inspectRealLibraryPublicCuratedSleeve } from "./real-library-resolver.js";

export const UMG_ACTIVATION_STATES = [
  "ON",
  "OFF",
  "DORMANT",
  "WATCHING",
  "BLOCKED",
  "REJECTED",
  "MISSING",
  "REFERENCE_ONLY",
  "FORMAT",
  "CONTEXTUAL",
  "SHADOWED"
] as const;

export type UmgActivationState = typeof UMG_ACTIVATION_STATES[number];
export type UmgGraphNodeKind = "sleeve" | "neostack" | "neoblock" | "moltblock" | "gate" | "trigger" | "tool" | "lane";
export type UmgGraphEdgeRelation = "contains" | "references" | "resolves_to" | "may_activate" | "constrains" | "formats" | "excludes" | "blocked_by";

export interface UmgGraphNode {
  id: string;
  kind: UmgGraphNodeKind;
  label: string;
  state: UmgActivationState;
  sourcePath: string | null;
  resolutionStatus: string | null;
  warnings: string[];
}

export interface UmgGraphEdge {
  from: string;
  to: string;
  relation: UmgGraphEdgeRelation;
  state: UmgActivationState;
  reason?: string;
}

export interface UmgGraphExcludedLane {
  lane: string;
  state: UmgActivationState;
  reason: string;
}

export interface UmgGraphSnapshot {
  mode: "public_curated";
  readOnly: true;
  execution: "not_performed";
  directSource: "not_enabled";
  libraryRoot: string;
  activeSleeveId: string;
  nodes: UmgGraphNode[];
  edges: UmgGraphEdge[];
  excludedLanes: UmgGraphExcludedLane[];
  warnings: string[];
  errors: string[];
}

export interface UmgCurrentSleeveStatus {
  ok: boolean;
  mode: "public_curated";
  readOnly: true;
  execution: "not_performed";
  directSource: "not_enabled";
  libraryRoot: string;
  catalogStatus: {
    loaded: boolean;
    sourcePolicy: "public_curated_allowlist_only";
  };
  activeSleeve: {
    sleeveId: string;
    title: string | null;
    sourcePath: string | null;
    resolutionStatus: string | null;
  };
  sleeveStatus: {
    loaded: boolean;
    warnings: string[];
    errors: string[];
  };
  graphSummary: {
    neostackCount: number;
    neoblockCount: number;
    moltBlockCount: number;
    gateCount: number;
    triggerCount: number;
    referenceCount: number;
    loadedTargetCount: number;
  };
  neostackSummary: {
    count: number;
    ids: string[];
  };
  neoblockSummary: {
    count: number;
    ids: string[];
    loaded: string[];
    dormant: string[];
  };
  moltBlockSummary: {
    count: number;
    ids: string[];
  };
  gateSummary: {
    count: number;
    ids: string[];
  };
  triggerSummary: {
    count: number;
    ids: string[];
  };
  activationStateSummary: Record<UmgActivationState, number>;
  currentRoute: Array<{
    kind: UmgGraphNodeKind;
    id: string;
    state: UmgActivationState;
  }>;
  excludedLanes: UmgGraphExcludedLane[];
  warnings: string[];
  errors: string[];
}

const DEFAULT_LIBRARY_ROOT = "C:\\.openclaw\\workspace\\UMG-Block-Library";
const DEFAULT_CURRENT_SLEEVE_ID = "neomagnetar-dynamic-persona-v1";
const DEFAULT_SHALLOW_LOAD_TARGET_REF = "primary.sample";

function createActivationStateSummary(): Record<UmgActivationState, number> {
  return {
    ON: 0,
    OFF: 0,
    DORMANT: 0,
    WATCHING: 0,
    BLOCKED: 0,
    REJECTED: 0,
    MISSING: 0,
    REFERENCE_ONLY: 0,
    FORMAT: 0,
    CONTEXTUAL: 0,
    SHADOWED: 0
  };
}

function increment(summary: Record<UmgActivationState, number>, state: UmgActivationState) {
  summary[state] += 1;
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter((value) => value.trim().length > 0))).sort();
}

export function buildCurrentSleeveGraphSnapshot(input?: { sleeveId?: string; libraryRoot?: string }): UmgGraphSnapshot {
  const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
  const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
  const inspect = inspectRealLibraryPublicCuratedSleeve({
    sleeveId,
    libraryRoot,
    mode: "public_curated",
    shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
  });

  if (!inspect.ok || !inspect.summary) {
    return {
      mode: "public_curated",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: inspect.libraryRoot,
      activeSleeveId: sleeveId,
      nodes: [],
      edges: [],
      excludedLanes: [
        { lane: "archive", state: "OFF", reason: "forbidden" },
        { lane: "HUMAN", state: "REFERENCE_ONLY", reason: "not_machine_loaded" },
        { lane: "Resleever", state: "OFF", reason: "not_allowed" },
        { lane: "direct_source", state: "OFF", reason: "not_enabled" }
      ],
      warnings: inspect.warnings,
      errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
  }

  const summary = inspect.summary;
  const nodes: UmgGraphNode[] = [];
  const edges: UmgGraphEdge[] = [];

  nodes.push({
    id: summary.id ?? sleeveId,
    kind: "sleeve",
    label: summary.title ?? summary.name ?? summary.id ?? sleeveId,
    state: "ON",
    sourcePath: inspect.sourcePath ?? null,
    resolutionStatus: inspect.resolutionStatus ?? null,
    warnings: inspect.warnings
  });

  for (const neostackId of summary.explicitReferences.neostacks) {
    nodes.push({
      id: neostackId,
      kind: "neostack",
      label: neostackId,
      state: "DORMANT",
      sourcePath: null,
      resolutionStatus: null,
      warnings: []
    });
    edges.push({
      from: summary.id ?? sleeveId,
      to: neostackId,
      relation: "contains",
      state: "DORMANT",
      reason: "declared_ref_present_not_loaded"
    });
  }

  for (const ref of summary.referenceClassification.references) {
    let state: UmgActivationState = "DORMANT";
    if (ref.rawRef === DEFAULT_SHALLOW_LOAD_TARGET_REF) state = "ON";
    else if (ref.inferredKind === "gate" || ref.inferredKind === "trigger") state = "WATCHING";
    else if (ref.resolutionStatus === "CLASSIFIED_UNKNOWN_NOT_RESOLVED_STEP6") state = "BLOCKED";
    else if (ref.resolutionStatus === "MALFORMED_REFERENCE_NOT_RESOLVED_STEP6") state = "MISSING";

    const availability = summary.targetAvailability.references.find((entry) => entry.rawRef === ref.rawRef);
    if (availability?.resolutionStatus === "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED_STEP7") state = "BLOCKED";
    if (availability?.resolutionStatus === "TARGET_INDEX_ENTRY_NOT_FOUND_STEP7") state = "MISSING";
    if (availability?.resolutionStatus === "TARGET_AVAILABILITY_UNKNOWN_STEP7") state = "REJECTED";

    const kind: UmgGraphNodeKind = ref.inferredKind === "neoblock"
      ? "neoblock"
      : ref.inferredKind === "neostack"
        ? "neostack"
        : ref.inferredKind === "moltBlock"
          ? "moltblock"
          : ref.inferredKind === "gate"
            ? "gate"
            : ref.inferredKind === "trigger"
              ? "trigger"
              : ref.inferredKind === "tool"
                ? "tool"
                : "neoblock";

    nodes.push({
      id: ref.rawRef,
      kind,
      label: ref.rawRef,
      state,
      sourcePath: availability?.candidatePath ?? null,
      resolutionStatus: availability?.resolutionStatus ?? ref.resolutionStatus,
      warnings: [...ref.warnings, ...(availability?.warnings ?? [])]
    });
    edges.push({
      from: summary.id ?? sleeveId,
      to: ref.rawRef,
      relation: kind === "neoblock" ? "references" : kind === "gate" || kind === "trigger" ? "may_activate" : "contains",
      state,
      reason: availability?.resolutionStatus ?? ref.resolutionStatus
    });
  }

  if (summary.targetShallowLoad?.performed === true) {
    const shallow = summary.targetShallowLoad.summary;
    if (shallow.moltType) {
      const moltNodeId = `molt:${shallow.moltType}`;
      nodes.push({
        id: moltNodeId,
        kind: "moltblock",
        label: shallow.moltType,
        state: "ON",
        sourcePath: summary.targetShallowLoad.candidatePath,
        resolutionStatus: summary.targetShallowLoad.status,
        warnings: []
      });
      edges.push({
        from: summary.targetShallowLoad.loadedRef,
        to: moltNodeId,
        relation: "resolves_to",
        state: "ON",
        reason: "step8b_shallow_loaded"
      });
    }
  }

  return {
    mode: "public_curated",
    readOnly: true,
    execution: "not_performed",
    directSource: "not_enabled",
    libraryRoot: inspect.libraryRoot,
    activeSleeveId: summary.id ?? sleeveId,
    nodes,
    edges,
    excludedLanes: [
      { lane: "archive", state: "OFF", reason: "forbidden" },
      { lane: "HUMAN", state: "REFERENCE_ONLY", reason: "not_machine_loaded" },
      { lane: "Resleever", state: "OFF", reason: "not_allowed" },
      { lane: "direct_source", state: "OFF", reason: "not_enabled" }
    ],
    warnings: inspect.warnings,
    errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
  };
}

export function getCurrentSleeveStatus(input?: { sleeveId?: string; libraryRoot?: string }): UmgCurrentSleeveStatus {
  const inspect = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID,
    libraryRoot: input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT,
    mode: "public_curated",
    shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
  });

  if (!inspect.ok || !inspect.summary) {
    return {
      ok: false,
      mode: "public_curated",
      readOnly: true,
      execution: "not_performed",
      directSource: "not_enabled",
      libraryRoot: inspect.libraryRoot,
      catalogStatus: {
        loaded: inspect.trace.catalogLoaded === true,
        sourcePolicy: "public_curated_allowlist_only"
      },
      activeSleeve: {
        sleeveId: input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID,
        title: null,
        sourcePath: null,
        resolutionStatus: inspect.resolutionStatus ?? null
      },
      sleeveStatus: {
        loaded: false,
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
      },
      graphSummary: {
        neostackCount: 0,
        neoblockCount: 0,
        moltBlockCount: 0,
        gateCount: 0,
        triggerCount: 0,
        referenceCount: 0,
        loadedTargetCount: 0
      },
      neostackSummary: { count: 0, ids: [] },
      neoblockSummary: { count: 0, ids: [], loaded: [], dormant: [] },
      moltBlockSummary: { count: 0, ids: [] },
      gateSummary: { count: 0, ids: [] },
      triggerSummary: { count: 0, ids: [] },
      activationStateSummary: createActivationStateSummary(),
      currentRoute: [],
      excludedLanes: [
        { lane: "archive", state: "OFF", reason: "forbidden" },
        { lane: "HUMAN", state: "REFERENCE_ONLY", reason: "not_machine_loaded" },
        { lane: "Resleever", state: "OFF", reason: "not_allowed" },
        { lane: "direct_source", state: "OFF", reason: "not_enabled" }
      ],
      warnings: inspect.warnings,
      errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
  }

  const snapshot = buildCurrentSleeveGraphSnapshot(input);
  const summary = inspect.summary;
  const activationStateSummary = createActivationStateSummary();
  for (const node of snapshot.nodes) {
    increment(activationStateSummary, node.state);
  }
  for (const excluded of snapshot.excludedLanes) {
    increment(activationStateSummary, excluded.state);
  }

  const neostackIds = uniqueSorted(snapshot.nodes.filter((node) => node.kind === "neostack").map((node) => node.id));
  const neoblockNodes = snapshot.nodes.filter((node) => node.kind === "neoblock");
  const neoblockIds = uniqueSorted(neoblockNodes.map((node) => node.id));
  const loadedNeoblocks = uniqueSorted(neoblockNodes.filter((node) => node.state === "ON").map((node) => node.id));
  const dormantNeoblocks = uniqueSorted(neoblockNodes.filter((node) => node.state === "DORMANT").map((node) => node.id));
  const moltBlockIds = uniqueSorted(snapshot.nodes.filter((node) => node.kind === "moltblock").map((node) => node.id));
  const gateIds = uniqueSorted(snapshot.nodes.filter((node) => node.kind === "gate").map((node) => node.id));
  const triggerIds = uniqueSorted(snapshot.nodes.filter((node) => node.kind === "trigger").map((node) => node.id));

  return {
    ok: true,
    mode: "public_curated",
    readOnly: true,
    execution: "not_performed",
    directSource: "not_enabled",
    libraryRoot: inspect.libraryRoot,
    catalogStatus: {
      loaded: inspect.trace.catalogLoaded === true,
      sourcePolicy: "public_curated_allowlist_only"
    },
    activeSleeve: {
      sleeveId: summary.id ?? input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID,
      title: summary.title ?? summary.name ?? null,
      sourcePath: inspect.sourcePath ?? null,
      resolutionStatus: inspect.resolutionStatus ?? null
    },
    sleeveStatus: {
      loaded: inspect.loaded,
      warnings: inspect.warnings,
      errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    },
    graphSummary: {
      neostackCount: neostackIds.length,
      neoblockCount: neoblockIds.length,
      moltBlockCount: moltBlockIds.length,
      gateCount: gateIds.length,
      triggerCount: triggerIds.length,
      referenceCount: summary.referenceClassification.references.length,
      loadedTargetCount: summary.runtimeSummary && "performed" in summary.runtimeSummary && summary.runtimeSummary.performed === true
        ? summary.runtimeSummary.shallowLoadedTargetCount
        : 0
    },
    neostackSummary: {
      count: neostackIds.length,
      ids: neostackIds
    },
    neoblockSummary: {
      count: neoblockIds.length,
      ids: neoblockIds,
      loaded: loadedNeoblocks,
      dormant: dormantNeoblocks
    },
    moltBlockSummary: {
      count: moltBlockIds.length,
      ids: moltBlockIds
    },
    gateSummary: {
      count: gateIds.length,
      ids: gateIds
    },
    triggerSummary: {
      count: triggerIds.length,
      ids: triggerIds
    },
    activationStateSummary,
    currentRoute: [
      {
        kind: "sleeve",
        id: summary.id ?? input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID,
        state: "ON"
      },
      {
        kind: "neoblock",
        id: DEFAULT_SHALLOW_LOAD_TARGET_REF,
        state: "ON"
      }
    ],
    excludedLanes: snapshot.excludedLanes,
    warnings: snapshot.warnings,
    errors: snapshot.errors
  };
}
