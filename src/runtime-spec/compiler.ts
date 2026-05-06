import path from "node:path";
import { loadBlockLibraryConfig } from "../resolver/block-library-config.js";
import { buildRegistry } from "../resolver/indexer.js";
import { UMGResolver } from "../resolver/resolver.js";
import { classifyRuntimeSpecCandidates } from "./classifier.js";
import { selectRuntimeArtifacts } from "./selector.js";
import { selectActiveSleeveDryRun } from "./sleeve-selection.js";
import { classifySleeveToolBindingsDryRun } from "./tool-binding-policy.js";
import { event, matrixId, runtimeSpecId, traceId } from "./trace.js";
import type { RuntimeSpecCompileInput, RuntimeSpecV0 } from "./types.js";

export function compileRuntimeSpecDryRun(input: RuntimeSpecCompileInput): RuntimeSpecV0 {
  const config = loadBlockLibraryConfig();
  const resolver = new UMGResolver(config, path.resolve(process.cwd()));
  const registry = buildRegistry(resolver);
  const candidates = classifyRuntimeSpecCandidates(input, registry.artifacts, registry.support_artifacts);
  const selection = selectRuntimeArtifacts({ ...input, execution_mode: "dry_run" }, candidates.selectable, candidates.support);

  const selection_events = [event("RUNTIMESPEC_CREATED", "RuntimeSpec dry-run compilation started.")];
  if (selection.candidates.sleeve) selection_events.push(event("SLEEVE_CANDIDATE_SELECTED", "Identified strongest sleeve candidate for conservative dry-run evaluation.", selection.candidates.sleeve));
  if (selection.candidates.neostack && selection.active_neostacks.length > 0) selection_events.push(event("NEOSTACK_SELECTED", "Selected strongest neostack candidate.", selection.candidates.neostack));
  if (selection.candidates.neoblock && selection.active_neoblocks.length > 0) selection_events.push(event("NEOBLOCK_SELECTED", "Selected strongest neoblock candidate.", selection.candidates.neoblock));
  if (selection.candidates.molt && selection.active_molt_blocks.length > 0) selection_events.push(event("MOLT_BLOCK_SELECTED", "Selected supporting MOLT block candidate.", selection.candidates.molt));
  if (selection.support_artifacts.length > 0) {
    for (const artifactId of selection.support_artifacts) {
      selection_events.push({ event: "SUPPORT_ARTIFACT_ATTACHED", artifact_id: artifactId, reason: "Attached support-only artifact for explanation/context." });
    }
  }

  const requested_tools = input.requested_tools ?? inferRequestedTools(input.user_task);
  const available = requested_tools.filter((tool) => tool === "langchain_bridge");
  const blocked = requested_tools.filter((tool) => tool === "mcp.real_remote_execution");
  const requires_approval = requested_tools.filter((tool) => tool.includes("agent_mode"));
  if (requested_tools.length > 0) {
    selection_events.push({ event: "TOOL_BINDING_REQUESTED", reason: `Requested tool bindings: ${requested_tools.join(', ')}` });
  }
  if (requires_approval.length > 0) {
    selection_events.push({ event: "APPROVAL_REQUIRED", reason: `Approval would be required for: ${requires_approval.join(', ')}` });
  }
  selection_events.push({ event: "GOVERNANCE_HANDOFF_CREATED", reason: "RuntimeSpec prepared governance handoff intent in dry-run mode." });

  const sleeve_selection = selectActiveSleeveDryRun({
    user_task: input.user_task,
    registry_artifacts: registry.artifacts,
    selected_neostacks: selection.active_neostacks,
    selected_neoblocks: selection.active_neoblocks,
    selected_molt_blocks: selection.active_molt_blocks,
    requested_tools,
    requested_capabilities: input.requested_capabilities ?? [],
    governance: {
      execution_mode: "dry_run",
      approval_required: requires_approval.length > 0,
      governed_execution_plane: true,
      mcp_policy: blocked.length > 0 ? "blocked_by_default" : "metadata_only",
      langchain_policy: available.includes("langchain_bridge") ? "governed" : "dry_run"
    }
  });

  if (sleeve_selection.active_sleeve) {
    selection.runtime_kind = "sleeve_runtime";
    selection.active_sleeve = sleeve_selection.active_sleeve;
    selection.warnings = selection.warnings.filter((warning) => warning !== "no matching sleeve found");
    selection_events.push({ event: "SLEEVE_CANDIDATE_SELECTED", artifact_id: sleeve_selection.active_sleeve, reason: "Selected sleeve met conservative dry-run threshold." });
  }
  for (const warning of [...selection.warnings, ...sleeve_selection.warnings]) {
    selection_events.push({ event: "SELECTION_WARNING", reason: warning });
  }

  const compiledSpecBase = {
    runtime_spec_id: runtimeSpecId(),
    runtime_kind: selection.active_sleeve ? "sleeve_runtime" : selection.runtime_kind,
    source_mode: resolver.status().source_mode,
    created_at: new Date().toISOString(),
    input: {
      user_task: input.user_task,
      requested_capabilities: input.requested_capabilities ?? [],
      requested_tools,
      risk_level: inferRiskLevel(input.user_task, requested_tools)
    },
    selection: {
      active_sleeve: selection.active_sleeve,
      active_neostacks: selection.active_neostacks,
      active_neoblocks: selection.active_neoblocks,
      active_molt_blocks: selection.active_molt_blocks,
      support_artifacts: selection.support_artifacts,
      candidate_sleeves: sleeve_selection.candidate_sleeves,
      selection_confidence: sleeve_selection.selection_confidence,
      selection_policy: sleeve_selection.selection_policy,
      selection_warnings: sleeve_selection.warnings
    },
    constraints: {
      instructions: [],
      blocked_artifacts: [],
      required_approvals: requires_approval,
      protected_rules: ["governed_execution_plane_required", "support_artifacts_non_runtime_selectable"]
    },
    tool_bindings: {
      requested: requested_tools,
      available,
      blocked,
      requires_approval
    },
    governance: {
      execution_mode: "dry_run" as const,
      approval_required: requires_approval.length > 0,
      governed_execution_plane: true as const,
      mcp_policy: blocked.length > 0 ? "blocked_by_default" as const : "metadata_only" as const,
      langchain_policy: available.includes("langchain_bridge") ? "governed" as const : "dry_run" as const
    },
    trace: {
      trace_id: traceId(),
      selection_events,
      warnings: selection.warnings
    },
    matrix: {
      matrix_id: matrixId(),
      available: false
    },
    status: selection.runtime_kind === "assembled_runtime" ? "assembled_runtime" as const : "compiled" as const
  };

  const structuredToolBindings = classifySleeveToolBindingsDryRun({
    runtimeSpec: compiledSpecBase as RuntimeSpecV0,
    registryArtifacts: [...registry.artifacts, ...registry.support_artifacts]
  });

  return {
    ...compiledSpecBase,
    tool_bindings: structuredToolBindings
  };
}

function inferRequestedTools(task: string): string[] {
  const lower = task.toLowerCase();
  const tools: string[] = [];
  if (lower.includes("langchain")) tools.push("langchain_bridge");
  if (lower.includes("agent")) tools.push("langchain.agent_mode");
  if (lower.includes("mcp")) tools.push("mcp.real_remote_execution");
  return tools;
}

function inferRiskLevel(task: string, tools: string[]): "low" | "medium" | "high" {
  const lower = task.toLowerCase();
  if (tools.some((tool) => tool.includes("mcp")) || lower.includes("approval")) return "high";
  if (tools.some((tool) => tool.includes("agent")) || lower.includes("workflow")) return "medium";
  return "low";
}
