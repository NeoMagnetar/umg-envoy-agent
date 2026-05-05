import fs from "node:fs";
import path from "node:path";
import { readJsonLoose } from "./utils.js";
import { classifyRelationship, pickCanonicalDescription, pickCanonicalTitle } from "./canonicalize.js";
import { extractManifestArtifactReferences } from "./manifest-extract.js";
const MANIFEST_FILES = [
    "molt-block-library-index.json",
    "neoblock-library-index.json",
    "neostack-library-index.json",
    "sleeve-catalog.json",
    "gate-library-index.json",
    "release-approved-content.json"
];
export function buildRegistry(resolver) {
    const warnings = [];
    let malformed_manifest_entries = 0;
    const duplicate_report = [];
    const artifacts = [];
    const support_artifacts = [];
    const declaredArtifactKeys = new Set();
    const declaredArtifactIds = new Set();
    for (const source of resolver.getSources()) {
        if (!fs.existsSync(source.resolvedPath))
            continue;
        const manifestArtifacts = loadManifestArtifacts(source.resolvedPath, source.name, source.canonical, warnings, declaredArtifactKeys, declaredArtifactIds, (count) => { malformed_manifest_entries += count; });
        artifacts.push(...manifestArtifacts.filter((artifact) => !artifact.support_only));
        support_artifacts.push(...manifestArtifacts.filter((artifact) => artifact.support_only));
        const manifestPaths = new Set(manifestArtifacts.map((artifact) => path.resolve(artifact.source.path)));
        const fallback = walkFallbackArtifacts(source.resolvedPath, source.name, source.canonical, manifestPaths, warnings);
        artifacts.push(...fallback.filter((artifact) => !artifact.support_only));
        support_artifacts.push(...fallback.filter((artifact) => artifact.support_only));
    }
    const deduped = dedupeArtifacts(artifacts, warnings, duplicate_report);
    const dedupedSupport = dedupeArtifacts(support_artifacts, warnings, []);
    const counts = countArtifacts(deduped, dedupedSupport, duplicate_report.length, warnings.length);
    const coreAiArtifacts = deduped.filter((artifact) => artifact.source.source_kind === 'ai_machine');
    const core_ai_total = coreAiArtifacts.length;
    const core_ai_manifest_backed = coreAiArtifacts.filter((artifact) => artifact.source.discovery_method === 'manifest' || declaredArtifactIds.has(artifact.id)).length;
    const core_ai_index_backed = coreAiArtifacts.filter((artifact) => artifact.source.discovery_method === 'index').length;
    const core_ai_generated_index_backed = coreAiArtifacts.filter((artifact) => artifact.source.discovery_method === 'generated').length;
    const core_ai_fallback_only = coreAiArtifacts.filter((artifact) => artifact.source.discovery_method === 'fallback_walk' && !declaredArtifactIds.has(artifact.id)).length;
    return {
        artifacts: deduped,
        support_artifacts: dedupedSupport,
        counts,
        duplicate_report,
        warnings_summary: {
            duplicate_id_groups: duplicate_report.length,
            malformed_manifest_entries,
            fallback_only_core_artifacts: core_ai_fallback_only,
            human_support_docs: dedupedSupport.length
        },
        core_ai_provenance: {
            core_ai_total,
            core_ai_manifest_backed,
            core_ai_index_backed,
            core_ai_generated_index_backed,
            core_ai_fallback_only,
            core_ai_manifest_coverage_percent: core_ai_total > 0 ? Number(((core_ai_manifest_backed / core_ai_total) * 100).toFixed(2)) : 0,
            core_ai_declared_coverage_percent: core_ai_total > 0 ? Number((((core_ai_manifest_backed + core_ai_index_backed + core_ai_generated_index_backed) / core_ai_total) * 100).toFixed(2)) : 0
        },
        warnings
    };
}
function loadManifestArtifacts(root, sourceName, canonical, warnings, declaredArtifactKeys, declaredArtifactIds, onMalformed) {
    const manifestDir = path.join(root, "AI", "MANIFESTS");
    if (!fs.existsSync(manifestDir))
        return [];
    const artifacts = [];
    for (const fileName of MANIFEST_FILES) {
        const filePath = path.join(manifestDir, fileName);
        if (!fs.existsSync(filePath))
            continue;
        try {
            const raw = readJsonLoose(fs.readFileSync(filePath, "utf8"));
            const discoveryMethod = fileName.includes('index') || fileName.includes('catalog') ? "index" : "manifest";
            artifacts.push(...normalizeManifestPayload(filePath, raw, sourceName, canonical, discoveryMethod, warnings, declaredArtifactKeys, declaredArtifactIds, onMalformed));
        }
        catch (error) {
            warnings.push(`Failed to read manifest ${filePath}: ${String(error)}`);
        }
    }
    return artifacts;
}
function normalizeManifestPayload(filePath, raw, sourceName, canonical, discovery_method, warnings, declaredArtifactKeys, declaredArtifactIds, onMalformed) {
    const results = [];
    const references = extractManifestArtifactReferences(raw, filePath);
    for (const reference of references) {
        if (reference.id)
            declaredArtifactIds.add(reference.id);
        const resolved = resolveDeclaredArtifact(reference.path, filePath, sourceName, canonical, discovery_method, declaredArtifactKeys, warnings);
        if (resolved) {
            results.push(resolved);
            continue;
        }
        if (reference.id || reference.kind || reference.title || reference.description) {
            const pseudo = normalizeRecord(filePath, {
                id: reference.id,
                kind: reference.kind,
                title: reference.title,
                description: reference.description
            }, sourceName, canonical, discovery_method);
            pseudo.source.path = filePath;
            results.push(pseudo);
        }
    }
    if (results.length > 0) {
        return results;
    }
    const arrays = Array.isArray(raw)
        ? [raw]
        : [
            raw.items,
            raw.entries,
            raw.artifacts,
            raw.blocks,
            raw.stacks,
            raw.sleeves,
            raw.tools,
            raw.resources,
            raw.prompts
        ].filter(Array.isArray);
    if (arrays.length === 0) {
        results.push(normalizeRecord(filePath, raw, sourceName, canonical, discovery_method));
        return results;
    }
    for (const array of arrays) {
        for (const item of array) {
            if (!item || typeof item !== "object") {
                warnings.push(`Skipped non-object manifest item in ${filePath}`);
                onMalformed?.(1);
                continue;
            }
            results.push(normalizeRecord(filePath, item, sourceName, canonical, discovery_method));
        }
    }
    return results;
}
function walkFallbackArtifacts(root, sourceName, canonical, skipPaths, warnings) {
    const artifacts = [];
    const preferredRoots = [
        path.join(root, "AI", "MOLT-BLOCKS"),
        path.join(root, "AI", "NEOBLOCKS"),
        path.join(root, "AI", "NEOSTACKS"),
        path.join(root, "AI", "SLEEVES"),
        path.join(root, "AI", "CAPABILITIES"),
        path.join(root, "AI", "SCHEMAS"),
        path.join(root, "AI", "MANIFESTS"),
        path.join(root, "sleeves"),
        path.join(root, "blocks"),
        path.join(root, "HUMAN")
    ];
    for (const preferredRoot of preferredRoots) {
        if (!fs.existsSync(preferredRoot))
            continue;
        for (const filePath of walkFiles(preferredRoot)) {
            const resolved = path.resolve(filePath);
            if (skipPaths.has(resolved))
                continue;
            const lower = filePath.toLowerCase();
            if (!lower.endsWith(".json") && !lower.endsWith(".md"))
                continue;
            try {
                const raw = lower.endsWith(".json") ? readJsonLoose(fs.readFileSync(filePath, "utf8")) : { markdown: fs.readFileSync(filePath, "utf8") };
                artifacts.push(normalizeRecord(filePath, raw, sourceName, canonical, "fallback_walk"));
            }
            catch (error) {
                warnings.push(`Failed to normalize fallback file ${filePath}: ${String(error)}`);
            }
        }
    }
    return artifacts;
}
function normalizeRecord(filePath, raw, sourceName, canonical, discovery_method) {
    const source_kind = inferSourceKind(filePath);
    const kind = inferKind(filePath, raw);
    const explicitId = raw.identity && typeof raw.identity === "object" ? String(raw.identity.artifact_id ?? "") : "";
    const id = String(raw.id ?? raw.artifact_id ?? (explicitId || undefined) ?? raw.block_id ?? raw.neoblock_id ?? raw.neostack_id ?? raw.sleeve_id ?? stableId(filePath));
    const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {};
    const manifest = raw.manifest && typeof raw.manifest === "object" ? raw.manifest : {};
    const title = pickCanonicalTitle(raw, filePath, id);
    const description = pickCanonicalDescription(raw, typeof raw.markdown === 'string' ? firstParagraph(raw.markdown) : undefined);
    const status = typeof raw.status === "string" ? raw.status : inferStatus(filePath);
    const canonical_status = source_kind === "human_readable"
        ? "non_canonical"
        : source_kind === "sample"
            ? "sample"
            : source_kind === "draft"
                ? "draft"
                : canonical
                    ? "canonical"
                    : "unknown";
    const support_only = source_kind === "human_readable";
    return {
        id,
        kind,
        title,
        description,
        domains: asStringArray(raw.domains ?? raw.domain),
        capabilities: asStringArray(raw.capabilities ?? raw.capability),
        tags: asStringArray(raw.tags).concat(inferTags(filePath)).filter((value, index, array) => array.indexOf(value) === index),
        status,
        runtime_selectable: !support_only,
        support_only,
        search_penalty: support_only,
        source: {
            source_name: sourceName,
            repo: "UMG-Block-Library",
            path: filePath,
            source_kind,
            canonical: canonical_status === "canonical",
            canonical_status,
            discovery_method
        },
        raw
    };
}
function inferKind(filePath, raw) {
    const explicit = String(raw.kind ?? raw.type ?? raw.artifact_type ?? "").toLowerCase();
    const lower = filePath.replaceAll("\\", "/").toLowerCase();
    if (explicit.includes("neostack") || lower.includes("/neostacks/"))
        return "neostack";
    if (explicit.includes("neoblock") || lower.includes("/neoblocks/"))
        return "neoblock";
    if (explicit.includes("sleeve") || lower.includes("/sleeves/"))
        return "sleeve";
    if (explicit.includes("tool") || lower.includes("/tools/"))
        return "tool";
    if (explicit.includes("capability") || lower.includes("/capabilities/"))
        return "capability";
    if (explicit.includes("domain") || lower.includes("domain"))
        return "domain";
    if (explicit.includes("schema") || lower.includes("/schemas/"))
        return "schema";
    if (explicit.includes("manifest") || lower.includes("/manifests/"))
        return "manifest";
    return "molt_block";
}
function inferSourceKind(filePath) {
    const lower = filePath.replaceAll("\\", "/").toLowerCase();
    if (lower.includes("/human/"))
        return "human_readable";
    if (lower.includes("/ai/"))
        return "ai_machine";
    if (lower.includes("/sleeves/"))
        return "package_lane";
    if (lower.includes("/public-content/") || lower.includes("/samples/"))
        return "sample";
    if (lower.includes("/drafts/"))
        return "draft";
    return "unknown";
}
function inferStatus(filePath) {
    const lower = filePath.toLowerCase();
    if (lower.includes("deprecated"))
        return "deprecated";
    if (lower.includes("draft"))
        return "draft";
    if (lower.includes("experimental"))
        return "experimental";
    return "active";
}
function inferTags(filePath) {
    return filePath.replaceAll("\\", "/").split("/").map((part) => part.toLowerCase()).filter((part) => part && !part.includes("."));
}
function stableId(filePath) {
    return `artifact.${path.basename(filePath).replace(/\.[^.]+$/, "")}`;
}
function extractMarkdownTitle(markdown) {
    const line = markdown.split(/\r?\n/).find((entry) => entry.trim().startsWith("#"));
    return line ? line.replace(/^#+\s*/, "").trim() : undefined;
}
function firstParagraph(markdown) {
    return markdown.split(/\r?\n\r?\n/).map((part) => part.trim()).find(Boolean) ?? "";
}
function resolveDeclaredArtifact(referencePath, sourceManifestPath, sourceName, canonical, discoveryMethod, declaredArtifactKeys, warnings) {
    if (!referencePath)
        return null;
    const resolvedPath = candidateDeclaredPaths(referencePath, sourceManifestPath).find((candidate) => fs.existsSync(candidate));
    if (!resolvedPath)
        return null;
    try {
        const raw = readJsonLoose(fs.readFileSync(resolvedPath, 'utf8'));
        const artifact = normalizeRecord(resolvedPath, raw, sourceName, canonical, discoveryMethod === 'fallback_walk' ? 'generated' : discoveryMethod);
        artifact.source.path = resolvedPath;
        declaredArtifactKeys.add(`${artifact.id}::${resolvedPath}`);
        return artifact;
    }
    catch (error) {
        warnings.push(`Failed to resolve declared artifact path ${referencePath} from ${sourceManifestPath}: ${String(error)}`);
        return null;
    }
}
function candidateDeclaredPaths(referencePath, sourceManifestPath) {
    const normalized = referencePath.replaceAll('/', path.sep).replaceAll('\\', path.sep);
    const sourceRoot = path.resolve(path.dirname(sourceManifestPath), '..');
    const candidates = [
        path.resolve(sourceRoot, normalized),
        path.resolve(sourceRoot, normalized.replace(`blocks${path.sep}library${path.sep}neostacks`, `AI${path.sep}NEOSTACKS${path.sep}categories`)),
        path.resolve(sourceRoot, normalized.replace(`blocks${path.sep}library${path.sep}neoblocks`, `AI${path.sep}NEOBLOCKS${path.sep}categories`)),
        path.resolve(sourceRoot, normalized.replace(`blocks${path.sep}library${path.sep}molt-extracted`, `AI${path.sep}MOLT-BLOCKS`)),
        path.resolve(path.dirname(sourceManifestPath), normalized)
    ];
    return [...new Set(candidates)];
}
function asStringArray(value) {
    if (!value)
        return [];
    if (Array.isArray(value))
        return value.map(String).filter(Boolean);
    return [String(value)].filter(Boolean);
}
function walkFiles(root) {
    const files = [];
    const stack = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory())
                stack.push(full);
            else
                files.push(full);
        }
    }
    return files;
}
function dedupeArtifacts(artifacts, warnings, duplicate_report) {
    const seen = new Map();
    const grouped = new Map();
    for (const artifact of artifacts) {
        if (!seen.has(artifact.id)) {
            seen.set(artifact.id, artifact);
            grouped.set(artifact.id, {
                duplicate_id: artifact.id,
                canonical_kept: {
                    relationship: classifyRelationship(artifact),
                    reason: precedenceReason(artifact),
                    path: artifact.source.path,
                    source_kind: artifact.source.source_kind,
                    discovery_method: artifact.source.discovery_method
                },
                related_entries: []
            });
            continue;
        }
        const existing = seen.get(artifact.id);
        const existingRank = artifactPrecedence(existing);
        const nextRank = artifactPrecedence(artifact);
        const group = grouped.get(artifact.id);
        if (nextRank > existingRank) {
            seen.set(artifact.id, artifact);
            warnings.push(`Duplicate artifact id ${artifact.id}; replaced lower-precedence source.`);
            group.related_entries.push({
                relationship: classifyRelationship(existing),
                reason: precedenceReason(existing),
                path: existing.source.path,
                source_kind: existing.source.source_kind,
                discovery_method: existing.source.discovery_method
            });
            group.canonical_kept = {
                relationship: classifyRelationship(artifact),
                reason: precedenceReason(artifact),
                path: artifact.source.path,
                source_kind: artifact.source.source_kind,
                discovery_method: artifact.source.discovery_method
            };
        }
        else {
            warnings.push(`Duplicate artifact id ${artifact.id}; kept existing source ${existing.source.path}.`);
            group.related_entries.push({
                relationship: classifyRelationship(artifact),
                reason: precedenceReason(artifact),
                path: artifact.source.path,
                source_kind: artifact.source.source_kind,
                discovery_method: artifact.source.discovery_method
            });
        }
    }
    duplicate_report.push(...[...grouped.values()].filter((group) => group.related_entries.length > 0));
    return [...seen.values()];
}
function artifactPrecedence(artifact) {
    if (artifact.source.discovery_method === "manifest" || artifact.source.discovery_method === "index")
        return 100;
    if (artifact.source.source_kind === "ai_machine")
        return 80;
    if (artifact.source.source_kind === "package_lane")
        return 60;
    if (artifact.kind === "schema" || artifact.kind === "manifest")
        return 40;
    if (artifact.source.source_kind === "human_readable")
        return 10;
    return 20;
}
function precedenceReason(artifact) {
    if (artifact.source.discovery_method === "manifest" || artifact.source.discovery_method === "index")
        return "manifest_declared_canonical_id";
    if (artifact.source.source_kind === "ai_machine")
        return "ai_machine_readable_artifact_id";
    if (artifact.source.source_kind === "package_lane")
        return "package_lane_id";
    if (artifact.kind === "schema" || artifact.kind === "manifest")
        return "schema_or_manifest_id";
    if (artifact.source.source_kind === "human_readable")
        return "human_markdown_generated_id";
    return "fallback_generated_id";
}
function countArtifacts(artifacts, supportArtifacts, duplicate_count, warning_count) {
    const by_kind = {};
    const by_source_kind = {};
    const by_status = {};
    const by_discovery_method = {};
    let canonical_count = 0;
    let non_canonical_count = 0;
    let sample_count = 0;
    let human_support_count = 0;
    for (const artifact of artifacts) {
        by_kind[artifact.kind] = (by_kind[artifact.kind] ?? 0) + 1;
        by_source_kind[artifact.source.source_kind] = (by_source_kind[artifact.source.source_kind] ?? 0) + 1;
        by_status[artifact.status] = (by_status[artifact.status] ?? 0) + 1;
        by_discovery_method[artifact.source.discovery_method] = (by_discovery_method[artifact.source.discovery_method] ?? 0) + 1;
        if (artifact.source.canonical_status === "canonical")
            canonical_count += 1;
        else
            non_canonical_count += 1;
        if (artifact.source.canonical_status === "sample")
            sample_count += 1;
        if (artifact.support_only)
            human_support_count += 1;
    }
    human_support_count = supportArtifacts.length;
    return { by_kind, by_source_kind, by_status, by_discovery_method, canonical_count, non_canonical_count, sample_count, human_support_count, duplicate_count, warning_count };
}
