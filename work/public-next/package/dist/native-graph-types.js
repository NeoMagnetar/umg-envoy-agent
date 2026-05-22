// src/native-graph-types.ts
// Real UMG sleeve-native graph types and validation helpers.
// This module is intentionally read-only and has no filesystem, network, package, or publish side effects.
export const NATIVE_GRAPH_SCHEMA_VERSION = "umg.native_sleeve_graph.v1";
export const ProvenanceCategories = [
    "sleeve_native",
    "sleeve_native_derived",
    "sample_fallback",
    "legacy_preview_residue",
    "mixed_contaminated",
    "unknown",
];
export const SourceModes = [
    "sleeve_native",
    "sleeve_native_with_sample_fallback",
    "sample_only",
    "legacy_preview",
    "unavailable",
];
export const RoutePurities = [
    "clean_native",
    "native_with_marked_fallback",
    "contaminated",
    "unknown",
];
export const MoltTypes = [
    "Trigger",
    "Directive",
    "Instruction",
    "Subject",
    "Primary",
    "Philosophy",
    "Blueprint",
    "Off",
];
export function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isProvenanceCategory(value) {
    return typeof value === "string" && ProvenanceCategories.includes(value);
}
export function isNativeProvenance(provenance) {
    return provenance?.category === "sleeve_native" || provenance?.category === "sleeve_native_derived";
}
export function isContaminatedProvenance(provenance) {
    return (provenance?.category === "sample_fallback" ||
        provenance?.category === "legacy_preview_residue" ||
        provenance?.category === "mixed_contaminated" ||
        provenance?.category === "unknown");
}
function issue(issues, severity, code, path, message) {
    issues.push({ severity, code, path, message });
}
function collectLegacyResiduePathsFromProvenance(provenance, path, paths) {
    if (!provenance) {
        return;
    }
    if (provenance.category === "legacy_preview_residue" || provenance.category === "mixed_contaminated") {
        paths.push(path);
    }
}
export function validateNativeGraphRoot(root) {
    const issues = [];
    const legacyPreviewResiduePaths = [];
    if (root.schemaVersion !== NATIVE_GRAPH_SCHEMA_VERSION) {
        issue(issues, "error", "INVALID_SCHEMA_VERSION", "schemaVersion", `Expected ${NATIVE_GRAPH_SCHEMA_VERSION}.`);
    }
    if (!root.sleeveId) {
        issue(issues, "error", "MISSING_SLEEVE_ID", "sleeveId", "Sleeve id is required.");
    }
    if (!isNativeProvenance(root.provenance)) {
        issue(issues, "error", "ROOT_NOT_NATIVE", "provenance", "Native graph root must be sleeve-native.");
    }
    if (!root.neoStacks.length) {
        issue(issues, "error", "NO_NATIVE_NEOSTACKS", "neoStacks", "At least one native NeoStack is required for clean_native.");
    }
    const neoBlockIds = new Set(root.neoBlocks.map((block) => block.neoBlockId));
    const stackIds = new Set(root.neoStacks.map((stack) => stack.stackId));
    const moltFragmentIds = new Set(root.moltFragments.map((fragment) => fragment.fragmentId));
    const toolRequestIds = new Set(root.toolRequests.map((request) => request.requestId));
    root.neoStacks.forEach((stack, index) => {
        const basePath = `neoStacks[${index}]`;
        if (!isNativeProvenance(stack.provenance)) {
            issue(issues, "error", "NEOSTACK_NOT_NATIVE", `${basePath}.provenance`, `${stack.stackId} is not native.`);
        }
        if (!stack.containedNeoBlockIds.length) {
            issue(issues, "error", "NEOSTACK_EMPTY", `${basePath}.containedNeoBlockIds`, `${stack.stackId} has no NeoBlocks.`);
        }
        stack.containedNeoBlockIds.forEach((blockId, blockIndex) => {
            if (!neoBlockIds.has(blockId)) {
                issue(issues, "error", "NEOSTACK_BLOCK_REF_MISSING", `${basePath}.containedNeoBlockIds[${blockIndex}]`, `${stack.stackId} references missing NeoBlock ${blockId}.`);
            }
        });
        collectLegacyResiduePathsFromProvenance(stack.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    root.neoBlocks.forEach((block, index) => {
        const basePath = `neoBlocks[${index}]`;
        if (!block.parentStackIds.length) {
            issue(issues, "error", "NEOBLOCK_NO_STACK_MEMBERSHIP", `${basePath}.parentStackIds`, `${block.neoBlockId} has no stack membership.`);
        }
        block.parentStackIds.forEach((stackId, stackIndex) => {
            if (!stackIds.has(stackId)) {
                issue(issues, "error", "NEOBLOCK_STACK_REF_MISSING", `${basePath}.parentStackIds[${stackIndex}]`, `${block.neoBlockId} references missing stack ${stackId}.`);
            }
        });
        if (!isNativeProvenance(block.provenance)) {
            issue(issues, "error", "NEOBLOCK_NOT_NATIVE", `${basePath}.provenance`, `${block.neoBlockId} is not native.`);
        }
        collectLegacyResiduePathsFromProvenance(block.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    root.moltFragments.forEach((fragment, index) => {
        const basePath = `moltFragments[${index}]`;
        if (!neoBlockIds.has(fragment.sourceNeoBlockId)) {
            issue(issues, "error", "MOLT_SOURCE_NEOBLOCK_MISSING", `${basePath}.sourceNeoBlockId`, `${fragment.fragmentId} references missing NeoBlock ${fragment.sourceNeoBlockId}.`);
        }
        if (!isNativeProvenance(fragment.provenance)) {
            issue(issues, "error", "MOLT_FRAGMENT_NOT_NATIVE", `${basePath}.provenance`, `${fragment.fragmentId} is not native.`);
        }
        collectLegacyResiduePathsFromProvenance(fragment.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    root.toolRequests.forEach((request, index) => {
        const basePath = `toolRequests[${index}]`;
        if (!isNativeProvenance(request.provenance)) {
            issue(issues, "error", "TOOL_REQUEST_NOT_NATIVE", `${basePath}.provenance`, `${request.requestId} is not native.`);
        }
        if (request.policyClass !== "read_only" && request.policyClass !== "approval_required" && request.policyClass !== "metadata_only") {
            issue(issues, "warning", "TOOL_REQUEST_BLOCKED", `${basePath}.policyClass`, `${request.requestId} is not an executable read-only route.`);
        }
        collectLegacyResiduePathsFromProvenance(request.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    root.runtimeRoutes.forEach((route, index) => {
        const basePath = `runtimeRoutes[${index}]`;
        route.sourceNeoBlockIds.forEach((blockId, blockIndex) => {
            if (!neoBlockIds.has(blockId)) {
                issue(issues, "error", "RUNTIME_ROUTE_BLOCK_REF_MISSING", `${basePath}.sourceNeoBlockIds[${blockIndex}]`, `Missing NeoBlock ${blockId}.`);
            }
        });
        route.sourceMoltFragmentIds.forEach((fragmentId, fragmentIndex) => {
            if (!moltFragmentIds.has(fragmentId)) {
                issue(issues, "error", "RUNTIME_ROUTE_MOLT_REF_MISSING", `${basePath}.sourceMoltFragmentIds[${fragmentIndex}]`, `Missing MOLT fragment ${fragmentId}.`);
            }
        });
        route.sourceToolRequestIds.forEach((requestId, requestIndex) => {
            if (!toolRequestIds.has(requestId)) {
                issue(issues, "error", "RUNTIME_ROUTE_TOOL_REF_MISSING", `${basePath}.sourceToolRequestIds[${requestIndex}]`, `Missing tool request ${requestId}.`);
            }
        });
        if (route.sourceMode !== "sleeve_native" || !isNativeProvenance(route.provenance)) {
            issue(issues, "error", "RUNTIME_ROUTE_NOT_NATIVE", basePath, `${route.routeId} is not sleeve-native.`);
        }
        collectLegacyResiduePathsFromProvenance(route.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    root.irRoutes.forEach((route, index) => {
        const basePath = `irRoutes[${index}]`;
        if (route.routePurity !== "clean_native" || !isNativeProvenance(route.provenance)) {
            issue(issues, "error", "IR_ROUTE_NOT_CLEAN_NATIVE", basePath, `${route.routeId} is not clean-native.`);
        }
        route.nodes.forEach((node, nodeIndex) => {
            if (!isNativeProvenance(node.provenance)) {
                issue(issues, "error", "IR_NODE_NOT_NATIVE", `${basePath}.nodes[${nodeIndex}].provenance`, `${node.nodeId} is not native.`);
            }
            collectLegacyResiduePathsFromProvenance(node.provenance, `${basePath}.nodes[${nodeIndex}].provenance`, legacyPreviewResiduePaths);
        });
        route.edges.forEach((edge, edgeIndex) => {
            if (!isNativeProvenance(edge.provenance)) {
                issue(issues, "error", "IR_EDGE_NOT_NATIVE", `${basePath}.edges[${edgeIndex}].provenance`, `${edge.edgeId} is not native.`);
            }
            collectLegacyResiduePathsFromProvenance(edge.provenance, `${basePath}.edges[${edgeIndex}].provenance`, legacyPreviewResiduePaths);
        });
        collectLegacyResiduePathsFromProvenance(route.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    root.envelopeSources.forEach((envelope, index) => {
        const basePath = `envelopeSources[${index}]`;
        if (envelope.envelopeSource !== "sleeve_native_derived" && envelope.envelopeSource !== "sleeve_native_declared") {
            issue(issues, "error", "ENVELOPE_NOT_NATIVE", basePath, `${envelope.envelopeId} is not native-derived.`);
        }
        if (!isNativeProvenance(envelope.provenance)) {
            issue(issues, "error", "ENVELOPE_PROVENANCE_NOT_NATIVE", `${basePath}.provenance`, `${envelope.envelopeId} provenance is not native.`);
        }
        collectLegacyResiduePathsFromProvenance(envelope.provenance, `${basePath}.provenance`, legacyPreviewResiduePaths);
    });
    if (!root.safety.approvedOnly || !root.safety.allowlistedOnly || !root.safety.readOnlyOnly) {
        issue(issues, "error", "SAFETY_BOUNDARY_INVALID", "safety", "Approved/allowlisted/read-only boundaries must be true.");
    }
    if (root.safety.directSourceEnabled !== false || root.safety.automaticResponseTakeover !== false) {
        issue(issues, "error", "SAFETY_TAKEOVER_INVALID", "safety", "direct_source and automatic response takeover must stay disabled.");
    }
    const hasErrors = issues.some((entry) => entry.severity === "error");
    const sampleFallbackUsed = allProvenance(root).some((entry) => entry.category === "sample_fallback");
    const legacyPreviewResidueDetected = legacyPreviewResiduePaths.length > 0;
    const sourceMode = hasErrors || sampleFallbackUsed || legacyPreviewResidueDetected ? "sleeve_native_with_sample_fallback" : "sleeve_native";
    const routePurity = hasErrors || sampleFallbackUsed || legacyPreviewResidueDetected ? "contaminated" : "clean_native";
    return {
        valid: !hasErrors && !sampleFallbackUsed && !legacyPreviewResidueDetected,
        sourceMode,
        routePurity,
        sampleFallbackUsed,
        legacyPreviewResidueDetected,
        legacyPreviewResiduePaths,
        issues,
    };
}
export function summarizeNativeGraph(root) {
    const validation = validateNativeGraphRoot(root);
    return {
        sleeveId: root.sleeveId,
        sourceMode: validation.sourceMode,
        routePurity: validation.routePurity,
        neoStackCount: root.neoStacks.length,
        neoBlockCount: root.neoBlocks.length,
        moltFragmentCount: root.moltFragments.length,
        toolRequestCount: root.toolRequests.length,
        runtimeRouteCount: root.runtimeRoutes.length,
        irRouteCount: root.irRoutes.length,
        envelopeSourceCount: root.envelopeSources.length,
        sampleFallbackUsed: validation.sampleFallbackUsed,
        legacyPreviewResidueDetected: validation.legacyPreviewResidueDetected,
        legacyPreviewResiduePaths: validation.legacyPreviewResiduePaths,
    };
}
export function allProvenance(root) {
    return [
        root.provenance,
        ...root.neoStacks.map((entry) => entry.provenance),
        ...root.neoBlocks.map((entry) => entry.provenance),
        ...root.moltFragments.map((entry) => entry.provenance),
        ...root.toolRequests.map((entry) => entry.provenance),
        ...root.runtimeRoutes.map((entry) => entry.provenance),
        ...root.irRoutes.map((entry) => entry.provenance),
        ...root.irRoutes.flatMap((route) => route.nodes.map((node) => node.provenance)),
        ...root.irRoutes.flatMap((route) => route.edges.map((edge) => edge.provenance)),
        ...root.envelopeSources.map((entry) => entry.provenance),
    ];
}
