const CHILD_FIELDS = [
    "neostacks",
    "neo_stacks",
    "neoblocks",
    "neo_blocks",
    "molt_blocks",
    "blocks",
    "members",
    "children",
    "tools",
    "tool_bindings",
    "resources",
    "prompts"
];
export function inspectRuntimeDrilldown(input) {
    const request = { depth: 1, ...input.request };
    const runtimeSpec = input.runtimeSpec ?? input.dashboard?.header ? input.runtimeSpec : input.runtimeSpec;
    const irMatrix = input.irMatrix ?? input.dashboard?.ir_matrix;
    const moltMap = input.moltMap ?? input.dashboard?.molt_map ?? input.dashboard?.ir_matrix?.molt_map_id ? input.moltMap ?? input.dashboard?.molt_map : input.moltMap;
    const warnings = [];
    const registryArtifacts = input.registryArtifacts;
    const supportArtifacts = registryArtifacts.filter((artifact) => artifact.support_only);
    const result = {
        inspection_id: createInspectionId(request),
        source: selectSource(request, runtimeSpec, input.dashboard),
        query_type: request.query_type,
        children: [],
        relations: [],
        support_docs: [],
        warnings,
        execution_statement: "No tools executed."
    };
    if (request.query_type === "runtime_selection") {
        if (!runtimeSpec) {
            warnings.push("runtime selection context not available");
            return result;
        }
        result.runtime_selection = {
            runtime_spec_id: runtimeSpec.runtime_spec_id,
            runtime_kind: runtimeSpec.runtime_kind,
            active_sleeve: runtimeSpec.selection.active_sleeve,
            active_neostacks: [...runtimeSpec.selection.active_neostacks],
            active_neoblocks: [...runtimeSpec.selection.active_neoblocks],
            active_molt_blocks: [...runtimeSpec.selection.active_molt_blocks],
            support_artifacts: [...runtimeSpec.selection.support_artifacts]
        };
        if (runtimeSpec.selection.selection_warnings?.length) {
            warnings.push(...runtimeSpec.selection.selection_warnings);
        }
        return result;
    }
    const artifact = resolveArtifact(request, registryArtifacts, runtimeSpec);
    if (!artifact && request.query_type !== "inspect_tool_bindings") {
        warnings.push("artifact not found");
        return result;
    }
    if (artifact) {
        result.artifact = toArtifactSummary(artifact);
    }
    if (request.include_provenance || request.query_type === "inspect_provenance") {
        if (artifact) {
            result.provenance = {
                source_kind: artifact.source.source_kind,
                discovery_method: artifact.source.discovery_method,
                generated_from_lane: getGeneratedLane(artifact),
                path: artifact.source.path
            };
        }
    }
    if (artifact && shouldIncludeChildren(request.query_type)) {
        const children = resolveDeclaredChildren(artifact, registryArtifacts, request.depth ?? 1);
        result.children.push(...children.children);
        result.relations.push(...children.relations);
        if (children.warnings.length > 0)
            warnings.push(...children.warnings);
    }
    if (runtimeSpec && (request.query_type === "inspect_tool_bindings" || request.query_type === "inspect_neostack" || request.query_type === "inspect_artifact")) {
        const toolRelations = resolveToolBindingRelations(request, artifact, runtimeSpec);
        result.relations.push(...toolRelations);
    }
    if (request.include_support_docs || request.query_type === "inspect_support_docs") {
        const supportDocs = resolveSupportDocs(request, artifact, runtimeSpec, supportArtifacts);
        result.support_docs.push(...supportDocs.support_docs);
        result.relations.push(...supportDocs.relations);
        if (supportDocs.warnings.length > 0)
            warnings.push(...supportDocs.warnings);
    }
    if (request.include_matrix_links || request.query_type === "inspect_matrix_links") {
        const matrixLinks = resolveMatrixLinks(request, artifact, irMatrix);
        result.relations.push(...matrixLinks.relations);
        if (matrixLinks.warnings.length > 0)
            warnings.push(...matrixLinks.warnings);
    }
    if (request.include_molt_map_links || request.query_type === "inspect_molt_map_links") {
        const moltLinks = resolveMoltMapLinks(request, artifact, moltMap);
        result.relations.push(...moltLinks.relations);
        if (moltLinks.warnings.length > 0)
            warnings.push(...moltLinks.warnings);
    }
    return result;
}
function selectSource(request, runtimeSpec, dashboard) {
    if (request.query_type === "runtime_selection" && runtimeSpec)
        return "RuntimeSpecV0";
    if (dashboard && (request.include_matrix_links || request.include_molt_map_links || request.query_type === "inspect_matrix_links" || request.query_type === "inspect_molt_map_links")) {
        return "RuntimeDashboardV0";
    }
    return "resolver_registry";
}
function createInspectionId(request) {
    const base = `${request.query_type}:${request.artifact_id ?? "runtime"}:${request.runtime_spec_id ?? "default"}:${request.depth ?? 1}`;
    let hash = 0;
    for (let index = 0; index < base.length; index += 1) {
        hash = ((hash << 5) - hash) + base.charCodeAt(index);
        hash |= 0;
    }
    return `inspection_${Math.abs(hash)}`;
}
function resolveArtifact(request, registryArtifacts, runtimeSpec) {
    if (request.artifact_id) {
        return registryArtifacts.find((artifact) => artifact.id === request.artifact_id);
    }
    if (runtimeSpec?.selection.active_sleeve) {
        return registryArtifacts.find((artifact) => artifact.id === runtimeSpec.selection.active_sleeve);
    }
    if (runtimeSpec?.selection.active_neostacks[0]) {
        return registryArtifacts.find((artifact) => artifact.id === runtimeSpec.selection.active_neostacks[0]);
    }
    return undefined;
}
function toArtifactSummary(artifact) {
    return {
        id: artifact.id,
        kind: artifact.kind,
        title: artifact.title,
        description: artifact.description,
        status: artifact.status,
        canonical: artifact.source.canonical,
        runtime_selectable: artifact.runtime_selectable,
        support_only: artifact.support_only,
        source_kind: artifact.source.source_kind,
        discovery_method: artifact.source.discovery_method,
        generated_from_lane: getGeneratedLane(artifact),
        path: artifact.source.path
    };
}
function getGeneratedLane(artifact) {
    const raw = artifact.raw;
    const direct = typeof raw?.generated_from_lane === "string" ? raw.generated_from_lane : undefined;
    if (direct)
        return direct;
    return undefined;
}
function shouldIncludeChildren(queryType) {
    return ["inspect_artifact", "inspect_sleeve", "inspect_neostack", "inspect_neoblock", "inspect_molt_block"].includes(queryType);
}
function resolveDeclaredChildren(artifact, registryArtifacts, depth) {
    const childIds = new Set();
    const relations = [];
    const warnings = [];
    const children = [];
    if (depth <= 0) {
        return { children, relations, warnings };
    }
    const raw = artifact.raw;
    for (const field of CHILD_FIELDS) {
        const values = asStringArray(raw?.[field]);
        for (const value of values) {
            childIds.add(value);
        }
    }
    for (const childId of childIds) {
        const child = registryArtifacts.find((artifactItem) => artifactItem.id === childId);
        if (!child)
            continue;
        if (child.support_only)
            continue;
        children.push(toArtifactSummary(child));
        relations.push({ relation: "contains", target_id: child.id, target_kind: child.kind, label: `contained by declared metadata: ${artifact.id}` });
    }
    if (children.length === 0) {
        warnings.push("no declared child relations found");
    }
    return { children, relations, warnings };
}
function resolveToolBindingRelations(request, artifact, runtimeSpec) {
    const relations = [];
    const artifactId = artifact?.id;
    const selectedNeostack = artifactId && runtimeSpec.selection.active_neostacks.includes(artifactId);
    const selectedSleeve = artifactId && runtimeSpec.selection.active_sleeve === artifactId;
    const selectedArtifact = selectedNeostack || selectedSleeve || request.query_type === "inspect_tool_bindings";
    if (!selectedArtifact)
        return relations;
    for (const tool of runtimeSpec.tool_bindings.requested) {
        relations.push({ relation: "requests_tool", target_id: tool, target_kind: "tool_binding", label: "tool-binding intent" });
    }
    for (const tool of runtimeSpec.tool_bindings.requires_approval) {
        relations.push({ relation: "requires_approval", target_id: tool, target_kind: "tool_binding", label: "requires approval" });
    }
    return relations;
}
function resolveSupportDocs(request, artifact, runtimeSpec, supportArtifacts) {
    const support_docs = [];
    const relations = [];
    const warnings = [];
    const artifactId = artifact?.id;
    const candidates = supportArtifacts.filter((supportArtifact) => {
        if (!artifactId)
            return false;
        const haystacks = [supportArtifact.id, supportArtifact.title ?? "", supportArtifact.description ?? "", supportArtifact.source.path].join(" ").toLowerCase();
        return haystacks.includes(artifactId.toLowerCase())
            || artifactId.toLowerCase().includes("langchain") && haystacks.includes("langchain")
            || artifactId.toLowerCase().includes("sleeve") && haystacks.includes("sleeve");
    });
    const runtimeAttached = runtimeSpec?.selection.support_artifacts ?? [];
    for (const supportArtifact of supportArtifacts) {
        if (runtimeAttached.includes(supportArtifact.id) && !candidates.some((candidate) => candidate.id === supportArtifact.id)) {
            candidates.push(supportArtifact);
        }
    }
    for (const supportArtifact of candidates) {
        support_docs.push({
            ...toArtifactSummary(supportArtifact),
            support_only: true,
            runtime_selectable: false
        });
        relations.push({ relation: "supports_explanation", target_id: supportArtifact.id, target_kind: supportArtifact.kind, label: "support-only documentation" });
        relations.push({ relation: "has_support_doc", target_id: supportArtifact.id, target_kind: supportArtifact.kind, label: artifactId ? `support doc for ${artifactId}` : "support doc" });
    }
    if (support_docs.length === 0 && request.query_type === "inspect_support_docs") {
        warnings.push("no support docs found");
    }
    return { support_docs, relations, warnings };
}
function resolveMatrixLinks(request, artifact, irMatrix) {
    const relations = [];
    const warnings = [];
    if (!artifact || !irMatrix) {
        warnings.push("no matrix links found");
        return { relations, warnings };
    }
    const nodes = irMatrix.nodes.filter((node) => node.id === artifact.id || node.artifact_id === artifact.id);
    const edges = irMatrix.edges.filter((edge) => edge.from === artifact.id || edge.to === artifact.id || edge.to === `tool.${artifact.id}` || edge.from === `tool.${artifact.id}`);
    for (const node of nodes) {
        relations.push({ relation: "appears_in_matrix", target_id: node.id, target_kind: node.kind, label: `node state: ${node.state}` });
    }
    for (const edge of edges) {
        relations.push({ relation: mapMatrixRelation(edge.relation), target_id: edge.from === artifact.id ? edge.to : edge.from, label: edge.reason ?? edge.relation });
    }
    if (nodes.length === 0 && edges.length === 0) {
        warnings.push("no matrix links found");
    }
    return { relations, warnings };
}
function mapMatrixRelation(relation) {
    if (relation === "maps_to_molt_field")
        return "maps_to_molt_field";
    if (relation === "requests_tool")
        return "requests_tool";
    if (relation === "requires_approval")
        return "requires_approval";
    return "references";
}
function resolveMoltMapLinks(request, artifact, moltMap) {
    const relations = [];
    const warnings = [];
    if (!artifact || !moltMap) {
        warnings.push("no MOLT Map links found");
        return { relations, warnings };
    }
    for (const [fieldName, field] of Object.entries(moltMap.fields)) {
        if (field.artifact_ids.includes(artifact.id)) {
            relations.push({ relation: "maps_to_molt_field", target_id: fieldName, target_kind: "molt_field", label: `source=${field.source}; confidence=${field.confidence}` });
        }
    }
    if (relations.length === 0) {
        warnings.push("no MOLT Map links found");
    }
    return { relations, warnings };
}
function asStringArray(value) {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.map(String).filter(Boolean);
    if (typeof value === "object") {
        return Object.values(value).flatMap((entry) => asStringArray(entry));
    }
    return [String(value)].filter(Boolean);
}
