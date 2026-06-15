import fs from "node:fs";
import path from "node:path";
import type {
  CognitiveGovernance,
  CognitiveRegistry,
  CognitiveRegistryQueryKind,
  CognitiveRegistryQueryResult,
  MoltBlock,
  NeoBlock,
  NeoStack,
  NeoStackPlanResult,
  NeoStackSelectionTraceEntry,
} from "../types.js";
import { publicContentRoot } from "./content-loader.js";

const SUPPORTED_KINDS = new Set(["all", "molt", "neoblock", "neostack"]);

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "to",
  "for",
  "of",
  "with",
  "show",
  "make",
  "me",
]);

const TOKEN_ALIASES: Record<string, string[]> = {
  code: ["coder"],
  coding: ["code", "coder"],
  generation: ["generate"],
  generate: ["generation"],
  usage: ["blocks"],
  use: ["usage"],
  post: ["draft"],
  write: ["draft"],
  article: ["post", "draft"],
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function cognitiveRegistryPath(metaUrl = import.meta.url): string {
  return path.join(publicContentRoot(metaUrl), "cognitive-registry.json");
}

export function loadCognitiveRegistry(metaUrl = import.meta.url): CognitiveRegistry {
  return readJson<CognitiveRegistry>(cognitiveRegistryPath(metaUrl));
}

function counts(registry: CognitiveRegistry) {
  return {
    molt_blocks: registry.molt_blocks.length,
    neoblocks: registry.neoblocks.length,
    neostacks: registry.neostacks.length,
  };
}

function normalizeKind(kind?: string): string {
  return (kind ?? "all").trim().toLowerCase();
}

export function queryCognitiveRegistry(input: { kind?: string; metaUrl?: string }): CognitiveRegistryQueryResult {
  const kind = normalizeKind(input.kind);
  const registry = loadCognitiveRegistry(input.metaUrl ?? import.meta.url);

  if (!SUPPORTED_KINDS.has(kind)) {
    return {
      ok: false,
      kind,
      error: "Unsupported registry kind",
      content_mode: registry.content_mode,
      counts: counts(registry),
      molt_blocks: [],
      neoblocks: [],
      neostacks: [],
      warnings: [],
      errors: ["Unsupported registry kind"],
    };
  }

  return {
    ok: true,
    kind,
    content_mode: registry.content_mode,
    counts: counts(registry),
    molt_blocks: kind === "all" || kind === "molt" ? registry.molt_blocks : [],
    neoblocks: kind === "all" || kind === "neoblock" ? registry.neoblocks : [],
    neostacks: kind === "all" || kind === "neostack" ? registry.neostacks : [],
    warnings: [],
    errors: [],
  };
}

function tokenize(input: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of input.toLowerCase().split(/[^a-z0-9_.-]+/)) {
    if (!raw || STOP_WORDS.has(raw)) continue;
    tokens.add(raw);
    for (const alias of TOKEN_ALIASES[raw] ?? []) {
      tokens.add(alias);
    }
  }
  return tokens;
}

function scoreStack(intentTokens: Set<string>, stack: NeoStack): NeoStackSelectionTraceEntry {
  const candidateTags = new Set([...stack.tags.map((tag) => tag.toLowerCase()), ...stack.name.toLowerCase().split(/[^a-z0-9]+/), ...stack.purpose.toLowerCase().split(/[^a-z0-9]+/)]);
  const matchedTags = [...candidateTags].filter((tag) => intentTokens.has(tag)).sort();
  const rawScore = matchedTags.length / Math.max(4, Math.min(10, candidateTags.size));
  const score = Number(Math.min(0.99, rawScore + (matchedTags.length > 0 ? 0.25 : 0)).toFixed(2));
  const reason = matchedTags.length > 0
    ? `Matched ${matchedTags.join(", ")} intent signals.`
    : "No direct tag match; retained as rejected candidate.";
  return {
    candidate_id: stack.id,
    score,
    matched_tags: matchedTags,
    reason,
  };
}

function combineGovernance(items: Array<{ governance: CognitiveGovernance }>): CognitiveGovernance {
  return {
    read_only: items.every((item) => item.governance.read_only === true),
    allows_writes: items.some((item) => item.governance.allows_writes === true),
    requires_gate: items.some((item) => item.governance.requires_gate === true),
  };
}

function selectedNeoBlocks(registry: CognitiveRegistry, stack: NeoStack) {
  const neoblockById = new Map(registry.neoblocks.map((entry) => [entry.id, entry]));
  return stack.neoblock_refs
    .filter((ref) => ref.enabled !== false)
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((ref) => ({
      ref,
      neoblock: neoblockById.get(ref.id),
    }))
    .filter((entry): entry is { ref: NonNullable<typeof entry.ref>; neoblock: NeoBlock } => Boolean(entry.neoblock));
}

function selectedMoltBlocks(registry: CognitiveRegistry, neoblocks: Array<{ ref: { id: string; order: number; role?: string }; neoblock: NeoBlock }>) {
  const moltById = new Map(registry.molt_blocks.map((entry) => [entry.id, entry]));
  const selections: Array<{ ref: { id: string; enabled: boolean; role?: string }; molt: MoltBlock; sourceNeoBlockId: string }> = [];
  for (const { neoblock } of neoblocks) {
    for (const ref of neoblock.molt_refs.filter((entry) => entry.enabled !== false)) {
      const molt = moltById.get(ref.id);
      if (molt) {
        selections.push({ ref, molt, sourceNeoBlockId: neoblock.id });
      }
    }
  }
  return selections;
}

export function planNeoStack(input: { intent: string; metaUrl?: string }): NeoStackPlanResult {
  const intent = input.intent.trim();
  const registry = loadCognitiveRegistry(input.metaUrl ?? import.meta.url);
  const intentTokens = tokenize(intent);
  const selectionTrace = registry.neostacks
    .map((stack) => scoreStack(intentTokens, stack))
    .sort((a, b) => b.score - a.score || a.candidate_id.localeCompare(b.candidate_id));

  const selectedTrace = selectionTrace[0] ?? null;
  const selectedStack = selectedTrace ? registry.neostacks.find((stack) => stack.id === selectedTrace.candidate_id) ?? null : null;
  const selectedBlocks = selectedStack ? selectedNeoBlocks(registry, selectedStack) : [];
  const selectedMolts = selectedMoltBlocks(registry, selectedBlocks);
  const governanceItems = [
    ...(selectedStack ? [selectedStack] : []),
    ...selectedBlocks.map((entry) => entry.neoblock),
    ...selectedMolts.map((entry) => entry.molt),
  ];
  const governance = combineGovernance(governanceItems);

  return {
    ok: Boolean(selectedStack) && intent.length > 0,
    intent,
    selected_neostack: selectedStack && selectedTrace ? {
      id: selectedStack.id,
      reason: selectedTrace.reason,
    } : null,
    selected_neoblocks: selectedBlocks.map(({ ref }) => ({
      id: ref.id,
      role: ref.role,
      order: ref.order,
      enabled: true,
    })),
    selected_molt_blocks: selectedMolts.map(({ ref, sourceNeoBlockId }) => ({
      id: ref.id,
      role: ref.role,
      enabled: true,
      source_neoblock_id: sourceNeoBlockId,
    })),
    rejected_candidates: selectionTrace.slice(1),
    selection_trace: selectionTrace,
    governance,
    non_executing: true,
    warnings: [],
    errors: intent.length > 0 ? [] : ["Intent is required"],
  };
}

export function validateCognitiveRegistry(registry: CognitiveRegistry) {
  const moltIds = new Set(registry.molt_blocks.map((entry) => entry.id));
  const neoBlockIds = new Set(registry.neoblocks.map((entry) => entry.id));
  const missingMoltRefs = registry.neoblocks.flatMap((neoblock) =>
    neoblock.molt_refs.filter((ref) => !moltIds.has(ref.id)).map((ref) => `${neoblock.id}->${ref.id}`)
  );
  const missingNeoBlockRefs = registry.neostacks.flatMap((neostack) =>
    neostack.neoblock_refs.filter((ref) => !neoBlockIds.has(ref.id)).map((ref) => `${neostack.id}->${ref.id}`)
  );
  const governanceEntries = [
    ...registry.molt_blocks.map((entry) => entry.governance),
    ...registry.neoblocks.map((entry) => entry.governance),
    ...registry.neostacks.map((entry) => entry.governance),
  ];
  return {
    ok: missingMoltRefs.length === 0 && missingNeoBlockRefs.length === 0 && governanceEntries.every((entry) => entry.read_only === true && entry.allows_writes === false),
    missingMoltRefs,
    missingNeoBlockRefs,
    governanceEntries,
  };
}
