import fs from "node:fs";
import path from "node:path";
import { Type } from "@sinclair/typebox";
import { compileSleeveById } from "./compiler/compiler-adapter.js";
import { runCompilerSmoke } from "./compiler/compiler-smoke.js";
import { getCompilerMatrixStatus } from "./compiler/compiler-matrix.js";
import { loadSleeves, publicContentRoot, summarizeBlockLibraries } from "./compiler/content-loader.js";
import { validateRuntimeOutput } from "./compiler/runtime-validator.js";
import { loadSleeveFile } from "./compiler/sleeve-loader.js";
import { validateSleeveStructure } from "./compiler/sleeve-schema-validator.js";
import { resolveSleeveArtifacts } from "./compiler/artifact-resolver.js";
import { runCompilerBridge } from "./compiler/compiler-bridge.js";
import { emitRelationMatrix } from "./compiler/relation-matrix-emitter.js";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { buildPublicPath } from "./public-path-builder.js";
import { invokeLangChainBridge, filterTools } from "./langchain-bridge-adapter.js";
import { runMinimalLangChainAgent } from "./langchain-agent-wrapper.js";
import { createApprovalResumeContract } from "./approval-resume-contract.js";
import { executeApprovalResume } from "./approval-resume-executor.js";
import { decideApprovalCheckpoint, getApprovalCheckpoint, listApprovalCheckpoints } from "./approval-store.js";
import { loadMcpBridgeConfig, validateMcpBridgeConfig } from "./mcp-bridge-config.js";
import { discoverMcpTools, listMcpServers } from "./mcp-bridge-scaffold.js";
import { createMcpToolCandidate } from "./mcp-tool-candidate.js";
import { classifyMcpToolCandidate } from "./mcp-permission-mapper.js";
import { createMcpCapabilitySummary } from "./mcp-capability-summary.js";
import { loadBlockLibraryConfig } from "./resolver/block-library-config.js";
import { UMGResolver } from "./resolver/resolver.js";
import { buildRegistry } from "./resolver/indexer.js";
import { searchRegistry } from "./resolver/search.js";
import { compileRuntimeSpecDryRun } from "./runtime-spec/compiler.js";
import { buildRuntimeVisibilityHeader } from "./runtime-spec/visibility.js";
import { buildRuntimeMOLTMap } from "./runtime-spec/molt-map.js";
import { loadNeostackFile } from "./compiler/neostack-loader.js";
import { resolveNeostackArtifacts, validateNeostackStructure } from "./compiler/neostack-validator.js";
import type { CompilerInputPreview, LangChainBridgePayload, PluginConfig, SleeveLoadResult, NeostackLoadResult } from "./types.js";

function effectiveConfig(config?: PluginConfig) {
  return {
    allowRuntimeWrites: false,
    contentMode: "bundled-public",
    compilerMode: "bundled-adapter",
    debug: false,
    ...config
  };
}

function resolverFoundationStatus() {
  const config = loadBlockLibraryConfig();
  const resolver = new UMGResolver(config, path.dirname(new URL(import.meta.url).pathname));
  const registry = buildRegistry(resolver);
  return {
    config,
    source_mode: resolver.status().source_mode,
    configured_sources: resolver.status().configured_sources,
    existing_sources: resolver.status().existing_sources,
    missing_sources: resolver.status().missing_sources,
    artifact_counts_by_kind: registry.counts.by_kind,
    artifact_counts_by_source_kind: registry.counts.by_source_kind,
    artifact_counts_by_status: registry.counts.by_status,
    artifact_counts_by_discovery_method: registry.counts.by_discovery_method,
    canonical_count: registry.counts.canonical_count,
    non_canonical_count: registry.counts.non_canonical_count,
    sample_count: registry.counts.sample_count,
    human_support_count: registry.counts.human_support_count,
    duplicate_count: registry.counts.duplicate_count,
    warning_count: registry.counts.warning_count,
    total_artifacts: registry.artifacts.length,
    support_artifact_count: registry.support_artifacts.length,
    duplicate_report: registry.duplicate_report.slice(0, 25),
    warnings: registry.warnings
  };
}

function statusPayload(config?: PluginConfig) {
  const cfg = effectiveConfig(config);
  const root = publicContentRoot(import.meta.url);
  const sleeves = loadSleeves(root);
  const libraries = summarizeBlockLibraries(root);
  const resolverStatus = resolverFoundationStatus();
  return {
    ok: true,
    plugin: "umg-envoy-agent",
    version: "0.2.8",
    compilerAdapter: "available",
    contentMode: cfg.contentMode,
    compilerMode: cfg.compilerMode,
    allowRuntimeWrites: Boolean(cfg.allowRuntimeWrites),
    sampleSleeves: sleeves.length,
    sampleBlocks: libraries.totalBlocks,
    resolverFoundation: resolverStatus,
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
      "umg_envoy_load_sleeve",
      "umg_envoy_compile_ir_bridge",
      "umg_envoy_emit_relation_matrix",
      "umg_envoy_neostack_inspect",
      "umg_envoy_neostack_validate",
      "umg_envoy_neostack_invoke",
      "umg_envoy_neostack_trace",
      "umg_envoy_neostack_list_tools",
      "umg_envoy_neostack_permission_check",
      "umg_envoy_library_status",
      "umg_envoy_library_search",
      "umg_envoy_runtime_spec_dry_run",
      "umg_envoy_runtime_visibility_header",
      "umg_envoy_runtime_molt_map"
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

function buildCompilerInputPreview(result: SleeveLoadResult, libraryRoot: string): CompilerInputPreview | undefined {
  if (!result.loadedSleeve || !result.artifactResolution) {
    return undefined;
  }

  const dependencies = result.loadedSleeve.sleeve?.dependencies;
  const entries = result.artifactResolution.entries;

  return {
    mode: "canonical-preparation-preview",
    sleeveArtifactId: result.loadedSleeve.identity?.artifact_id ?? null,
    sleevePath: result.sleevePath,
    libraryRoot,
    routeCount: Array.isArray(result.loadedSleeve.sleeve?.routes) ? result.loadedSleeve.sleeve.routes.length : 0,
    dependencyCounts: {
      sleeves: Array.isArray(dependencies?.sleeve_ids) ? dependencies.sleeve_ids.length : 0,
      neostacks: Array.isArray(dependencies?.neostack_ids) ? dependencies.neostack_ids.length : 0,
      bundles: Array.isArray(dependencies?.bundle_ids) ? dependencies.bundle_ids.length : 0,
      overlays: Array.isArray(dependencies?.overlay_ids) ? dependencies.overlay_ids.length : 0,
      schemas: Array.isArray(dependencies?.schema_ids) ? dependencies.schema_ids.length : 0
    },
    resolvedArtifactCounts: {
      resolved: entries.filter((entry) => entry.status === "resolved").length,
      missing: entries.filter((entry) => entry.status === "missing").length,
      invalid: entries.filter((entry) => entry.status === "invalid").length
    },
    stageBoundary: {
      compilerInvoked: false,
      stage8BridgeDeferred: true,
      runtimeOutputsWritten: false
    }
  };
}

function loadSleevePreview(sleevePath: string, libraryRoot: string): SleeveLoadResult {
  const loaded = loadSleeveFile({ sleevePath, libraryRoot });
  if (!loaded.ok || !loaded.loadedSleeve) {
    return loaded;
  }

  const validation = validateSleeveStructure(loaded.loadedSleeve);
  const artifactResolution = resolveSleeveArtifacts(libraryRoot, loaded.loadedSleeve);
  const compilerInputPreview = buildCompilerInputPreview({ ...loaded, validation, artifactResolution }, libraryRoot);

  return {
    ok: loaded.ok && validation.ok && artifactResolution.ok,
    sleevePath: loaded.sleevePath,
    loadedSleeve: loaded.loadedSleeve,
    validation,
    artifactResolution,
    compilerInputPreview,
    warnings: [...loaded.warnings, ...validation.warnings, ...artifactResolution.warnings],
    errors: [...loaded.errors, ...validation.errors, ...artifactResolution.errors]
  };
}

function loadNeostackPreview(libraryRoot: string, neostackId: string): NeostackLoadResult {
  const loaded = loadNeostackFile({ libraryRoot, neostackId });
  if (!loaded.ok || !loaded.loadedNeostack) {
    return loaded;
  }

  const validation = validateNeostackStructure(loaded.loadedNeostack);
  const artifactResolution = resolveNeostackArtifacts(libraryRoot, loaded.loadedNeostack);

  return {
    ok: loaded.ok && validation.ok && artifactResolution.ok,
    neostackPath: loaded.neostackPath,
    loadedNeostack: loaded.loadedNeostack,
    validation,
    artifactResolution,
    warnings: [...loaded.warnings, ...validation.warnings, ...artifactResolution.warnings],
    errors: [...loaded.errors, ...validation.errors, ...artifactResolution.errors]
  };
}

function createPhase2Executor(pluginConfig?: PluginConfig): { execute(toolName: string, payload: Record<string, unknown>): Promise<unknown> } {
  return {
    async execute(toolName: string, _payload: Record<string, unknown>) {
      if (toolName === "umg_envoy_status") {
        return statusPayload(pluginConfig);
      }
      if (toolName === "umg_envoy_matrix_status") {
        return getCompilerMatrixStatus(import.meta.url);
      }
      throw new Error(`Tool is not bound for Phase 2/4.2 execution: ${toolName}`);
    }
  };
}

function registerCliBridge(api: any, config?: PluginConfig) {
  api.registerCli(({ program }: { program: any }) => {
    const root = program.command("umg-envoy").description("Run UMG workflows as a modular cognitive architecture runtime inside OpenClaw.");

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

    root.command("load-sleeve")
      .requiredOption("--sleeve-path <path>")
      .requiredOption("--library-root <path>")
      .action(async (opts: { sleevePath: string; libraryRoot: string }) => {
        console.log(JSON.stringify(loadSleevePreview(opts.sleevePath, opts.libraryRoot), null, 2));
      });

    root.command("compile-ir-bridge")
      .requiredOption("--sleeve-path <path>")
      .requiredOption("--library-root <path>")
      .option("--compiler-repo-path <path>")
      .option("--compiler-cli-path <path>")
      .option("--output-dir <path>")
      .option("--timeout-ms <number>")
      .action(async (opts: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: string }) => {
        const result = await runCompilerBridge({
          sleevePath: opts.sleevePath,
          libraryRoot: opts.libraryRoot,
          compilerRepoPath: opts.compilerRepoPath,
          compilerCliPath: opts.compilerCliPath,
          outputDir: opts.outputDir,
          timeoutMs: opts.timeoutMs ? Number(opts.timeoutMs) : undefined,
          allowCompilerBridge: true
        });
        console.log(JSON.stringify(result, null, 2));
      });

    root.command("emit-relation-matrix")
      .requiredOption("--sleeve-path <path>")
      .requiredOption("--library-root <path>")
      .option("--compiler-repo-path <path>")
      .option("--compiler-cli-path <path>")
      .option("--output-dir <path>")
      .option("--timeout-ms <number>")
      .option("--relation-matrix-mode <mode>")
      .action(async (opts: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: string; relationMatrixMode?: string }) => {
        const result = await emitRelationMatrix({
          sleevePath: opts.sleevePath,
          libraryRoot: opts.libraryRoot,
          compilerRepoPath: opts.compilerRepoPath,
          compilerCliPath: opts.compilerCliPath,
          outputDir: opts.outputDir,
          timeoutMs: opts.timeoutMs ? Number(opts.timeoutMs) : undefined,
          allowCompilerBridge: true,
          allowRelationMatrixEmit: true,
          relationMatrixMode: (opts.relationMatrixMode as any) ?? "response-only"
        }, config?.relationMatrix);
        console.log(JSON.stringify(result, null, 2));
      });

    root.command("neostack-inspect")
      .requiredOption("--library-root <path>")
      .requiredOption("--neostack-id <id>")
      .action(async (opts: { libraryRoot: string; neostackId: string }) => {
        console.log(JSON.stringify(loadNeostackPreview(opts.libraryRoot, opts.neostackId), null, 2));
      });

    root.command("neostack-validate")
      .requiredOption("--library-root <path>")
      .requiredOption("--neostack-id <id>")
      .action(async (opts: { libraryRoot: string; neostackId: string }) => {
        const result = loadNeostackPreview(opts.libraryRoot, opts.neostackId);
        console.log(JSON.stringify({ ok: result.ok, validation: result.validation, artifactResolution: result.artifactResolution, warnings: result.warnings, errors: result.errors }, null, 2));
      });

    root.command("neostack-invoke")
      .requiredOption("--payload-file <path>")
      .option("--execute")
      .option("--agent-execute")
      .action(async (opts: { payloadFile: string; execute?: boolean; agentExecute?: boolean }) => {
        const payload = JSON.parse(fs.readFileSync(opts.payloadFile, "utf8")) as LangChainBridgePayload;
        if (opts.agentExecute) payload.invoke_mode = "agent_execute";
        else if (opts.execute) payload.invoke_mode = "direct_execute";
        else payload.invoke_mode = payload.invoke_mode ?? "dry_run";
        console.log(JSON.stringify(await invokeLangChainBridge(payload, { executor: opts.execute || opts.agentExecute ? createPhase2Executor(config) : undefined, agentRunner: opts.agentExecute ? runMinimalLangChainAgent : undefined }), null, 2));
      });

    root.command("approval-list")
      .option("--status <status>")
      .action(async (opts: { status?: string }) => {
        console.log(JSON.stringify(listApprovalCheckpoints(opts.status as any), null, 2));
      });

    root.command("approval-get")
      .requiredOption("--approval-id <id>")
      .action(async (opts: { approvalId: string }) => {
        const record = getApprovalCheckpoint(opts.approvalId);
        console.log(JSON.stringify(record ?? { ok: false, error: "approval checkpoint not found" }, null, 2));
      });

    root.command("approval-decide")
      .requiredOption("--approval-id <id>")
      .requiredOption("--decision <decision>")
      .requiredOption("--decided-by <who>")
      .option("--reason <text>")
      .option("--edited-input-file <path>")
      .action(async (opts: { approvalId: string; decision: "approve" | "deny" | "edit"; decidedBy: string; reason?: string; editedInputFile?: string }) => {
        const existing = getApprovalCheckpoint(opts.approvalId);
        if (!existing) {
          console.log(JSON.stringify({ ok: false, error: "approval checkpoint not found", trace: [] }, null, 2));
          return;
        }
        const trace: Array<Record<string, unknown>> = [
          { event_type: "APPROVAL_DECISION_RECEIVED", timestamp_utc: new Date().toISOString(), sleeve_id: existing.sleeve_id, neostack_id: existing.neostack_id, tool_id: existing.tool.tool_id, message: "Approval decision received.", data: { approval_id: opts.approvalId, decision: opts.decision } }
        ];
        const editedInput = opts.editedInputFile ? JSON.parse(fs.readFileSync(opts.editedInputFile, "utf8")) : null;
        const result = decideApprovalCheckpoint({ approval_id: opts.approvalId, decision: opts.decision, decided_by: opts.decidedBy, reason: opts.reason, edited_input: editedInput, execute_now: false });
        if (!result.ok || !result.record) {
          trace.push({ event_type: "APPROVAL_DECISION_REJECTED", timestamp_utc: new Date().toISOString(), sleeve_id: existing.sleeve_id, neostack_id: existing.neostack_id, tool_id: existing.tool.tool_id, message: "Approval decision rejected.", data: { approval_id: opts.approvalId, error: result.error ?? "invalid approval transition" } });
          console.log(JSON.stringify({ ok: false, error: result.error, trace }, null, 2));
          return;
        }
        trace.push({ event_type: "APPROVAL_DECISION_VALIDATED", timestamp_utc: new Date().toISOString(), sleeve_id: result.record.sleeve_id, neostack_id: result.record.neostack_id, tool_id: result.record.tool.tool_id, message: "Approval decision validated.", data: { approval_id: opts.approvalId, decision: opts.decision } });
        trace.push({ event_type: "APPROVAL_STATE_TRANSITIONED", timestamp_utc: new Date().toISOString(), sleeve_id: result.record.sleeve_id, neostack_id: result.record.neostack_id, tool_id: result.record.tool.tool_id, message: "Approval state transitioned.", data: { approval_id: opts.approvalId, status: result.record.status } });
        console.log(JSON.stringify({ ok: true, record: result.record, trace }, null, 2));
      });

    root.command("approval-resume-prepare")
      .requiredOption("--approval-id <id>")
      .action(async (opts: { approvalId: string }) => {
        const record = getApprovalCheckpoint(opts.approvalId);
        if (!record) {
          console.log(JSON.stringify({ ok: false, error: "approval checkpoint not found" }, null, 2));
          return;
        }
        if (!["approval_granted", "approval_edited"].includes(record.status)) {
          console.log(JSON.stringify({ ok: false, error: `approval checkpoint is not resumable: ${record.status}` }, null, 2));
          return;
        }
        console.log(JSON.stringify({ ok: true, contract: createApprovalResumeContract(record) }, null, 2));
      });

    root.command("approval-resume-execute")
      .requiredOption("--approval-id <id>")
      .option("--execute")
      .action(async (opts: { approvalId: string; execute?: boolean }) => {
        const record = getApprovalCheckpoint(opts.approvalId);
        if (!record) {
          console.log(JSON.stringify({ ok: false, status: "resume_execution_blocked", executed: false, error: "approval checkpoint not found" }, null, 2));
          return;
        }
        if (!opts.execute) {
          console.log(JSON.stringify({ ok: false, status: "resume_execution_blocked", executed: false, error: "explicit --execute flag is required" }, null, 2));
          return;
        }
        console.log(JSON.stringify(await executeApprovalResume(record, createPhase2Executor(config)), null, 2));
      });

    root.command("mcp-config-validate")
      .option("--config-file <path>")
      .action(async (opts: { configFile?: string }) => {
        if (opts.configFile) {
          console.log(JSON.stringify(loadMcpBridgeConfig(opts.configFile), null, 2));
          return;
        }
        console.log(JSON.stringify(loadMcpBridgeConfig(), null, 2));
      });

    root.command("mcp-server-list")
      .option("--config-file <path>")
      .action(async (opts: { configFile?: string }) => {
        const loaded = loadMcpBridgeConfig(opts.configFile);
        if (!loaded.ok || !loaded.config) {
          console.log(JSON.stringify(loaded, null, 2));
          return;
        }
        console.log(JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, ...listMcpServers(loaded.config), trace: [...loaded.trace, ...listMcpServers(loaded.config).trace] }, null, 2));
      });

    root.command("mcp-tool-discover")
      .option("--config-file <path>")
      .option("--server-id <id>")
      .action(async (opts: { configFile?: string; serverId?: string }) => {
        const loaded = loadMcpBridgeConfig(opts.configFile);
        if (!loaded.ok || !loaded.config) {
          console.log(JSON.stringify(loaded, null, 2));
          return;
        }
        const discovered = await discoverMcpTools(loaded.config, opts.serverId);
        console.log(JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, discovered: discovered.discovered, trace: [...loaded.trace, ...discovered.trace] }, null, 2));
      });

    root.command("mcp-tool-classify")
      .option("--config-file <path>")
      .option("--server-id <id>")
      .action(async (opts: { configFile?: string; serverId?: string }) => {
        const loaded = loadMcpBridgeConfig(opts.configFile);
        if (!loaded.ok || !loaded.config) {
          console.log(JSON.stringify(loaded, null, 2));
          return;
        }
        const discovered = await discoverMcpTools(loaded.config, opts.serverId);
        const candidates = discovered.discovered.flatMap((entry) => entry.metadata.tools.map((tool) => {
          const candidate = createMcpToolCandidate(entry.server.server_id, tool);
          const classified = classifyMcpToolCandidate(candidate);
          return {
            candidate,
            classification: classified.classification,
            trace: [
              { event_type: "MCP_TOOL_CANDIDATE_CREATED", timestamp_utc: new Date().toISOString(), message: "MCP tool candidate created.", data: { server_id: entry.server.server_id, tool_name: tool.tool_name } },
              ...classified.trace
            ]
          };
        }));
        console.log(JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, candidates, trace: [...loaded.trace, ...discovered.trace] }, null, 2));
      });

    root.command("mcp-capability-summary")
      .option("--config-file <path>")
      .option("--server-id <id>")
      .action(async (opts: { configFile?: string; serverId?: string }) => {
        const loaded = loadMcpBridgeConfig(opts.configFile);
        if (!loaded.ok || !loaded.config) {
          console.log(JSON.stringify(loaded, null, 2));
          return;
        }
        const discovered = await discoverMcpTools(loaded.config, opts.serverId);
        const summaries = discovered.discovered.map((entry) => createMcpCapabilitySummary(entry.metadata));
        console.log(JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, summaries: summaries.map((item) => item.summary), trace: [...loaded.trace, ...discovered.trace, ...summaries.flatMap((item) => item.trace)] }, null, 2));
      });

    root.command("library-status")
      .action(async () => {
        console.log(JSON.stringify(resolverFoundationStatus(), null, 2));
      });

    root.command("library-search")
      .option("--text <text>")
      .option("--kind <kind>")
      .option("--tag <tag>")
      .option("--domain <domain>")
      .option("--capability <capability>")
      .option("--status <status>")
      .option("--limit <number>")
      .action(async (opts: { text?: string; kind?: string; tag?: string; domain?: string; capability?: string; status?: string; limit?: string }) => {
        const config = loadBlockLibraryConfig();
        const resolver = new UMGResolver(config, path.dirname(new URL(import.meta.url).pathname));
        const registry = buildRegistry(resolver);
        const hits = searchRegistry(registry.artifacts, {
          text: opts.text,
          kinds: opts.kind ? [opts.kind] : undefined,
          tags: opts.tag ? [opts.tag] : undefined,
          domains: opts.domain ? [opts.domain] : undefined,
          capabilities: opts.capability ? [opts.capability] : undefined,
          status: opts.status ? [opts.status] : undefined,
          limit: opts.limit ? Number(opts.limit) : undefined
        }, registry.support_artifacts);
        console.log(JSON.stringify({ source_mode: resolver.status().source_mode, counts: registry.counts, support_artifact_count: registry.support_artifacts.length, hits, warnings_summary: registry.warnings_summary, warnings: registry.warnings.slice(0, 25) }, null, 2));
      });

    root.command("runtime-spec-dry-run")
      .requiredOption("--user-task <task>")
      .option("--preferred-kind <kind>")
      .action(async (opts: { userTask: string; preferredKind?: "sleeve" | "neostack" | "neoblock" | "molt_block" }) => {
        console.log(JSON.stringify(compileRuntimeSpecDryRun({ user_task: opts.userTask, preferred_kind: opts.preferredKind, execution_mode: "dry_run" }), null, 2));
      });

    root.command("runtime-visibility-header")
      .requiredOption("--user-task <task>")
      .option("--preferred-kind <kind>")
      .option("--mode <mode>")
      .action(async (opts: { userTask: string; preferredKind?: "sleeve" | "neostack" | "neoblock" | "molt_block"; mode?: "compact" | "developer" | "debug" }) => {
        const spec = compileRuntimeSpecDryRun({ user_task: opts.userTask, preferred_kind: opts.preferredKind, execution_mode: "dry_run" });
        console.log(JSON.stringify(buildRuntimeVisibilityHeader(spec, opts.mode ?? "developer"), null, 2));
      });

    root.command("runtime-molt-map")
      .requiredOption("--user-task <task>")
      .option("--preferred-kind <kind>")
      .action(async (opts: { userTask: string; preferredKind?: "sleeve" | "neostack" | "neoblock" | "molt_block" }) => {
        const spec = compileRuntimeSpecDryRun({ user_task: opts.userTask, preferred_kind: opts.preferredKind, execution_mode: "dry_run" });
        console.log(JSON.stringify(buildRuntimeMOLTMap(spec), null, 2));
      });
  }, { commands: ["umg-envoy"] });
}

const entry = {
  id: "umg-envoy-agent",
  name: "UMG Envoy Agent",
  description: "UMG Envoy Agent is an OpenClaw code plugin that runs Universal Modular Generation workflows as a modular cognitive architecture runtime: loading UMG sleeves, resolving artifacts, compiling canonical IR, and emitting runtime specs, traces, diagnostics, and relation matrices.",
  register(api: { registerTool: (definition: any, options?: { optional?: boolean }) => void; registerCli?: (register: any, options?: { commands?: string[] }) => void }, config?: PluginConfig) {
    registerCliBridge(api, config);

    api.registerTool({ name: "umg_envoy_status", description: "Report UMG modular cognitive runtime status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(statusPayload(config), null, 2) }] }; } }, { optional: true });
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
    api.registerTool({
      name: "umg_envoy_load_sleeve",
      description: "Read-only sleeve loader that validates sleeve structure, resolves artifacts, and previews canonical compiler preparation without invoking the compiler.",
      parameters: Type.Object({ sleevePath: Type.String(), libraryRoot: Type.String() }, { additionalProperties: false }),
      async execute(input: { sleevePath: string; libraryRoot: string }) {
        return { content: [{ type: "text", text: JSON.stringify(loadSleevePreview(input.sleevePath, input.libraryRoot), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_compile_ir_bridge",
      description: "Invoke the configured local umg-compiler compile-ir path using a constrained canonical IR bridge.",
      parameters: Type.Object({
        sleevePath: Type.String(),
        libraryRoot: Type.String(),
        compilerRepoPath: Type.Optional(Type.String()),
        compilerCliPath: Type.Optional(Type.String()),
        outputDir: Type.Optional(Type.String()),
        timeoutMs: Type.Optional(Type.Number()),
        allowCompilerBridge: Type.Optional(Type.Boolean())
      }, { additionalProperties: false }),
      async execute(input: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: number; allowCompilerBridge?: boolean }) {
        return { content: [{ type: "text", text: JSON.stringify(await runCompilerBridge({ ...input, allowCompilerBridge: input.allowCompilerBridge ?? true }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_emit_relation_matrix",
      description: "Emit an ASCII-safe relation matrix projection after the compiler bridge.",
      parameters: Type.Object({
        sleevePath: Type.String(),
        libraryRoot: Type.String(),
        compilerRepoPath: Type.Optional(Type.String()),
        compilerCliPath: Type.Optional(Type.String()),
        outputDir: Type.Optional(Type.String()),
        timeoutMs: Type.Optional(Type.Number()),
        allowCompilerBridge: Type.Optional(Type.Boolean()),
        allowRelationMatrixEmit: Type.Optional(Type.Boolean()),
        relationMatrixMode: Type.Optional(Type.Union([Type.Literal("response-only"), Type.Literal("temp-write"), Type.Literal("both")]))
      }, { additionalProperties: false }),
      async execute(input: { sleevePath: string; libraryRoot: string; compilerRepoPath?: string; compilerCliPath?: string; outputDir?: string; timeoutMs?: number; allowCompilerBridge?: boolean; allowRelationMatrixEmit?: boolean; relationMatrixMode?: "response-only" | "temp-write" | "both" }) {
        return { content: [{ type: "text", text: JSON.stringify(await emitRelationMatrix({ ...input, allowCompilerBridge: input.allowCompilerBridge ?? true, allowRelationMatrixEmit: input.allowRelationMatrixEmit ?? false }, config?.relationMatrix), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_neostack_inspect",
      description: "Load and inspect a NeoStack from the UMG Block Library.",
      parameters: Type.Object({ libraryRoot: Type.String(), neostackId: Type.String() }, { additionalProperties: false }),
      async execute(input: { libraryRoot: string; neostackId: string }) {
        return { content: [{ type: "text", text: JSON.stringify(loadNeostackPreview(input.libraryRoot, input.neostackId), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_neostack_validate",
      description: "Validate a NeoStack structure and referenced neoblocks.",
      parameters: Type.Object({ libraryRoot: Type.String(), neostackId: Type.String() }, { additionalProperties: false }),
      async execute(input: { libraryRoot: string; neostackId: string }) {
        const result = loadNeostackPreview(input.libraryRoot, input.neostackId);
        return { content: [{ type: "text", text: JSON.stringify({ ok: result.ok, validation: result.validation, artifactResolution: result.artifactResolution, warnings: result.warnings, errors: result.errors }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_neostack_invoke",
      description: "Invoke the LangChain Bridge NeoStack. Dry-run by default; supports direct execute and minimal LangChain agent execute for hardcoded safe tools only.",
      parameters: Type.Object({ payload: Type.Any(), execute: Type.Optional(Type.Boolean()), agentExecute: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      async execute(input: { payload: LangChainBridgePayload; execute?: boolean; agentExecute?: boolean }) {
        const payload = { ...input.payload };
        if (input.agentExecute) payload.invoke_mode = "agent_execute";
        else if (input.execute) payload.invoke_mode = "direct_execute";
        else payload.invoke_mode = payload.invoke_mode ?? "dry_run";
        return { content: [{ type: "text", text: JSON.stringify(await invokeLangChainBridge(payload, { executor: input.execute || input.agentExecute ? createPhase2Executor(config) : undefined, agentRunner: input.agentExecute ? runMinimalLangChainAgent : undefined }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_neostack_trace",
      description: "Return trace events from a dry-run LangChain Bridge NeoStack invocation.",
      parameters: Type.Object({ payload: Type.Any() }, { additionalProperties: false }),
      async execute(input: { payload: LangChainBridgePayload }) {
        const result = await invokeLangChainBridge(input.payload);
        return { content: [{ type: "text", text: JSON.stringify({ ok: true, neostack_id: result.neostack_id, trace_events: result.trace_events, warnings: result.warnings, errors: result.errors }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_neostack_list_tools",
      description: "List declared tool definitions and permission decisions for a LangChain Bridge payload.",
      parameters: Type.Object({ payload: Type.Any() }, { additionalProperties: false }),
      async execute(input: { payload: LangChainBridgePayload }) {
        const filtered = filterTools(input.payload);
        return { content: [{ type: "text", text: JSON.stringify({ ok: true, neostack_id: input.payload.neostack_id, tool_definitions: input.payload.tools?.definitions ?? [], decisions: filtered.decisions, trace_events: filtered.events }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_neostack_permission_check",
      description: "Run permission filtering only for a LangChain Bridge payload.",
      parameters: Type.Object({ payload: Type.Any() }, { additionalProperties: false }),
      async execute(input: { payload: LangChainBridgePayload }) {
        const filtered = filterTools(input.payload);
        return { content: [{ type: "text", text: JSON.stringify({ ok: true, neostack_id: input.payload.neostack_id, decisions: filtered.decisions, trace_events: filtered.events }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_approval_list",
      description: "List stored approval checkpoints.",
      parameters: Type.Object({ status: Type.Optional(Type.String()) }, { additionalProperties: false }),
      async execute(input: { status?: string }) {
        return { content: [{ type: "text", text: JSON.stringify(listApprovalCheckpoints(input.status as any), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_approval_get",
      description: "Get one stored approval checkpoint by approval_id.",
      parameters: Type.Object({ approvalId: Type.String() }, { additionalProperties: false }),
      async execute(input: { approvalId: string }) {
        return { content: [{ type: "text", text: JSON.stringify(getApprovalCheckpoint(input.approvalId) ?? { ok: false, error: "approval checkpoint not found" }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_approval_decide",
      description: "Record an approval decision without executing the underlying tool.",
      parameters: Type.Object({ approvalId: Type.String(), decision: Type.Union([Type.Literal("approve"), Type.Literal("deny"), Type.Literal("edit")]), decidedBy: Type.String(), editedInput: Type.Optional(Type.Any()), reason: Type.Optional(Type.String()) }, { additionalProperties: false }),
      async execute(input: { approvalId: string; decision: "approve" | "deny" | "edit"; decidedBy: string; editedInput?: Record<string, unknown>; reason?: string }) {
        const existing = getApprovalCheckpoint(input.approvalId);
        if (!existing) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "approval checkpoint not found", trace: [] }, null, 2) }] };
        }
        const trace: Array<Record<string, unknown>> = [
          { event_type: "APPROVAL_DECISION_RECEIVED", timestamp_utc: new Date().toISOString(), sleeve_id: existing.sleeve_id, neostack_id: existing.neostack_id, tool_id: existing.tool.tool_id, message: "Approval decision received.", data: { approval_id: input.approvalId, decision: input.decision } }
        ];
        const result = decideApprovalCheckpoint({ approval_id: input.approvalId, decision: input.decision, decided_by: input.decidedBy, edited_input: input.editedInput ?? null, reason: input.reason, execute_now: false });
        if (!result.ok || !result.record) {
          trace.push({ event_type: "APPROVAL_DECISION_REJECTED", timestamp_utc: new Date().toISOString(), sleeve_id: existing.sleeve_id, neostack_id: existing.neostack_id, tool_id: existing.tool.tool_id, message: "Approval decision rejected.", data: { approval_id: input.approvalId, error: result.error ?? "invalid approval transition" } });
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: result.error, trace }, null, 2) }] };
        }
        trace.push({ event_type: "APPROVAL_DECISION_VALIDATED", timestamp_utc: new Date().toISOString(), sleeve_id: result.record.sleeve_id, neostack_id: result.record.neostack_id, tool_id: result.record.tool.tool_id, message: "Approval decision validated.", data: { approval_id: input.approvalId, decision: input.decision } });
        trace.push({ event_type: "APPROVAL_STATE_TRANSITIONED", timestamp_utc: new Date().toISOString(), sleeve_id: result.record.sleeve_id, neostack_id: result.record.neostack_id, tool_id: result.record.tool.tool_id, message: "Approval state transitioned.", data: { approval_id: input.approvalId, status: result.record.status } });
        return { content: [{ type: "text", text: JSON.stringify({ ok: true, record: result.record, trace }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_approval_resume_prepare",
      description: "Prepare a resume contract from an approved checkpoint without executing the tool.",
      parameters: Type.Object({ approvalId: Type.String() }, { additionalProperties: false }),
      async execute(input: { approvalId: string }) {
        const record = getApprovalCheckpoint(input.approvalId);
        if (!record) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "approval checkpoint not found" }, null, 2) }] };
        }
        if (!["approval_granted", "approval_edited"].includes(record.status)) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: `approval checkpoint is not resumable: ${record.status}` }, null, 2) }] };
        }
        return { content: [{ type: "text", text: JSON.stringify({ ok: true, contract: createApprovalResumeContract(record) }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_approval_resume_execute",
      description: "Execute exactly one allowlisted harmless approval-resume tool path with idempotency protection.",
      parameters: Type.Object({ approvalId: Type.String(), execute: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      async execute(input: { approvalId: string; execute?: boolean }) {
        const record = getApprovalCheckpoint(input.approvalId);
        if (!record) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, status: "resume_execution_blocked", executed: false, error: "approval checkpoint not found" }, null, 2) }] };
        }
        if (!input.execute) {
          return { content: [{ type: "text", text: JSON.stringify({ ok: false, status: "resume_execution_blocked", executed: false, error: "explicit execute=true is required" }, null, 2) }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(await executeApprovalResume(record, createPhase2Executor(config)), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_mcp_config_validate",
      description: "Resolve and validate MCP bridge configuration without starting servers or executing tools.",
      parameters: Type.Object({ configPath: Type.Optional(Type.String()), config: Type.Optional(Type.Any()) }, { additionalProperties: false }),
      async execute(input: { configPath?: string; config?: unknown }) {
        const result = input.config ? validateMcpBridgeConfig(input.config) : loadMcpBridgeConfig(input.configPath);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_mcp_server_list",
      description: "List MCP server registry metadata from the selected config source.",
      parameters: Type.Object({ configPath: Type.Optional(Type.String()) }, { additionalProperties: false }),
      async execute(input: { configPath?: string }) {
        const loaded = loadMcpBridgeConfig(input.configPath);
        if (!loaded.ok || !loaded.config) {
          return { content: [{ type: "text", text: JSON.stringify(loaded, null, 2) }] };
        }
        const listed = listMcpServers(loaded.config);
        return { content: [{ type: "text", text: JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, servers: listed.servers, trace: [...loaded.trace, ...listed.trace] }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_mcp_tool_discover",
      description: "Discover MCP tool/resource/prompt metadata only. Does not execute tools or expose them to LangChain.",
      parameters: Type.Object({ configPath: Type.Optional(Type.String()), serverId: Type.Optional(Type.String()) }, { additionalProperties: false }),
      async execute(input: { configPath?: string; serverId?: string }) {
        const loaded = loadMcpBridgeConfig(input.configPath);
        if (!loaded.ok || !loaded.config) {
          return { content: [{ type: "text", text: JSON.stringify(loaded, null, 2) }] };
        }
        const discovered = await discoverMcpTools(loaded.config, input.serverId);
        return { content: [{ type: "text", text: JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, discovered: discovered.discovered, trace: [...loaded.trace, ...discovered.trace] }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_mcp_tool_classify",
      description: "Map discovered MCP tool metadata into blocked-by-default UMG tool candidates.",
      parameters: Type.Object({ configPath: Type.Optional(Type.String()), serverId: Type.Optional(Type.String()) }, { additionalProperties: false }),
      async execute(input: { configPath?: string; serverId?: string }) {
        const loaded = loadMcpBridgeConfig(input.configPath);
        if (!loaded.ok || !loaded.config) {
          return { content: [{ type: "text", text: JSON.stringify(loaded, null, 2) }] };
        }
        const discovered = await discoverMcpTools(loaded.config, input.serverId);
        const candidates = discovered.discovered.flatMap((entry) => entry.metadata.tools.map((tool) => {
          const candidate = createMcpToolCandidate(entry.server.server_id, tool);
          const classified = classifyMcpToolCandidate(candidate);
          return {
            candidate,
            classification: classified.classification,
            trace: [
              { event_type: "MCP_TOOL_CANDIDATE_CREATED", timestamp_utc: new Date().toISOString(), message: "MCP tool candidate created.", data: { server_id: entry.server.server_id, tool_name: tool.tool_name } },
              ...classified.trace
            ]
          };
        }));
        return { content: [{ type: "text", text: JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, candidates, trace: [...loaded.trace, ...discovered.trace] }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_mcp_capability_summary",
      description: "Return MCP capability summary for configured servers in metadata-only mode.",
      parameters: Type.Object({ configPath: Type.Optional(Type.String()), serverId: Type.Optional(Type.String()) }, { additionalProperties: false }),
      async execute(input: { configPath?: string; serverId?: string }) {
        const loaded = loadMcpBridgeConfig(input.configPath);
        if (!loaded.ok || !loaded.config) {
          return { content: [{ type: "text", text: JSON.stringify(loaded, null, 2) }] };
        }
        const discovered = await discoverMcpTools(loaded.config, input.serverId);
        const summaries = discovered.discovered.map((entry) => createMcpCapabilitySummary(entry.metadata));
        return { content: [{ type: "text", text: JSON.stringify({ source: loaded.source, sourceType: loaded.sourceType, summaries: summaries.map((item) => item.summary), trace: [...loaded.trace, ...discovered.trace, ...summaries.flatMap((item) => item.trace)] }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_library_status",
      description: "Report UMG block-library resolver status, source mode, counts, and warnings.",
      parameters: Type.Object({}, { additionalProperties: false }),
      async execute() {
        return { content: [{ type: "text", text: JSON.stringify(resolverFoundationStatus(), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_library_search",
      description: "Search the normalized UMG registry by text, kind, tag, domain, capability, and status.",
      parameters: Type.Object({ text: Type.Optional(Type.String()), kind: Type.Optional(Type.String()), tag: Type.Optional(Type.String()), domain: Type.Optional(Type.String()), capability: Type.Optional(Type.String()), status: Type.Optional(Type.String()), limit: Type.Optional(Type.Number()) }, { additionalProperties: false }),
      async execute(input: { text?: string; kind?: string; tag?: string; domain?: string; capability?: string; status?: string; limit?: number }) {
        const config = loadBlockLibraryConfig();
        const resolver = new UMGResolver(config, path.dirname(new URL(import.meta.url).pathname));
        const registry = buildRegistry(resolver);
        const hits = searchRegistry(registry.artifacts, {
          text: input.text,
          kinds: input.kind ? [input.kind] : undefined,
          tags: input.tag ? [input.tag] : undefined,
          domains: input.domain ? [input.domain] : undefined,
          capabilities: input.capability ? [input.capability] : undefined,
          status: input.status ? [input.status] : undefined,
          limit: input.limit
        }, registry.support_artifacts);
        return { content: [{ type: "text", text: JSON.stringify({ source_mode: resolver.status().source_mode, counts: registry.counts, support_artifact_count: registry.support_artifacts.length, hits, warnings_summary: registry.warnings_summary, warnings: registry.warnings.slice(0, 25) }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_runtime_spec_dry_run",
      description: "Compile a read-only dry-run RuntimeSpec v0 object from the resolver registry without executing anything.",
      parameters: Type.Object({ user_task: Type.String(), requested_capabilities: Type.Optional(Type.Array(Type.String())), requested_tools: Type.Optional(Type.Array(Type.String())), preferred_kind: Type.Optional(Type.Union([Type.Literal("sleeve"), Type.Literal("neostack"), Type.Literal("neoblock"), Type.Literal("molt_block")])) }, { additionalProperties: false }),
      async execute(input: { user_task: string; requested_capabilities?: string[]; requested_tools?: string[]; preferred_kind?: "sleeve" | "neostack" | "neoblock" | "molt_block" }) {
        return { content: [{ type: "text", text: JSON.stringify(compileRuntimeSpecDryRun({ ...input, execution_mode: "dry_run" }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_runtime_visibility_header",
      description: "Build a read-only runtime visibility header from a dry-run RuntimeSpec without executing anything.",
      parameters: Type.Object({ user_task: Type.String(), requested_capabilities: Type.Optional(Type.Array(Type.String())), requested_tools: Type.Optional(Type.Array(Type.String())), preferred_kind: Type.Optional(Type.Union([Type.Literal("sleeve"), Type.Literal("neostack"), Type.Literal("neoblock"), Type.Literal("molt_block")])), mode: Type.Optional(Type.Union([Type.Literal("compact"), Type.Literal("developer"), Type.Literal("debug")])) }, { additionalProperties: false }),
      async execute(input: { user_task: string; requested_capabilities?: string[]; requested_tools?: string[]; preferred_kind?: "sleeve" | "neostack" | "neoblock" | "molt_block"; mode?: "compact" | "developer" | "debug" }) {
        const spec = compileRuntimeSpecDryRun({ ...input, execution_mode: "dry_run" });
        return { content: [{ type: "text", text: JSON.stringify(buildRuntimeVisibilityHeader(spec, input.mode ?? "developer"), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_runtime_molt_map",
      description: "Build a read-only Runtime MOLT Map from a dry-run RuntimeSpec without executing anything.",
      parameters: Type.Object({ user_task: Type.String(), requested_capabilities: Type.Optional(Type.Array(Type.String())), requested_tools: Type.Optional(Type.Array(Type.String())), preferred_kind: Type.Optional(Type.Union([Type.Literal("sleeve"), Type.Literal("neostack"), Type.Literal("neoblock"), Type.Literal("molt_block")])) }, { additionalProperties: false }),
      async execute(input: { user_task: string; requested_capabilities?: string[]; requested_tools?: string[]; preferred_kind?: "sleeve" | "neostack" | "neoblock" | "molt_block" }) {
        const spec = compileRuntimeSpecDryRun({ ...input, execution_mode: "dry_run" });
        return { content: [{ type: "text", text: JSON.stringify(buildRuntimeMOLTMap(spec), null, 2) }] };
      }
    }, { optional: true });
  }
};

if (process.argv.includes("--smoke")) {
  console.log(JSON.stringify(runCompilerSmoke(import.meta.url), null, 2));
}

export default entry;
