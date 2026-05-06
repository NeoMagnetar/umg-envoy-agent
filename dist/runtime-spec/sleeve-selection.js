const CONTAINMENT_FIELDS = [
    "neostacks",
    "neo_stacks",
    "stacks",
    "children",
    "members",
    "contains",
    "components"
];
export function selectActiveSleeveDryRun(input) {
    const candidates = input.registry_artifacts
        .filter((artifact) => artifact.kind === "sleeve")
        .map((artifact) => scoreSleeveCandidate(artifact, input))
        .filter((candidate) => candidate.confidence !== "none" || candidate.warnings.length > 0 || candidate.reasons.length > 0)
        .sort((left, right) => right.score - left.score);
    const selected = candidates.find((candidate) => candidate.confidence === "high" && !candidate.warnings.some(isHardBlockingWarning)) ?? null;
    const warnings = selected
        ? [...selected.warnings]
        : candidates.length > 0
            ? ["candidate sleeve found but conservative threshold was not met", ...candidates.flatMap((candidate) => candidate.warnings).filter(unique)]
            : inferNoMatchWarnings(input);
    return {
        active_sleeve: selected?.sleeve_id ?? null,
        selection_confidence: selected?.confidence ?? strongestConfidence(candidates),
        candidate_sleeves: candidates.map((candidate) => ({
            ...candidate,
            selected: selected?.sleeve_id === candidate.sleeve_id
        })),
        selection_policy: "conservative_v0",
        warnings: [...new Set(warnings)]
    };
}
function scoreSleeveCandidate(artifact, input) {
    const reasons = [];
    const warnings = [];
    let score = 0;
    if (!isEligibleSleeve(artifact, warnings)) {
        return {
            sleeve_id: artifact.id,
            title: artifact.title,
            description: artifact.description,
            score: 0,
            confidence: "none",
            selected: false,
            reasons,
            warnings,
            provenance: provenanceForArtifact(artifact)
        };
    }
    const terms = tokenize(input.user_task);
    const raw = artifact.raw;
    const haystack = [artifact.id, artifact.title ?? "", artifact.description ?? "", artifact.tags.join(" "), artifact.domains.join(" "), artifact.capabilities.join(" ")].join(" \n").toLowerCase();
    const titleDescription = [artifact.title ?? "", artifact.description ?? ""].join(" \n").toLowerCase();
    const statusValue = normalizeSleeveStatus(artifact, raw);
    const taskMatchCount = terms.filter((term) => titleDescription.includes(term) || haystack.includes(term)).length;
    if (taskMatchCount >= 2) {
        score += 20;
        reasons.push("task text matches sleeve title/description");
    }
    else if (taskMatchCount === 1) {
        score += 5;
        warnings.push("weak title-only match");
    }
    const domainMatches = artifact.domains.filter((domain) => terms.includes(domain.toLowerCase())).length;
    if (domainMatches > 0) {
        score += 15;
        reasons.push("domain match");
    }
    const capabilityMatches = input.requested_capabilities.filter((capability) => artifact.capabilities.includes(capability)).length;
    if (capabilityMatches > 0) {
        score += 15;
        reasons.push("capability match");
    }
    const preferredTools = getStringArray(raw, ["toolpacks.preferred", "toolpacks.allowed", "tools", "tool_bindings", "runtime.services"]);
    const toolMatches = input.requested_tools.filter((tool) => preferredTools.some((entry) => entry.toLowerCase().includes(tool.toLowerCase()))).length;
    if (toolMatches > 0) {
        score += 15;
        reasons.push("requested tool-binding match");
    }
    else if (input.requested_tools.length > 0) {
        score -= 20;
        warnings.push("missing required tool bindings");
    }
    const containedNeostacks = getStringArray(raw, ["neostacks", "neo_stacks", "stacks", "children", "members", "contains", "components", "sleeve.dependencies.neostack_ids", "sleeve.composition.neostack_ids", "runtime.neostacks", "selection.neostacks"]);
    const matchedNeostack = input.selected_neostacks.find((stack) => containedNeostacks.includes(stack));
    if (matchedNeostack) {
        score += 20;
        reasons.push("selected NeoStack explicitly contained by sleeve");
    }
    else if (input.selected_neostacks.length > 0) {
        score -= 20;
        warnings.push("no declared containing sleeve found");
    }
    const containedNeoblocks = getStringArray(raw, ["neoblocks", "neo_blocks", "blocks", "members", "children"]);
    const matchedNeoblock = input.selected_neoblocks.find((block) => containedNeoblocks.includes(block));
    if (matchedNeoblock) {
        score += 15;
        reasons.push("selected NeoBlock explicitly contained by sleeve");
    }
    if (input.selected_neostacks.length > 0 && containedNeostacks.length === 0) {
        score -= 20;
        warnings.push("missing declared child relations when containment is needed");
    }
    const declaredRoles = getStringArray(raw, ["sleeve.routes", "sleeve.runtime.services", "metadata.stage", "sleeve.notes"]);
    if (declaredRoles.length > 0) {
        score += 10;
        reasons.push("output/blueprint expectation matches");
    }
    if (input.governance.execution_mode === "dry_run" && input.governance.governed_execution_plane) {
        score += 10;
        reasons.push("governance constraints are compatible");
    }
    if (statusValue === "active" || statusValue === "promoted_reference") {
        score += 10;
        reasons.push("sleeve status is active/promoted");
    }
    if (["manifest", "index", "generated_index"].includes(artifact.source.discovery_method)) {
        score += 10;
        reasons.push("canonical provenance from manifest/index/generated_index");
    }
    if (preferredTools.length > 0) {
        score += 10;
        reasons.push("clear tool-binding policy");
    }
    const lowerTask = input.user_task.toLowerCase();
    if (/readme|guide|docs/.test(lowerTask)) {
        score -= 50;
        warnings.push("support docs are not runtime-selectable");
        warnings.push("support-doc confusion blocked candidate sleeve selection");
    }
    if (artifact.source.source_kind === "unknown") {
        score -= 30;
        warnings.push("unknown fallback artifact rejected");
    }
    if (!artifact.source.canonical) {
        score -= 30;
        warnings.push("non-canonical source rejected");
    }
    if (statusValue === "deprecated") {
        score -= 50;
        warnings.push("deprecated artifacts are not selected by conservative v0 policy");
    }
    if (requiresUnsafeExecution(raw, input.governance)) {
        score -= 50;
        warnings.push("requires unsafe execution mode");
    }
    if (requiresGovernanceExpansion(raw, input.governance)) {
        score -= 50;
        warnings.push("requires MCP/LangChain expansion not allowed by current governance");
    }
    score = Math.max(0, Math.min(100, score));
    const confidence = confidenceForScore(score, warnings);
    return {
        sleeve_id: artifact.id,
        title: artifact.title,
        description: artifact.description,
        score,
        confidence,
        selected: false,
        reasons: [...new Set(reasons)],
        warnings: [...new Set(warnings)],
        provenance: provenanceForArtifact(artifact)
    };
}
function isEligibleSleeve(artifact, warnings) {
    const raw = artifact.raw;
    const statusValue = normalizeSleeveStatus(artifact, raw);
    if (artifact.kind !== "sleeve")
        return false;
    if (!artifact.source.canonical) {
        warnings.push("non-canonical source rejected");
        return false;
    }
    if (artifact.runtime_selectable === false) {
        warnings.push("runtime_selectable=false artifact rejected");
        return false;
    }
    if (artifact.support_only === true) {
        warnings.push("support docs are not runtime-selectable");
        return false;
    }
    if (!["active", "promoted_reference", "staged"].includes(statusValue)) {
        warnings.push(`status ${statusValue} not eligible for conservative v0 selection`);
        return false;
    }
    if (!["manifest", "index", "generated_index"].includes(artifact.source.discovery_method)) {
        warnings.push("unknown fallback artifact rejected");
        return false;
    }
    if (!["ai_machine", "package_lane"].includes(artifact.source.source_kind)) {
        warnings.push("HUMAN docs are not runtime-selectable");
        return false;
    }
    if (statusValue === "deprecated") {
        warnings.push("deprecated artifacts are not selected by conservative v0 policy");
        return false;
    }
    if (artifact.source.discovery_method === "fallback_walk" || artifact.source.source_kind === "unknown") {
        warnings.push("unknown fallback artifact rejected");
        return false;
    }
    return true;
}
function normalizeSleeveStatus(artifact, raw) {
    const sleeveStatus = typeof raw?.sleeve === "object" && raw.sleeve && typeof raw.sleeve.status === "string"
        ? String(raw.sleeve.status)
        : undefined;
    const status = sleeveStatus ?? artifact.status;
    return String(status).toLowerCase();
}
function tokenize(text) {
    return text.toLowerCase().split(/[^a-z0-9_.-]+/).filter(Boolean);
}
function getStringArray(raw, paths) {
    const values = [];
    for (const path of paths) {
        const parts = path.split(".");
        let current = raw;
        for (const part of parts) {
            if (!current || typeof current !== "object") {
                current = undefined;
                break;
            }
            current = current[part];
        }
        values.push(...flattenStrings(current));
    }
    return [...new Set(values)];
}
function flattenStrings(value) {
    if (!value)
        return [];
    if (typeof value === "string")
        return [value];
    if (Array.isArray(value))
        return value.flatMap((entry) => flattenStrings(entry));
    if (typeof value === "object")
        return Object.values(value).flatMap((entry) => flattenStrings(entry));
    return [];
}
function provenanceForArtifact(artifact) {
    const raw = artifact.raw;
    return {
        source_kind: artifact.source.source_kind,
        discovery_method: artifact.source.discovery_method,
        generated_from_lane: typeof raw?.generated_from_lane === "string" ? raw.generated_from_lane : undefined,
        path: artifact.source.path
    };
}
function requiresUnsafeExecution(raw, governance) {
    const runtimeServices = getStringArray(raw, ["sleeve.runtime.services", "runtime.services"]);
    if (governance.execution_mode !== "dry_run")
        return true;
    return runtimeServices.some((service) => /execute|write|live/i.test(service));
}
function requiresGovernanceExpansion(raw, governance) {
    const values = getStringArray(raw, ["sleeve.toolpacks.preferred", "sleeve.toolpacks.allowed", "toolpacks.preferred", "toolpacks.allowed", "sleeve.notes"]);
    if (values.some((value) => /mcp/i.test(value)) && governance.mcp_policy !== "metadata_only")
        return true;
    if (values.some((value) => /langchain/i.test(value)) && !["dry_run", "governed"].includes(governance.langchain_policy))
        return true;
    return false;
}
function confidenceForScore(score, warnings) {
    if (score <= 0)
        return "none";
    if (warnings.some(isHardBlockingWarning))
        return "none";
    if (score >= 75)
        return "high";
    if (score >= 45)
        return "medium";
    return "low";
}
function isHardBlockingWarning(warning) {
    return [
        "support docs are not runtime-selectable",
        "support-doc confusion blocked candidate sleeve selection",
        "HUMAN docs are not runtime-selectable",
        "unknown fallback artifact rejected",
        "deprecated artifacts are not selected by conservative v0 policy",
        "requires unsafe execution mode",
        "requires MCP/LangChain expansion not allowed by current governance",
        "runtime_selectable=false artifact rejected"
    ].includes(warning);
}
function strongestConfidence(candidates) {
    if (candidates.some((candidate) => candidate.confidence === "high"))
        return "high";
    if (candidates.some((candidate) => candidate.confidence === "medium"))
        return "medium";
    if (candidates.some((candidate) => candidate.confidence === "low"))
        return "low";
    return "none";
}
function inferNoMatchWarnings(input) {
    if (/readme|guide|docs/.test(input.user_task.toLowerCase())) {
        return ["support docs are not runtime-selectable"];
    }
    if (input.selected_neostacks.length > 0) {
        return ["no declared containing sleeve found"];
    }
    return ["no matching sleeve found"];
}
function unique(value, index, array) {
    return array.indexOf(value) === index;
}
