import fs from "node:fs";
import path from "node:path";
import { readJsonLoose } from "./utils.js";
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
    const artifacts = [];
    for (const source of resolver.getSources()) {
        if (!fs.existsSync(source.resolvedPath))
            continue;
        const manifestArtifacts = loadManifestArtifacts(source.resolvedPath, source.name, source.canonical, warnings);
        artifacts.push(...manifestArtifacts);
        const manifestPaths = new Set(manifestArtifacts.map((artifact) => path.resolve(artifact.source.path)));
        artifacts.push(...walkFallbackArtifacts(source.resolvedPath, source.name, source.canonical, manifestPaths, warnings));
    }
    const deduped = dedupeArtifacts(artifacts, warnings);
    return {
        artifacts: deduped,
        counts: countArtifacts(deduped),
        warnings
    };
}
function loadManifestArtifacts(root, sourceName, canonical, warnings) {
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
            artifacts.push(...normalizeManifestPayload(filePath, raw, sourceName, canonical, "manifest", warnings));
        }
        catch (error) {
            warnings.push(`Failed to read manifest ${filePath}: ${String(error)}`);
        }
    }
    return artifacts;
}
function normalizeManifestPayload(filePath, raw, sourceName, canonical, discovery_method, warnings) {
    const results = [];
    const record = raw;
    const arrays = [record.items, record.entries, record.artifacts, record.blocks, record.stacks, record.sleeves].filter(Array.isArray);
    if (arrays.length === 0) {
        results.push(normalizeRecord(filePath, record, sourceName, canonical, discovery_method));
        return results;
    }
    for (const array of arrays) {
        for (const item of array) {
            if (!item || typeof item !== "object") {
                warnings.push(`Skipped non-object manifest item in ${filePath}`);
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
        root
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
    const id = String(raw.id ?? raw.artifact_id ?? raw.block_id ?? raw.neoblock_id ?? raw.neostack_id ?? raw.sleeve_id ?? stableId(filePath));
    const title = typeof raw.title === "string" ? raw.title : typeof raw.name === "string" ? raw.name : typeof raw.label === "string" ? raw.label : path.basename(filePath);
    const description = typeof raw.description === "string" ? raw.description : typeof raw.summary === "string" ? raw.summary : "";
    const status = typeof raw.status === "string" ? raw.status : inferStatus(filePath);
    return {
        id,
        kind,
        title,
        description,
        domains: asStringArray(raw.domains ?? raw.domain),
        capabilities: asStringArray(raw.capabilities ?? raw.capability),
        tags: asStringArray(raw.tags).concat(inferTags(filePath)).filter((value, index, array) => array.indexOf(value) === index),
        status,
        source: {
            source_name: sourceName,
            repo: "UMG-Block-Library",
            path: filePath,
            source_kind,
            canonical: canonical && source_kind !== "human_readable",
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
function dedupeArtifacts(artifacts, warnings) {
    const seen = new Map();
    for (const artifact of artifacts) {
        if (!seen.has(artifact.id)) {
            seen.set(artifact.id, artifact);
            continue;
        }
        const existing = seen.get(artifact.id);
        if (artifact.source.canonical && !existing.source.canonical) {
            seen.set(artifact.id, artifact);
            warnings.push(`Duplicate artifact id ${artifact.id}; canonical source replaced non-canonical source.`);
        }
        else {
            warnings.push(`Duplicate artifact id ${artifact.id}; kept existing source ${existing.source.path}.`);
        }
    }
    return [...seen.values()];
}
function countArtifacts(artifacts) {
    const by_kind = {};
    const by_source_kind = {};
    const by_status = {};
    const by_discovery_method = {};
    for (const artifact of artifacts) {
        by_kind[artifact.kind] = (by_kind[artifact.kind] ?? 0) + 1;
        by_source_kind[artifact.source.source_kind] = (by_source_kind[artifact.source.source_kind] ?? 0) + 1;
        by_status[artifact.status] = (by_status[artifact.status] ?? 0) + 1;
        by_discovery_method[artifact.source.discovery_method] = (by_discovery_method[artifact.source.discovery_method] ?? 0) + 1;
    }
    return { by_kind, by_source_kind, by_status, by_discovery_method };
}
