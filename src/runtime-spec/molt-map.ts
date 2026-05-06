import crypto from "node:crypto";
import type { RuntimeMOLTMapField, RuntimeMOLTMapV0 } from "./molt-map-types.js";
import type { RuntimeSpecV0 } from "./types.js";

function mapId(): string {
  return `molt_map_${crypto.randomUUID().replace(/-/g, "")}`;
}

function field(value: string | "n/a", source: RuntimeMOLTMapField["source"], artifact_ids: string[], confidence: RuntimeMOLTMapField["confidence"], notes?: string[]): RuntimeMOLTMapField {
  return { value, source, artifact_ids, confidence, notes };
}

export function buildRuntimeMOLTMap(spec: RuntimeSpecV0): RuntimeMOLTMapV0 {
  const firstNeostack = spec.selection.active_neostacks[0];
  const supportMode = spec.selection.support_artifacts.length > 0 && spec.selection.active_sleeve === null && spec.selection.active_neostacks.length === 0;

  const Trigger = field(
    spec.input.user_task || "n/a",
    spec.input.user_task ? "runtime_input" : "n/a",
    [],
    spec.input.user_task ? "high" : "n/a"
  );

  const Directive = supportMode
    ? field("Attach support artifacts for explanation only.", "derived_default", spec.selection.support_artifacts, "high")
    : firstNeostack
      ? field("Use governed LangChain bridge path without executing tools.", "selected_neostack", [firstNeostack], "medium")
      : spec.runtime_kind === "assembled_runtime"
        ? field("Assemble a dry-run runtime because no matching sleeve was found.", "derived_default", [], "high")
        : field("n/a", "n/a", [], "n/a");

  const instructionText = spec.governance.approval_required
    ? `Execution remains dry-run; approval required for ${spec.tool_bindings.requires_approval.join(', ')}.`
    : supportMode
      ? "Do not runtime-select support docs; do not execute tools."
      : spec.constraints.protected_rules.length > 0
        ? `Execution remains dry-run; protected rules: ${spec.constraints.protected_rules.join(', ')}.`
        : "Execution remains dry-run. No tools executed.";
  const Instruction = field(instructionText, spec.governance.approval_required ? "governance" : "derived_default", [], spec.governance.approval_required ? "high" : "medium");

  const Subject = supportMode
    ? field("Sleeve documentation/explanation.", "runtime_input_and_selection", spec.selection.support_artifacts, "medium")
    : firstNeostack
      ? field("LangChain bridge workflow under UMG/OpenClaw governance.", "runtime_input_and_selection", [firstNeostack], "medium")
      : spec.runtime_kind === "assembled_runtime"
        ? field("One-off file report.", "runtime_input", [], "medium")
        : field("n/a", "n/a", [], "n/a");

  const Primary = supportMode
    ? field("Explain selected support context.", "derived_default", spec.selection.support_artifacts, "high")
    : spec.runtime_kind === "assembled_runtime"
      ? field("Compile an assembled RuntimeSpec.", "runtime_input", [], "high")
      : field("Compile a read-only RuntimeSpec for the requested workflow.", "runtime_input", [], "high");

  const Philosophy = supportMode
    ? field("Preserve separation between human docs and runtime artifacts.", "governance_default", [], "medium")
    : spec.runtime_kind === "assembled_runtime"
      ? field("Prefer truthful runtime state over fake sleeve activation.", "governance_default", [], "medium")
      : field("Preserve user control, traceability, and governed execution boundaries.", "governance_default", [], "medium");

  const Blueprint = supportMode
    ? field("Explanatory response with support-only context.", "visibility_layer", [], "medium")
    : field("Runtime visibility header / structured dry-run output.", "visibility_layer", [], "medium");

  return {
    molt_map_id: mapId(),
    runtime_spec_id: spec.runtime_spec_id,
    source: "RuntimeSpecV0",
    created_at: new Date().toISOString(),
    mode: "dry_run",
    fields: {
      Trigger,
      Directive,
      Instruction,
      Subject,
      Primary,
      Philosophy,
      Blueprint
    },
    warnings: spec.trace.warnings,
    trace_id: spec.trace.trace_id,
    matrix_id: spec.matrix.matrix_id,
    matrix_available: false
  };
}
