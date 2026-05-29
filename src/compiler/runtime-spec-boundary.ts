import type { RuntimeSpecBoundary, RuntimeSpecBoundarySourceKind } from "../types.js";

const DEFAULT_BOUNDARY_NOTE = "RuntimeSpec is a non-executing compiler artifact and does not authorize or perform tool execution.";

function toRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function normalizeRuntimeSpecBoundary(payload: unknown, sourceKind: RuntimeSpecBoundarySourceKind): RuntimeSpecBoundary {
  const warnings: string[] = [];
  const root = toRecord(payload);

  let artifactKind: string | null = null;
  let nonExecuting: boolean | null = null;
  let boundaryNote: string | null = null;

  if (sourceKind === "external_sleeve_runtime") {
    const meta = toRecord(root?.meta);
    artifactKind = asString(meta?.artifactKind);
    nonExecuting = asBoolean(meta?.nonExecuting);
    boundaryNote = asString(meta?.boundaryNote);
  } else if (sourceKind === "external_ir_runtime_spec") {
    const state = toRecord(root?.state);
    artifactKind = asString(state?.artifact_kind);
    nonExecuting = asBoolean(state?.non_executing);
    boundaryNote = asString(state?.boundary_note);
  } else if (sourceKind === "local_adapter") {
    artifactKind = "runtime_spec";
    nonExecuting = true;
    boundaryNote = DEFAULT_BOUNDARY_NOTE;
  }

  if (!artifactKind || nonExecuting === null || !boundaryNote) {
    warnings.push("RuntimeSpec boundary metadata is missing or incomplete; treating artifact as non-executing by policy, not by trusted source metadata.");
  }

  if (nonExecuting === false) {
    warnings.push("RuntimeSpec boundary violation: non-executing flag is false. Artifact must not be treated as execution authority.");
  }

  let status: RuntimeSpecBoundary["status"] = "unknown";
  if (nonExecuting === false) {
    status = "boundary_violation";
  } else if (artifactKind && nonExecuting === true && boundaryNote) {
    status = "valid_non_executing_artifact";
  } else if (warnings.length > 0) {
    status = "missing_boundary_metadata";
  }

  return {
    sourceKind,
    artifactKind,
    nonExecuting,
    boundaryNote,
    originalPayload: payload,
    warnings,
    status,
  };
}
