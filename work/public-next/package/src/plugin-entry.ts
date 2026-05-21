import fs from "node:fs";
import { Type } from "@sinclair/typebox";
import { compileSleeveById } from "./compiler/compiler-adapter.js";
import { runCompilerSmoke } from "./compiler/compiler-smoke.js";
import { getCompilerMatrixStatus } from "./compiler/compiler-matrix.js";
import { loadSleeves, publicContentRoot, summarizeBlockLibraries } from "./compiler/content-loader.js";
import { validateRuntimeOutput } from "./compiler/runtime-validator.js";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { buildPublicPath } from "./public-path-builder.js";
import { classifyRuntimeToolRequests, clearRuntimeSleeveSession, compileRuntimeSleeve, createRuntimeApprovalCheckpoints, createRuntimeExecutionGatePlan, defaultBlockLibraryRoot, executeApprovedAllowlistedRuntimeAction, getBlockLibraryActiveStackProjection, getBlockLibraryManifestEntryLookup, getBlockLibraryManifestIndex, getBlockLibraryMoltMapCompose, getBlockLibraryMoltMapFragment, getBlockLibraryMoltblockVisibleExtract, getBlockLibraryNeoblockInspect, getBlockLibraryResponseEnvelopeFragment, getBlockLibrarySleeveGraphDrilldown, getBlockLibrarySleeveGraphIndex, getBlockLibraryStatus, getBlockLibraryTargetShallowLoadGate, getBlockLibraryTargetShallowLoadSingle, getBlockLibraryTargetShallowSummaryNormalize, getCurrentRuntimeSleeveSession, inspectRuntimeActiveSleeveIrMatrixEnvelope, inspectRuntimeSleeveSession, previewRuntimeSleeve, resumeRuntimeApprovalCheckpoint, resolveRuntimeSleeveGraph, runBoundedReadOnlyOrchestration, runRuntimeExecutionChainE2EApprovedReadOnly, selectRuntimeSleeve, selectRuntimeSleeveSession } from "./block-library-resolver.js";
import type { PluginConfig } from "./types.js";

function effectiveConfig(config?: PluginConfig) {
  return {
    allowRuntimeWrites: false,
    contentMode: "bundled-public",
    compilerMode: "bundled-adapter",
    debug: false,
    ...config
  };
}

function statusPayload(config?: PluginConfig) {
  const cfg = effectiveConfig(config);
  const root = publicContentRoot(import.meta.url);
  const sleeves = loadSleeves(root);
  const libraries = summarizeBlockLibraries(root);
  return {
    ok: true,
    plugin: "umg-envoy-agent",
    version: "0.3.0-alpha.8",
    compilerAdapter: "available",
    contentMode: cfg.contentMode,
    compilerMode: cfg.compilerMode,
    allowRuntimeWrites: Boolean(cfg.allowRuntimeWrites),
    sampleSleeves: sleeves.length,
    sampleBlocks: libraries.totalBlocks,
    supportedTools: [
      "umg_envoy_status",
      "umg_envoy_compiler_smoke_test",
      "umg_envoy_list_sleeves",
      "umg_envoy_list_block_libraries",
      "umg_envoy_compile_sleeve",
      "umg_envoy_validate_runtime_output",
      "umg_envoy_compare_sleeves",
      "umg_envoy_parse_path",
      "umg_envoy_validate_path",
      "umg_envoy_render_path",
      "umg_envoy_build_path",
      "umg_envoy_matrix_status",
      "umg_envoy_block_library_status",
      "umg_envoy_block_library_manifest_index",
      "umg_envoy_block_library_manifest_entry_lookup",
      "umg_envoy_block_library_target_shallow_load_gate",
      "umg_envoy_block_library_target_shallow_load_single",
      "umg_envoy_block_library_target_shallow_summary_normalize",
      "umg_envoy_block_library_neoblock_inspect",
      "umg_envoy_block_library_moltblock_visible_extract",
      "umg_envoy_block_library_molt_map_fragment",
      "umg_envoy_block_library_molt_map_compose",
      "umg_envoy_block_library_response_envelope_fragment",
      "umg_envoy_block_library_active_stack_projection",
      "umg_envoy_block_library_sleeve_graph_index",
      "umg_envoy_block_library_sleeve_graph_drilldown",
      "umg_envoy_sleeve_select",
      "umg_envoy_sleeve_resolve",
      "umg_envoy_runtime_compile",
      "umg_envoy_runtime_preview",
      "umg_envoy_runtime_bounded_read_only_orchestrate"
    ]
  };
}

function compareSleeves(left: string, right: string, config?: PluginConfig) {
  const leftCompiled = compileSleeveById(left, config, import.meta.url);
  const rightCompiled = compileSleeveById(right, config, import.meta.url);
  return {
    ok: leftCompiled.ok && rightCompiled.ok,
    left: {
      sleeveId: leftCompiled.sleeveId,
      active_blocks: leftCompiled.runtimeSpec.active_blocks,
      prompt_parts: leftCompiled.runtimeSpec.prompt_parts.map((part) => part.block_id)
    },
    right: {
      sleeveId: rightCompiled.sleeveId,
      active_blocks: rightCompiled.runtimeSpec.active_blocks,
      prompt_parts: rightCompiled.runtimeSpec.prompt_parts.map((part) => part.block_id)
    },
    onlyLeftBlocks: leftCompiled.runtimeSpec.active_blocks.filter((id) => !rightCompiled.runtimeSpec.active_blocks.includes(id)),
    onlyRightBlocks: rightCompiled.runtimeSpec.active_blocks.filter((id) => !leftCompiled.runtimeSpec.active_blocks.includes(id))
  };
}

function registerCliBridge(api: any, config?: PluginConfig) {
  api.registerCli(({ program }: { program: any }) => {
    const root = program.command("umg-envoy").description("Public compiler-backed UMG Envoy Agent");

    root.command("status").action(async () => {
      console.log(JSON.stringify(statusPayload(config), null, 2));
    });

    root.command("compiler-smoke").action(async () => {
      console.log(JSON.stringify(runCompilerSmoke(import.meta.url), null, 2));
    });

    root.command("list-sleeves").action(async () => {
      console.log(JSON.stringify(loadSleeves(publicContentRoot(import.meta.url)), null, 2));
    });

    root.command("list-block-libraries").action(async () => {
      console.log(JSON.stringify(summarizeBlockLibraries(publicContentRoot(import.meta.url)), null, 2));
    });

    root.command("compile-sleeve")
      .requiredOption("--sleeve <id>")
      .action(async (opts: { sleeve: string }) => {
        console.log(JSON.stringify(compileSleeveById(opts.sleeve, config, import.meta.url), null, 2));
      });

    root.command("validate-runtime-output")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        console.log(JSON.stringify(validateRuntimeOutput(JSON.parse(fs.readFileSync(opts.file, "utf8"))), null, 2));
      });

    root.command("compare-sleeves")
      .requiredOption("--left <id>")
      .requiredOption("--right <id>")
      .action(async (opts: { left: string; right: string }) => {
        console.log(JSON.stringify(compareSleeves(opts.left, opts.right, config), null, 2));
      });

    root.command("parse-path")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        console.log(JSON.stringify(parseUMGPath(fs.readFileSync(opts.file, "utf8")), null, 2));
      });

    root.command("validate-path")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        const issues = validateUMGPath(parseUMGPath(fs.readFileSync(opts.file, "utf8")));
        console.log(JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2));
      });

    root.command("render-path")
      .requiredOption("--file <path>")
      .action(async (opts: { file: string }) => {
        const raw = fs.readFileSync(opts.file, "utf8");
        const parsed = opts.file.toLowerCase().endsWith(".json") ? JSON.parse(raw) : parseUMGPath(raw);
        console.log(renderUMGPath(parsed));
      });

    root.command("build-path")
      .requiredOption("--message <text>")
      .option("--sleeve <id>")
      .action(async (opts: { message: string; sleeve?: string }) => {
        console.log(renderUMGPath(buildPublicPath(opts.message, opts.sleeve ?? config?.defaultSleeveId ?? "public-basic-envoy")));
      });

    root.command("matrix-status").action(async () => {
      console.log(JSON.stringify(getCompilerMatrixStatus(import.meta.url), null, 2));
    });

    root.command("block-library-status")
      .option("--root <path>")
      .action(async (opts: { root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryStatus("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot()), null, 2));
      });

    root.command("block-library-manifest-index")
      .option("--root <path>")
      .action(async (opts: { root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryManifestIndex("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot()), null, 2));
      });

    root.command("block-library-manifest-entry-lookup")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--no-include-manifest-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { entryId?: string; sourcePath?: string; manifestKind?: any; includeManifestSummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryManifestEntryLookup("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'all', includeManifestSummary: opts.includeManifestSummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-target-shallow-load-gate")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--intended-load-mode <mode>")
      .option("--no-include-entry-summary")
      .option("--root <path>")
      .action(async (opts: { entryId?: string; sourcePath?: string; manifestKind?: any; intendedLoadMode?: string; includeEntrySummary?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryTargetShallowLoadGate("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'all', intendedLoadMode: opts.intendedLoadMode ?? 'shallow', includeEntrySummary: opts.includeEntrySummary !== false }), null, 2));
      });

    root.command("block-library-target-shallow-load-single")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--load-mode <mode>")
      .option("--no-include-content-preview")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { entryId?: string; sourcePath?: string; manifestKind?: any; loadMode?: string; includeContentPreview?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryTargetShallowLoadSingle("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'all', loadMode: opts.loadMode ?? 'shallow_single', includeContentPreview: opts.includeContentPreview !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-target-shallow-summary-normalize")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--summary-profile <profile>")
      .option("--no-include-content-preview")
      .option("--no-include-reference-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryTargetShallowSummaryNormalize("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'all', summaryProfile: opts.summaryProfile ?? 'standard', includeContentPreview: opts.includeContentPreview !== false, includeReferenceSummary: opts.includeReferenceSummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-neoblock-inspect")
      .option("--neoblock-id <id>")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--summary-profile <profile>")
      .option("--no-include-content-preview")
      .option("--no-include-reference-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { neoblockId?: string; entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryNeoblockInspect("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { neoblockId: opts.neoblockId, entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'neoblock', summaryProfile: opts.summaryProfile ?? 'standard', includeContentPreview: opts.includeContentPreview !== false, includeReferenceSummary: opts.includeReferenceSummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-moltblock-visible-extract")
      .option("--neoblock-id <id>")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--summary-profile <profile>")
      .option("--no-include-content-preview")
      .option("--no-include-reference-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { neoblockId?: string; entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryMoltblockVisibleExtract("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { neoblockId: opts.neoblockId, entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'neoblock', summaryProfile: opts.summaryProfile ?? 'standard', includeContentPreview: opts.includeContentPreview !== false, includeReferenceSummary: opts.includeReferenceSummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-molt-map-fragment")
      .option("--neoblock-id <id>")
      .option("--entry-id <id>")
      .option("--source-path <path>")
      .option("--manifest-kind <kind>")
      .option("--summary-profile <profile>")
      .option("--projection-format <format>")
      .option("--no-include-content-preview")
      .option("--no-include-reference-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { neoblockId?: string; entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; projectionFormat?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryMoltMapFragment("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { neoblockId: opts.neoblockId, entryId: opts.entryId, sourcePath: opts.sourcePath, manifestKind: opts.manifestKind ?? 'neoblock', summaryProfile: opts.summaryProfile ?? 'standard', projectionFormat: opts.projectionFormat ?? 'both', includeContentPreview: opts.includeContentPreview !== false, includeReferenceSummary: opts.includeReferenceSummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-molt-map-compose")
      .requiredOption("--neoblock-ids <ids>")
      .option("--manifest-kind <kind>")
      .option("--summary-profile <profile>")
      .option("--projection-format <format>")
      .option("--conflict-policy <policy>")
      .option("--no-include-field-provenance")
      .option("--no-include-content-preview")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { neoblockIds: string; manifestKind?: any; summaryProfile?: string; projectionFormat?: string; conflictPolicy?: string; includeFieldProvenance?: boolean; includeContentPreview?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryMoltMapCompose("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { neoblockIds: String(opts.neoblockIds).split(',').map((v) => v.trim()).filter(Boolean), manifestKind: opts.manifestKind ?? 'neoblock', summaryProfile: opts.summaryProfile ?? 'standard', projectionFormat: opts.projectionFormat ?? 'both', conflictPolicy: opts.conflictPolicy ?? 'report_only', includeFieldProvenance: opts.includeFieldProvenance !== false, includeContentPreview: opts.includeContentPreview !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-response-envelope-fragment")
      .requiredOption("--neoblock-ids <ids>")
      .option("--project <label>")
      .option("--current-state <state>")
      .option("--active-tool <label>")
      .option("--formal-response-content <text>")
      .option("--envoy-intuition <text>")
      .option("--projection-format <format>")
      .option("--no-include-metadata")
      .option("--no-include-audit")
      .option("--active-sleeve <label>")
      .option("--active-stack-boundary <text>")
      .option("--no-include-active-stack-projection")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { neoblockIds: string; project?: string; currentState?: string; activeTool?: string; formalResponseContent?: string; envoyIntuition?: string; projectionFormat?: string; includeMetadata?: boolean; includeAudit?: boolean; activeSleeve?: string; activeStackBoundary?: string; includeActiveStackProjection?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryResponseEnvelopeFragment("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { neoblockIds: String(opts.neoblockIds).split(',').map((v) => v.trim()).filter(Boolean), project: opts.project, currentState: opts.currentState, activeTool: opts.activeTool, formalResponseContent: opts.formalResponseContent, envoyIntuition: opts.envoyIntuition, projectionFormat: opts.projectionFormat ?? 'both', includeMetadata: opts.includeMetadata !== false, includeAudit: opts.includeAudit !== false, activeSleeve: opts.activeSleeve, activeStackBoundary: opts.activeStackBoundary, includeActiveStackProjection: opts.includeActiveStackProjection !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-active-stack-projection")
      .option("--project <label>")
      .option("--current-state <state>")
      .option("--active-tool <label>")
      .option("--source-tool <label>")
      .option("--neoblock-ids <ids>")
      .option("--active-sleeve <label>")
      .option("--boundary <text>")
      .option("--projection-format <format>")
      .option("--no-include-audit")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { project?: string; currentState?: string; activeTool?: string; sourceTool?: string; neoblockIds?: string; activeSleeve?: string; boundary?: string; projectionFormat?: string; includeAudit?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibraryActiveStackProjection("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { project: opts.project, currentState: opts.currentState, activeTool: opts.activeTool, sourceTool: opts.sourceTool, neoblockIds: opts.neoblockIds ? String(opts.neoblockIds).split(',').map((v) => v.trim()).filter(Boolean) : [], activeSleeve: opts.activeSleeve, boundary: opts.boundary, projectionFormat: opts.projectionFormat ?? 'both', includeAudit: opts.includeAudit !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-sleeve-graph-index")
      .option("--sleeve-id <id>")
      .option("--source-catalog <catalog>")
      .option("--projection-format <format>")
      .option("--no-include-reference-summary")
      .option("--no-include-policy-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { sleeveId?: string; sourceCatalog?: string; projectionFormat?: string; includeReferenceSummary?: boolean; includePolicySummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibrarySleeveGraphIndex("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { sleeveId: opts.sleeveId, sourceCatalog: opts.sourceCatalog ?? 'auto', projectionFormat: opts.projectionFormat ?? 'both', includeReferenceSummary: opts.includeReferenceSummary !== false, includePolicySummary: opts.includePolicySummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("block-library-sleeve-graph-drilldown")
      .requiredOption("--sleeve-id <id>")
      .option("--source-catalog <catalog>")
      .option("--projection-format <format>")
      .option("--no-include-policy-summary")
      .option("--no-include-reference-summary")
      .option("--include-raw")
      .option("--root <path>")
      .action(async (opts: { sleeveId: string; sourceCatalog?: string; projectionFormat?: string; includePolicySummary?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) => {
        console.log(JSON.stringify(getBlockLibrarySleeveGraphDrilldown("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { sleeveId: opts.sleeveId, sourceCatalog: opts.sourceCatalog ?? 'auto', projectionFormat: opts.projectionFormat ?? 'summary', includePolicySummary: opts.includePolicySummary !== false, includeReferenceSummary: opts.includeReferenceSummary !== false, includeRaw: Boolean(opts.includeRaw) }), null, 2));
      });

    root.command("sleeve-select")
      .option("--sleeve-id <id>")
      .option("--selection-mode <mode>")
      .option("--persist-selection")
      .option("--runtime-session-id <id>")
      .option("--root <path>")
      .action(async (opts: { sleeveId?: string; selectionMode?: string; persistSelection?: boolean; runtimeSessionId?: string; root?: string }) => {
        console.log(JSON.stringify(selectRuntimeSleeve("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { sleeveId: opts.sleeveId, selectionMode: opts.selectionMode as any, persistSelection: Boolean(opts.persistSelection), runtimeSessionId: opts.runtimeSessionId }), null, 2));
      });

    root.command("sleeve-resolve")
      .option("--sleeve-id <id>")
      .option("--runtime-session-id <id>")
      .option("--resolve-depth <depth>")
      .option("--max-neostacks <n>")
      .option("--max-neoblocks <n>")
      .option("--max-visible-molt-fragments <n>")
      .option("--allow-recursive")
      .option("--mode <mode>")
      .option("--root <path>")
      .action(async (opts: { sleeveId?: string; runtimeSessionId?: string; resolveDepth?: string; maxNeostacks?: string; maxNeoblocks?: string; maxVisibleMoltFragments?: string; allowRecursive?: boolean; mode?: string; root?: string }) => {
        console.log(JSON.stringify(resolveRuntimeSleeveGraph("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { sleeveId: opts.sleeveId, runtimeSessionId: opts.runtimeSessionId, resolveDepth: opts.resolveDepth as any, maxNeoStacks: opts.maxNeostacks ? Number(opts.maxNeostacks) : undefined, maxNeoBlocks: opts.maxNeoblocks ? Number(opts.maxNeoblocks) : undefined, maxVisibleMoltFragments: opts.maxVisibleMoltFragments ? Number(opts.maxVisibleMoltFragments) : undefined, allowRecursive: Boolean(opts.allowRecursive), mode: opts.mode ?? 'dry_run' }), null, 2));
      });

    root.command("runtime-compile")
      .option("--sleeve-id <id>")
      .option("--runtime-session-id <id>")
      .option("--resolve-depth <depth>")
      .option("--strictness <strictness>")
      .option("--compile-mode <mode>")
      .option("--root <path>")
      .action(async (opts: { sleeveId?: string; runtimeSessionId?: string; resolveDepth?: string; strictness?: string; compileMode?: string; root?: string }) => {
        console.log(JSON.stringify(compileRuntimeSleeve("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { sleeveId: opts.sleeveId, runtimeSessionId: opts.runtimeSessionId, resolveDepth: opts.resolveDepth as any, strictness: opts.strictness as any, compileMode: opts.compileMode ?? 'dry_run' }), null, 2));
      });

    root.command("runtime-preview")
      .option("--sleeve-id <id>")
      .option("--runtime-session-id <id>")
      .option("--preview-format <format>")
      .option("--no-include-active-stack")
      .option("--no-include-molt-map")
      .option("--no-include-envelope")
      .option("--no-include-tool-requests")
      .option("--root <path>")
      .action(async (opts: { sleeveId?: string; runtimeSessionId?: string; previewFormat?: string; includeActiveStack?: boolean; includeMoltMap?: boolean; includeEnvelope?: boolean; includeToolRequests?: boolean; root?: string }) => {
        console.log(JSON.stringify(previewRuntimeSleeve("0.3.0-alpha.8", "dist/plugin-entry.js", opts.root ?? defaultBlockLibraryRoot(), { sleeveId: opts.sleeveId, runtimeSessionId: opts.runtimeSessionId, previewFormat: opts.previewFormat as any, includeActiveStack: opts.includeActiveStack !== false, includeMoltMap: opts.includeMoltMap !== false, includeEnvelope: opts.includeEnvelope !== false, includeToolRequests: opts.includeToolRequests !== false }), null, 2));
      });
  }, { commands: ["umg-envoy"] });
}

const entry = {
  id: "umg-envoy-agent",
  name: "UMG Envoy Agent",
  description: "Public compiler-backed UMG Envoy Agent for OpenClaw",
  register(api: { registerTool: (definition: any, options?: { optional?: boolean }) => void; registerCli?: (register: any, options?: { commands?: string[] }) => void }, config?: PluginConfig) {
    registerCliBridge(api, config);

    api.registerTool({ name: "umg_envoy_status", description: "Report compiler-backed public package status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(statusPayload(config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_compiler_smoke_test", description: "Run bundled public compiler smoke tests.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(runCompilerSmoke(import.meta.url), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_list_sleeves", description: "List bundled public sleeves.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(loadSleeves(publicContentRoot(import.meta.url)), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_list_block_libraries", description: "Summarize bundled public block libraries.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(summarizeBlockLibraries(publicContentRoot(import.meta.url)), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_compile_sleeve", description: "Compile a bundled public sleeve into RuntimeSpec-like output.", parameters: Type.Object({ sleeveId: Type.String() }, { additionalProperties: false }), async execute(input: { sleeveId: string }) { return { content: [{ type: "text", text: JSON.stringify(compileSleeveById(input.sleeveId, config, import.meta.url), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_validate_runtime_output", description: "Validate RuntimeSpec-like output.", parameters: Type.Object({ runtimeOutput: Type.Any() }, { additionalProperties: false }), async execute(input: { runtimeOutput: unknown }) { return { content: [{ type: "text", text: JSON.stringify(validateRuntimeOutput(input.runtimeOutput), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_compare_sleeves", description: "Compare two bundled public sleeves.", parameters: Type.Object({ left: Type.String(), right: Type.String() }, { additionalProperties: false }), async execute(input: { left: string; right: string }) { return { content: [{ type: "text", text: JSON.stringify(compareSleeves(input.left, input.right, config), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_parse_path", description: "Parse a UMG path string.", parameters: Type.Object({ source: Type.String() }, { additionalProperties: false }), async execute(input: { source: string }) { return { content: [{ type: "text", text: JSON.stringify(parseUMGPath(input.source), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_validate_path", description: "Validate a parsed UMG path string.", parameters: Type.Object({ source: Type.String() }, { additionalProperties: false }), async execute(input: { source: string }) { const issues = validateUMGPath(parseUMGPath(input.source)); return { content: [{ type: "text", text: JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_render_path", description: "Render a parsed UMG path string back to text.", parameters: Type.Object({ source: Type.String() }, { additionalProperties: false }), async execute(input: { source: string }) { return { content: [{ type: "text", text: renderUMGPath(parseUMGPath(input.source)) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_build_path", description: "Build a public-safe UMG path document.", parameters: Type.Object({ message: Type.String(), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { message: string; sleeveId?: string }) { return { content: [{ type: "text", text: renderUMGPath(buildPublicPath(input.message, input.sleeveId ?? config?.defaultSleeveId ?? "public-basic-envoy")) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_matrix_status", description: "Report bundled compiler matrix status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(getCompilerMatrixStatus(import.meta.url), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_status", description: "Report read-only real UMG Block Library resolver status for the official alpha6 runtime.", parameters: Type.Object({ root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryStatus("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot()), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_manifest_index", description: "Inspect approved block-library manifest/index files without loading target payloads.", parameters: Type.Object({ root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryManifestIndex("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot()), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_manifest_entry_lookup", description: "Look up a single manifest/index entry without loading the target payload.", parameters: Type.Object({ entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), includeManifestSummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { entryId?: string; sourcePath?: string; manifestKind?: any; includeManifestSummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryManifestEntryLookup("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'all', includeManifestSummary: input.includeManifestSummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_target_shallow_load_gate", description: "Determine whether a manifest-indexed target is eligible for future shallow loading without loading the payload.", parameters: Type.Object({ entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), intendedLoadMode: Type.Optional(Type.String()), includeEntrySummary: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { entryId?: string; sourcePath?: string; manifestKind?: any; intendedLoadMode?: string; includeEntrySummary?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryTargetShallowLoadGate("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'all', intendedLoadMode: input.intendedLoadMode ?? 'shallow', includeEntrySummary: input.includeEntrySummary !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_target_shallow_load_single", description: "Shallow-load exactly one gate-approved target payload and return a bounded summary.", parameters: Type.Object({ entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), loadMode: Type.Optional(Type.String()), includeContentPreview: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { entryId?: string; sourcePath?: string; manifestKind?: any; loadMode?: string; includeContentPreview?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryTargetShallowLoadSingle("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'all', loadMode: input.loadMode ?? 'shallow_single', includeContentPreview: input.includeContentPreview !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_target_shallow_summary_normalize", description: "Return a stable normalized summary for one shallow-loaded target payload.", parameters: Type.Object({ entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), summaryProfile: Type.Optional(Type.String()), includeContentPreview: Type.Optional(Type.Boolean()), includeReferenceSummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryTargetShallowSummaryNormalize("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'all', summaryProfile: input.summaryProfile ?? 'standard', includeContentPreview: input.includeContentPreview !== false, includeReferenceSummary: input.includeReferenceSummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_neoblock_inspect", description: "Inspect exactly one gate-approved NeoBlock without recursively loading references.", parameters: Type.Object({ neoblockId: Type.Optional(Type.String()), entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), summaryProfile: Type.Optional(Type.String()), includeContentPreview: Type.Optional(Type.Boolean()), includeReferenceSummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { neoblockId?: string; entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryNeoblockInspect("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { neoblockId: input.neoblockId, entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'neoblock', summaryProfile: input.summaryProfile ?? 'standard', includeContentPreview: input.includeContentPreview !== false, includeReferenceSummary: input.includeReferenceSummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_moltblock_visible_extract", description: "Extract visible MOLT-shaped data from exactly one inspected NeoBlock without loading external MOLT blocks.", parameters: Type.Object({ neoblockId: Type.Optional(Type.String()), entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), summaryProfile: Type.Optional(Type.String()), includeContentPreview: Type.Optional(Type.Boolean()), includeReferenceSummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { neoblockId?: string; entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryMoltblockVisibleExtract("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { neoblockId: input.neoblockId, entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'neoblock', summaryProfile: input.summaryProfile ?? 'standard', includeContentPreview: input.includeContentPreview !== false, includeReferenceSummary: input.includeReferenceSummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_molt_map_fragment", description: "Project one visible MOLT extraction into a normalized single-field MOLT Map fragment.", parameters: Type.Object({ neoblockId: Type.Optional(Type.String()), entryId: Type.Optional(Type.String()), sourcePath: Type.Optional(Type.String()), manifestKind: Type.Optional(Type.String()), summaryProfile: Type.Optional(Type.String()), projectionFormat: Type.Optional(Type.String()), includeContentPreview: Type.Optional(Type.Boolean()), includeReferenceSummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { neoblockId?: string; entryId?: string; sourcePath?: string; manifestKind?: any; summaryProfile?: string; projectionFormat?: string; includeContentPreview?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryMoltMapFragment("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { neoblockId: input.neoblockId, entryId: input.entryId, sourcePath: input.sourcePath, manifestKind: input.manifestKind ?? 'neoblock', summaryProfile: input.summaryProfile ?? 'standard', projectionFormat: input.projectionFormat ?? 'both', includeContentPreview: input.includeContentPreview !== false, includeReferenceSummary: input.includeReferenceSummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_molt_map_compose", description: "Compose a full seven-field MOLT Map from an explicit list of NeoBlock ids using the fragment path.", parameters: Type.Object({ neoblockIds: Type.Array(Type.String()), manifestKind: Type.Optional(Type.String()), summaryProfile: Type.Optional(Type.String()), projectionFormat: Type.Optional(Type.String()), conflictPolicy: Type.Optional(Type.String()), includeFieldProvenance: Type.Optional(Type.Boolean()), includeContentPreview: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { neoblockIds: string[]; manifestKind?: any; summaryProfile?: string; projectionFormat?: string; conflictPolicy?: string; includeFieldProvenance?: boolean; includeContentPreview?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryMoltMapCompose("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { neoblockIds: input.neoblockIds, manifestKind: input.manifestKind ?? 'neoblock', summaryProfile: input.summaryProfile ?? 'standard', projectionFormat: input.projectionFormat ?? 'both', conflictPolicy: input.conflictPolicy ?? 'report_only', includeFieldProvenance: input.includeFieldProvenance !== false, includeContentPreview: input.includeContentPreview !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_response_envelope_fragment", description: "Render a UMG-style response envelope fragment from an explicit normalized MOLT Map composition.", parameters: Type.Object({ neoblockIds: Type.Array(Type.String()), project: Type.Optional(Type.String()), currentState: Type.Optional(Type.String()), activeTool: Type.Optional(Type.String()), formalResponseContent: Type.Optional(Type.String()), envoyIntuition: Type.Optional(Type.String()), projectionFormat: Type.Optional(Type.String()), includeMetadata: Type.Optional(Type.Boolean()), includeAudit: Type.Optional(Type.Boolean()), activeSleeve: Type.Optional(Type.String()), activeStackBoundary: Type.Optional(Type.String()), includeActiveStackProjection: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { neoblockIds: string[]; project?: string; currentState?: string; activeTool?: string; formalResponseContent?: string; envoyIntuition?: string; projectionFormat?: string; includeMetadata?: boolean; includeAudit?: boolean; activeSleeve?: string; activeStackBoundary?: string; includeActiveStackProjection?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryResponseEnvelopeFragment("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { neoblockIds: input.neoblockIds, project: input.project, currentState: input.currentState, activeTool: input.activeTool, formalResponseContent: input.formalResponseContent, envoyIntuition: input.envoyIntuition, projectionFormat: input.projectionFormat ?? 'both', includeMetadata: input.includeMetadata !== false, includeAudit: input.includeAudit !== false, activeSleeve: input.activeSleeve, activeStackBoundary: input.activeStackBoundary, includeActiveStackProjection: input.includeActiveStackProjection !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_active_stack_projection", description: "Render a normalized Active Stack projection from explicit runtime state and optional normalized composer context.", parameters: Type.Object({ project: Type.Optional(Type.String()), currentState: Type.Optional(Type.String()), activeTool: Type.Optional(Type.String()), sourceTool: Type.Optional(Type.String()), neoblockIds: Type.Optional(Type.Array(Type.String())), activeSleeve: Type.Optional(Type.String()), boundary: Type.Optional(Type.String()), projectionFormat: Type.Optional(Type.String()), includeAudit: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { project?: string; currentState?: string; activeTool?: string; sourceTool?: string; neoblockIds?: string[]; activeSleeve?: string; boundary?: string; projectionFormat?: string; includeAudit?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibraryActiveStackProjection("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { project: input.project, currentState: input.currentState, activeTool: input.activeTool, sourceTool: input.sourceTool, neoblockIds: input.neoblockIds ?? [], activeSleeve: input.activeSleeve, boundary: input.boundary, projectionFormat: input.projectionFormat ?? 'both', includeAudit: input.includeAudit !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_sleeve_graph_index", description: "Index approved sleeve catalog references into a normalized read-only sleeve graph summary without activation.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), sourceCatalog: Type.Optional(Type.String()), projectionFormat: Type.Optional(Type.String()), includeReferenceSummary: Type.Optional(Type.Boolean()), includePolicySummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; sourceCatalog?: string; projectionFormat?: string; includeReferenceSummary?: boolean; includePolicySummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibrarySleeveGraphIndex("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, sourceCatalog: input.sourceCatalog ?? 'auto', projectionFormat: input.projectionFormat ?? 'both', includeReferenceSummary: input.includeReferenceSummary !== false, includePolicySummary: input.includePolicySummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_block_library_sleeve_graph_drilldown", description: "Return a focused normalized drilldown for one sleeve from the sleeve graph index.", parameters: Type.Object({ sleeveId: Type.String(), sourceCatalog: Type.Optional(Type.String()), projectionFormat: Type.Optional(Type.String()), includePolicySummary: Type.Optional(Type.Boolean()), includeReferenceSummary: Type.Optional(Type.Boolean()), includeRaw: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId: string; sourceCatalog?: string; projectionFormat?: string; includePolicySummary?: boolean; includeReferenceSummary?: boolean; includeRaw?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getBlockLibrarySleeveGraphDrilldown("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, sourceCatalog: input.sourceCatalog ?? 'auto', projectionFormat: input.projectionFormat ?? 'summary', includePolicySummary: input.includePolicySummary !== false, includeReferenceSummary: input.includeReferenceSummary !== false, includeRaw: Boolean(input.includeRaw) }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_sleeve_select", description: "Select or query the active runtime sleeve in scoped session state.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), selectionMode: Type.Optional(Type.String()), persistSelection: Type.Optional(Type.Boolean()), runtimeSessionId: Type.Optional(Type.String()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; selectionMode?: string; persistSelection?: boolean; runtimeSessionId?: string; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(selectRuntimeSleeve("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, selectionMode: input.selectionMode as any, persistSelection: Boolean(input.persistSelection), runtimeSessionId: input.runtimeSessionId }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_sleeve_resolve", description: "Resolve a selected or explicit sleeve into a bounded dry-run runtime graph.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), runtimeSessionId: Type.Optional(Type.String()), resolveDepth: Type.Optional(Type.String()), maxNeoStacks: Type.Optional(Type.Number()), maxNeoBlocks: Type.Optional(Type.Number()), maxVisibleMoltFragments: Type.Optional(Type.Number()), allowRecursive: Type.Optional(Type.Boolean()), mode: Type.Optional(Type.String()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; runtimeSessionId?: string; resolveDepth?: string; maxNeoStacks?: number; maxNeoBlocks?: number; maxVisibleMoltFragments?: number; allowRecursive?: boolean; mode?: string; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(resolveRuntimeSleeveGraph("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, runtimeSessionId: input.runtimeSessionId, resolveDepth: input.resolveDepth as any, maxNeoStacks: input.maxNeoStacks, maxNeoBlocks: input.maxNeoBlocks, maxVisibleMoltFragments: input.maxVisibleMoltFragments, allowRecursive: Boolean(input.allowRecursive), mode: input.mode ?? 'dry_run' }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_compile", description: "Compile a resolved sleeve graph into a dry-run RuntimeSpecV0.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), runtimeSessionId: Type.Optional(Type.String()), useSelectedSleeve: Type.Optional(Type.Boolean()), compileMode: Type.Optional(Type.String()), resolveDepth: Type.Optional(Type.String()), strictness: Type.Optional(Type.String()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; runtimeSessionId?: string; useSelectedSleeve?: boolean; compileMode?: string; resolveDepth?: string; strictness?: string; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(compileRuntimeSleeve("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, runtimeSessionId: input.runtimeSessionId, useSelectedSleeve: input.useSelectedSleeve !== false, compileMode: input.compileMode ?? 'dry_run', resolveDepth: input.resolveDepth as any, strictness: input.strictness as any }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_preview", description: "Produce a coherent dry-run runtime preview from a selected or explicit real sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), runtimeSessionId: Type.Optional(Type.String()), previewFormat: Type.Optional(Type.String()), includeActiveStack: Type.Optional(Type.Boolean()), includeMoltMap: Type.Optional(Type.Boolean()), includeEnvelope: Type.Optional(Type.Boolean()), includeToolRequests: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; runtimeSessionId?: string; previewFormat?: string; includeActiveStack?: boolean; includeMoltMap?: boolean; includeEnvelope?: boolean; includeToolRequests?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(previewRuntimeSleeve("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, runtimeSessionId: input.runtimeSessionId, previewFormat: input.previewFormat as any, includeActiveStack: input.includeActiveStack !== false, includeMoltMap: input.includeMoltMap !== false, includeEnvelope: input.includeEnvelope !== false, includeToolRequests: input.includeToolRequests !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_tool_request_classify", description: "Classify RuntimeSpecV0 tool requests without executing them.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), runtimeSpec: Type.Optional(Type.Any()), compileIfMissing: Type.Optional(Type.Boolean()), requestedToolName: Type.Optional(Type.String()), mode: Type.Optional(Type.String()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; runtimeSpec?: any; compileIfMissing?: boolean; requestedToolName?: string; mode?: string; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(classifyRuntimeToolRequests("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, runtimeSpec: input.runtimeSpec, compileIfMissing: input.compileIfMissing !== false, requestedToolName: input.requestedToolName, mode: input.mode as any, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_execution_gate_plan", description: "Create a non-executing Alpha7 runtime execution gate plan from RuntimeSpecV0 tool requests and/or classifications.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), runtimeSpec: Type.Optional(Type.Any()), classifications: Type.Optional(Type.Array(Type.Any())), compileIfMissing: Type.Optional(Type.Boolean()), classifyIfMissing: Type.Optional(Type.Boolean()), mode: Type.Optional(Type.String()), includeTrace: Type.Optional(Type.Boolean()), includeCheckpointPreview: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; runtimeSpec?: any; classifications?: any[]; compileIfMissing?: boolean; classifyIfMissing?: boolean; mode?: string; includeTrace?: boolean; includeCheckpointPreview?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(createRuntimeExecutionGatePlan("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, runtimeSpec: input.runtimeSpec, classifications: input.classifications as any, compileIfMissing: input.compileIfMissing !== false, classifyIfMissing: input.classifyIfMissing !== false, mode: input.mode as any, includeTrace: input.includeTrace !== false, includeCheckpointPreview: input.includeCheckpointPreview !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_approval_checkpoint_create", description: "Create non-persistent approval checkpoint records from approval-required gate plan actions without executing them.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), runtimeSpec: Type.Optional(Type.Any()), classifications: Type.Optional(Type.Array(Type.Any())), gatePlan: Type.Optional(Type.Any()), createForRequestIds: Type.Optional(Type.Array(Type.String())), mode: Type.Optional(Type.String()), includeTrace: Type.Optional(Type.Boolean()), storageMode: Type.Optional(Type.String()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; runtimeSpec?: any; classifications?: any[]; gatePlan?: any; createForRequestIds?: string[]; mode?: string; includeTrace?: boolean; storageMode?: string; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(createRuntimeApprovalCheckpoints("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, runtimeSpec: input.runtimeSpec, classifications: input.classifications as any, gatePlan: input.gatePlan as any, createForRequestIds: input.createForRequestIds, mode: input.mode as any, includeTrace: input.includeTrace !== false, storageMode: input.storageMode as any }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_approval_checkpoint_resume", description: "Resume a returned approval checkpoint projection with an explicit decision, without executing the requested action.", parameters: Type.Object({ checkpoint: Type.Optional(Type.Any()), resumeToken: Type.Optional(Type.String()), decision: Type.String(), editedArgsPreview: Type.Optional(Type.Any()), decisionReason: Type.Optional(Type.String()), mode: Type.Optional(Type.String()), includeTrace: Type.Optional(Type.Boolean()) }, { additionalProperties: false }), async execute(input: { checkpoint?: any; resumeToken?: string; decision: 'approve' | 'deny' | 'edit' | 'dry_run_only'; editedArgsPreview?: unknown; decisionReason?: string; mode?: string; includeTrace?: boolean }) { return { content: [{ type: "text", text: JSON.stringify(resumeRuntimeApprovalCheckpoint("0.3.0-alpha.8", "dist/plugin-entry.js", { checkpoint: input.checkpoint as any, resumeToken: input.resumeToken, decision: input.decision, editedArgsPreview: input.editedArgsPreview, decisionReason: input.decisionReason, mode: input.mode as any, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_execute_approved_allowlisted", description: "Execute an approved allowlisted read-only runtime action with strict internal dispatch only.", parameters: Type.Object({ checkpoint: Type.Optional(Type.Any()), resumeResult: Type.Optional(Type.Any()), runtimeSpec: Type.Optional(Type.Any()), gatePlan: Type.Optional(Type.Any()), actionArgs: Type.Optional(Type.Any()), mode: Type.Optional(Type.String()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { checkpoint?: any; resumeResult?: any; runtimeSpec?: any; gatePlan?: any; actionArgs?: unknown; mode?: string; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(executeApprovedAllowlistedRuntimeAction("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { checkpoint: input.checkpoint as any, resumeResult: input.resumeResult as any, runtimeSpec: input.runtimeSpec as any, gatePlan: input.gatePlan as any, actionArgs: input.actionArgs, mode: input.mode as any, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_execution_chain_e2e_approved_read_only", description: "Run the full Alpha7 controlled execution chain from dry-run runtime path through approved allowlisted read-only execution.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), requestedToolName: Type.Optional(Type.String()), requestedAction: Type.Optional(Type.String()), approvalDecision: Type.Optional(Type.String()), mode: Type.Optional(Type.String()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; requestedToolName?: string; requestedAction?: string; approvalDecision?: 'approve' | 'deny' | 'dry_run_only'; mode?: string; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(runRuntimeExecutionChainE2EApprovedReadOnly("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, requestedToolName: input.requestedToolName, requestedAction: input.requestedAction, approvalDecision: input.approvalDecision as any, mode: input.mode as any, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect", description: "Inspect the active sleeve, NeoStacks, NeoBlocks, MOLT map, RuntimeSpec, IR matrix route, envelope preview, and execution gate state without executing anything.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), includeNeoStacks: Type.Optional(Type.Boolean()), includeNeoBlocks: Type.Optional(Type.Boolean()), includeMoltBlocks: Type.Optional(Type.Boolean()), includeRuntimeSpec: Type.Optional(Type.Boolean()), includeIrMatrix: Type.Optional(Type.Boolean()), includeEnvelope: Type.Optional(Type.Boolean()), includeExecutionGateState: Type.Optional(Type.Boolean()), mode: Type.Optional(Type.String()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; includeNeoStacks?: boolean; includeNeoBlocks?: boolean; includeMoltBlocks?: boolean; includeRuntimeSpec?: boolean; includeIrMatrix?: boolean; includeEnvelope?: boolean; includeExecutionGateState?: boolean; mode?: string; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(inspectRuntimeActiveSleeveIrMatrixEnvelope("0.3.0-alpha.8", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, includeNeoStacks: input.includeNeoStacks !== false, includeNeoBlocks: input.includeNeoBlocks !== false, includeMoltBlocks: input.includeMoltBlocks !== false, includeRuntimeSpec: input.includeRuntimeSpec !== false, includeIrMatrix: input.includeIrMatrix !== false, includeEnvelope: input.includeEnvelope !== false, includeExecutionGateState: input.includeExecutionGateState !== false, mode: input.mode as any }), null, 2) }] }; } }, { optional: true });
    api.registerTool({ name: "umg_envoy_sleeve_session_select", description: "Select a sleeve for the current UMG runtime session without executing anything.", parameters: Type.Object({ sleeveId: Type.String(), selectionReason: Type.Optional(Type.String()), persistenceMode: Type.Optional(Type.String()), includeInspection: Type.Optional(Type.Boolean()), includeRuntimePreview: Type.Optional(Type.Boolean()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId: string; selectionReason?: string; persistenceMode?: 'memory_only' | 'request_scoped' | 'disabled'; includeInspection?: boolean; includeRuntimePreview?: boolean; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(selectRuntimeSleeveSession("0.3.0-alpha.10", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, selectionReason: input.selectionReason, persistenceMode: input.persistenceMode as any, includeInspection: input.includeInspection !== false, includeRuntimePreview: input.includeRuntimePreview !== false, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
api.registerTool({ name: "umg_envoy_sleeve_session_current", description: "Return current explicit active sleeve session state without executing anything.", parameters: Type.Object({ includeInspection: Type.Optional(Type.Boolean()), includeRuntimePreview: Type.Optional(Type.Boolean()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { includeInspection?: boolean; includeRuntimePreview?: boolean; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(getCurrentRuntimeSleeveSession("0.3.0-alpha.10", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { includeInspection: input.includeInspection !== false, includeRuntimePreview: input.includeRuntimePreview !== false, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
api.registerTool({ name: "umg_envoy_sleeve_session_clear", description: "Clear explicit active sleeve session state without touching files or runtime execution.", parameters: Type.Object({ clearReason: Type.Optional(Type.String()), includePreviousState: Type.Optional(Type.Boolean()), includeTrace: Type.Optional(Type.Boolean()) }, { additionalProperties: false }), async execute(input: { clearReason?: string; includePreviousState?: boolean; includeTrace?: boolean }) { return { content: [{ type: "text", text: JSON.stringify(clearRuntimeSleeveSession({ clearReason: input.clearReason, includePreviousState: input.includePreviousState !== false, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
api.registerTool({ name: "umg_envoy_sleeve_session_inspect", description: "Inspect active sleeve session state plus sleeve/runtime details without silently selecting a sleeve.", parameters: Type.Object({ includeNeoStacks: Type.Optional(Type.Boolean()), includeNeoBlocks: Type.Optional(Type.Boolean()), includeMoltBlocks: Type.Optional(Type.Boolean()), includeRuntimeSpec: Type.Optional(Type.Boolean()), includeIrMatrix: Type.Optional(Type.Boolean()), includeEnvelope: Type.Optional(Type.Boolean()), includeExecutionGateState: Type.Optional(Type.Boolean()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { includeNeoStacks?: boolean; includeNeoBlocks?: boolean; includeMoltBlocks?: boolean; includeRuntimeSpec?: boolean; includeIrMatrix?: boolean; includeEnvelope?: boolean; includeExecutionGateState?: boolean; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(inspectRuntimeSleeveSession("0.3.0-alpha.10", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { includeNeoStacks: input.includeNeoStacks !== false, includeNeoBlocks: input.includeNeoBlocks !== false, includeMoltBlocks: input.includeMoltBlocks !== false, includeRuntimeSpec: input.includeRuntimeSpec !== false, includeIrMatrix: input.includeIrMatrix !== false, includeEnvelope: input.includeEnvelope !== false, includeExecutionGateState: input.includeExecutionGateState !== false, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
api.registerTool({ name: "umg_envoy_runtime_bounded_read_only_orchestrate", description: "Compose the proven Alpha7 inspector, preview, classification, gate, checkpoint, and tiny allowlisted read-only execution path into one bounded orchestration report.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), useActiveSessionSleeve: Type.Optional(Type.Boolean()), selectSession: Type.Optional(Type.Boolean()), requestedToolName: Type.Optional(Type.String()), requestedAction: Type.Optional(Type.String()), approvalDecision: Type.Optional(Type.String()), mode: Type.Optional(Type.String()), includeInspector: Type.Optional(Type.Boolean()), includeRuntimePreview: Type.Optional(Type.Boolean()), includeIrMatrix: Type.Optional(Type.Boolean()), includeEnvelope: Type.Optional(Type.Boolean()), includeExecutionGateState: Type.Optional(Type.Boolean()), includeTrace: Type.Optional(Type.Boolean()), root: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input: { sleeveId?: string; useActiveSessionSleeve?: boolean; selectSession?: boolean; requestedToolName?: string; requestedAction?: string; approvalDecision?: 'approve' | 'deny' | 'edit' | 'dry_run_only'; mode?: string; includeInspector?: boolean; includeRuntimePreview?: boolean; includeIrMatrix?: boolean; includeEnvelope?: boolean; includeExecutionGateState?: boolean; includeTrace?: boolean; root?: string }) { return { content: [{ type: "text", text: JSON.stringify(runBoundedReadOnlyOrchestration("0.3.0-alpha.10", "dist/plugin-entry.js", input.root ?? defaultBlockLibraryRoot(), { sleeveId: input.sleeveId, useActiveSessionSleeve: input.useActiveSessionSleeve !== false, selectSession: input.selectSession === true, requestedToolName: input.requestedToolName, requestedAction: input.requestedAction, approvalDecision: input.approvalDecision as any, mode: input.mode as any, includeInspector: input.includeInspector !== false, includeRuntimePreview: input.includeRuntimePreview !== false, includeIrMatrix: input.includeIrMatrix !== false, includeEnvelope: input.includeEnvelope !== false, includeExecutionGateState: input.includeExecutionGateState !== false, includeTrace: input.includeTrace !== false }), null, 2) }] }; } }, { optional: true });
  }
};

if (process.argv.includes("--smoke")) {
  console.log(JSON.stringify(runCompilerSmoke(import.meta.url), null, 2));
}

export default entry;


