import type { RuntimeSpecBoundaryStatus, TraceBoundaryStatus } from "./types.js";

export type ToolRiskClass =
  | "read_only"
  | "dry_run_only"
  | "preview_only"
  | "low_risk_direct"
  | "approval_gated_write"
  | "destructive_or_sensitive"
  | "external_transmission"
  | "blocked";

export type ActionGateState =
  | "proposed"
  | "preview_required"
  | "dry_run_required"
  | "approval_required"
  | "allowed_direct"
  | "allowed_after_approval"
  | "denied"
  | "blocked"
  | "executed"
  | "failed"
  | "superseded"
  | "expired";

export type ActionGateDecision =
  | "allow_direct"
  | "allow_after_approval"
  | "require_preview"
  | "require_dry_run"
  | "deny"
  | "block"
  | "review_required";

export interface ActionGateRequiredChecks {
  runtimeSpecBoundaryValid: boolean;
  traceBoundaryValid: boolean;
  allowlistSatisfied: boolean;
  previewSatisfied: boolean;
  dryRunSatisfied: boolean;
  approvalSatisfied: boolean;
  rollbackPrepared: boolean;
}

export interface ActionGateApprovalRequirement {
  required: boolean;
  reason: string | null;
}

export interface ActionGatePreviewRequirement {
  required: boolean;
  reason: string | null;
}

export interface ActionGateDryRunRequirement {
  required: boolean;
  reason: string | null;
}

export interface ActionGateAllowlistRequirement {
  required: boolean;
  reason: string | null;
}

export interface ActionGateRollbackRequirement {
  required: boolean;
  reason: string | null;
}

export interface ActionGateAuditMeta {
  auditReference: string | null;
  decisionReason: string;
  notes: string[];
}

export interface ActionGate {
  actionId: string;
  sourceRuntimeSpecBoundaryStatus: RuntimeSpecBoundaryStatus | null;
  sourceRuntimeSpecNonExecuting: boolean | null;
  sourceTraceBoundaryStatus: TraceBoundaryStatus | null;
  sourceTraceAuditOnly: boolean | null;
  proposedToolName: string;
  proposedToolId: string;
  actionKind: string;
  riskClass: ToolRiskClass;
  gateState: ActionGateState;
  requiredChecks: ActionGateRequiredChecks;
  approvalRequirement: ActionGateApprovalRequirement;
  previewRequirement: ActionGatePreviewRequirement;
  dryRunRequirement: ActionGateDryRunRequirement;
  allowlistRequirement: ActionGateAllowlistRequirement;
  rollbackRequirement: ActionGateRollbackRequirement;
  finalDecision: ActionGateDecision;
  auditMeta: ActionGateAuditMeta;
}

export interface ToolCapability {
  toolId: string;
  toolName: string;
  toolCategory: string;
  allowedRiskClass: ToolRiskClass;
  directExecutionAllowed: boolean;
  approvalRequired: boolean;
  previewRequired: boolean;
  dryRunSupported: boolean;
  rollbackSupported: boolean;
  externalTransmissionAllowed: boolean;
  blockedSurfaces: string[];
  auditRequirements: string[];
}

export interface ToolCapabilityRegistryEntry extends ToolCapability {}

export interface ToolResult {
  actionId: string;
  toolName: string;
  toolId: string;
  executionStatus: "proposed" | "executed" | "failed" | "blocked" | "denied";
  inputSummary: string;
  outputSummary: string;
  sideEffects: string[];
  filesChanged: string[];
  externalCallsMade: string[];
  rollbackArtifacts: string[];
  backupArtifacts: string[];
  startedAt: string | null;
  finishedAt: string | null;
  approvalReference: string | null;
  auditReference: string | null;
  warnings: string[];
  errors: string[];
}

export function classifyRiskClassPolicy(riskClass: ToolRiskClass) {
  switch (riskClass) {
    case "read_only":
      return { directExecutionAllowed: true, requiresApproval: false, requiresPreview: false, requiresDryRun: false, requiresRollback: false };
    case "dry_run_only":
      return { directExecutionAllowed: false, requiresApproval: false, requiresPreview: false, requiresDryRun: true, requiresRollback: false };
    case "preview_only":
      return { directExecutionAllowed: false, requiresApproval: false, requiresPreview: true, requiresDryRun: false, requiresRollback: false };
    case "low_risk_direct":
      return { directExecutionAllowed: true, requiresApproval: false, requiresPreview: false, requiresDryRun: false, requiresRollback: false };
    case "approval_gated_write":
      return { directExecutionAllowed: false, requiresApproval: true, requiresPreview: false, requiresDryRun: false, requiresRollback: true };
    case "destructive_or_sensitive":
      return { directExecutionAllowed: false, requiresApproval: true, requiresPreview: true, requiresDryRun: false, requiresRollback: true };
    case "external_transmission":
      return { directExecutionAllowed: false, requiresApproval: true, requiresPreview: true, requiresDryRun: false, requiresRollback: false };
    case "blocked":
    default:
      return { directExecutionAllowed: false, requiresApproval: false, requiresPreview: false, requiresDryRun: false, requiresRollback: false };
  }
}

export function canProceedDirectly(actionGate: ActionGate): boolean {
  return actionGate.finalDecision === "allow_direct" && actionGate.gateState === "allowed_direct";
}

export function requiresApproval(actionGate: ActionGate): boolean {
  return actionGate.approvalRequirement.required;
}

export function requiresPreview(actionGate: ActionGate): boolean {
  return actionGate.previewRequirement.required;
}

export function requiresRollback(actionGate: ActionGate): boolean {
  return actionGate.rollbackRequirement.required;
}

export interface ProposedActionGateInput {
  actionId: string;
  proposedToolName: string;
  proposedToolId: string;
  actionKind: string;
  riskClass: ToolRiskClass;
  sourceRuntimeSpecBoundaryStatus: RuntimeSpecBoundaryStatus | null;
  sourceRuntimeSpecNonExecuting: boolean | null;
  sourceTraceBoundaryStatus: TraceBoundaryStatus | null;
  sourceTraceAuditOnly: boolean | null;
}

export function createProposedActionGate(input: ProposedActionGateInput): ActionGate {
  const policy = classifyRiskClassPolicy(input.riskClass);
  const runtimeBoundaryValid = input.sourceRuntimeSpecBoundaryStatus === "valid_non_executing_artifact" && input.sourceRuntimeSpecNonExecuting === true;
  const traceBoundaryValid = input.sourceTraceBoundaryStatus === "valid_audit_artifact" && input.sourceTraceAuditOnly === true;

  let gateState: ActionGateState = "proposed";
  let finalDecision: ActionGateDecision = "review_required";
  let decisionReason = "Action proposed for policy evaluation.";

  if (!runtimeBoundaryValid || !traceBoundaryValid) {
    gateState = "blocked";
    finalDecision = "block";
    decisionReason = "Boundary validation failed or is incomplete; compiler artifacts cannot authorize execution.";
  } else if (input.riskClass === "blocked") {
    gateState = "blocked";
    finalDecision = "block";
    decisionReason = "Tool capability is blocked by policy.";
  } else if (policy.requiresApproval) {
    gateState = "approval_required";
    finalDecision = "allow_after_approval";
    decisionReason = "Approval is required before execution can proceed.";
  } else if (policy.requiresPreview) {
    gateState = "preview_required";
    finalDecision = "require_preview";
    decisionReason = "Preview is required before execution can proceed.";
  } else if (policy.requiresDryRun) {
    gateState = "dry_run_required";
    finalDecision = "require_dry_run";
    decisionReason = "Dry-run is required before execution can proceed.";
  } else if (policy.directExecutionAllowed) {
    gateState = "allowed_direct";
    finalDecision = "allow_direct";
    decisionReason = "Direct execution may proceed under allowlisted low-risk policy.";
  }

  return {
    actionId: input.actionId,
    sourceRuntimeSpecBoundaryStatus: input.sourceRuntimeSpecBoundaryStatus,
    sourceRuntimeSpecNonExecuting: input.sourceRuntimeSpecNonExecuting,
    sourceTraceBoundaryStatus: input.sourceTraceBoundaryStatus,
    sourceTraceAuditOnly: input.sourceTraceAuditOnly,
    proposedToolName: input.proposedToolName,
    proposedToolId: input.proposedToolId,
    actionKind: input.actionKind,
    riskClass: input.riskClass,
    gateState,
    requiredChecks: {
      runtimeSpecBoundaryValid: runtimeBoundaryValid,
      traceBoundaryValid,
      allowlistSatisfied: policy.directExecutionAllowed,
      previewSatisfied: !policy.requiresPreview,
      dryRunSatisfied: !policy.requiresDryRun,
      approvalSatisfied: !policy.requiresApproval,
      rollbackPrepared: !policy.requiresRollback,
    },
    approvalRequirement: { required: policy.requiresApproval, reason: policy.requiresApproval ? "Risk class requires approval." : null },
    previewRequirement: { required: policy.requiresPreview, reason: policy.requiresPreview ? "Risk class requires preview." : null },
    dryRunRequirement: { required: policy.requiresDryRun, reason: policy.requiresDryRun ? "Risk class requires dry-run." : null },
    allowlistRequirement: { required: policy.directExecutionAllowed, reason: policy.directExecutionAllowed ? "Direct execution requires allowlisted policy match." : null },
    rollbackRequirement: { required: policy.requiresRollback, reason: policy.requiresRollback ? "Risk class requires rollback/backup planning." : null },
    finalDecision,
    auditMeta: {
      auditReference: null,
      decisionReason,
      notes: ["RuntimeSpec and Trace may inform planning but do not authorize execution by themselves."],
    },
  };
}
