import path from "node:path";
function uniqueStrings(values) {
    return Array.from(new Set(values));
}
function artifactRefFromResolution(type, artifactId) {
    return `${type}:${artifactId}`;
}
function dependencyCounts(loadedSleeve) {
    const dependencies = loadedSleeve.sleeve?.dependencies;
    return {
        sleeves: Array.isArray(dependencies?.sleeve_ids) ? dependencies.sleeve_ids.length : 0,
        neostacks: Array.isArray(dependencies?.neostack_ids) ? dependencies.neostack_ids.length : 0,
        bundles: Array.isArray(dependencies?.bundle_ids) ? dependencies.bundle_ids.length : 0,
        overlays: Array.isArray(dependencies?.overlay_ids) ? dependencies.overlay_ids.length : 0,
        schemas: Array.isArray(dependencies?.schema_ids) ? dependencies.schema_ids.length : 0
    };
}
function buildNodes(sleeve, resolution) {
    const nodes = [];
    const artifactId = sleeve.identity?.artifact_id ?? "UNKNOWN.SLEEVE";
    const seen = new Set();
    nodes.push({
        node_id: artifactId,
        node_type: "sleeve",
        artifact_ref: artifactId,
        state: "active",
        payload: {
            name: sleeve.sleeve?.name ?? null,
            version: sleeve.identity?.version ?? null
        }
    });
    seen.add(artifactId);
    for (const entry of resolution.entries.filter((item) => item.status === "resolved" && item.artifactType !== "schema" && item.artifactType !== "capability" && item.artifactType !== "toolpack")) {
        const nodeType = entry.artifactType;
        const nodeId = artifactRefFromResolution(nodeType, entry.artifactId);
        if (seen.has(nodeId)) {
            continue;
        }
        nodes.push({
            node_id: nodeId,
            node_type: nodeType,
            artifact_ref: entry.artifactId,
            state: "resolved",
            payload: {
                expected_path: entry.expectedPath,
                source_reason: entry.sourceReason ?? null,
                source_ref: entry.sourceRef ?? null
            }
        });
        seen.add(nodeId);
    }
    return nodes;
}
function buildEdges(sleeve, resolution) {
    const artifactId = sleeve.identity?.artifact_id ?? "UNKNOWN.SLEEVE";
    const edges = [];
    for (const entry of resolution.entries.filter((item) => item.status === "resolved")) {
        const nodeType = entry.artifactType === "schema" ? "schema" : entry.artifactType;
        edges.push({
            from: artifactId,
            to: artifactRefFromResolution(nodeType, entry.artifactId),
            edge_kind: "depends_on",
            condition: null,
            notes: `Resolved ${entry.artifactType} dependency`
        });
    }
    return edges;
}
function buildRoutes(sleeve) {
    return Array.isArray(sleeve.sleeve?.routes) ? sleeve.sleeve.routes : [];
}
function buildOverlays(sleeve, resolution) {
    const dependencies = sleeve.sleeve?.dependencies?.overlay_ids ?? [];
    const composition = sleeve.sleeve?.composition?.overlay_ids ?? [];
    const resolved = resolution.entries.filter((entry) => entry.artifactType === 'overlay').map((entry) => entry.artifactId);
    return uniqueStrings([...dependencies, ...composition, ...resolved]).map((overlayId) => ({ overlay_id: overlayId }));
}
function buildCapabilities(sleeve, resolution) {
    const required = sleeve.sleeve?.capabilities?.required ?? [];
    const optional = sleeve.sleeve?.capabilities?.optional ?? [];
    const resolved = resolution.entries.filter((entry) => entry.artifactType === 'capability').map((entry) => entry.artifactId);
    return uniqueStrings([...required, ...optional, ...resolved]).map((capabilityId) => ({ capability_id: capabilityId }));
}
export function buildCanonicalIr(loadResult, libraryRoot, tempInputPath) {
    if (!loadResult.loadedSleeve || !loadResult.artifactResolution) {
        return {
            ok: false,
            inputPath: path.resolve(tempInputPath),
            warnings: [],
            errors: ["cannot build canonical IR without loaded sleeve and artifact resolution"]
        };
    }
    const sleeve = loadResult.loadedSleeve;
    const resolution = loadResult.artifactResolution;
    const artifactId = sleeve.identity?.artifact_id ?? "UNKNOWN.SLEEVE";
    const counts = dependencyCounts(sleeve);
    const canonicalIr = {
        ir_version: "0.1",
        ir_id: `IR.${artifactId}`,
        source: {
            sleeve_id: artifactId,
            sleeve_version: sleeve.identity?.version ?? null,
            library_sources: [path.resolve(libraryRoot)],
            compiled_at: null,
            compiler_target: "umg-compiler-v0"
        },
        priority_profile: "pure_umg_reference",
        nodes: buildNodes(sleeve, resolution),
        edges: buildEdges(sleeve, resolution),
        routes: buildRoutes(sleeve),
        gates: [],
        bundles: (sleeve.sleeve?.dependencies?.bundle_ids ?? []).map((bundleId) => ({ bundle_id: bundleId })),
        overlays: buildOverlays(sleeve, resolution),
        merge_recipes: [],
        capabilities: buildCapabilities(sleeve, resolution),
        states: {
            default_route: sleeve.sleeve?.activation?.default_route ?? null,
            strict_capabilities: sleeve.sleeve?.activation?.strict_capabilities ?? null,
            default_state: sleeve.sleeve?.activation?.default_state ?? null
        },
        source_map: resolution.entries
            .filter((entry) => entry.expectedPath && entry.artifactType !== "schema")
            .map((entry) => ({
            node_id: artifactRefFromResolution(entry.artifactType, entry.artifactId),
            artifact_id: entry.artifactId,
            source_path: entry.expectedPath,
            source_ref: `${entry.artifactType}:${entry.artifactId}`
        })),
        diagnostics: []
    };
    const preview = {
        mode: "canonical-preparation-preview",
        sleeveArtifactId: artifactId,
        sleevePath: loadResult.sleevePath,
        libraryRoot: path.resolve(libraryRoot),
        routeCount: Array.isArray(sleeve.sleeve?.routes) ? sleeve.sleeve.routes.length : 0,
        dependencyCounts: counts,
        resolvedArtifactCounts: {
            resolved: resolution.entries.filter((entry) => entry.status === "resolved").length,
            missing: resolution.entries.filter((entry) => entry.status === "missing").length,
            invalid: resolution.entries.filter((entry) => entry.status === "invalid").length
        },
        stageBoundary: {
            compilerInvoked: false,
            stage8BridgeDeferred: false,
            runtimeOutputsWritten: false
        }
    };
    return {
        ok: true,
        inputPath: path.resolve(tempInputPath),
        canonicalIr,
        compilerInputPreview: preview,
        warnings: [...loadResult.warnings],
        errors: []
    };
}
