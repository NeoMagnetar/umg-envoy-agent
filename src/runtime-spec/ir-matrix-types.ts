export type RuntimeIRMatrixNodeKind =
  | "runtime_spec"
  | "molt_map"
  | "sleeve"
  | "neostack"
  | "neoblock"
  | "molt_block"
  | "tool_binding"
  | "governance"
  | "constraint"
  | "support_artifact"
  | "warning"
  | "trace_event"
  | "matrix_placeholder"
  | "approval_request"
  | "checkpoint_policy"
  | "resume_guard";

export type RuntimeIRMatrixEdgeRelation =
  | "selects"
  | "contains"
  | "references"
  | "constrains"
  | "requests_tool"
  | "requires_approval"
  | "blocked_by"
  | "governed_by"
  | "supports_explanation"
  | "maps_to_molt_field"
  | "emits_trace"
  | "has_warning";

export type RuntimeIRMatrixNodeState =
  | "active"
  | "selected"
  | "available"
  | "support_only"
  | "blocked"
  | "requires_approval"
  | "warning"
  | "unavailable"
  | "placeholder";

export interface RuntimeIRMatrixNode {
  id: string;
  kind: RuntimeIRMatrixNodeKind;
  label: string;
  state: RuntimeIRMatrixNodeState;
  artifact_id?: string;
  metadata?: Record<string, unknown>;
}

export interface RuntimeIRMatrixEdge {
  from: string;
  to: string;
  relation: RuntimeIRMatrixEdgeRelation;
  state: RuntimeIRMatrixNodeState;
  reason?: string;
}

export interface RuntimeIRMatrixV0 {
  matrix_id: string;
  runtime_spec_id: string;
  molt_map_id?: string;
  source: "RuntimeSpecV0";
  mode: "dry_run";
  created_at: string;
  matrix_available: boolean;
  nodes: RuntimeIRMatrixNode[];
  edges: RuntimeIRMatrixEdge[];
  symbolic?: string;
  warnings: string[];
  trace_id: string;
}
