import type { PluginConfig, PublicBlock, PublicSleeve, SleeveExplanationResult } from "../types.js";
import { compileSleeveById } from "./compiler-adapter.js";
import { loadBlockMap, loadSleeveById, publicContentRoot } from "./content-loader.js";

const PREVIEW_LIMIT = 96;

function effectiveConfig(config?: PluginConfig) {
  return {
    allowRuntimeWrites: false,
    contentMode: "bundled-public",
    compilerMode: "bundled-adapter",
    debug: false,
    ...config
  };
}

function previewText(block?: PublicBlock): string | null {
  if (!block) return null;
  const text = block.text.replace(/\s+/g, " ").trim();
  return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT - 3)}...` : text;
}

function skippedReason(refEnabled: boolean, block?: PublicBlock): string | null {
  if (!refEnabled) return "disabled block skipped";
  if (!block) return "missing block reference";
  if (block.enabled === false) return "block disabled in library";
  return null;
}

function matrixSummary(includeMatrixSummary: boolean): SleeveExplanationResult["matrix_summary"] {
  if (!includeMatrixSummary) {
    return {
      available: false,
      reason: "matrix summary not requested"
    };
  }

  return {
    available: false,
    reason: "matrix summary helper not implemented in this lane"
  };
}

function invalidSleeveResult(input: {
  sleeveId: string;
  config: ReturnType<typeof effectiveConfig>;
  error: string;
  includeMatrixSummary: boolean;
}): SleeveExplanationResult {
  return {
    ok: false,
    sleeve_id: input.sleeveId,
    title: null,
    snap_id: null,
    primary_shell_block_id: null,
    content_mode: input.config.contentMode,
    compiler_mode: input.config.compilerMode,
    block_refs: [],
    active_blocks: [],
    disabled_blocks: [],
    missing_blocks: [],
    skipped_blocks: [],
    prompt_parts: [],
    tool_requests: [],
    strategy: {},
    constraints: [],
    context: {},
    values: {},
    format: {},
    warnings: [],
    errors: [input.error],
    runtime_spec_boundary: {
      nonExecuting: true,
      status: "valid_non_executing_artifact"
    },
    matrix_summary: matrixSummary(input.includeMatrixSummary)
  };
}

export function explainSleeveById(input: {
  sleeveId: string;
  config?: PluginConfig;
  metaUrl?: string;
  includeRuntimeSpec?: boolean;
  includeMatrixSummary?: boolean;
}): SleeveExplanationResult {
  const cfg = effectiveConfig(input.config);
  const root = publicContentRoot(input.metaUrl ?? import.meta.url);
  const sleeve = loadSleeveById(root, input.sleeveId);
  const includeMatrixSummary = input.includeMatrixSummary === true;

  if (!sleeve) {
    return invalidSleeveResult({
      sleeveId: input.sleeveId,
      config: cfg,
      error: `Unknown sleeve: ${input.sleeveId}`,
      includeMatrixSummary
    });
  }

  const blockMap = loadBlockMap(root);
  const compiled = compileSleeveById(sleeve.sleeve_id, input.config, input.metaUrl ?? import.meta.url);
  const activeSet = new Set(compiled.runtimeSpec.active_blocks);

  const blockRefs = sleeve.block_refs.map((ref) => {
    const block = blockMap.get(ref.block_id);
    const enabled = ref.enabled !== false;
    const reason = skippedReason(enabled, block);
    return {
      block_id: ref.block_id,
      enabled,
      resolved: Boolean(block),
      active: activeSet.has(ref.block_id) && enabled && Boolean(block) && block?.enabled !== false,
      kind: block?.kind ?? null,
      authority: block?.authority ?? null,
      skipped_reason: reason,
      text_preview: previewText(block)
    };
  });

  const disabledBlocks = blockRefs.filter((ref) => !ref.enabled).map((ref) => ref.block_id);
  const missingBlocks = blockRefs.filter((ref) => !ref.resolved).map((ref) => ref.block_id);
  const skippedBlocks = blockRefs
    .filter((ref) => ref.skipped_reason !== null)
    .map((ref) => ({ block_id: ref.block_id, reason: ref.skipped_reason as string }));

  const result: SleeveExplanationResult = {
    ok: compiled.ok,
    sleeve_id: sleeve.sleeve_id,
    title: sleeve.title,
    snap_id: sleeve.snap_id ?? "default",
    primary_shell_block_id: sleeve.primary_shell_block_id,
    content_mode: cfg.contentMode,
    compiler_mode: cfg.compilerMode,
    block_refs: blockRefs,
    active_blocks: compiled.runtimeSpec.active_blocks,
    disabled_blocks: disabledBlocks,
    missing_blocks: missingBlocks,
    skipped_blocks: skippedBlocks,
    prompt_parts: compiled.runtimeSpec.prompt_parts,
    tool_requests: sleeve.tool_requests ?? [],
    strategy: sleeve.strategy ?? {},
    constraints: sleeve.constraints ?? [],
    context: sleeve.context ?? {},
    values: sleeve.values ?? {},
    format: sleeve.format ?? {},
    warnings: compiled.runtimeSpec.warnings,
    errors: compiled.runtimeSpec.errors,
    runtime_spec_boundary: compiled.runtimeSpecBoundary ?? {
      nonExecuting: true,
      status: "valid_non_executing_artifact"
    },
    matrix_summary: matrixSummary(includeMatrixSummary)
  };

  if (input.includeRuntimeSpec === true) {
    result.runtime_spec = compiled.runtimeSpec;
  }

  return result;
}
