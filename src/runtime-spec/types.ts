export type RuntimeSpecStatus =
  | "draft"
  | "compiled"
  | "assembled_runtime"
  | "blocked"
  | "invalid";

export type RuntimeKind =
  | "sleeve_runtime"
  | "neostack_runtime"
  | "assembled_runtime";

export interface RuntimeSpecInput {
  user_task: string;
  requested_capabilities: string[];
  requested_tools: string[];
  risk_level: "low" | "medium" | "high";
}

export interface RuntimeSpecArtifactSelection {
  active_sleeve: string | null;
  active_neostacks: string[];
  active_neoblocks: string[];
  active_molt_blocks: string[];
  support_artifacts: string[];
}

export interface RuntimeSpecToolBindings {
  requested: string[];
  available: string[];
  blocked: string[];
  requires_approval: string[];
}

export interface RuntimeSpecGovernance {
  execution_mode: "dry_run" | "direct" | "agent";
  approval_required: boolean;
  governed_execution_plane: true;
  mcp_policy: "blocked_by_default" | "metadata_only" | "mock_only" | "approved";
  langchain_policy: "disabled" | "dry_run" | "governed" | "approved";
}

export interface RuntimeSpecSelectionEvent {
  event:
    | "RUNTIMESPEC_CREATED"
    | "SLEEVE_CANDIDATE_SELECTED"
    | "NEOSTACK_SELECTED"
    | "NEOBLOCK_SELECTED"
    | "MOLT_BLOCK_SELECTED"
    | "SUPPORT_ARTIFACT_ATTACHED"
    | "TOOL_BINDING_REQUESTED"
    | "APPROVAL_REQUIRED"
    | "GOVERNANCE_HANDOFF_CREATED"
    | "SELECTION_WARNING";
  artifact_id?: string;
  reason: string;
  provenance?: {
    source_kind: string;
    discovery_method: string;
    generated_from_lane?: string;
    path?: string;
  };
}

export interface RuntimeSpecTraceRef {
  trace_id: string;
  selection_events: RuntimeSpecSelectionEvent[];
  warnings: string[];
}

export interface RuntimeSpecMatrixRef {
  matrix_id: string;
  available: boolean;
}

export interface RuntimeSpecV0 {
  runtime_spec_id: string;
  runtime_kind: RuntimeKind;
  source_mode: "SAMPLE_MODE" | "FULL_LIBRARY_MODE" | "MIXED_MODE" | "NO_LIBRARY_MODE";
  created_at: string;
  input: RuntimeSpecInput;
  selection: RuntimeSpecArtifactSelection;
  constraints: {
    instructions: string[];
    blocked_artifacts: string[];
    required_approvals: string[];
    protected_rules: string[];
  };
  tool_bindings: RuntimeSpecToolBindings;
  governance: RuntimeSpecGovernance;
  trace: RuntimeSpecTraceRef;
  matrix: RuntimeSpecMatrixRef;
  status: RuntimeSpecStatus;
}
