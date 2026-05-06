import path from "node:path";
import { stableHash } from "./approval-checkpoint-contract.js";
import { compileRuntimeSpecDryRun } from "./compiler.js";
import { buildRuntimeDashboard } from "./dashboard.js";
import { buildUMGRuntimeDisplayContract } from "./runtime-display.js";
import { loadBlockLibraryConfig } from "../resolver/block-library-config.js";
import { UMGResolver } from "../resolver/resolver.js";
import { buildRegistry } from "../resolver/indexer.js";
import { searchRegistry } from "../resolver/search.js";
export function buildUMGEnvoyAlphaDemo(input) {
    const query = (input?.query ?? "langchain bridge").trim() || "langchain bridge";
    const kind = input?.kind ?? "neostack";
    const limit = Math.min(Math.max(input?.limit ?? 3, 1), 10);
    const include_display = input?.include_display ?? true;
    const display_mode = input?.display_mode ?? "compact";
    const config = loadBlockLibraryConfig();
    const resolver = new UMGResolver(config, path.resolve(process.cwd()));
    const registry = buildRegistry(resolver);
    const status = resolver.status();
    const search = searchRegistry(registry.artifacts, { text: query, kinds: kind ? [kind] : undefined, limit }, registry.support_artifacts);
    const runtimeSpec = compileRuntimeSpecDryRun({ user_task: `Search the UMG library for ${query}.`, requested_tools: ["resolver.library_search"], execution_mode: "dry_run" });
    const dashboard = buildRuntimeDashboard(runtimeSpec, {
        include_molt_map: true,
        include_ir_matrix: true,
        include_governed_handoff: true,
        include_approval_checkpoint: true,
        include_governed_alpha: true,
        governed_alpha_tool_id: "resolver.library_search",
        governed_alpha_query: query,
        governed_alpha_kind: kind,
        governed_alpha_limit: limit,
        mode: "developer"
    });
    return {
        demo_id: `alpha_demo_${stableHash({ query, kind, limit, display_mode })}`,
        mode: "alpha_demo",
        execution_boundary: {
            file_contents_read: false,
            write_performed: false,
            delete_performed: false,
            shell_command_executed: false,
            external_calls_performed: false,
            statement: "Alpha demo completed using safe metadata-only surfaces."
        },
        library: {
            status_available: true,
            source_mode: status.source_mode,
            artifact_counts: registry.counts.by_kind
        },
        search_sample: {
            query,
            kind,
            limit,
            result_count: search.runtime_results.length + search.support_results.length,
            results: [...search.runtime_results, ...search.support_results].slice(0, limit).map((result) => ({
                id: result.id,
                kind: result.kind,
                title: result.title,
                description: result.description,
                canonical: result.canonical,
                source_kind: result.source_kind,
                status: result.status,
                score: result.score,
                reasons: result.reasons
            }))
        },
        capabilities: {
            metadata_alpha_targets: ["resolver.library_status", "resolver.library_search", "tool.capability_summary"],
            local_readonly_surfaces: ["umg_envoy_local_readonly_plan", "umg_envoy_local_readonly_scan"],
            blocked_capabilities: [
                "file contents reading",
                "file writes",
                "file deletes",
                "shell execution",
                "remote MCP execution",
                "MCP server startup",
                "LangChain agent mode",
                "broad Desktop Bridge automation",
                "automatic local scan"
            ]
        },
        runtime_surfaces: {
            runtime_spec_dry_run: true,
            visibility_header: true,
            molt_map: true,
            ir_matrix: true,
            dashboard: true,
            drilldown: true
        },
        local_readonly: {
            plan_surface: "umg_envoy_local_readonly_plan",
            scan_surface: "umg_envoy_local_readonly_scan",
            requires_scope_hash: true,
            requires_approval_token: true,
            requires_exact_scope_approval: true,
            requires_no_contents_confirmation: true,
            automatic_scan_performed: false
        },
        display: include_display ? buildUMGRuntimeDisplayContract({ dashboard, mode: display_mode }) : undefined,
        warnings: []
    };
}
