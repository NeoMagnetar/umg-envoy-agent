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
];
const DEFAULT_LIBRARY_ROOT = "C:\\.openclaw\\workspace\\UMG-Block-Library";
const DEFAULT_CURRENT_SLEEVE_ID = "neomagnetar-dynamic-persona-v1";
const DEFAULT_SHALLOW_LOAD_TARGET_REF = "primary.sample";
function createActivationStateSummary() {
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
function increment(summary, state) {
    summary[state] += 1;
}
function uniqueSorted(values) {
    return Array.from(new Set(values.filter((value) => value.trim().length > 0))).sort();
}
function findNode(snapshot, id) {
    return snapshot.nodes.find((node) => node.id === id);
}
function buildExcludedLanes() {
    return [
        { lane: "archive", state: "OFF", reason: "forbidden" },
        { lane: "HUMAN", state: "REFERENCE_ONLY", reason: "not_machine_loaded" },
        { lane: "Resleever", state: "OFF", reason: "not_allowed" },
        { lane: "direct_source", state: "OFF", reason: "not_enabled" }
    ];
}
function getFallbackChildrenMode(declaredNeoStackCount, explicitNeoBlockRefCount) {
    if (declaredNeoStackCount > 0)
        return "DECLARED_NEOSTACKS";
    if (explicitNeoBlockRefCount > 0)
        return "EXPLICIT_NEOBLOCK_REFS_FALLBACK";
    return "EMPTY";
}
function inferMoltTypeFromRefId(neoblockId) {
    const prefix = neoblockId.split(".")[0]?.trim().toLowerCase();
    if (!prefix)
        return null;
    const map = {
        primary: "Primary",
        directive: "Directive",
        instruction: "Instruction",
        subject: "Subject",
        philosophy: "Philosophy",
        blueprint: "Blueprint",
        trigger: "Trigger"
    };
    return map[prefix] ?? null;
}
export function buildCurrentSleeveGraphSnapshot(input) {
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
            excludedLanes: buildExcludedLanes(),
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    const summary = inspect.summary;
    const nodes = [];
    const edges = [];
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
        let state = "DORMANT";
        if (ref.rawRef === DEFAULT_SHALLOW_LOAD_TARGET_REF)
            state = "ON";
        else if (ref.inferredKind === "gate" || ref.inferredKind === "trigger")
            state = "WATCHING";
        else if (ref.resolutionStatus === "CLASSIFIED_UNKNOWN_NOT_RESOLVED_STEP6")
            state = "BLOCKED";
        else if (ref.resolutionStatus === "MALFORMED_REFERENCE_NOT_RESOLVED_STEP6")
            state = "MISSING";
        const availability = summary.targetAvailability.references.find((entry) => entry.rawRef === ref.rawRef);
        if (availability?.resolutionStatus === "TARGET_INDEX_ENTRY_FOUND_PATH_FORBIDDEN_NOT_LOADED_STEP7")
            state = "BLOCKED";
        if (availability?.resolutionStatus === "TARGET_INDEX_ENTRY_NOT_FOUND_STEP7")
            state = "MISSING";
        if (availability?.resolutionStatus === "TARGET_AVAILABILITY_UNKNOWN_STEP7")
            state = "REJECTED";
        const kind = ref.inferredKind === "neoblock"
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
        excludedLanes: buildExcludedLanes(),
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
}
export function getCurrentSleeveStatus(input) {
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
            excludedLanes: buildExcludedLanes(),
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
export function getSleeveTree(input) {
    const requestedDepth = input?.depth ?? 2;
    if (!Number.isInteger(requestedDepth) || requestedDepth < 1 || requestedDepth > 4) {
        throw new Error("HOLD_INVALID_TREE_DEPTH");
    }
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const inspect = inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
    });
    if (!inspect.ok || !inspect.summary) {
        const firstCode = inspect.errors[0]?.code ?? "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED";
        throw new Error(firstCode);
    }
    const snapshot = buildCurrentSleeveGraphSnapshot({ sleeveId, libraryRoot });
    const summary = inspect.summary;
    const rootId = summary.id ?? sleeveId;
    const rootNode = findNode(snapshot, rootId);
    if (!rootNode) {
        throw new Error("HOLD_SLEEVE_NOT_FOUND");
    }
    const notes = [];
    const tree = {
        kind: "sleeve",
        id: rootNode.id,
        label: rootNode.label,
        state: rootNode.state,
        sourcePath: rootNode.sourcePath,
        resolutionStatus: rootNode.resolutionStatus,
        children: [],
        childrenMode: "EMPTY",
        notes: [],
        warnings: rootNode.warnings
    };
    const explicitRefNodes = summary.explicitReferences.neoblocks
        .map((id) => findNode(snapshot, id))
        .filter((node) => Boolean(node));
    const shallowMoltNode = findNode(snapshot, "molt:Primary");
    if (requestedDepth >= 2) {
        if (summary.explicitReferences.neostacks.length > 0) {
            tree.childrenMode = "DECLARED_NEOSTACKS";
            tree.children = summary.explicitReferences.neostacks
                .map((id) => findNode(snapshot, id))
                .filter((node) => Boolean(node))
                .map((node) => ({
                kind: "neostack",
                id: node.id,
                label: node.label,
                state: node.state,
                sourcePath: node.sourcePath,
                resolutionStatus: node.resolutionStatus,
                children: [],
                notes: [],
                warnings: node.warnings
            }));
        }
        else if (explicitRefNodes.length > 0) {
            tree.childrenMode = "EXPLICIT_NEOBLOCK_REFS_FALLBACK";
            tree.notes.push("NO_DECLARED_NEOSTACKS");
            notes.push({
                code: "NO_DECLARED_NEOSTACKS",
                message: "The current sleeve has no declared NeoStack objects. Explicit NeoBlock refs are displayed directly under the sleeve."
            });
            tree.children = explicitRefNodes.map((node) => {
                const child = {
                    kind: "neoblock",
                    id: node.id,
                    label: node.label,
                    state: node.state,
                    sourcePath: node.sourcePath,
                    resolutionStatus: node.resolutionStatus,
                    children: [],
                    notes: [],
                    warnings: node.warnings
                };
                if (node.state === "DORMANT") {
                    child.notes.push("target_available_not_loaded");
                }
                if (requestedDepth >= 4 && node.id === DEFAULT_SHALLOW_LOAD_TARGET_REF && shallowMoltNode) {
                    child.children.push({
                        kind: "moltblock",
                        id: shallowMoltNode.id,
                        label: shallowMoltNode.label,
                        state: shallowMoltNode.state,
                        sourcePath: shallowMoltNode.sourcePath,
                        resolutionStatus: shallowMoltNode.resolutionStatus,
                        children: [],
                        notes: ["shallow_visible_only"],
                        warnings: shallowMoltNode.warnings
                    });
                }
                return child;
            });
        }
        else {
            tree.childrenMode = "EMPTY";
        }
    }
    if (requestedDepth === 1) {
        tree.children = [];
    }
    const displayedNeoStackCount = tree.children.filter((child) => child.kind === "neostack").length;
    const displayedNeoBlockCount = tree.childrenMode === "EXPLICIT_NEOBLOCK_REFS_FALLBACK"
        ? tree.children.filter((child) => child.kind === "neoblock").length
        : tree.children.flatMap((child) => child.children).filter((child) => child.kind === "neoblock").length;
    const displayedMoltBlockCount = tree.children
        .flatMap((child) => child.children)
        .filter((child) => child.kind === "moltblock").length;
    return {
        ok: true,
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId: rootNode.id,
            depth: requestedDepth
        },
        tree,
        summary: {
            declaredNeoStackCount: summary.explicitReferences.neostacks.length,
            displayedNeoStackCount,
            explicitNeoBlockRefCount: summary.explicitReferences.neoblocks.length,
            displayedNeoBlockCount,
            displayedMoltBlockCount,
            loadedTargetCount: summary.runtimeSummary && "performed" in summary.runtimeSummary && summary.runtimeSummary.performed === true
                ? summary.runtimeSummary.shallowLoadedTargetCount
                : 0,
            depthApplied: requestedDepth
        },
        notes,
        excludedLanes: snapshot.excludedLanes,
        warnings: snapshot.warnings,
        errors: snapshot.errors
    };
}
export function inspectNeoStack(input) {
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const neostackId = input?.neostackId ?? null;
    const includeNeoBlocks = input?.includeNeoBlocks ?? true;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const baseResult = {
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId,
            neostackId,
            includeNeoBlocks
        }
    };
    if (!neostackId) {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_NEOSTACK_ID_REQUIRED",
                message: "A neostackId is required for NeoStack inspection."
            },
            activeSleeve: {
                sleeveId,
                title: null,
                sourcePath: null,
                resolutionStatus: null
            },
            neostack: null,
            sleeveSummary: {
                sleeveId,
                declaredNeoStackCount: 0,
                explicitNeoBlockRefCount: 0,
                childrenMode: "EMPTY"
            },
            fallback: {
                kind: "none",
                available: false,
                refs: []
            },
            warnings: [],
            errors: []
        };
    }
    const inspect = inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
    });
    if (!inspect.ok || !inspect.summary) {
        const firstCode = inspect.errors[0]?.code ?? "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED";
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: firstCode,
                message: inspect.errors[0]?.message ?? "Sleeve could not be inspected in public_curated mode."
            },
            activeSleeve: {
                sleeveId,
                title: null,
                sourcePath: null,
                resolutionStatus: inspect.resolutionStatus ?? null
            },
            neostack: null,
            sleeveSummary: {
                sleeveId,
                declaredNeoStackCount: 0,
                explicitNeoBlockRefCount: 0,
                childrenMode: "EMPTY"
            },
            fallback: {
                kind: "none",
                available: false,
                refs: []
            },
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    const summary = inspect.summary;
    const declaredNeoStackCount = summary.explicitReferences.neostacks.length;
    const explicitNeoBlockRefs = summary.explicitReferences.neoblocks;
    const childrenMode = getFallbackChildrenMode(declaredNeoStackCount, explicitNeoBlockRefs.length);
    const commonResult = {
        activeSleeve: {
            sleeveId: summary.id ?? sleeveId,
            title: summary.title ?? summary.name ?? null,
            sourcePath: inspect.sourcePath ?? null,
            resolutionStatus: inspect.resolutionStatus ?? null
        },
        sleeveSummary: {
            sleeveId: summary.id ?? sleeveId,
            declaredNeoStackCount,
            explicitNeoBlockRefCount: explicitNeoBlockRefs.length,
            childrenMode
        },
        fallback: {
            kind: childrenMode === "EXPLICIT_NEOBLOCK_REFS_FALLBACK" ? "explicit_neoblock_refs" : "none",
            available: explicitNeoBlockRefs.length > 0,
            refs: explicitNeoBlockRefs
        },
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
    if (declaredNeoStackCount === 0) {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_NO_DECLARED_NEOSTACKS_FOR_SLEEVE",
                message: "The selected sleeve has no declared NeoStack objects. It exposes explicit NeoBlock refs directly under the sleeve."
            },
            neostack: null,
            ...commonResult
        };
    }
    const snapshot = buildCurrentSleeveGraphSnapshot({ sleeveId, libraryRoot });
    const node = findNode(snapshot, neostackId);
    if (!node || node.kind !== "neostack") {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_NEOSTACK_NOT_FOUND_IN_SLEEVE",
                message: `NeoStack not declared in sleeve: ${neostackId}`
            },
            neostack: null,
            ...commonResult
        };
    }
    return {
        ok: true,
        ...baseResult,
        activeSleeve: commonResult.activeSleeve,
        neostack: {
            neostackId: node.id,
            title: node.label,
            state: node.state,
            sourcePath: node.sourcePath,
            resolutionStatus: node.resolutionStatus,
            containedNeoBlockCount: includeNeoBlocks ? 0 : 0,
            gateCount: 0,
            triggerCount: 0,
            warnings: node.warnings
        },
        sleeveSummary: commonResult.sleeveSummary,
        fallback: commonResult.fallback,
        warnings: commonResult.warnings,
        errors: commonResult.errors
    };
}
export function inspectNeoBlock(input) {
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const neoblockId = input?.neoblockId ?? null;
    const includeMoltBlocks = input?.includeMoltBlocks ?? true;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const baseResult = {
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId,
            neoblockId,
            includeMoltBlocks
        }
    };
    if (!neoblockId) {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_NEOBLOCK_ID_REQUIRED",
                message: "A neoblockId is required for NeoBlock inspection."
            },
            activeSleeve: {
                sleeveId,
                title: null,
                sourcePath: null,
                resolutionStatus: null
            },
            neoblock: null,
            moltBlocks: [],
            notes: [],
            warnings: [],
            errors: []
        };
    }
    const inspect = inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
    });
    if (!inspect.ok || !inspect.summary) {
        const firstCode = inspect.errors[0]?.code ?? "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED";
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: firstCode,
                message: inspect.errors[0]?.message ?? "Sleeve could not be inspected in public_curated mode."
            },
            activeSleeve: {
                sleeveId,
                title: null,
                sourcePath: null,
                resolutionStatus: inspect.resolutionStatus ?? null
            },
            neoblock: null,
            moltBlocks: [],
            notes: [],
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    const summary = inspect.summary;
    const explicitNeoBlockRefs = summary.explicitReferences.neoblocks;
    if (!explicitNeoBlockRefs.includes(neoblockId)) {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_NEOBLOCK_REF_NOT_FOUND_IN_SLEEVE",
                message: `NeoBlock ref not found in sleeve: ${neoblockId}`
            },
            activeSleeve: {
                sleeveId: summary.id ?? sleeveId,
                title: summary.title ?? summary.name ?? null,
                sourcePath: inspect.sourcePath ?? null,
                resolutionStatus: inspect.resolutionStatus ?? null
            },
            neoblock: null,
            moltBlocks: [],
            notes: [],
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    const snapshot = buildCurrentSleeveGraphSnapshot({ sleeveId, libraryRoot });
    const node = findNode(snapshot, neoblockId);
    if (!node || node.kind !== "neoblock") {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_NEOBLOCK_SHAPE_UNKNOWN",
                message: `NeoBlock node shape could not be derived for: ${neoblockId}`
            },
            activeSleeve: {
                sleeveId: summary.id ?? sleeveId,
                title: summary.title ?? summary.name ?? null,
                sourcePath: inspect.sourcePath ?? null,
                resolutionStatus: inspect.resolutionStatus ?? null
            },
            neoblock: null,
            moltBlocks: [],
            notes: [],
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    const shallowLoaded = summary.targetShallowLoad?.performed === true && summary.targetShallowLoad.loadedRef === neoblockId;
    const inferredMoltType = inferMoltTypeFromRefId(neoblockId);
    const notes = [];
    const moltBlocks = [];
    let neoblock;
    if (shallowLoaded && summary.targetShallowLoad) {
        const shallow = summary.targetShallowLoad;
        const shallowSummary = shallow.summary;
        const moltType = shallowSummary.moltType ?? inferredMoltType;
        neoblock = {
            neoblockId,
            kind: "neoblock",
            moltType,
            moltTypeSource: shallowSummary.moltType ? "shallow_loaded_target" : inferredMoltType ? "inferred_from_ref_id" : "unknown",
            state: "ON",
            sourcePath: shallow.candidatePath ?? node.sourcePath,
            resolutionStatus: "SHALLOW_LOADED",
            contentPreview: shallowSummary.contentPreview ?? null,
            warnings: [...node.warnings, ...(shallow.warnings ?? [])]
        };
        if (includeMoltBlocks) {
            moltBlocks.push({
                id: neoblockId,
                moltType,
                state: "ON",
                source: "shallow_loaded_target",
                contentPreview: shallowSummary.contentPreview ?? null,
                warnings: shallow.warnings ?? []
            });
        }
    }
    else {
        neoblock = {
            neoblockId,
            kind: "neoblock",
            moltType: inferredMoltType,
            moltTypeSource: inferredMoltType ? "inferred_from_ref_id" : "unknown",
            state: node.state,
            sourcePath: node.sourcePath,
            resolutionStatus: "TARGET_AVAILABLE_NOT_LOADED",
            contentPreview: null,
            warnings: node.warnings
        };
        notes.push({
            code: "MOLT_BLOCKS_NOT_LOADED",
            message: "This NeoBlock target is available but was not shallow-loaded in the current Alpha.7 route."
        });
    }
    return {
        ok: true,
        ...baseResult,
        activeSleeve: {
            sleeveId: summary.id ?? sleeveId,
            title: summary.title ?? summary.name ?? null,
            sourcePath: inspect.sourcePath ?? null,
            resolutionStatus: inspect.resolutionStatus ?? null
        },
        neoblock,
        moltBlocks,
        notes,
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
}
export function inspectMoltBlock(input) {
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const neoblockId = input?.neoblockId ?? null;
    const moltBlockId = input?.moltBlockId ?? null;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const baseResult = {
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId,
            neoblockId,
            moltBlockId
        }
    };
    if (!moltBlockId) {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_MOLTBLOCK_ID_REQUIRED",
                message: "A moltBlockId is required for MOLT block inspection."
            },
            activeSleeve: {
                sleeveId,
                title: null,
                sourcePath: null,
                resolutionStatus: null
            },
            parentNeoBlock: null,
            moltBlock: null,
            notes: [],
            warnings: [],
            errors: []
        };
    }
    const inspect = inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
    });
    if (!inspect.ok || !inspect.summary) {
        const firstCode = inspect.errors[0]?.code ?? "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED";
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: firstCode,
                message: inspect.errors[0]?.message ?? "Sleeve could not be inspected in public_curated mode."
            },
            activeSleeve: {
                sleeveId,
                title: null,
                sourcePath: null,
                resolutionStatus: inspect.resolutionStatus ?? null
            },
            parentNeoBlock: null,
            moltBlock: null,
            notes: [],
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    const summary = inspect.summary;
    const activeSleeve = {
        sleeveId: summary.id ?? sleeveId,
        title: summary.title ?? summary.name ?? null,
        sourcePath: inspect.sourcePath ?? null,
        resolutionStatus: inspect.resolutionStatus ?? null
    };
    const visibleMoltBlocks = summary.targetShallowLoad?.performed === true
        ? [{
                moltBlockId: summary.targetShallowLoad.loadedRef,
                parentNeoBlockId: summary.targetShallowLoad.loadedRef,
                moltType: summary.targetShallowLoad.summary.moltType ?? inferMoltTypeFromRefId(summary.targetShallowLoad.loadedRef),
                contentPreview: summary.targetShallowLoad.summary.contentPreview ?? null,
                sourcePath: summary.targetShallowLoad.candidatePath ?? null,
                warnings: summary.targetShallowLoad.warnings ?? []
            }]
        : [];
    if (neoblockId) {
        if (!summary.explicitReferences.neoblocks.includes(neoblockId)) {
            return {
                ok: false,
                ...baseResult,
                hold: {
                    code: "HOLD_NEOBLOCK_REF_NOT_FOUND_IN_SLEEVE",
                    message: `NeoBlock ref not found in sleeve: ${neoblockId}`
                },
                activeSleeve,
                parentNeoBlock: null,
                moltBlock: null,
                notes: [],
                warnings: inspect.warnings,
                errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
            };
        }
        if (!(summary.targetShallowLoad?.performed === true && summary.targetShallowLoad.loadedRef === neoblockId)) {
            const snapshot = buildCurrentSleeveGraphSnapshot({ sleeveId, libraryRoot });
            const node = findNode(snapshot, neoblockId);
            return {
                ok: false,
                ...baseResult,
                hold: {
                    code: "HOLD_NEOBLOCK_TARGET_AVAILABLE_NOT_LOADED",
                    message: "The parent NeoBlock target is available but was not shallow-loaded in the current Alpha.7 route, so its MOLT blocks are not visible."
                },
                activeSleeve,
                parentNeoBlock: {
                    neoblockId,
                    state: node?.state ?? "DORMANT",
                    resolutionStatus: "TARGET_AVAILABLE_NOT_LOADED"
                },
                moltBlock: null,
                notes: [],
                warnings: inspect.warnings,
                errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
            };
        }
    }
    const visible = visibleMoltBlocks.find((entry) => entry.moltBlockId === moltBlockId);
    if (!visible) {
        return {
            ok: false,
            ...baseResult,
            hold: {
                code: "HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH",
                message: `MOLT block not found in visible graph: ${moltBlockId}`
            },
            activeSleeve,
            parentNeoBlock: null,
            moltBlock: null,
            notes: [],
            warnings: inspect.warnings,
            errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
        };
    }
    return {
        ok: true,
        ...baseResult,
        activeSleeve,
        parentNeoBlock: {
            neoblockId: visible.parentNeoBlockId,
            state: "ON",
            resolutionStatus: "SHALLOW_LOADED"
        },
        moltBlock: {
            moltBlockId: visible.moltBlockId,
            moltType: visible.moltType,
            moltTypeSource: "shallow_loaded_target",
            state: "ON",
            source: "shallow_loaded_target",
            sourcePath: visible.sourcePath,
            contentPreview: visible.contentPreview,
            mergeKey: null,
            stackKey: null,
            stackRank: null,
            warnings: visible.warnings
        },
        notes: [],
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
}
export function getRuntimeIrPath(input) {
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const includeDormant = input?.includeDormant ?? true;
    const includeExcludedLanes = input?.includeExcludedLanes ?? true;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const inspect = inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
    });
    if (!inspect.ok || !inspect.summary) {
        const firstCode = inspect.errors[0]?.code ?? "HOLD_RUNTIME_IR_PATH_UNAVAILABLE";
        throw new Error(firstCode);
    }
    const summary = inspect.summary;
    const path = [
        {
            order: 1,
            kind: "sleeve",
            id: summary.id ?? sleeveId,
            label: summary.title ?? summary.name ?? summary.id ?? sleeveId,
            state: "ON",
            reason: "active_public_curated_sleeve",
            sourcePath: inspect.sourcePath ?? null,
            resolutionStatus: inspect.resolutionStatus ?? null
        },
        {
            order: 2,
            kind: "neostack",
            id: null,
            label: "NO_DECLARED_NEOSTACKS",
            state: "REFERENCE_ONLY",
            reason: "current_sleeve_has_no_declared_neostacks",
            sourcePath: null,
            resolutionStatus: null
        },
        {
            order: 3,
            kind: "neoblock",
            id: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            label: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            state: "ON",
            reason: "shallow_loaded_target",
            sourcePath: summary.targetShallowLoad?.candidatePath ?? null,
            resolutionStatus: "SHALLOW_LOADED"
        },
        {
            order: 4,
            kind: "moltblock",
            id: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            label: summary.targetShallowLoad?.summary.moltType ?? "Primary",
            state: "ON",
            reason: "visible_molt_summary_from_shallow_loaded_target",
            sourcePath: summary.targetShallowLoad?.candidatePath ?? null,
            resolutionStatus: "SHALLOW_LOADED"
        }
    ];
    const edges = [
        {
            from: summary.id ?? sleeveId,
            to: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            relation: "references",
            state: "ON",
            reason: "explicit_neoblock_refs_fallback"
        },
        {
            from: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            to: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            relation: "exposes_molt_summary",
            state: "ON",
            reason: "shallow_loaded_target"
        }
    ];
    const dormantRefs = includeDormant
        ? summary.explicitReferences.neoblocks
            .filter((ref) => ref !== DEFAULT_SHALLOW_LOAD_TARGET_REF)
            .map((ref) => ({ kind: "neoblock", id: ref, state: "DORMANT", reason: "target_available_not_loaded" }))
        : [];
    const excludedLanes = includeExcludedLanes ? buildExcludedLanes() : [];
    const notes = [
        {
            code: "NO_DECLARED_NEOSTACKS",
            message: "The selected sleeve exposes explicit NeoBlock refs directly under the sleeve."
        },
        {
            code: "SHALLOW_ROUTE_ONLY",
            message: "Only the current shallow-loaded target is represented as active. Available refs are dormant and not recursively loaded."
        }
    ];
    const nlLines = [
        "Runtime IR Path:",
        `- SLEEVE ${summary.id ?? sleeveId} [ON]`,
        `- NEOSTACK none_declared [REFERENCE_ONLY: NO_DECLARED_NEOSTACKS]`,
        `- NEOBLOCK ${DEFAULT_SHALLOW_LOAD_TARGET_REF} [ON: SHALLOW_LOADED]`,
        `- MOLTBLOCK ${DEFAULT_SHALLOW_LOAD_TARGET_REF} / ${summary.targetShallowLoad?.summary.moltType ?? "Primary"} [ON: VISIBLE_MOLT_SUMMARY]`
    ];
    if (includeDormant) {
        nlLines.push("", "Dormant NeoBlock Refs:");
        for (const ref of dormantRefs) {
            nlLines.push(`- ${ref.id} [${ref.state}: TARGET_AVAILABLE_NOT_LOADED]`);
        }
    }
    if (includeExcludedLanes) {
        nlLines.push("", "Excluded Lanes:");
        for (const lane of excludedLanes) {
            nlLines.push(`- ${lane.lane} [${lane.state}: ${lane.reason}]`);
        }
    }
    return {
        ok: true,
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId: summary.id ?? sleeveId,
            includeDormant,
            includeExcludedLanes
        },
        activeSleeve: {
            sleeveId: summary.id ?? sleeveId,
            title: summary.title ?? summary.name ?? null,
            state: "ON"
        },
        path,
        edges,
        dormantRefs,
        excludedLanes,
        summary: {
            pathNodeCount: path.length,
            edgeCount: edges.length,
            activeNodeCount: path.filter((node) => node.state === "ON").length,
            dormantRefCount: dormantRefs.length,
            excludedLaneCount: excludedLanes.length,
            declaredNeoStackCount: summary.explicitReferences.neostacks.length,
            explicitNeoBlockRefCount: summary.explicitReferences.neoblocks.length,
            loadedTargetCount: summary.runtimeSummary?.performed ? summary.runtimeSummary.shallowLoadedTargetCount : 0,
            visibleMoltBlockCount: summary.targetShallowLoad?.performed ? 1 : 0
        },
        notes,
        nlProjection: nlLines.join("\n"),
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
}
export function getRuntimeIrMatrixFull(input) {
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const includeDormant = input?.includeDormant ?? true;
    const includeExcludedLanes = input?.includeExcludedLanes ?? true;
    const includeEdges = input?.includeEdges ?? true;
    const includeNlProjection = input?.includeNlProjection ?? true;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const inspect = inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef: DEFAULT_SHALLOW_LOAD_TARGET_REF
    });
    if (!inspect.ok || !inspect.summary) {
        const firstCode = inspect.errors[0]?.code ?? "HOLD_RUNTIME_IR_MATRIX_UNAVAILABLE";
        throw new Error(firstCode);
    }
    const pathResult = getRuntimeIrPath({ sleeveId, includeDormant, includeExcludedLanes, libraryRoot });
    const summary = inspect.summary;
    const nodes = [
        {
            id: summary.id ?? sleeveId,
            kind: "sleeve",
            label: summary.title ?? summary.name ?? summary.id ?? sleeveId,
            state: "ON",
            reason: "active_public_curated_sleeve",
            sourcePath: inspect.sourcePath ?? null,
            resolutionStatus: inspect.resolutionStatus ?? null,
            moltType: null,
            metadata: {}
        },
        {
            id: "NO_DECLARED_NEOSTACKS",
            kind: "neostack_marker",
            label: "none_declared",
            state: "REFERENCE_ONLY",
            reason: "NO_DECLARED_NEOSTACKS",
            sourcePath: null,
            resolutionStatus: null,
            moltType: null,
            metadata: {}
        },
        {
            id: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            kind: "neoblock",
            label: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            state: "ON",
            reason: "shallow_loaded_target",
            sourcePath: summary.targetShallowLoad?.candidatePath ?? null,
            resolutionStatus: "SHALLOW_LOADED",
            moltType: summary.targetShallowLoad?.summary.moltType ?? "Primary",
            metadata: {}
        },
        {
            id: `${DEFAULT_SHALLOW_LOAD_TARGET_REF}::${summary.targetShallowLoad?.summary.moltType ?? "Primary"}`,
            kind: "moltblock",
            label: `${DEFAULT_SHALLOW_LOAD_TARGET_REF} / ${summary.targetShallowLoad?.summary.moltType ?? "Primary"}`,
            state: "ON",
            reason: "VISIBLE_MOLT_SUMMARY",
            sourcePath: summary.targetShallowLoad?.candidatePath ?? null,
            resolutionStatus: "SHALLOW_LOADED",
            moltType: summary.targetShallowLoad?.summary.moltType ?? "Primary",
            metadata: {}
        }
    ];
    if (includeDormant) {
        for (const ref of summary.explicitReferences.neoblocks.filter((ref) => ref !== DEFAULT_SHALLOW_LOAD_TARGET_REF)) {
            nodes.push({
                id: ref,
                kind: "neoblock",
                label: ref,
                state: "DORMANT",
                reason: "TARGET_AVAILABLE_NOT_LOADED",
                sourcePath: null,
                resolutionStatus: "TARGET_AVAILABLE_NOT_LOADED",
                moltType: inferMoltTypeFromRefId(ref),
                metadata: {}
            });
        }
    }
    if (includeExcludedLanes) {
        for (const lane of buildExcludedLanes()) {
            nodes.push({
                id: lane.lane,
                kind: "lane",
                label: lane.lane,
                state: lane.state,
                reason: lane.reason,
                sourcePath: null,
                resolutionStatus: lane.reason,
                moltType: null,
                metadata: {}
            });
        }
    }
    const edges = includeEdges ? [
        {
            from: summary.id ?? sleeveId,
            to: "NO_DECLARED_NEOSTACKS",
            relation: "contains_marker",
            state: "REFERENCE_ONLY",
            reason: "current_sleeve_has_no_declared_neostacks"
        },
        {
            from: summary.id ?? sleeveId,
            to: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            relation: "references",
            state: "ON",
            reason: "explicit_neoblock_refs_fallback"
        },
        {
            from: DEFAULT_SHALLOW_LOAD_TARGET_REF,
            to: `${DEFAULT_SHALLOW_LOAD_TARGET_REF}::${summary.targetShallowLoad?.summary.moltType ?? "Primary"}`,
            relation: "exposes_molt_summary",
            state: "ON",
            reason: "shallow_loaded_target"
        },
        ...summary.explicitReferences.neoblocks
            .filter((ref) => ref !== DEFAULT_SHALLOW_LOAD_TARGET_REF && includeDormant)
            .map((ref) => ({
            from: summary.id ?? sleeveId,
            to: ref,
            relation: "available_ref",
            state: "DORMANT",
            reason: "target_available_not_loaded"
        })),
        ...buildExcludedLanes().filter(() => includeExcludedLanes).map((lane) => ({
            from: summary.id ?? sleeveId,
            to: lane.lane,
            relation: "excludes_lane",
            state: lane.state,
            reason: lane.reason
        }))
    ] : [];
    const stateBuckets = {
        ON: nodes.filter((node) => node.state === "ON").map((node) => node.id),
        OFF: nodes.filter((node) => node.state === "OFF").map((node) => node.id),
        DORMANT: nodes.filter((node) => node.state === "DORMANT").map((node) => node.id),
        REFERENCE_ONLY: nodes.filter((node) => node.state === "REFERENCE_ONLY").map((node) => node.id),
        WATCHING: nodes.filter((node) => node.state === "WATCHING").map((node) => node.id),
        BLOCKED: nodes.filter((node) => node.state === "BLOCKED").map((node) => node.id),
        REJECTED: nodes.filter((node) => node.state === "REJECTED").map((node) => node.id),
        MISSING: nodes.filter((node) => node.state === "MISSING").map((node) => node.id),
        FORMAT: nodes.filter((node) => node.state === "FORMAT").map((node) => node.id),
        CONTEXTUAL: nodes.filter((node) => node.state === "CONTEXTUAL").map((node) => node.id),
        SHADOWED: nodes.filter((node) => node.state === "SHADOWED").map((node) => node.id)
    };
    const notes = [
        {
            code: "VISIBLE_GRAPH_ONLY",
            message: "This matrix represents the currently visible read-only graph. It does not recursively load all targets."
        },
        {
            code: "NO_DECLARED_NEOSTACKS",
            message: "The selected sleeve has no declared NeoStack objects, so explicit NeoBlock refs are shown directly under the sleeve."
        },
        {
            code: "SHALLOW_ROUTE_ONLY",
            message: "Only primary.sample is shallow-loaded as the active target. Other refs are available but dormant."
        }
    ];
    const nlProjection = includeNlProjection ? [
        "Runtime IR Matrix:",
        "Nodes:",
        `- SLEEVE ${summary.id ?? sleeveId} [ON]`,
        `- NEOSTACK none_declared [REFERENCE_ONLY: NO_DECLARED_NEOSTACKS]`,
        `- NEOBLOCK primary.sample [ON: SHALLOW_LOADED]`,
        `- MOLTBLOCK primary.sample / ${summary.targetShallowLoad?.summary.moltType ?? "Primary"} [ON: VISIBLE_MOLT_SUMMARY]`,
        ...summary.explicitReferences.neoblocks
            .filter((ref) => ref !== DEFAULT_SHALLOW_LOAD_TARGET_REF && includeDormant)
            .map((ref) => `- NEOBLOCK ${ref} [DORMANT: TARGET_AVAILABLE_NOT_LOADED]`),
        "",
        "Edges:",
        `- sleeve → none_declared [contains_marker]`,
        `- sleeve → primary.sample [references]`,
        `- primary.sample → primary.sample / ${summary.targetShallowLoad?.summary.moltType ?? "Primary"} [exposes_molt_summary]`,
        ...summary.explicitReferences.neoblocks
            .filter((ref) => ref !== DEFAULT_SHALLOW_LOAD_TARGET_REF && includeDormant)
            .map((ref) => `- sleeve → ${ref} [available_ref]`),
        "",
        "Excluded Lanes:",
        ...buildExcludedLanes().filter(() => includeExcludedLanes).map((lane) => `- ${lane.lane} [${lane.state}: ${lane.reason}]`),
        "",
        "Route:",
        `SLEEVE ${summary.id ?? sleeveId}`,
        `→ NEOSTACK none_declared`,
        `→ NEOBLOCK primary.sample`,
        `→ MOLTBLOCK primary.sample / ${summary.targetShallowLoad?.summary.moltType ?? "Primary"}`
    ].join("\n") : "";
    return {
        ok: true,
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId: summary.id ?? sleeveId,
            includeDormant,
            includeExcludedLanes,
            includeEdges,
            includeNlProjection
        },
        activeSleeve: {
            sleeveId: summary.id ?? sleeveId,
            title: summary.title ?? summary.name ?? null,
            state: "ON"
        },
        matrix: {
            nodes,
            edges,
            stateBuckets,
            route: pathResult.path,
            dormantRefs: pathResult.dormantRefs,
            excludedLanes: includeExcludedLanes ? buildExcludedLanes() : []
        },
        summary: {
            nodeCount: nodes.length,
            edgeCount: edges.length,
            routeNodeCount: pathResult.path.length,
            activeNodeCount: nodes.filter((node) => node.state === "ON").length,
            dormantNodeCount: nodes.filter((node) => node.state === "DORMANT").length,
            excludedLaneCount: includeExcludedLanes ? buildExcludedLanes().length : 0,
            declaredNeoStackCount: summary.explicitReferences.neostacks.length,
            explicitNeoBlockRefCount: summary.explicitReferences.neoblocks.length,
            loadedTargetCount: summary.runtimeSummary?.performed ? summary.runtimeSummary.shallowLoadedTargetCount : 0,
            visibleMoltBlockCount: summary.targetShallowLoad?.performed ? 1 : 0
        },
        notes,
        nlProjection,
        warnings: inspect.warnings,
        errors: inspect.errors.map((error) => `${error.code}: ${error.message}`)
    };
}
export function renderResponseEnvelopeDraft(input) {
    const sleeveId = input?.sleeveId ?? DEFAULT_CURRENT_SLEEVE_ID;
    const includeIrMatrix = input?.includeIrMatrix ?? true;
    const includeMetadata = input?.includeMetadata ?? true;
    const libraryRoot = input?.libraryRoot ?? DEFAULT_LIBRARY_ROOT;
    const path = getRuntimeIrPath({ sleeveId, includeDormant: true, includeExcludedLanes: true, libraryRoot });
    const matrix = includeIrMatrix ? getRuntimeIrMatrixFull({ sleeveId, includeDormant: true, includeExcludedLanes: true, includeEdges: true, includeNlProjection: true, libraryRoot }) : null;
    const activeStack = {
        activeSleeve: path.activeSleeve.sleeveId,
        activeSleeveTitle: path.activeSleeve.title,
        runtimeMode: "public_curated",
        toolExecution: "off",
        directSource: "off",
        activeRoute: [
            `SLEEVE ${path.activeSleeve.sleeveId} [ON]`,
            `NEOSTACK none_declared [REFERENCE_ONLY]`,
            `NEOBLOCK primary.sample [ON]`,
            `MOLTBLOCK primary.sample / Primary [ON]`
        ],
        dormantRefCount: path.summary.dormantRefCount,
        excludedLaneCount: path.summary.excludedLaneCount
    };
    const envoyIntuition = {
        text: "The active sleeve is readable. The current route is shallow-loaded and non-executing. The matrix is visible-graph-only.",
        confidence: "bounded",
        limitations: [
            "no recursive loading",
            "no execution",
            "no direct_source",
            "no HUMAN/archive/Resleever machine loading"
        ]
    };
    const moltMap = {
        Trigger: input?.trigger ?? "user_request",
        Directive: input?.directive ?? "n/a",
        Instruction: input?.instruction ?? "n/a",
        Subject: input?.subject ?? "n/a",
        Primary: input?.primary ?? "n/a",
        Philosophy: input?.philosophy ?? "n/a",
        Blueprint: input?.blueprint ?? "n/a"
    };
    const formalResponseContent = input?.formalResponseContent ?? "[formal response content placeholder]";
    const metadata = includeMetadata ? {
        ActiveSleeve: path.activeSleeve.sleeveId,
        Mode: "public_curated_readonly",
        Scope: "response_envelope_draft",
        Domain: "OPENCLAW / UMG",
        Project: "UMG Envoy Agent",
        State: "visible_graph_only",
        ToolCount: 26,
        Execution: "not_performed",
        DirectSource: "not_enabled",
        Surface: "plugin_tool",
        SpecVersion: "alpha7.response_envelope_draft.v1"
    } : null;
    const nlLines = [
        "Active Stack:",
        `- Active Sleeve: ${activeStack.activeSleeve}`,
        `- Active Sleeve Title: ${activeStack.activeSleeveTitle}`,
        `- Runtime Mode: ${activeStack.runtimeMode}`,
        `- Active Route: SLEEVE → NEOBLOCK primary.sample → MOLTBLOCK Primary`,
        `- Tool Execution: ${activeStack.toolExecution}`,
        `- Direct Source: ${activeStack.directSource}`,
        "",
        `(Envoy Intuition: ${envoyIntuition.text})`,
        "",
        "Current Context — MOLT Map:",
        `Trigger: ${moltMap.Trigger}`,
        `Directive: ${moltMap.Directive}`,
        `Instruction: ${moltMap.Instruction}`,
        `Subject: ${moltMap.Subject}`,
        `Primary: ${moltMap.Primary}`,
        `Philosophy: ${moltMap.Philosophy}`,
        `Blueprint: ${moltMap.Blueprint}`,
        "",
        "Formal Response Content:",
        formalResponseContent
    ];
    if (includeIrMatrix && matrix) {
        nlLines.push("", matrix.nlProjection);
    }
    if (includeMetadata && metadata) {
        nlLines.push("", "Metadata:", `ActiveSleeve: ${metadata.ActiveSleeve}`, `Mode: ${metadata.Mode}`, `Scope: ${metadata.Scope}`, `Domain: ${metadata.Domain}`, `Project: ${metadata.Project}`, `State: ${metadata.State}`, `ToolCount: ${metadata.ToolCount}`, `Execution: ${metadata.Execution}`, `DirectSource: ${metadata.DirectSource}`, `Surface: ${metadata.Surface}`, `SpecVersion: ${metadata.SpecVersion}`);
    }
    return {
        ok: true,
        mode: "public_curated",
        readOnly: true,
        execution: "not_performed",
        directSource: "not_enabled",
        requested: {
            sleeveId: path.activeSleeve.sleeveId,
            includeIrMatrix,
            includeMetadata
        },
        activeStack,
        envoyIntuition,
        moltMap,
        formalResponseContent,
        irMatrix: matrix,
        metadata,
        nlProjection: nlLines.join("\n"),
        warnings: path.warnings,
        errors: path.errors
    };
}
