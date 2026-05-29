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
  dryRunRequired: boolean;
  rollbackSupported: boolean;
  backupRequired: boolean;
  externalTransmissionAllowed: boolean;
  blockedSurfaces: string[];
  auditRequirements: string[];
  requiresToolResultAudit: boolean;
  allowlistTags?: string[];
  notes?: string[];
}

export interface ToolCapabilityRegistryEntry extends ToolCapability {}

export interface ToolRiskClassPolicy {
  directExecutionAllowed: boolean;
  approvalRequired: boolean;
  previewRequired: boolean;
  dryRunRequired: boolean;
  dryRunSupported: boolean;
  rollbackRequired: boolean;
  backupRequired: boolean;
  externalTransmissionAllowed: boolean;
  requiresToolResultAudit: boolean;
}

export interface ToolCapabilityRegistry {
  entriesByToolId: Record<string, ToolCapabilityRegistryEntry>;
}

export type ActionGatePreExecutionStatus =
  | "preview_not_required"
  | "preview_required"
  | "dry_run_required"
  | "preview_ready"
  | "dry_run_ready"
  | "approval_required_after_preview"
  | "blocked_before_preview"
  | "blocked_before_dry_run";

export interface ActionGatePreviewPlan {
  required: boolean;
  status: "not_required" | "required" | "ready" | "blocked";
  reasonCode: string;
  reason: string;
}

export interface ActionGateDryRunPlan {
  required: boolean;
  supported: boolean;
  status: "not_required" | "required" | "ready" | "blocked";
  reasonCode: string;
  reason: string;
}

export interface ActionGatePreExecutionPlan {
  actionId: string;
  toolId: string;
  toolName: string;
  riskClass: ToolRiskClass;
  status: ActionGatePreExecutionStatus;
  blocked: boolean;
  approvalRequiredLater: boolean;
  previewPlan: ActionGatePreviewPlan;
  dryRunPlan: ActionGateDryRunPlan;
  backupRequired: boolean;
  rollbackRequired: boolean;
  externalTransmission: boolean;
  notes: string[];
}

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

export function getRiskClassPolicy(riskClass: ToolRiskClass): ToolRiskClassPolicy {
  switch (riskClass) {
    case "read_only":
      return {
        directExecutionAllowed: true,
        approvalRequired: false,
        previewRequired: false,
        dryRunRequired: false,
        dryRunSupported: false,
        rollbackRequired: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: true,
      };
    case "dry_run_only":
      return {
        directExecutionAllowed: false,
        approvalRequired: false,
        previewRequired: false,
        dryRunRequired: true,
        dryRunSupported: true,
        rollbackRequired: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: true,
      };
    case "preview_only":
      return {
        directExecutionAllowed: false,
        approvalRequired: false,
        previewRequired: true,
        dryRunRequired: false,
        dryRunSupported: true,
        rollbackRequired: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: true,
      };
    case "low_risk_direct":
      return {
        directExecutionAllowed: true,
        approvalRequired: false,
        previewRequired: false,
        dryRunRequired: false,
        dryRunSupported: true,
        rollbackRequired: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: true,
      };
    case "approval_gated_write":
      return {
        directExecutionAllowed: false,
        approvalRequired: true,
        previewRequired: false,
        dryRunRequired: false,
        dryRunSupported: true,
        rollbackRequired: true,
        backupRequired: true,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: true,
      };
    case "destructive_or_sensitive":
      return {
        directExecutionAllowed: false,
        approvalRequired: true,
        previewRequired: true,
        dryRunRequired: true,
        dryRunSupported: true,
        rollbackRequired: true,
        backupRequired: true,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: true,
      };
    case "external_transmission":
      return {
        directExecutionAllowed: false,
        approvalRequired: true,
        previewRequired: true,
        dryRunRequired: false,
        dryRunSupported: true,
        rollbackRequired: false,
        backupRequired: false,
        externalTransmissionAllowed: true,
        requiresToolResultAudit: true,
      };
    case "blocked":
    default:
      return {
        directExecutionAllowed: false,
        approvalRequired: false,
        previewRequired: false,
        dryRunRequired: false,
        dryRunSupported: false,
        rollbackRequired: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        requiresToolResultAudit: false,
      };
  }
}

export function classifyRiskClassPolicy(riskClass: ToolRiskClass): ToolRiskClassPolicy {
  return getRiskClassPolicy(riskClass);
}

export function createToolCapabilityRegistry(entries: ToolCapabilityRegistryEntry[]): ToolCapabilityRegistry {
  const entriesByToolId: Record<string, ToolCapabilityRegistryEntry> = {};
  for (const entry of entries) {
    entriesByToolId[entry.toolId] = entry;
  }
  return { entriesByToolId };
}

export function resolveToolCapability(registry: ToolCapabilityRegistry, toolId: string): ToolCapabilityRegistryEntry | null {
  return registry.entriesByToolId[toolId] ?? null;
}

export function isToolCapabilityKnown(registry: ToolCapabilityRegistry, toolId: string): boolean {
  return resolveToolCapability(registry, toolId) !== null;
}

export function canToolRunDirectly(capability: ToolCapability | null): boolean {
  return capability?.directExecutionAllowed === true;
}

export function requiresApprovalForCapability(capability: ToolCapability | null): boolean {
  return capability?.approvalRequired === true;
}

export function requiresPreviewForCapability(capability: ToolCapability | null): boolean {
  return capability?.previewRequired === true;
}

export function requiresDryRunForCapability(capability: ToolCapability | null): boolean {
  return capability?.dryRunRequired === true;
}

export function requiresBackupForCapability(capability: ToolCapability | null): boolean {
  return capability?.backupRequired === true;
}

export function planActionGatePreviewDryRun(actionGate: ActionGate, capability: ToolCapability | null): ActionGatePreExecutionPlan {
  const runtimeBoundaryValid = actionGate.requiredChecks.runtimeSpecBoundaryValid;
  const traceBoundaryValid = actionGate.requiredChecks.traceBoundaryValid;

  const fallbackPolicy = getRiskClassPolicy(actionGate.riskClass);
  const previewRequired = capability?.previewRequired ?? fallbackPolicy.previewRequired;
  const dryRunRequired = capability?.dryRunRequired ?? fallbackPolicy.dryRunRequired;
  const dryRunSupported = capability?.dryRunSupported ?? fallbackPolicy.dryRunSupported;
  const approvalRequired = capability?.approvalRequired ?? fallbackPolicy.approvalRequired;
  const backupRequired = capability?.backupRequired ?? fallbackPolicy.backupRequired;
  const rollbackRequired = fallbackPolicy.rollbackRequired;
  const externalTransmission = capability?.externalTransmissionAllowed ?? fallbackPolicy.externalTransmissionAllowed;

  const notes = [
    "Preview and dry-run planning do not execute tools.",
    "Preview and dry-run do not equal approval or execution.",
    "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves.",
  ];

  if (!runtimeBoundaryValid || !traceBoundaryValid) {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      riskClass: actionGate.riskClass,
      status: previewRequired ? "blocked_before_preview" : "blocked_before_dry_run",
      blocked: true,
      approvalRequiredLater: approvalRequired,
      previewPlan: {
        required: previewRequired,
        status: "blocked",
        reasonCode: "boundary_blocked",
        reason: "Boundary validation failed or is incomplete; pre-execution planning cannot authorize or advance execution.",
      },
      dryRunPlan: {
        required: dryRunRequired,
        supported: dryRunSupported,
        status: "blocked",
        reasonCode: "boundary_blocked",
        reason: "Boundary validation failed or is incomplete; dry-run planning cannot proceed.",
      },
      backupRequired,
      rollbackRequired,
      externalTransmission,
      notes,
    };
  }

  if (actionGate.riskClass === "blocked" || actionGate.gateState === "blocked" || actionGate.finalDecision === "block") {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      riskClass: actionGate.riskClass,
      status: previewRequired ? "blocked_before_preview" : "blocked_before_dry_run",
      blocked: true,
      approvalRequiredLater: false,
      previewPlan: {
        required: previewRequired,
        status: "blocked",
        reasonCode: "policy_blocked",
        reason: "Capability is blocked by policy and does not become executable through preview.",
      },
      dryRunPlan: {
        required: dryRunRequired,
        supported: dryRunSupported,
        status: "blocked",
        reasonCode: "policy_blocked",
        reason: "Capability is blocked by policy and does not become executable through dry-run.",
      },
      backupRequired,
      rollbackRequired,
      externalTransmission,
      notes,
    };
  }

  if (actionGate.finalDecision === "review_required") {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      riskClass: actionGate.riskClass,
      status: previewRequired ? "blocked_before_preview" : "blocked_before_dry_run",
      blocked: true,
      approvalRequiredLater: approvalRequired,
      previewPlan: {
        required: previewRequired,
        status: "blocked",
        reasonCode: "review_required",
        reason: "Capability remains review-required and does not advance through preview planning alone.",
      },
      dryRunPlan: {
        required: dryRunRequired,
        supported: dryRunSupported,
        status: "blocked",
        reasonCode: "review_required",
        reason: "Capability remains review-required and does not advance through dry-run planning alone.",
      },
      backupRequired,
      rollbackRequired,
      externalTransmission,
      notes,
    };
  }

  if (previewRequired) {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      riskClass: actionGate.riskClass,
      status: approvalRequired ? "approval_required_after_preview" : "preview_required",
      blocked: false,
      approvalRequiredLater: approvalRequired,
      previewPlan: {
        required: true,
        status: "required",
        reasonCode: "preview_required_by_policy",
        reason: "Capability policy requires preview before any later execution lane can proceed.",
      },
      dryRunPlan: {
        required: dryRunRequired,
        supported: dryRunSupported,
        status: dryRunRequired ? (dryRunSupported ? "ready" : "blocked") : "not_required",
        reasonCode: dryRunRequired
          ? (dryRunSupported ? "dry_run_supported_after_preview" : "dry_run_required_but_unsupported")
          : "dry_run_not_required",
        reason: dryRunRequired
          ? (dryRunSupported
            ? "Dry-run is also required and appears supportable after preview planning."
            : "Dry-run is required by policy but not marked as supported by this capability.")
          : "Dry-run is not required by current capability policy.",
      },
      backupRequired,
      rollbackRequired,
      externalTransmission,
      notes,
    };
  }

  if (dryRunRequired) {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      riskClass: actionGate.riskClass,
      status: dryRunSupported ? (approvalRequired ? "approval_required_after_preview" : "dry_run_required") : "blocked_before_dry_run",
      blocked: !dryRunSupported,
      approvalRequiredLater: approvalRequired,
      previewPlan: {
        required: false,
        status: "not_required",
        reasonCode: "preview_not_required",
        reason: "Preview is not required by current capability policy.",
      },
      dryRunPlan: {
        required: true,
        supported: dryRunSupported,
        status: dryRunSupported ? "required" : "blocked",
        reasonCode: dryRunSupported ? "dry_run_required_by_policy" : "dry_run_required_but_unsupported",
        reason: dryRunSupported
          ? "Capability policy requires a non-mutating dry-run before any later execution lane can proceed."
          : "Dry-run is required by policy but this capability is not marked as dry-run supportable.",
      },
      backupRequired,
      rollbackRequired,
      externalTransmission,
      notes,
    };
  }

  return {
    actionId: actionGate.actionId,
    toolId: actionGate.proposedToolId,
    toolName: actionGate.proposedToolName,
    riskClass: actionGate.riskClass,
    status: "preview_not_required",
    blocked: false,
    approvalRequiredLater: approvalRequired,
    previewPlan: {
      required: false,
      status: "not_required",
      reasonCode: "preview_not_required",
      reason: "Preview is not required by current capability policy.",
    },
    dryRunPlan: {
      required: false,
      supported: dryRunSupported,
      status: "not_required",
      reasonCode: "dry_run_not_required",
      reason: "Dry-run is not required by current capability policy.",
    },
    backupRequired,
    rollbackRequired,
    externalTransmission,
    notes,
  };
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

export function createBlockedUnknownToolGate(input: UnknownToolIntent): ActionGate {
  const runtimeBoundaryValid = input.sourceRuntimeSpecBoundaryStatus === "valid_non_executing_artifact" && input.sourceRuntimeSpecNonExecuting === true;
  const traceBoundaryValid = input.sourceTraceBoundaryStatus === "valid_audit_artifact" && input.sourceTraceAuditOnly === true;

  return {
    actionId: input.actionId,
    sourceRuntimeSpecBoundaryStatus: input.sourceRuntimeSpecBoundaryStatus,
    sourceRuntimeSpecNonExecuting: input.sourceRuntimeSpecNonExecuting,
    sourceTraceBoundaryStatus: input.sourceTraceBoundaryStatus,
    sourceTraceAuditOnly: input.sourceTraceAuditOnly,
    proposedToolName: input.proposedToolName,
    proposedToolId: input.proposedToolId,
    actionKind: input.actionKind,
    riskClass: "blocked",
    gateState: "blocked",
    requiredChecks: {
      runtimeSpecBoundaryValid: runtimeBoundaryValid,
      traceBoundaryValid,
      allowlistSatisfied: false,
      previewSatisfied: false,
      dryRunSatisfied: false,
      approvalSatisfied: false,
      rollbackPrepared: false,
    },
    approvalRequirement: { required: false, reason: null },
    previewRequirement: { required: false, reason: null },
    dryRunRequirement: { required: false, reason: null },
    allowlistRequirement: { required: false, reason: "Unknown tools are never directly executable by default." },
    rollbackRequirement: { required: false, reason: null },
    finalDecision: runtimeBoundaryValid && traceBoundaryValid ? "review_required" : "block",
    auditMeta: {
      auditReference: null,
      decisionReason: runtimeBoundaryValid && traceBoundaryValid
        ? "Tool capability is unknown to the registry; execution remains review-required and blocked from direct execution."
        : "Boundary validation failed or is incomplete; unknown tool cannot proceed.",
      notes: [
        "Unknown tool ids must not auto-map to direct execution or approval-gated execution.",
        "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves."
      ],
    },
  };
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

export interface UnknownToolIntent {
  actionId: string;
  proposedToolName: string;
  proposedToolId: string;
  actionKind: string;
  sourceRuntimeSpecBoundaryStatus: RuntimeSpecBoundaryStatus | null;
  sourceRuntimeSpecNonExecuting: boolean | null;
  sourceTraceBoundaryStatus: TraceBoundaryStatus | null;
  sourceTraceAuditOnly: boolean | null;
}

export function createProposedActionGate(input: ProposedActionGateInput): ActionGate {
  const policy = getRiskClassPolicy(input.riskClass);
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
  } else if (policy.approvalRequired) {
    gateState = "approval_required";
    finalDecision = "allow_after_approval";
    decisionReason = "Approval is required before execution can proceed.";
  } else if (policy.previewRequired) {
    gateState = "preview_required";
    finalDecision = "require_preview";
    decisionReason = "Preview is required before execution can proceed.";
  } else if (policy.dryRunRequired) {
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
      previewSatisfied: !policy.previewRequired,
      dryRunSatisfied: !policy.dryRunRequired,
      approvalSatisfied: !policy.approvalRequired,
      rollbackPrepared: !policy.rollbackRequired,
    },
    approvalRequirement: { required: policy.approvalRequired, reason: policy.approvalRequired ? "Risk class requires approval." : null },
    previewRequirement: { required: policy.previewRequired, reason: policy.previewRequired ? "Risk class requires preview." : null },
    dryRunRequirement: { required: policy.dryRunRequired, reason: policy.dryRunRequired ? "Risk class requires dry-run." : null },
    allowlistRequirement: { required: policy.directExecutionAllowed, reason: policy.directExecutionAllowed ? "Direct execution requires allowlisted policy match." : null },
    rollbackRequirement: { required: policy.rollbackRequired, reason: policy.rollbackRequired ? "Risk class requires rollback/backup planning." : null },
    finalDecision,
    auditMeta: {
      auditReference: null,
      decisionReason,
      notes: ["RuntimeSpec and Trace may inform planning but do not authorize execution by themselves."],
    },
  };
}
