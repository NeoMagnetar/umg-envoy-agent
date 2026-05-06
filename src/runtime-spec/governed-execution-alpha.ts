import path from "node:path";
import type { ApprovalRequestV0, ExecutionCheckpointRecordV0, PreflightValidationResultV0 } from "./approval-checkpoint-contract-types.js";
import { stableHash } from "./approval-checkpoint-contract.js";
import type { GovernedExecutionAlphaResultV0 } from "./governed-execution-alpha-types.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { RuntimeSpecV0 } from "./types.js";
import { loadBlockLibraryConfig } from "../resolver/block-library-config.js";
import { UMGResolver } from "../resolver/resolver.js";
import { buildRegistry } from "../resolver/indexer.js";
import { searchRegistry } from "../resolver/search.js";
import { DEFAULT_KNOWN_TOOL_SURFACES } from "./tool-binding-policy.js";

const IMPLEMENTATION_ALLOWLIST = new Set([
  "resolver.library_status",
  "resolver.library_search",
  "tool.capability_summary"
]);

const IMPLEMENTATION_BLOCKLIST = new Set([
  "desktop_bridge.file_write",
  "desktop_bridge.file_delete",
  "phasebridge.workflow_execute",
  "mcp.real_remote_execution",
  "langchain.agent_mode",
  "repo.write",
  "repo.publish",
  "shell.command",
  "npm.publish",
  "desktop_bridge.file_scan",
  "mcp.server_metadata"
]);

const SEARCH_DEFAULT_LIMIT = 10;
const SEARCH_HARD_MAX = 25;

export function executeGovernedAlpha(input: {
  tool_id: string;
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
  query?: string;
  kind?: string;
  limit?: number;
}): GovernedExecutionAlphaResultV0 {
  const { tool_id, runtimeSpec, handoff, approvalRequest, checkpoint, preflight } = input;

  if (!IMPLEMENTATION_ALLOWLIST.has(tool_id)) {
    return blockedAlphaResult({
      tool_id,
      runtimeSpec,
      handoff,
      approvalRequest,
      checkpoint,
      preflight,
      reason: blockReason(tool_id)
    });
  }

  const binding = resolveBinding(tool_id, handoff);
  const checks = buildMetadataChecks({ tool_id, runtimeSpec, handoff, preflight, binding });
  if (checks.some((entry) => !entry.ok)) {
    return preflightFailedAlphaResult({ tool_id, runtimeSpec, handoff, approvalRequest, checkpoint, preflight, warnings: checks.filter((entry) => !entry.ok).map((entry) => entry.reason) });
  }

  if (tool_id === "resolver.library_status") {
    return successAlphaResult({
      tool_id,
      runtimeSpec,
      handoff,
      approvalRequest,
      checkpoint,
      preflight,
      payload: resolverLibraryStatusPayload(),
      payloadPolicy: {
        payload_type: "metadata",
        contains_file_content: false,
        contains_sensitive_data: false,
        redaction_required: false
      },
      statement: "Metadata-only governed alpha executed for resolver.library_status.",
      warnings: []
    });
  }

  if (tool_id === "resolver.library_search") {
    const query = sanitizeQuery(input.query);
    if (!query) {
      return preflightFailedAlphaResult({ tool_id, runtimeSpec, handoff, approvalRequest, checkpoint, preflight, warnings: ["resolver.library_search requires a non-empty query"] });
    }
    const { effectiveLimit, warnings } = normalizeLimit(input.limit);
    const payload = resolverLibrarySearchPayload({ query, kind: input.kind, limit: effectiveLimit });
    return successAlphaResult({
      tool_id,
      runtimeSpec,
      handoff,
      approvalRequest,
      checkpoint,
      preflight,
      payload: {
        query,
        kind: input.kind ?? null,
        limit: effectiveLimit,
        hard_max: SEARCH_HARD_MAX,
        runtime_results: payload.runtime_results,
        support_results: payload.support_results
      },
      payloadPolicy: {
        payload_type: "metadata",
        contains_file_content: false,
        contains_sensitive_data: false,
        redaction_required: false
      },
      statement: "Metadata-only governed alpha executed for resolver.library_search.",
      warnings
    });
  }

  return successAlphaResult({
    tool_id,
    runtimeSpec,
    handoff,
    approvalRequest,
    checkpoint,
    preflight,
    payload: capabilitySummaryPayload(),
    payloadPolicy: {
      payload_type: "metadata",
      contains_file_content: false,
      contains_sensitive_data: false,
      redaction_required: false
    },
    statement: "Metadata-only governed alpha executed for tool.capability_summary.",
    warnings: []
  });
}

export function executeGovernedAlphaMetadataOnly(input: {
  tool_id: "resolver.library_status" | "resolver.library_search" | "tool.capability_summary";
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
  query?: string;
  kind?: string;
  limit?: number;
}): GovernedExecutionAlphaResultV0 {
  return executeGovernedAlpha(input);
}

function resolverLibraryStatusPayload() {
  const { resolver, registry } = loadResolverContext();
  const status = resolver.status();
  return {
    source_mode: status.source_mode,
    configured_sources: status.configured_sources,
    existing_sources: status.existing_sources,
    missing_sources: status.missing_sources,
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
    support_artifact_count: registry.support_artifacts.length,
    warnings_summary: registry.warnings_summary,
    core_ai_provenance: registry.core_ai_provenance,
    runtime_surface: {
      runtime_spec_dry_run: true,
      runtime_visibility_header: true,
      runtime_molt_map: true,
      runtime_dashboard: true,
      runtime_ir_matrix: true,
      runtime_inspect: true
    }
  };
}

function resolverLibrarySearchPayload(input: { query: string; kind?: string; limit: number }) {
  const { registry } = loadResolverContext();
  const results = searchRegistry(registry.artifacts, {
    text: input.query,
    kinds: input.kind ? [input.kind] : undefined,
    limit: input.limit
  }, registry.support_artifacts);

  return {
    runtime_results: results.runtime_results.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      description: item.description,
      canonical: item.canonical,
      runtime_selectable: true,
      support_only: false,
      source_kind: item.source_kind,
      discovery_method: item.discovery_method,
      generated_from_lane: undefined,
      status: item.status,
      score: item.score,
      reasons: item.reasons,
      path: item.path,
      warnings: item.warnings
    })),
    support_results: results.support_results.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      description: item.description,
      canonical: item.canonical,
      runtime_selectable: false,
      support_only: true,
      source_kind: item.source_kind,
      discovery_method: item.discovery_method,
      generated_from_lane: undefined,
      status: item.status,
      score: item.score,
      reasons: item.reasons,
      path: item.path,
      warnings: item.warnings
    }))
  };
}

function capabilitySummaryPayload() {
  return {
    metadata_only: [
      summaryRow("resolver.library_status", "metadata_only", "none", "metadata_only", false, "plugin_native_metadata_only", true),
      summaryRow("resolver.library_search", "metadata_only", "none", "metadata_only", false, "plugin_native_metadata_only", true),
      summaryRow("tool.capability_summary", "metadata_only", "none", "metadata_only", false, "plugin_native_metadata_only", true)
    ],
    candidate_only: [
      summaryRow("mcp.server_metadata", "metadata_only", "none", "metadata_only", false, "mcp_metadata_only", false, "candidate_only")
    ],
    blocked: [
      summaryRow("desktop_bridge.file_scan", "blocked", "medium", "blocked", false, "local_inspection_outside_metadata_alpha_v2", false, "blocked"),
      summaryRow("desktop_bridge.file_write", "blocked", "high", "blocked", false, "file_write_outside_metadata_alpha", false, "blocked"),
      summaryRow("desktop_bridge.file_delete", "blocked", "destructive", "blocked", false, "file_delete_outside_metadata_alpha", false, "blocked"),
      summaryRow("phasebridge.workflow_execute", "blocked", "high", "blocked", false, "phasebridge_execution_outside_metadata_alpha", false, "blocked"),
      summaryRow("mcp.real_remote_execution", "blocked", "high", "blocked", false, "mcp_remote_execution_blocked", false, "blocked"),
      summaryRow("langchain.agent_mode", "blocked", "high", "blocked", false, "langchain_agent_mode_outside_metadata_alpha", false, "blocked"),
      summaryRow("shell.command", "blocked", "high", "blocked", false, "shell_execution_blocked", false, "blocked"),
      summaryRow("npm.publish", "blocked", "high", "blocked", false, "publish_blocked", false, "blocked"),
      summaryRow("repo.write", "blocked", "high", "blocked", false, "repo_write_blocked", false, "blocked"),
      summaryRow("repo.publish", "blocked", "high", "blocked", false, "repo_publish_blocked", false, "blocked")
    ]
  };
}

function summaryRow(tool_id: string, status: string, risk_level: string, execution_mode: string, approval_required: boolean, governance_policy: string, alpha_eligible: boolean, blocked_reason?: string) {
  return { tool_id, status, risk_level, execution_mode, approval_required, governance_policy, alpha_eligible, blocked_reason };
}

function buildMetadataChecks(input: {
  tool_id: string;
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  preflight: PreflightValidationResultV0;
  binding?: GovernedExecutionHandoffV0["tool_plan"]["bindings"][number];
}) {
  const { tool_id, runtimeSpec, handoff, preflight, binding } = input;
  return [
    { ok: IMPLEMENTATION_ALLOWLIST.has(tool_id), reason: "Tool is in metadata alpha allowlist." },
    { ok: !IMPLEMENTATION_BLOCKLIST.has(tool_id), reason: IMPLEMENTATION_BLOCKLIST.has(tool_id) ? blockReason(tool_id) : "Tool is not blocklisted." },
    { ok: Boolean(handoff?.handoff_id), reason: handoff?.handoff_id ? "Governed handoff exists." : "Governed handoff is missing." },
    { ok: Boolean(runtimeSpec?.runtime_spec_id), reason: runtimeSpec?.runtime_spec_id ? "RuntimeSpec exists." : "RuntimeSpec is missing." },
    { ok: Boolean(preflight), reason: preflight ? "Preflight exists." : "Preflight is missing." },
    { ok: preflight.status === "pass_future_only", reason: preflight.status === "pass_future_only" ? "Preflight passed future-only metadata-safe requirements." : `Preflight status is ${preflight.status}.` },
    { ok: binding?.status === "metadata_only", reason: binding?.status === "metadata_only" ? "Tool classification is metadata_only." : "Tool classification is not metadata_only." },
    { ok: binding?.risk_level === "none", reason: binding?.risk_level === "none" ? "Tool risk level is none." : "Tool risk level is not none." },
    { ok: binding?.approval_required === false, reason: binding?.approval_required === false ? "Approval is not required." : "Approval is still required." },
    { ok: handoff.checkpoint.checkpoint_required === false, reason: handoff.checkpoint.checkpoint_required === false ? "Checkpoint is not required." : "Checkpoint is still required." },
    { ok: !handoff.tool_plan.bindings.some((entry) => entry.tool_id === tool_id && entry.provenance?.source_kind === "support_only"), reason: !handoff.tool_plan.bindings.some((entry) => entry.tool_id === tool_id && entry.provenance?.source_kind === "support_only") ? "Tool is not support-doc-derived." : "Support-doc-derived tool source detected." }
  ];
}

function resolveBinding(tool_id: string, handoff: GovernedExecutionHandoffV0) {
  return handoff.tool_plan.bindings.find((binding) => binding.tool_id === tool_id);
}

function successAlphaResult(input: {
  tool_id: string;
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
  payload: Record<string, unknown>;
  payloadPolicy: GovernedExecutionAlphaResultV0["result_payload_policy"];
  statement: string;
  warnings: string[];
}): GovernedExecutionAlphaResultV0 {
  return {
    execution_result_id: `alpha_result_${stableHash({ tool_id: input.tool_id, handoff_id: input.handoff.handoff_id, runtime_spec_id: input.runtimeSpec.runtime_spec_id, trace_id: input.handoff.trace_id, payload: input.statement })}`,
    handoff_id: input.handoff.handoff_id,
    approval_request_id: input.approvalRequest?.approval_request_id,
    checkpoint_id: input.checkpoint?.checkpoint_id,
    runtime_spec_id: input.runtimeSpec.runtime_spec_id,
    trace_id: input.handoff.trace_id,
    mode: "governed_alpha",
    status: "executed_metadata_only",
    tool_id: input.tool_id,
    tool_status: "metadata_only",
    risk_level: "none",
    execution_mode: "metadata_only",
    preflight: {
      required: true,
      status: input.preflight.status,
      checks_passed: true
    },
    approval: {
      required: false,
      approved: false,
      approval_scope: "not_required"
    },
    checkpoint: {
      required: false,
      checkpoint_written: false,
      checkpoint_id: input.checkpoint?.checkpoint_id
    },
    result_payload_policy: input.payloadPolicy,
    execution_boundary: {
      tool_execution_performed: true,
      external_calls_performed: false,
      write_performed: false,
      delete_performed: false,
      statement: input.statement
    },
    payload: input.payload,
    warnings: input.warnings
  };
}

function preflightFailedAlphaResult(input: {
  tool_id: string;
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
  warnings: string[];
}): GovernedExecutionAlphaResultV0 {
  return {
    execution_result_id: `alpha_result_${stableHash({ tool_id: input.tool_id, handoff_id: input.handoff.handoff_id, blocked: true })}`,
    handoff_id: input.handoff.handoff_id,
    approval_request_id: input.approvalRequest?.approval_request_id,
    checkpoint_id: input.checkpoint?.checkpoint_id,
    runtime_spec_id: input.runtimeSpec.runtime_spec_id,
    trace_id: input.handoff.trace_id,
    mode: "governed_alpha",
    status: "preflight_failed",
    tool_id: input.tool_id,
    tool_status: "metadata_only",
    risk_level: "none",
    execution_mode: "metadata_only",
    preflight: {
      required: true,
      status: input.preflight.status,
      checks_passed: false
    },
    approval: {
      required: false,
      approved: false,
      approval_scope: "not_required"
    },
    checkpoint: {
      required: false,
      checkpoint_written: false,
      checkpoint_id: input.checkpoint?.checkpoint_id
    },
    result_payload_policy: {
      payload_type: "metadata",
      contains_file_content: false,
      contains_sensitive_data: false,
      redaction_required: false
    },
    execution_boundary: {
      tool_execution_performed: false,
      external_calls_performed: false,
      write_performed: false,
      delete_performed: false,
      statement: "No tools executed."
    },
    payload: undefined,
    warnings: input.warnings
  };
}

function blockedAlphaResult(input: {
  tool_id: string;
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
  reason: string;
}): GovernedExecutionAlphaResultV0 {
  return {
    execution_result_id: `alpha_result_${stableHash({ tool_id: input.tool_id, handoff_id: input.handoff.handoff_id, blocked: true })}`,
    handoff_id: input.handoff.handoff_id,
    approval_request_id: input.approvalRequest?.approval_request_id,
    checkpoint_id: input.checkpoint?.checkpoint_id,
    runtime_spec_id: input.runtimeSpec.runtime_spec_id,
    trace_id: input.handoff.trace_id,
    mode: "governed_alpha",
    status: "blocked",
    tool_id: input.tool_id,
    tool_status: "blocked",
    risk_level: inferBlockedRisk(input.tool_id),
    execution_mode: "blocked",
    preflight: {
      required: true,
      status: input.preflight.status,
      checks_passed: false
    },
    approval: {
      required: false,
      approved: false,
      approval_scope: "not_required"
    },
    checkpoint: {
      required: false,
      checkpoint_written: false,
      checkpoint_id: input.checkpoint?.checkpoint_id
    },
    result_payload_policy: {
      payload_type: "none",
      contains_file_content: false,
      contains_sensitive_data: false,
      redaction_required: false
    },
    execution_boundary: {
      tool_execution_performed: false,
      external_calls_performed: false,
      write_performed: false,
      delete_performed: false,
      statement: "No tools executed."
    },
    payload: undefined,
    warnings: [input.reason]
  };
}

function sanitizeQuery(value?: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeLimit(limit?: number): { effectiveLimit: number; warnings: string[] } {
  if (!limit || Number.isNaN(limit)) return { effectiveLimit: SEARCH_DEFAULT_LIMIT, warnings: [] };
  if (limit > SEARCH_HARD_MAX) {
    return { effectiveLimit: SEARCH_HARD_MAX, warnings: ["limit clamped to metadata alpha hard max"] };
  }
  if (limit < 1) return { effectiveLimit: 1, warnings: [] };
  return { effectiveLimit: Math.floor(limit), warnings: [] };
}

function loadResolverContext() {
  const config = loadBlockLibraryConfig();
  const resolver = new UMGResolver(config, path.resolve(process.cwd()));
  const registry = buildRegistry(resolver);
  return { resolver, registry };
}

function blockReason(toolId: string): string {
  if (toolId === "mcp.server_metadata") return "candidate-only / not implemented in metadata alpha v2";
  if (toolId === "desktop_bridge.file_scan") return "local inspection outside metadata alpha v2";
  if (IMPLEMENTATION_BLOCKLIST.has(toolId)) return "not in metadata alpha implementation allowlist";
  return "tool is outside the governed metadata alpha allowlist";
}

function inferBlockedRisk(toolId: string): "none" | "low" | "medium" | "high" | "destructive" {
  if (toolId.includes("delete")) return "destructive";
  if (toolId.includes("write") || toolId.includes("publish")) return "high";
  if (toolId.includes("langchain") || toolId.includes("mcp")) return "high";
  return "medium";
}
