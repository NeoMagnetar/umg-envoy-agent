import fs from "node:fs";
import path from "node:path";
import type { DiscoveryMethod, NormalizedArtifact } from "./block-library-config.js";
import type { UMGResolver } from "./resolver.js";
import { readJsonLoose } from "./utils.js";
import { classifyRelationship, pickCanonicalDescription, pickCanonicalTitle, type DuplicateRelationshipGroup } from "./canonicalize.js";

const MANIFEST_FILES = [
  "molt-block-library-index.json",
  "neoblock-library-index.json",
  "neostack-library-index.json",
  "sleeve-catalog.json",
  "gate-library-index.json",
  "release-approved-content.json"
];

export interface BuildRegistryResult {
  artifacts: NormalizedArtifact[];
  support_artifacts: NormalizedArtifact[];
  counts: {
    by_kind: Record<string, number>;
    by_source_kind: Record<string, number>;
    by_status: Record<string, number>;
    by_discovery_method: Record<string, number>;
    canonical_count: number;
    non_canonical_count: number;
    sample_count: number;
    human_support_count: number;
    duplicate_count: number;
    warning_count: number;
  };
  duplicate_report: DuplicateRelationshipGroup[];
  warnings_summary: {
    duplicate_id_groups: number;
    malformed_manifest_entries: number;
    fallback_only_core_artifacts: number;
    human_support_docs: number;
  };
  warnings: string[];
}

export function buildRegistry(resolver: UMGResolver): BuildRegistryResult {
  const warnings: string[] = [];
  let malformed_manifest_entries = 0;
  const duplicate_report: BuildRegistryResult["duplicate_report"] = [];
  const artifacts: NormalizedArtifact[] = [];
  const support_artifacts: NormalizedArtifact[] = [];

  for (const source of resolver.getSources()) {
    if (!fs.existsSync(source.resolvedPath)) continue;
    const manifestArtifacts = loadManifestArtifacts(source.resolvedPath, source.name, source.canonical, warnings, (count) => { malformed_manifest_entries += count; });
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
  return {
    artifacts: deduped,
    support_artifacts: dedupedSupport,
    counts,
    duplicate_report,
    warnings_summary: {
      duplicate_id_groups: duplicate_report.length,
      malformed_manifest_entries,
      fallback_only_core_artifacts: deduped.filter((artifact) => artifact.source.discovery_method === 'fallback_walk' && artifact.source.source_kind === 'ai_machine').length,
      human_support_docs: dedupedSupport.length
    },
    warnings
  };
}

function loadManifestArtifacts(root: string, sourceName: string, canonical: boolean, warnings: string[], onMalformed?: (count: number) => void): NormalizedArtifact[] {
  const manifestDir = path.join(root, "AI", "MANIFESTS");
  if (!fs.existsSync(manifestDir)) return [];
  const artifacts: NormalizedArtifact[] = [];

  for (const fileName of MANIFEST_FILES) {
    const filePath = path.join(manifestDir, fileName);
    if (!fs.existsSync(filePath)) continue;
    try {
      const raw = readJsonLoose(fs.readFileSync(filePath, "utf8")) as unknown;
      artifacts.push(...normalizeManifestPayload(filePath, raw, sourceName, canonical, fileName.includes('index') || fileName.includes('catalog') ? "index" : "manifest", warnings, onMalformed));
    } catch (error) {
      warnings.push(`Failed to read manifest ${filePath}: ${String(error)}`);
    }
  }

  return artifacts;
}

function normalizeManifestPayload(filePath: string, raw: unknown, sourceName: string, canonical: boolean, discovery_method: DiscoveryMethod, warnings: string[], onMalformed?: (count: number) => void): NormalizedArtifact[] {
  const results: NormalizedArtifact[] = [];
  const arrays = Array.isArray(raw)
    ? [raw]
    : [
        (raw as Record<string, unknown>).items,
        (raw as Record<string, unknown>).entries,
        (raw as Record<string, unknown>).artifacts,
        (raw as Record<string, unknown>).blocks,
        (raw as Record<string, unknown>).stacks,
        (raw as Record<string, unknown>).sleeves,
        (raw as Record<string, unknown>).tools,
        (raw as Record<string, unknown>).resources,
        (raw as Record<string, unknown>).prompts
      ].filter(Array.isArray) as unknown[][];

  if (arrays.length === 0) {
    results.push(normalizeRecord(filePath, raw as Record<string, unknown>, sourceName, canonical, discovery_method));
    return results;
  }

  for (const array of arrays) {
    for (const item of array) {
      if (!item || typeof item !== "object") {
        warnings.push(`Skipped non-object manifest item in ${filePath}`);
        onMalformed?.(1);
        continue;
      }
      results.push(normalizeRecord(filePath, item as Record<string, unknown>, sourceName, canonical, discovery_method));
    }
  }

  return results;
}

function walkFallbackArtifacts(root: string, sourceName: string, canonical: boolean, skipPaths: Set<string>, warnings: string[]): NormalizedArtifact[] {
  const artifacts: NormalizedArtifact[] = [];
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
    if (!fs.existsSync(preferredRoot)) continue;
    for (const filePath of walkFiles(preferredRoot)) {
      const resolved = path.resolve(filePath);
      if (skipPaths.has(resolved)) continue;
      const lower = filePath.toLowerCase();
      if (!lower.endsWith(".json") && !lower.endsWith(".md")) continue;
      try {
        const raw = lower.endsWith(".json") ? readJsonLoose(fs.readFileSync(filePath, "utf8")) as unknown : { markdown: fs.readFileSync(filePath, "utf8") };
        artifacts.push(normalizeRecord(filePath, raw as Record<string, unknown>, sourceName, canonical, "fallback_walk"));
      } catch (error) {
        warnings.push(`Failed to normalize fallback file ${filePath}: ${String(error)}`);
      }
    }
  }

  return artifacts;
}

function normalizeRecord(filePath: string, raw: Record<string, unknown>, sourceName: string, canonical: boolean, discovery_method: DiscoveryMethod): NormalizedArtifact {
  const source_kind = inferSourceKind(filePath);
  const kind = inferKind(filePath, raw);
  const explicitId = raw.identity && typeof raw.identity === "object" ? String((raw.identity as Record<string, unknown>).artifact_id ?? "") : "";
  const id = String(raw.id ?? raw.artifact_id ?? (explicitId || undefined) ?? raw.block_id ?? raw.neoblock_id ?? raw.neostack_id ?? raw.sleeve_id ?? stableId(filePath));
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata as Record<string, unknown> : {};
  const manifest = raw.manifest && typeof raw.manifest === "object" ? raw.manifest as Record<string, unknown> : {};
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

function inferKind(filePath: string, raw: Record<string, unknown>): NormalizedArtifact["kind"] {
  const explicit = String(raw.kind ?? raw.type ?? raw.artifact_type ?? "").toLowerCase();
  const lower = filePath.replaceAll("\\", "/").toLowerCase();
  if (explicit.includes("neostack") || lower.includes("/neostacks/")) return "neostack";
  if (explicit.includes("neoblock") || lower.includes("/neoblocks/")) return "neoblock";
  if (explicit.includes("sleeve") || lower.includes("/sleeves/")) return "sleeve";
  if (explicit.includes("tool") || lower.includes("/tools/")) return "tool";
  if (explicit.includes("capability") || lower.includes("/capabilities/")) return "capability";
  if (explicit.includes("domain") || lower.includes("domain")) return "domain";
  if (explicit.includes("schema") || lower.includes("/schemas/")) return "schema";
  if (explicit.includes("manifest") || lower.includes("/manifests/")) return "manifest";
  return "molt_block";
}

function inferSourceKind(filePath: string): NormalizedArtifact["source"]["source_kind"] {
  const lower = filePath.replaceAll("\\", "/").toLowerCase();
  if (lower.includes("/human/")) return "human_readable";
  if (lower.includes("/ai/")) return "ai_machine";
  if (lower.includes("/sleeves/")) return "package_lane";
  if (lower.includes("/public-content/") || lower.includes("/samples/")) return "sample";
  if (lower.includes("/drafts/")) return "draft";
  return "unknown";
}

function inferStatus(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.includes("deprecated")) return "deprecated";
  if (lower.includes("draft")) return "draft";
  if (lower.includes("experimental")) return "experimental";
  return "active";
}

function inferTags(filePath: string): string[] {
  return filePath.replaceAll("\\", "/").split("/").map((part) => part.toLowerCase()).filter((part) => part && !part.includes("."));
}

function stableId(filePath: string): string {
  return `artifact.${path.basename(filePath).replace(/\.[^.]+$/, "")}`;
}

function extractMarkdownTitle(markdown: string): string | undefined {
  const line = markdown.split(/\r?\n/).find((entry) => entry.trim().startsWith("#"));
  return line ? line.replace(/^#+\s*/, "").trim() : undefined;
}

function firstParagraph(markdown: string): string {
  return markdown.split(/\r?\n\r?\n/).map((part) => part.trim()).find(Boolean) ?? "";
}

function asStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [String(value)].filter(Boolean);
}

function walkFiles(root: string): string[] {
  const files: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else files.push(full);
    }
  }
  return files;
}

function dedupeArtifacts(artifacts: NormalizedArtifact[], warnings: string[], duplicate_report: BuildRegistryResult["duplicate_report"]): NormalizedArtifact[] {
  const seen = new Map<string, NormalizedArtifact>();
  const grouped = new Map<string, DuplicateRelationshipGroup>();
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
    const existing = seen.get(artifact.id)!;
    const existingRank = artifactPrecedence(existing);
    const nextRank = artifactPrecedence(artifact);
    const group = grouped.get(artifact.id)!;
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
    } else {
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

function artifactPrecedence(artifact: NormalizedArtifact): number {
  if (artifact.source.discovery_method === "manifest" || artifact.source.discovery_method === "index") return 100;
  if (artifact.source.source_kind === "ai_machine") return 80;
  if (artifact.source.source_kind === "package_lane") return 60;
  if (artifact.kind === "schema" || artifact.kind === "manifest") return 40;
  if (artifact.source.source_kind === "human_readable") return 10;
  return 20;
}

function precedenceReason(artifact: NormalizedArtifact): string {
  if (artifact.source.discovery_method === "manifest" || artifact.source.discovery_method === "index") return "manifest_declared_canonical_id";
  if (artifact.source.source_kind === "ai_machine") return "ai_machine_readable_artifact_id";
  if (artifact.source.source_kind === "package_lane") return "package_lane_id";
  if (artifact.kind === "schema" || artifact.kind === "manifest") return "schema_or_manifest_id";
  if (artifact.source.source_kind === "human_readable") return "human_markdown_generated_id";
  return "fallback_generated_id";
}

function countArtifacts(artifacts: NormalizedArtifact[], supportArtifacts: NormalizedArtifact[], duplicate_count: number, warning_count: number) {
  const by_kind: Record<string, number> = {};
  const by_source_kind: Record<string, number> = {};
  const by_status: Record<string, number> = {};
  const by_discovery_method: Record<string, number> = {};
  let canonical_count = 0;
  let non_canonical_count = 0;
  let sample_count = 0;
  let human_support_count = 0;
  for (const artifact of artifacts) {
    by_kind[artifact.kind] = (by_kind[artifact.kind] ?? 0) + 1;
    by_source_kind[artifact.source.source_kind] = (by_source_kind[artifact.source.source_kind] ?? 0) + 1;
    by_status[artifact.status] = (by_status[artifact.status] ?? 0) + 1;
    by_discovery_method[artifact.source.discovery_method] = (by_discovery_method[artifact.source.discovery_method] ?? 0) + 1;
    if (artifact.source.canonical_status === "canonical") canonical_count += 1;
    else non_canonical_count += 1;
    if (artifact.source.canonical_status === "sample") sample_count += 1;
    if (artifact.support_only) human_support_count += 1;
  }
  human_support_count = supportArtifacts.length;
  return { by_kind, by_source_kind, by_status, by_discovery_method, canonical_count, non_canonical_count, sample_count, human_support_count, duplicate_count, warning_count };
}
