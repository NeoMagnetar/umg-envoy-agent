export declare const NATIVE_GRAPH_SCHEMA_VERSION: "umg.native_sleeve_graph.v1";
export declare const ProvenanceCategories: readonly ["sleeve_native", "sleeve_native_derived", "sample_fallback", "legacy_preview_residue", "mixed_contaminated", "unknown"];
export type ProvenanceCategory = (typeof ProvenanceCategories)[number];
export declare const SourceModes: readonly ["sleeve_native", "sleeve_native_with_sample_fallback", "sample_only", "legacy_preview", "unavailable"];
export type SourceMode = (typeof SourceModes)[number];
export declare const RoutePurities: readonly ["clean_native", "native_with_marked_fallback", "contaminated", "unknown"];
export type RoutePurity = (typeof RoutePurities)[number];
export declare const MoltTypes: readonly ["Trigger", "Directive", "Instruction", "Subject", "Primary", "Philosophy", "Blueprint", "Off"];
export type MoltType = (typeof MoltTypes)[number];
export interface NativeGraphProvenance {
    category: ProvenanceCategory;
    declaredBy: "sleeve" | "neoblock" | "runtime" | "fallback" | "unknown";
    sourceId: string;
    sourcePath?: string;
    derivedFrom?: string[];
    evidence?: string[];
}
export interface NativeNeoStack {
    stackId: string;
    label: string;
    purpose: string;
    containedNeoBlockIds: string[];
    order?: number;
    activation?: {
        defaultActive: boolean;
        reason: string;
    };
    provenance: NativeGraphProvenance;
}
export interface NativeNeoBlock {
    neoBlockId: string;
    label: string;
    role: string;
    parentStackIds: string[];
    contributesTo: Array<"MOLT" | "RuntimeSpec" | "IRMatrix" | "Envelope" | "ToolRequest">;
    provenance: NativeGraphProvenance;
}
export interface NativeMoltFragment {
    fragmentId: string;
    sourceNeoBlockId: string;
    moltType: MoltType;
    role: string;
    content: string;
    mergeKey?: string;
    stackKey?: string;
    provenance: NativeGraphProvenance;
}
export interface NativeToolRequest {
    requestId: string;
    requestedToolName: string;
    requestedAction: string;
    purpose: string;
    policyClass: "read_only" | "approval_required" | "blocked" | "metadata_only";
    executableUnderBoundedRules: boolean;
    provenance: NativeGraphProvenance;
}
export interface NativeRuntimeRoute {
    routeId: string;
    routeType: "RuntimeSpecV0";
    sourceNeoBlockIds: string[];
    sourceMoltFragmentIds: string[];
    sourceToolRequestIds: string[];
    sourceMode: SourceMode;
    provenance: NativeGraphProvenance;
}
export interface NativeIrRoute {
    routeId: string;
    nodes: Array<{
        nodeId: string;
        nodeType: "sleeve" | "neoStack" | "neoBlock" | "moltFragment" | "toolRequest" | "runtimeSpec" | "irMatrix" | "envelope";
        sourceId: string;
        provenance: NativeGraphProvenance;
    }>;
    edges: Array<{
        edgeId: string;
        edgeType: "contains" | "contributes_to" | "declares" | "derives" | "compiles_to" | "routes_to" | "previews";
        from: string;
        to: string;
        provenance: NativeGraphProvenance;
    }>;
    routePurity: RoutePurity;
    provenance: NativeGraphProvenance;
}
export interface NativeEnvelopeSource {
    envelopeId: string;
    sourceRuntimeRouteId: string;
    sourceIrRouteId: string;
    sections: {
        activeStack: string;
        currentContextMoltMap: string;
        formalResponsePreview: string;
        metadata: string;
    };
    envelopeSource: "sleeve_native_declared" | "sleeve_native_derived" | "sample_fallback" | "legacy_preview_residue";
    provenance: NativeGraphProvenance;
}
export interface NativeGraphRoot {
    schemaVersion: typeof NATIVE_GRAPH_SCHEMA_VERSION;
    sleeveId: string;
    sleeveName: string;
    nativeGraphId: string;
    provenance: NativeGraphProvenance;
    neoStacks: NativeNeoStack[];
    neoBlocks: NativeNeoBlock[];
    moltFragments: NativeMoltFragment[];
    toolRequests: NativeToolRequest[];
    runtimeRoutes: NativeRuntimeRoute[];
    irRoutes: NativeIrRoute[];
    envelopeSources: NativeEnvelopeSource[];
    safety: {
        approvedOnly: true;
        allowlistedOnly: true;
        readOnlyOnly: true;
        directSourceEnabled: false;
        automaticResponseTakeover: false;
        umgBlockLibraryMutation: "not_performed";
    };
}
export interface NativeGraphValidationIssue {
    code: string;
    path: string;
    severity: "error" | "warning";
    message: string;
}
export interface NativeGraphValidationResult {
    valid: boolean;
    sourceMode: SourceMode;
    routePurity: RoutePurity;
    sampleFallbackUsed: boolean;
    legacyPreviewResidueDetected: boolean;
    legacyPreviewResiduePaths: string[];
    issues: NativeGraphValidationIssue[];
}
export interface NativeGraphSummary {
    sleeveId: string;
    sourceMode: SourceMode;
    routePurity: RoutePurity;
    neoStackCount: number;
    neoBlockCount: number;
    moltFragmentCount: number;
    toolRequestCount: number;
    runtimeRouteCount: number;
    irRouteCount: number;
    envelopeSourceCount: number;
    sampleFallbackUsed: boolean;
    legacyPreviewResidueDetected: boolean;
    legacyPreviewResiduePaths: string[];
}
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function isProvenanceCategory(value: unknown): value is ProvenanceCategory;
export declare function isNativeProvenance(provenance: NativeGraphProvenance | undefined): boolean;
export declare function isContaminatedProvenance(provenance: NativeGraphProvenance | undefined): boolean;
export declare function validateNativeGraphRoot(root: NativeGraphRoot): NativeGraphValidationResult;
export declare function summarizeNativeGraph(root: NativeGraphRoot): NativeGraphSummary;
export declare function allProvenance(root: NativeGraphRoot): NativeGraphProvenance[];
