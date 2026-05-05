import path from "node:path";
import type { NormalizedArtifact } from "./block-library-config.js";

export interface DuplicateRelationshipEntry {
  relationship: "canonical_artifact" | "supporting_human_doc" | "package_export" | "manifest_entry" | "index_entry" | "fallback_duplicate" | "schema_reference" | "readme_reference";
  reason: string;
  path: string;
  source_kind: string;
  discovery_method: string;
}

export interface DuplicateRelationshipGroup {
  duplicate_id: string;
  canonical_kept: DuplicateRelationshipEntry;
  related_entries: DuplicateRelationshipEntry[];
}

export function classifyRelationship(artifact: NormalizedArtifact): DuplicateRelationshipEntry["relationship"] {
  const lower = artifact.source.path.replaceAll("\\", "/").toLowerCase();
  if (artifact.source.discovery_method === "manifest") return "manifest_entry";
  if (artifact.source.discovery_method === "index") return "index_entry";
  if (artifact.source.source_kind === "human_readable") return "supporting_human_doc";
  if (artifact.source.source_kind === "package_lane") return "package_export";
  if (artifact.kind === "schema") return "schema_reference";
  if (lower.endsWith("readme.md")) return "readme_reference";
  if (artifact.source.canonical) return "canonical_artifact";
  return "fallback_duplicate";
}

export function humanizeId(id: string): string {
  return id
    .replace(/^NB\.|^NS\.|^SLV\./, "")
    .replace(/\.v\d+(?:\.\d+)?$/i, "")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bUMG\b/g, "UMG")
    .replace(/\bLC\b/g, "LangChain")
    .replace(/\bMCP\b/g, "MCP")
    .replace(/\bLANGCHAIN\b/gi, "LangChain")
    .replace(/\bBRIDGE\b/gi, "Bridge")
    .replace(/\bRUNTIME\b/gi, "Runtime")
    .replace(/\bFLOW\b/gi, "Flow")
    .replace(/\bCORE\b/gi, "Core")
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export function pickCanonicalTitle(raw: Record<string, unknown>, fallbackPath: string, fallbackId: string): string {
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata as Record<string, unknown> : {};
  const manifest = raw.manifest && typeof raw.manifest === "object" ? raw.manifest as Record<string, unknown> : {};
  const neostack = raw.neostack && typeof raw.neostack === "object" ? raw.neostack as Record<string, unknown> : {};
  const sleeve = raw.sleeve && typeof raw.sleeve === "object" ? raw.sleeve as Record<string, unknown> : {};
  const identity = raw.identity && typeof raw.identity === "object" ? raw.identity as Record<string, unknown> : {};

  for (const value of [
    raw.title,
    raw.display_name,
    raw.name,
    raw.label,
    metadata.title,
    metadata.name,
    manifest.title,
    neostack.name,
    sleeve.name,
    raw.summary,
    raw.description,
    identity.artifact_id ? humanizeId(String(identity.artifact_id)) : undefined,
    fallbackId ? humanizeId(fallbackId) : undefined,
    path.basename(fallbackPath)
  ]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return path.basename(fallbackPath);
}

export function pickCanonicalDescription(raw: Record<string, unknown>, markdownSummary?: string): string {
  const metadata = raw.metadata && typeof raw.metadata === "object" ? raw.metadata as Record<string, unknown> : {};
  const manifest = raw.manifest && typeof raw.manifest === "object" ? raw.manifest as Record<string, unknown> : {};
  const neostack = raw.neostack && typeof raw.neostack === "object" ? raw.neostack as Record<string, unknown> : {};
  const sleeve = raw.sleeve && typeof raw.sleeve === "object" ? raw.sleeve as Record<string, unknown> : {};

  for (const value of [
    raw.description,
    raw.summary,
    metadata.description,
    manifest.description,
    neostack.description,
    sleeve.description,
    markdownSummary
  ]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}
