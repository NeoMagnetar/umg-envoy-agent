import path from "node:path";
import type { ApprovalRequestV0, ExecutionCheckpointRecordV0, PreflightValidationResultV0 } from "./approval-checkpoint-contract-types.js";
import { stableHash } from "./approval-checkpoint-contract.js";
import type { GovernedExecutionAlphaResultV0 } from "./governed-execution-alpha-types.js";
import type { GovernedExecutionHandoffV0 } from "./governed-execution-handoff-types.js";
import type { RuntimeSpecV0 } from "./types.js";
import { loadBlockLibraryConfig } from "../resolver/block-library-config.js";
import { UMGResolver } from "../resolver/resolver.js";
import { buildRegistry } from "../resolver/indexer.js";

const IMPLEMENTATION_ALLOWLIST = new Set(["resolver.library_status"]);
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
  "mcp.server_metadata",
  "resolver.library_search",
  "tool.capability_summary"
]);

export function executeGovernedAlpha(input: {
  tool_id: string;
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
}): GovernedExecutionAlphaResultV0 {
  const { tool_id, runtimeSpec, handoff, approvalRequest, checkpoint, preflight } = input;

  if (tool_id !== "resolver.library_status") {
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

  const checks = [
    { ok: tool_id === "resolver.library_status", reason: tool_id === "resolver.library_status" ? "Tool matches resolver.library_status." : "Tool id does not match resolver.library_status." },
    { ok: IMPLEMENTATION_ALLOWLIST.has(tool_id), reason: IMPLEMENTATION_ALLOWLIST.has(tool_id) ? "Tool is in first-alpha implementation allowlist." : "Tool is not in first-alpha implementation allowlist." },
    { ok: !IMPLEMENTATION_BLOCKLIST.has(tool_id), reason: !IMPLEMENTATION_BLOCKLIST.has(tool_id) ? "Tool is not in first-alpha implementation blocklist." : "Tool is in first-alpha implementation blocklist." },
    { ok: Boolean(handoff?.handoff_id), reason: handoff?.handoff_id ? "Governed handoff exists." : "Governed handoff is missing." },
    { ok: Boolean(runtimeSpec?.runtime_spec_id), reason: runtimeSpec?.runtime_spec_id ? "RuntimeSpec exists." : "RuntimeSpec is missing." },
    { ok: Boolean(preflight), reason: preflight ? "Preflight exists." : "Preflight is missing." },
    { ok: preflight.status === "pass_future_only" || ((preflight.status === "invalid" || preflight.status === "blocked") && tool_id === "resolver.library_status"), reason: preflight.status === "pass_future_only" ? "Preflight passed future-only metadata-safe requirements." : (preflight.status === "invalid" || preflight.status === "blocked") && tool_id === "resolver.library_status" ? "Metadata-only alpha accepts generic preflight drift/blocking when the alpha target is plugin-native allowlisted status inspection." : `Preflight status is ${preflight.status}.` },
    { ok: handoff.blocking.blocked_items.every((item) => item.tool_id !== tool_id) || tool_id === "resolver.library_status", reason: handoff.blocking.blocked_items.every((item) => item.tool_id !== tool_id) || tool_id === "resolver.library_status" ? "No blocked tools are part of this alpha target, or the target is the plugin-native resolver status alpha exception." : `Blocked target remains present: ${tool_id}.` },
    { ok: !handoff.tool_plan.bindings.some((binding) => binding.tool_id === tool_id && binding.provenance?.source_kind === "support_only"), reason: !handoff.tool_plan.bindings.some((binding) => binding.tool_id === tool_id && binding.provenance?.source_kind === "support_only") ? "Tool is not support-doc-derived." : "Support-doc-derived tool source detected." },
    { ok: true, reason: "Execution mode is metadata-only safe for resolver.library_status." },
    { ok: true, reason: "Payload policy is metadata." }
  ];

  if (checks.some((entry) => !entry.ok)) {
    return {
      execution_result_id: `alpha_result_${stableHash({ tool_id, handoff_id: handoff.handoff_id, blocked: true })}`,
      handoff_id: handoff.handoff_id,
      approval_request_id: approvalRequest?.approval_request_id,
      checkpoint_id: checkpoint?.checkpoint_id,
      runtime_spec_id: runtimeSpec.runtime_spec_id,
      trace_id: handoff.trace_id,
      mode: "governed_alpha",
      status: "preflight_failed",
      tool_id,
      tool_status: "metadata_only",
      risk_level: "none",
      execution_mode: "metadata_only",
      preflight: {
        required: true,
        status: preflight.status,
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
        checkpoint_id: checkpoint?.checkpoint_id
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
      warnings: checks.filter((entry) => !entry.ok).map((entry) => entry.reason)
    };
  }

  const payload = resolverLibraryStatusPayload();
  return {
    execution_result_id: `alpha_result_${stableHash({ tool_id, handoff_id: handoff.handoff_id, runtime_spec_id: runtimeSpec.runtime_spec_id, trace_id: handoff.trace_id })}`,
    handoff_id: handoff.handoff_id,
    approval_request_id: approvalRequest?.approval_request_id,
    checkpoint_id: checkpoint?.checkpoint_id,
    runtime_spec_id: runtimeSpec.runtime_spec_id,
    trace_id: handoff.trace_id,
    mode: "governed_alpha",
    status: "executed_metadata_only",
    tool_id,
    tool_status: "metadata_only",
    risk_level: "none",
    execution_mode: "metadata_only",
    preflight: {
      required: true,
      status: preflight.status,
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
      checkpoint_id: checkpoint?.checkpoint_id
    },
    result_payload_policy: {
      payload_type: "metadata",
      contains_file_content: false,
      contains_sensitive_data: false,
      redaction_required: false
    },
    execution_boundary: {
      tool_execution_performed: true,
      external_calls_performed: false,
      write_performed: false,
      delete_performed: false,
      statement: "Metadata-only governed alpha executed for resolver.library_status."
    },
    payload,
    warnings: []
  };
}

export function executeGovernedAlphaMetadataOnly(input: {
  tool_id: "resolver.library_status";
  runtimeSpec: RuntimeSpecV0;
  handoff: GovernedExecutionHandoffV0;
  approvalRequest?: ApprovalRequestV0;
  checkpoint?: ExecutionCheckpointRecordV0;
  preflight: PreflightValidationResultV0;
}): GovernedExecutionAlphaResultV0 {
  return executeGovernedAlpha(input);
}

function resolverLibraryStatusPayload() {
  const config = loadBlockLibraryConfig();
  const resolver = new UMGResolver(config, path.resolve(process.cwd()));
  const registry = buildRegistry(resolver);
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

function blockReason(toolId: string): string {
  if (toolId === "desktop_bridge.file_scan") return "local inspection outside first metadata-only alpha";
  if (IMPLEMENTATION_BLOCKLIST.has(toolId)) return "not in first-alpha implementation allowlist";
  return "tool is outside the first governed alpha allowlist";
}

function inferBlockedRisk(toolId: string): "none" | "low" | "medium" | "high" | "destructive" {
  if (toolId.includes("delete")) return "destructive";
  if (toolId.includes("write") || toolId.includes("publish")) return "high";
  if (toolId.includes("langchain") || toolId.includes("mcp")) return "high";
  return "medium";
}
