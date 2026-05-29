import type { TraceBoundary, TraceBoundarySourceKind } from "../types.js";

const DEFAULT_BOUNDARY_NOTE = "Trace is a compiler audit/provenance artifact and does not grant permission, approval, or execution authority.";

function toRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function scanMessagesForBoundaryViolations(payload: unknown): string[] {
  const warnings: string[] = [];
  const root = toRecord(payload);
  const events = Array.isArray(root?.events) ? (root?.events as unknown[]) : [];
  for (const event of events) {
    const rec = toRecord(event);
    const message = asString(rec?.message) ?? asString(rec?.reason) ?? "";
    if (/permission|approved|approval|execution authority|authorized to execute/i.test(message)) {
      warnings.push("Trace boundary violation: trace content contains permission/approval/execution-authority language.");
      break;
    }
  }
  return warnings;
}

export function normalizeTraceBoundary(payload: unknown, sourceKind: TraceBoundarySourceKind): TraceBoundary {
  const warnings: string[] = [];
  let artifactKind: string | null = null;
  let auditOnly: boolean | null = null;
  let boundaryNote: string | null = null;

  if (sourceKind === "external_trace" || sourceKind === "local_trace") {
    artifactKind = "trace_audit_artifact";
    auditOnly = true;
    boundaryNote = DEFAULT_BOUNDARY_NOTE;
  }

  warnings.push(...scanMessagesForBoundaryViolations(payload));

  if (!artifactKind || auditOnly === null || !boundaryNote) {
    warnings.push("Trace boundary metadata is missing or incomplete; treating trace as audit/provenance by policy, not by trusted source metadata.");
  }

  let status: TraceBoundary["status"] = "unknown";
  if (warnings.some((w) => w.includes("boundary violation"))) {
    status = "boundary_violation";
  } else if (artifactKind && auditOnly === true && boundaryNote) {
    status = "valid_audit_artifact";
  } else if (warnings.length > 0) {
    status = "missing_boundary_metadata";
  }

  return {
    sourceKind,
    artifactKind,
    auditOnly,
    boundaryNote,
    originalPayload: payload,
    warnings,
    status,
  };
}
