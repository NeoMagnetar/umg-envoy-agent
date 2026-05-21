export declare const UMG_ACTIVATION_STATES: readonly ["ON", "OFF", "DORMANT", "WATCHING", "BLOCKED", "REJECTED", "MISSING", "REFERENCE_ONLY", "FORMAT", "CONTEXTUAL", "SHADOWED"];
export type UmgActivationState = typeof UMG_ACTIVATION_STATES[number];
export type UmgGraphNodeKind = "sleeve" | "neostack" | "neoblock" | "moltblock" | "gate" | "trigger" | "tool" | "lane";
export type UmgGraphEdgeRelation = "contains" | "references" | "resolves_to" | "may_activate" | "constrains" | "formats" | "excludes" | "blocked_by";
export type UmgSleeveTreeChildrenMode = "DECLARED_NEOSTACKS" | "EXPLICIT_NEOBLOCK_REFS_FALLBACK" | "EMPTY" | "BLOCKED";
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
export interface UmgSleeveTreeNode {
    kind: "sleeve" | "neostack" | "neoblock" | "moltblock" | "gate" | "trigger" | "lane";
    id: string;
    label: string;
    state: UmgActivationState;
    sourcePath: string | null;
    resolutionStatus: string | null;
    children: UmgSleeveTreeNode[];
    childrenMode?: UmgSleeveTreeChildrenMode;
    notes: string[];
    warnings: string[];
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
export interface UmgSleeveTreeResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        depth: number;
    };
    tree: UmgSleeveTreeNode;
    summary: {
        declaredNeoStackCount: number;
        displayedNeoStackCount: number;
        explicitNeoBlockRefCount: number;
        displayedNeoBlockCount: number;
        displayedMoltBlockCount: number;
        loadedTargetCount: number;
        depthApplied: number;
    };
    notes: Array<{
        code: string;
        message: string;
    }>;
    excludedLanes: UmgGraphExcludedLane[];
    warnings: string[];
    errors: string[];
}
export interface UmgNeoStackInspectRequest {
    sleeveId?: string;
    neostackId?: string;
    includeNeoBlocks?: boolean;
    libraryRoot?: string;
}
export interface UmgNeoStackHold {
    code: string;
    message: string;
}
export interface UmgNeoStackSummary {
    neostackId: string;
    title: string | null;
    state: UmgActivationState;
    sourcePath: string | null;
    resolutionStatus: string | null;
    containedNeoBlockCount: number;
    gateCount: number;
    triggerCount: number;
    warnings: string[];
}
export interface UmgNeoStackInspectResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        neostackId: string | null;
        includeNeoBlocks: boolean;
    };
    hold?: UmgNeoStackHold;
    activeSleeve: {
        sleeveId: string;
        title: string | null;
        sourcePath: string | null;
        resolutionStatus: string | null;
    };
    neostack: UmgNeoStackSummary | null;
    sleeveSummary: {
        sleeveId: string;
        declaredNeoStackCount: number;
        explicitNeoBlockRefCount: number;
        childrenMode: UmgSleeveTreeChildrenMode;
    };
    fallback: {
        kind: "explicit_neoblock_refs" | "none";
        available: boolean;
        refs: string[];
    };
    warnings: string[];
    errors: string[];
}
export interface UmgNeoBlockInspectRequest {
    neoblockId?: string;
    sleeveId?: string;
    includeMoltBlocks?: boolean;
    libraryRoot?: string;
}
export interface UmgNeoBlockHold {
    code: string;
    message: string;
}
export interface UmgNeoBlockSummary {
    neoblockId: string;
    kind: "neoblock";
    moltType: string | null;
    moltTypeSource: "shallow_loaded_target" | "inferred_from_ref_id" | "unknown";
    state: UmgActivationState;
    sourcePath: string | null;
    resolutionStatus: string;
    contentPreview: string | null;
    warnings: string[];
}
export interface UmgMoltBlockShallowSummary {
    id: string;
    moltType: string | null;
    state: UmgActivationState;
    source: "shallow_loaded_target";
    contentPreview: string | null;
    warnings: string[];
}
export interface UmgNeoBlockInspectResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        neoblockId: string | null;
        includeMoltBlocks: boolean;
    };
    hold?: UmgNeoBlockHold;
    activeSleeve: {
        sleeveId: string;
        title: string | null;
        sourcePath: string | null;
        resolutionStatus: string | null;
    };
    neoblock: UmgNeoBlockSummary | null;
    moltBlocks: UmgMoltBlockShallowSummary[];
    notes: Array<{
        code: string;
        message: string;
    }>;
    warnings: string[];
    errors: string[];
}
export interface UmgMoltBlockInspectRequest {
    moltBlockId?: string;
    sleeveId?: string;
    neoblockId?: string;
    libraryRoot?: string;
}
export interface UmgMoltBlockHold {
    code: string;
    message: string;
}
export interface UmgMoltBlockInspectSummary {
    moltBlockId: string;
    moltType: string | null;
    moltTypeSource: "shallow_loaded_target" | "inferred_from_ref_id" | "unknown";
    state: UmgActivationState;
    source: "shallow_loaded_target";
    sourcePath: string | null;
    contentPreview: string | null;
    mergeKey: string | null;
    stackKey: string | null;
    stackRank: number | null;
    warnings: string[];
}
export interface UmgMoltBlockInspectResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        neoblockId: string | null;
        moltBlockId: string | null;
    };
    hold?: UmgMoltBlockHold;
    activeSleeve: {
        sleeveId: string;
        title: string | null;
        sourcePath: string | null;
        resolutionStatus: string | null;
    };
    parentNeoBlock: {
        neoblockId: string;
        state: UmgActivationState;
        resolutionStatus: string;
    } | null;
    moltBlock: UmgMoltBlockInspectSummary | null;
    notes: Array<{
        code: string;
        message: string;
    }>;
    warnings: string[];
    errors: string[];
}
export interface UmgRuntimeIrPathRequest {
    sleeveId?: string;
    includeDormant?: boolean;
    includeExcludedLanes?: boolean;
    libraryRoot?: string;
}
export interface UmgRuntimeIrPathNode {
    order: number;
    kind: "sleeve" | "neostack" | "neoblock" | "moltblock";
    id: string | null;
    label: string;
    state: UmgActivationState;
    reason: string;
    sourcePath: string | null;
    resolutionStatus: string | null;
}
export interface UmgRuntimeIrPathEdge {
    from: string;
    to: string;
    relation: "references" | "exposes_molt_summary";
    state: UmgActivationState;
    reason: string;
}
export interface UmgRuntimeIrPathSummary {
    pathNodeCount: number;
    edgeCount: number;
    activeNodeCount: number;
    dormantRefCount: number;
    excludedLaneCount: number;
    declaredNeoStackCount: number;
    explicitNeoBlockRefCount: number;
    loadedTargetCount: number;
    visibleMoltBlockCount: number;
}
export interface UmgRuntimeIrPathNote {
    code: string;
    message: string;
}
export interface UmgRuntimeIrPathResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        includeDormant: boolean;
        includeExcludedLanes: boolean;
    };
    activeSleeve: {
        sleeveId: string;
        title: string | null;
        state: UmgActivationState;
    };
    path: UmgRuntimeIrPathNode[];
    edges: UmgRuntimeIrPathEdge[];
    dormantRefs: Array<{
        kind: "neoblock";
        id: string;
        state: UmgActivationState;
        reason: string;
    }>;
    excludedLanes: UmgGraphExcludedLane[];
    summary: UmgRuntimeIrPathSummary;
    notes: UmgRuntimeIrPathNote[];
    nlProjection: string;
    warnings: string[];
    errors: string[];
}
export interface UmgRuntimeIrMatrixRequest {
    sleeveId?: string;
    includeDormant?: boolean;
    includeExcludedLanes?: boolean;
    includeEdges?: boolean;
    includeNlProjection?: boolean;
    libraryRoot?: string;
}
export interface UmgRuntimeIrMatrixNode {
    id: string;
    kind: "sleeve" | "neostack_marker" | "neoblock" | "moltblock" | "lane" | "note";
    label: string;
    state: UmgActivationState;
    reason: string;
    sourcePath: string | null;
    resolutionStatus: string | null;
    moltType: string | null;
    metadata: Record<string, unknown>;
}
export interface UmgRuntimeIrMatrixEdge {
    from: string;
    to: string;
    relation: "contains_marker" | "references" | "available_ref" | "exposes_molt_summary" | "excludes_lane" | "documents_state";
    state: UmgActivationState;
    reason: string;
}
export interface UmgRuntimeIrMatrixStateBuckets {
    ON: string[];
    OFF: string[];
    DORMANT: string[];
    REFERENCE_ONLY: string[];
    WATCHING: string[];
    BLOCKED: string[];
    REJECTED: string[];
    MISSING: string[];
    FORMAT: string[];
    CONTEXTUAL: string[];
    SHADOWED: string[];
}
export interface UmgRuntimeIrMatrixSummary {
    nodeCount: number;
    edgeCount: number;
    routeNodeCount: number;
    activeNodeCount: number;
    dormantNodeCount: number;
    excludedLaneCount: number;
    declaredNeoStackCount: number;
    explicitNeoBlockRefCount: number;
    loadedTargetCount: number;
    visibleMoltBlockCount: number;
}
export interface UmgRuntimeIrMatrix {
    nodes: UmgRuntimeIrMatrixNode[];
    edges: UmgRuntimeIrMatrixEdge[];
    stateBuckets: UmgRuntimeIrMatrixStateBuckets;
    route: UmgRuntimeIrPathNode[];
    dormantRefs: Array<{
        kind: "neoblock";
        id: string;
        state: UmgActivationState;
        reason: string;
    }>;
    excludedLanes: UmgGraphExcludedLane[];
}
export interface UmgRuntimeIrMatrixResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        includeDormant: boolean;
        includeExcludedLanes: boolean;
        includeEdges: boolean;
        includeNlProjection: boolean;
    };
    activeSleeve: {
        sleeveId: string;
        title: string | null;
        state: UmgActivationState;
    };
    matrix: UmgRuntimeIrMatrix;
    summary: UmgRuntimeIrMatrixSummary;
    notes: UmgRuntimeIrPathNote[];
    nlProjection: string;
    warnings: string[];
    errors: string[];
}
export interface UmgResponseEnvelopeDraftRequest {
    sleeveId?: string;
    trigger?: string;
    directive?: string;
    instruction?: string;
    subject?: string;
    primary?: string;
    philosophy?: string;
    blueprint?: string;
    formalResponseContent?: string;
    includeIrMatrix?: boolean;
    includeMetadata?: boolean;
    libraryRoot?: string;
}
export interface UmgResponseEnvelopeActiveStack {
    activeSleeve: string;
    activeSleeveTitle: string | null;
    runtimeMode: string;
    toolExecution: "off";
    directSource: "off";
    activeRoute: string[];
    dormantRefCount: number;
    excludedLaneCount: number;
}
export interface UmgResponseEnvelopeIntuition {
    text: string;
    confidence: "bounded";
    limitations: string[];
}
export interface UmgResponseEnvelopeMoltMap {
    Trigger: string;
    Directive: string;
    Instruction: string;
    Subject: string;
    Primary: string;
    Philosophy: string;
    Blueprint: string;
}
export interface UmgResponseEnvelopeMetadata {
    ActiveSleeve: string;
    Mode: string;
    Scope: string;
    Domain: string;
    Project: string;
    State: string;
    ToolCount: number;
    Execution: string;
    DirectSource: string;
    Surface: string;
    SpecVersion: string;
}
export interface UmgResponseEnvelopeDraftResult {
    ok: boolean;
    mode: "public_curated";
    readOnly: true;
    execution: "not_performed";
    directSource: "not_enabled";
    requested: {
        sleeveId: string;
        includeIrMatrix: boolean;
        includeMetadata: boolean;
    };
    activeStack: UmgResponseEnvelopeActiveStack;
    envoyIntuition: UmgResponseEnvelopeIntuition;
    moltMap: UmgResponseEnvelopeMoltMap;
    formalResponseContent: string;
    irMatrix: UmgRuntimeIrMatrixResult | null;
    metadata: UmgResponseEnvelopeMetadata | null;
    nlProjection: string;
    warnings: string[];
    errors: string[];
}
export declare function buildCurrentSleeveGraphSnapshot(input?: {
    sleeveId?: string;
    libraryRoot?: string;
}): UmgGraphSnapshot;
export declare function getCurrentSleeveStatus(input?: {
    sleeveId?: string;
    libraryRoot?: string;
}): UmgCurrentSleeveStatus;
export declare function getSleeveTree(input?: {
    sleeveId?: string;
    libraryRoot?: string;
    depth?: number;
}): UmgSleeveTreeResult;
export declare function inspectNeoStack(input?: UmgNeoStackInspectRequest): UmgNeoStackInspectResult;
export declare function inspectNeoBlock(input?: UmgNeoBlockInspectRequest): UmgNeoBlockInspectResult;
export declare function inspectMoltBlock(input?: UmgMoltBlockInspectRequest): UmgMoltBlockInspectResult;
export declare function getRuntimeIrPath(input?: UmgRuntimeIrPathRequest): UmgRuntimeIrPathResult;
export declare function getRuntimeIrMatrixFull(input?: UmgRuntimeIrMatrixRequest): UmgRuntimeIrMatrixResult;
export declare function renderResponseEnvelopeDraft(input?: UmgResponseEnvelopeDraftRequest): UmgResponseEnvelopeDraftResult;
