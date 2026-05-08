import path from "node:path";
import { Type } from "@sinclair/typebox";
import { loadBlockLibraryConfig } from "./resolver/block-library-config.js";
import { UMGResolver } from "./resolver/resolver.js";
import { buildRegistry } from "./resolver/indexer.js";
import { searchRegistry } from "./resolver/search.js";
import { compileRuntimeSpecDryRun } from "./runtime-spec/compiler.js";
import { buildRuntimeVisibilityHeader } from "./runtime-spec/visibility.js";
import { buildRuntimeMOLTMap } from "./runtime-spec/molt-map.js";
import { buildRuntimeDashboard } from "./runtime-spec/dashboard.js";
import { inspectRuntimeDrilldown } from "./runtime-spec/drilldown.js";
import { buildRuntimeIRMatrix } from "./runtime-spec/ir-matrix.js";
import { buildLocalReadOnlyInspectionPlanDryRun, executeApprovedLocalReadOnlyMetadataScan } from "./runtime-spec/local-readonly-inspection.js";
import { buildGovernedExecutionHandoffDryRun } from "./runtime-spec/governed-execution-handoff.js";
import { buildUMGEnvoyAlphaDemo } from "./runtime-spec/alpha-demo.js";
import { renderUMGRuntimeDisplay } from "./runtime-spec/runtime-display.js";
import { demoOperationalSleeve, inspectOperationalSleeve, listOperationalSleeves } from "./runtime-spec/operational-sleeve.js";
import { publicContentRoot, loadSleeves, summarizeBlockLibraries } from "./compiler/content-loader.js";
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
    version: "0.3.0-alpha.3",
    compilerAdapter: "available",
    contentMode: cfg.contentMode,
    compilerMode: cfg.compilerMode,
    allowRuntimeWrites: Boolean(cfg.allowRuntimeWrites),
    sampleSleeves: sleeves.length,
    sampleBlocks: libraries.totalBlocks,
    resolverFoundation: resolverStatus,
    supportedTools: [
      "umg_envoy_status",
      "umg_envoy_library_status",
      "umg_envoy_library_search",
      "umg_envoy_runtime_spec_dry_run",
      "umg_envoy_runtime_visibility_header",
      "umg_envoy_runtime_molt_map",
      "umg_envoy_runtime_dashboard",
      "umg_envoy_runtime_ir_matrix",
      "umg_envoy_runtime_inspect",
      "umg_envoy_local_readonly_plan",
      "umg_envoy_local_readonly_scan",
      "umg_envoy_alpha_demo",
      "umg_envoy_sleeve_list",
      "umg_envoy_sleeve_inspect",
      "umg_envoy_sleeve_demo"
    ]
  };
}

const entry = {
  id: "umg-envoy-agent",
  name: "UMG Envoy Agent",
  description: "UMG Envoy Agent is an OpenClaw code plugin that exposes the safe public alpha UMG runtime inspection surfaces.",
  register(api: { registerTool: (definition: any, options?: { optional?: boolean }) => void }, config?: PluginConfig) {
    api.registerTool({ name: "umg_envoy_status", description: "Report UMG modular cognitive runtime status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(statusPayload(config), null, 2) }] }; } }, { optional: true });
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
    api.registerTool({
      name: "umg_envoy_runtime_dashboard",
      description: "Build a combined read-only runtime dashboard with visibility header, optional MOLT Map, and optional IR Matrix.",
      parameters: Type.Object({ user_task: Type.String(), requested_capabilities: Type.Optional(Type.Array(Type.String())), requested_tools: Type.Optional(Type.Array(Type.String())), preferred_kind: Type.Optional(Type.Union([Type.Literal("sleeve"), Type.Literal("neostack"), Type.Literal("neoblock"), Type.Literal("molt_block")])), include_molt_map: Type.Optional(Type.Boolean()), include_ir_matrix: Type.Optional(Type.Boolean()), mode: Type.Optional(Type.Union([Type.Literal("compact"), Type.Literal("developer"), Type.Literal("debug")])) }, { additionalProperties: false }),
      async execute(input: { user_task: string; requested_capabilities?: string[]; requested_tools?: string[]; preferred_kind?: "sleeve" | "neostack" | "neoblock" | "molt_block"; include_molt_map?: boolean; include_ir_matrix?: boolean; mode?: "compact" | "developer" | "debug" }) {
        const spec = compileRuntimeSpecDryRun({ ...input, execution_mode: "dry_run" });
        return { content: [{ type: "text", text: JSON.stringify(buildRuntimeDashboard(spec, { include_molt_map: input.include_molt_map, include_ir_matrix: input.include_ir_matrix, mode: input.mode }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_local_readonly_plan",
      description: "Plan an exact-scope local read-only metadata scan preview. Metadata only, approval/checkpoint required, no file contents, no writes, no deletes, no shell, no remote execution, and no scan performed.",
      parameters: Type.Object({ root_path: Type.String(), recursive: Type.Optional(Type.Boolean()), max_depth: Type.Optional(Type.Number()), max_items: Type.Optional(Type.Number()), include_hidden: Type.Optional(Type.Boolean()), include_system_paths: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      async execute(input: { root_path: string; recursive?: boolean; max_depth?: number; max_items?: number; include_hidden?: boolean; include_system_paths?: boolean }) {
        const runtimeSpec = compileRuntimeSpecDryRun({ user_task: `Scan ${input.root_path} for file metadata only.`, requested_tools: ["desktop_bridge.file_scan"], execution_mode: "dry_run" });
        const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
        return { content: [{ type: "text", text: JSON.stringify(buildLocalReadOnlyInspectionPlanDryRun({ runtimeSpec, handoff, ...input }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_local_readonly_scan",
      description: "Execute an exact-scope approved local read-only metadata scan. Metadata only, approval/checkpoint required, requires matching scope hash, approval token, exact-scope approval flag, no-file-contents confirmation, and permits no writes, deletes, shell, or remote execution.",
      parameters: Type.Object({ root_path: Type.String(), recursive: Type.Optional(Type.Boolean()), max_depth: Type.Optional(Type.Number()), max_items: Type.Optional(Type.Number()), include_hidden: Type.Optional(Type.Boolean()), include_system_paths: Type.Optional(Type.Boolean()), scope_hash: Type.String(), approval_token: Type.String(), user_approved_exact_scope: Type.Boolean(), confirm_no_file_contents: Type.Boolean() }, { additionalProperties: false }),
      async execute(input: { root_path: string; recursive?: boolean; max_depth?: number; max_items?: number; include_hidden?: boolean; include_system_paths?: boolean; scope_hash: string; approval_token: string; user_approved_exact_scope: boolean; confirm_no_file_contents: boolean }) {
        const runtimeSpec = compileRuntimeSpecDryRun({ user_task: `Scan ${input.root_path} for file metadata only.`, requested_tools: ["desktop_bridge.file_scan"], execution_mode: "dry_run" });
        const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
        return { content: [{ type: "text", text: JSON.stringify(await executeApprovedLocalReadOnlyMetadataScan({ runtimeSpec, handoff, ...input }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_alpha_demo",
      description: "Safe alpha self-test/demo surface. Uses metadata-only surfaces and runtime projections. Does not read file contents, write files, delete files, run shell commands, start MCP, or run LangChain agent mode.",
      parameters: Type.Object({ query: Type.Optional(Type.String()), kind: Type.Optional(Type.String()), limit: Type.Optional(Type.Number()), display_mode: Type.Optional(Type.Union([Type.Literal("compact"), Type.Literal("developer"), Type.Literal("debug")])), include_display: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      async execute(input: { query?: string; kind?: string; limit?: number; display_mode?: "compact" | "developer" | "debug"; include_display?: boolean }) {
        const report = buildUMGEnvoyAlphaDemo(input);
        return { content: [{ type: "text", text: JSON.stringify({ ...report, rendered_display: report.display ? renderUMGRuntimeDisplay(report.display) : undefined }, null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_sleeve_list",
      description: "Operational demo layer sleeve catalog. Lists safe allowlisted demo-ready sleeves only.",
      parameters: Type.Object({}, { additionalProperties: false }),
      async execute() {
        return { content: [{ type: "text", text: JSON.stringify(listOperationalSleeves(), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_sleeve_inspect",
      description: "Inspect a demo-ready sleeve profile, runtime containment, governance state, and runtime display envelope. No broad execution.",
      parameters: Type.Object({ sleeve_id: Type.String(), include_molt_map: Type.Optional(Type.Boolean()), include_ir_matrix: Type.Optional(Type.Boolean()), display_mode: Type.Optional(Type.Union([Type.Literal("compact"), Type.Literal("developer"), Type.Literal("debug")])) }, { additionalProperties: false }),
      async execute(input: { sleeve_id: string; include_molt_map?: boolean; include_ir_matrix?: boolean; display_mode?: "compact" | "developer" | "debug" }) {
        return { content: [{ type: "text", text: JSON.stringify(inspectOperationalSleeve(input), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_sleeve_demo",
      description: "Run safe allowlisted operational sleeve demos only. Library demo is metadata-only, local readonly demo is plan-only by default, and LangChain demo is handoff-only.",
      parameters: Type.Object({ sleeve_id: Type.String(), query: Type.Optional(Type.String()), kind: Type.Optional(Type.String()), limit: Type.Optional(Type.Number()), root_path: Type.Optional(Type.String()), recursive: Type.Optional(Type.Boolean()), max_depth: Type.Optional(Type.Number()), max_items: Type.Optional(Type.Number()), display_mode: Type.Optional(Type.Union([Type.Literal("compact"), Type.Literal("developer"), Type.Literal("debug")])) }, { additionalProperties: false }),
      async execute(input: { sleeve_id: string; query?: string; kind?: string; limit?: number; root_path?: string; recursive?: boolean; max_depth?: number; max_items?: number; display_mode?: "compact" | "developer" | "debug" }) {
        return { content: [{ type: "text", text: JSON.stringify(demoOperationalSleeve(input), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_runtime_ir_matrix",
      description: "Build a read-only Runtime IR Matrix from dry-run RuntimeSpec, optional MOLT Map, and optional dashboard context without executing anything.",
      parameters: Type.Object({ user_task: Type.String(), requested_capabilities: Type.Optional(Type.Array(Type.String())), requested_tools: Type.Optional(Type.Array(Type.String())), preferred_kind: Type.Optional(Type.Union([Type.Literal("sleeve"), Type.Literal("neostack"), Type.Literal("neoblock"), Type.Literal("molt_block")])), include_dashboard_context: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      async execute(input: { user_task: string; requested_capabilities?: string[]; requested_tools?: string[]; preferred_kind?: "sleeve" | "neostack" | "neoblock" | "molt_block"; include_dashboard_context?: boolean }) {
        const spec = compileRuntimeSpecDryRun({ ...input, execution_mode: "dry_run" });
        const dashboard = input.include_dashboard_context ? buildRuntimeDashboard(spec, { include_molt_map: true, mode: "developer" }) : undefined;
        return { content: [{ type: "text", text: JSON.stringify(buildRuntimeIRMatrix({ spec, molt_map: dashboard?.molt_map, dashboard }), null, 2) }] };
      }
    }, { optional: true });
    api.registerTool({
      name: "umg_envoy_runtime_inspect",
      description: "Inspect dry-run runtime selection and artifact structure using a read-only drill-down layer without executing anything.",
      parameters: Type.Object({ query_type: Type.String(), artifact_id: Type.Optional(Type.String()), user_task: Type.Optional(Type.String()), requested_capabilities: Type.Optional(Type.Array(Type.String())), requested_tools: Type.Optional(Type.Array(Type.String())), preferred_kind: Type.Optional(Type.Union([Type.Literal("sleeve"), Type.Literal("neostack"), Type.Literal("neoblock"), Type.Literal("molt_block")])), depth: Type.Optional(Type.Union([Type.Literal(0), Type.Literal(1), Type.Literal(2), Type.Literal(3)])), include_support_docs: Type.Optional(Type.Boolean()), include_provenance: Type.Optional(Type.Boolean()), include_matrix_links: Type.Optional(Type.Boolean()), include_molt_map_links: Type.Optional(Type.Boolean()) }, { additionalProperties: false }),
      async execute(input: { query_type: string; artifact_id?: string; user_task?: string; requested_capabilities?: string[]; requested_tools?: string[]; preferred_kind?: "sleeve" | "neostack" | "neoblock" | "molt_block"; depth?: 0 | 1 | 2 | 3; include_support_docs?: boolean; include_provenance?: boolean; include_matrix_links?: boolean; include_molt_map_links?: boolean }) {
        const config = loadBlockLibraryConfig();
        const resolver = new UMGResolver(config, path.dirname(new URL(import.meta.url).pathname));
        const registry = buildRegistry(resolver);
        const spec = compileRuntimeSpecDryRun({
          user_task: input.user_task ?? "Inspect the safe UMG public runtime projection.",
          requested_capabilities: input.requested_capabilities,
          requested_tools: input.requested_tools,
          preferred_kind: input.preferred_kind,
          execution_mode: "dry_run"
        });
        const dashboard = buildRuntimeDashboard(spec, { include_molt_map: true, include_ir_matrix: true, mode: "developer" });
        return { content: [{ type: "text", text: JSON.stringify(inspectRuntimeDrilldown({
          request: {
            query_type: input.query_type as any,
            artifact_id: input.artifact_id,
            depth: input.depth,
            include_support_docs: input.include_support_docs,
            include_provenance: input.include_provenance,
            include_matrix_links: input.include_matrix_links,
            include_molt_map_links: input.include_molt_map_links
          },
          registryArtifacts: [...registry.artifacts, ...registry.support_artifacts],
          runtimeSpec: spec,
          dashboard,
          irMatrix: dashboard.ir_matrix,
          moltMap: dashboard.molt_map
        }), null, 2) }] };
      }
    }, { optional: true });
  }
};

export default entry;
