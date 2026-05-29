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

export type LowRiskAllowlistStatus =
  | "allowed_low_risk_direct"
  | "blocked_unknown_tool"
  | "blocked_boundary_violation"
  | "blocked_requires_preview"
  | "blocked_requires_dry_run"
  | "blocked_requires_approval"
  | "blocked_external_transmission"
  | "blocked_mutation_risk"
  | "blocked_not_allowlisted"
  | "blocked_risk_class";

export interface LowRiskAllowlistPolicy {
  allowlistTag: string;
  allowedRiskClasses: Array<"read_only" | "low_risk_direct">;
  notes: string[];
}

export interface LowRiskAllowlistDecision {
  actionId: string;
  toolId: string;
  toolName: string;
  status: LowRiskAllowlistStatus;
  eligible: boolean;
  reasonCode: string;
  reason: string;
  requiresToolResultAuditLater: boolean;
  notes: string[];
}

export type ApprovalRequirementStatus =
  | "approval_not_required"
  | "approval_required"
  | "approval_missing"
  | "approval_present"
  | "approval_invalid";

export type RollbackBackupRequirementStatus =
  | "not_required"
  | "rollback_required"
  | "backup_required"
  | "rollback_and_backup_required"
  | "ready";

export type ApprovalGatedWriteStatus =
  | "approval_not_required"
  | "approval_required"
  | "approval_missing"
  | "approval_present"
  | "approval_invalid"
  | "preview_required_before_approval"
  | "dry_run_required_before_approval"
  | "rollback_required"
  | "backup_required"
  | "ready_for_future_write_execution"
  | "blocked_boundary_violation"
  | "blocked_not_write_capability"
  | "blocked_external_transmission"
  | "blocked_destructive_or_sensitive"
  | "blocked_unknown_tool";

export interface ApprovalRecord {
  approvalId: string;
  approver: string;
  approvedAt: string;
  scope: string;
  valid: boolean;
  note?: string;
}

export interface ApprovalGatedWritePolicy {
  notes: string[];
}

export interface ApprovalGatedWriteDecision {
  actionId: string;
  toolId: string;
  toolName: string;
  status: ApprovalGatedWriteStatus;
  eligibleForFutureWriteExecution: boolean;
  reasonCode: string;
  reason: string;
  approvalStatus: ApprovalRequirementStatus;
  rollbackBackupStatus: RollbackBackupRequirementStatus;
  previewRequiredBeforeApproval: boolean;
  dryRunRequiredBeforeApproval: boolean;
  approvalRecord: ApprovalRecord | null;
  requiresToolResultAuditLater: boolean;
  notes: string[];
}

export type ToolResultExecutionStatus =
  | "not_executed"
  | "preview_recorded"
  | "dry_run_recorded"
  | "executed_success"
  | "executed_failure"
  | "execution_blocked"
  | "execution_denied"
  | "execution_cancelled"
  | "execution_error";

export interface ToolResultAuditLink {
  runtimeSpecBoundaryStatus: RuntimeSpecBoundaryStatus | null;
  runtimeSpecBoundarySummary: string | null;
  traceBoundaryStatus: TraceBoundaryStatus | null;
  traceBoundarySummary: string | null;
  actionGateActionId: string | null;
  actionGateDecision: ActionGateDecision | null;
  approvalId: string | null;
  toolRiskClass: ToolRiskClass | null;
}

export interface ToolResult {
  actionId: string;
  toolName: string;
  toolId: string;
  executionStatus: ToolResultExecutionStatus;
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
  auditLink: ToolResultAuditLink;
  warnings: string[];
  errors: string[];
}

export type ActionGateRuntimeReportStatus =
  | "inspection_only"
  | "planning_ready"
  | "preview_required"
  | "dry_run_required"
  | "approval_required"
  | "ready_for_future_execution"
  | "blocked"
  | "denied"
  | "executed_result_present"
  | "invalid_boundary"
  | "unknown_tool";

export interface ActionGateRuntimeReportSummary {
  label: string;
  value: string;
}

export interface ActionGateRuntimeReportSection {
  title: string;
  status: string;
  details: string[];
}

export interface ActionGateRuntimeReport {
  actionId: string;
  toolId: string;
  toolName: string;
  status: ActionGateRuntimeReportStatus;
  riskClass: ToolRiskClass | null;
  summaries: ActionGateRuntimeReportSummary[];
  sections: ActionGateRuntimeReportSection[];
  finalReason: string;
  notes: string[];
}

export type ActionGateRuntimeReportViewMode = "full" | "compact" | "public_redacted";

export interface ActionGateRuntimeReportView {
  mode: ActionGateRuntimeReportViewMode;
  actionId: string;
  toolId: string;
  toolName: string;
  status: ActionGateRuntimeReportStatus;
  riskClass: ToolRiskClass | null;
  finalReason: string;
  summaries: ActionGateRuntimeReportSummary[];
  sections?: ActionGateRuntimeReportSection[];
  notes: string[];
  boundaries: {
    inspectionOnly: true;
    notApproval: true;
    notExecution: true;
    notPermission: true;
    executedStatusDerivedOnlyFromToolResult: true;
    currentLaneDoesNotRunTools: true;
  };
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

export function assertToolResultNotCompilerTrace(toolResult: ToolResult): boolean {
  return toolResult.auditLink.traceBoundarySummary !== "compiler_trace_as_execution";
}

export function validateToolResultAuditRecord(toolResult: ToolResult): { ok: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!toolResult.actionId) issues.push("missing actionId");
  if (!toolResult.toolId) issues.push("missing toolId");
  if (!toolResult.toolName) issues.push("missing toolName");
  if (!assertToolResultNotCompilerTrace(toolResult)) issues.push("tool result must not be treated as compiler trace");

  if (toolResult.executionStatus === "executed_success" && !toolResult.finishedAt) {
    issues.push("executed_success should include finishedAt");
  }

  if (toolResult.executionStatus === "not_executed" && toolResult.finishedAt && toolResult.startedAt) {
    issues.push("not_executed record should not look like completed execution");
  }

  if ((toolResult.executionStatus === "execution_blocked" || toolResult.executionStatus === "execution_denied") && toolResult.sideEffects.length > 0) {
    issues.push("blocked/denied records should not report side effects as executed outputs");
  }

  return { ok: issues.length === 0, issues };
}

export function linkToolResultToActionGate(
  toolResult: ToolResult,
  actionGate: ActionGate,
  capability?: ToolCapability | null,
  approvalRecord?: ApprovalRecord | null,
): ToolResult {
  return {
    ...toolResult,
    actionId: actionGate.actionId,
    toolId: capability?.toolId ?? actionGate.proposedToolId,
    toolName: capability?.toolName ?? actionGate.proposedToolName,
    approvalReference: approvalRecord?.approvalId ?? toolResult.approvalReference,
    auditLink: {
      runtimeSpecBoundaryStatus: actionGate.sourceRuntimeSpecBoundaryStatus,
      runtimeSpecBoundarySummary: actionGate.sourceRuntimeSpecBoundaryStatus,
      traceBoundaryStatus: actionGate.sourceTraceBoundaryStatus,
      traceBoundarySummary: actionGate.sourceTraceBoundaryStatus,
      actionGateActionId: actionGate.actionId,
      actionGateDecision: actionGate.finalDecision,
      approvalId: approvalRecord?.approvalId ?? null,
      toolRiskClass: capability?.allowedRiskClass ?? actionGate.riskClass,
    },
  };
}

export function createToolResultAuditDraft(input: {
  actionGate: ActionGate;
  capability?: ToolCapability | null;
  approvalRecord?: ApprovalRecord | null;
  executionStatus: ToolResultExecutionStatus;
  inputSummary: string;
  outputSummary?: string;
  auditReference?: string | null;
  warnings?: string[];
  errors?: string[];
}): ToolResult {
  return {
    actionId: input.actionGate.actionId,
    toolId: input.capability?.toolId ?? input.actionGate.proposedToolId,
    toolName: input.capability?.toolName ?? input.actionGate.proposedToolName,
    executionStatus: input.executionStatus,
    inputSummary: input.inputSummary,
    outputSummary: input.outputSummary ?? "",
    sideEffects: [],
    filesChanged: [],
    externalCallsMade: [],
    rollbackArtifacts: [],
    backupArtifacts: [],
    startedAt: null,
    finishedAt: null,
    approvalReference: input.approvalRecord?.approvalId ?? null,
    auditReference: input.auditReference ?? null,
    auditLink: {
      runtimeSpecBoundaryStatus: input.actionGate.sourceRuntimeSpecBoundaryStatus,
      runtimeSpecBoundarySummary: input.actionGate.sourceRuntimeSpecBoundaryStatus,
      traceBoundaryStatus: input.actionGate.sourceTraceBoundaryStatus,
      traceBoundarySummary: input.actionGate.sourceTraceBoundaryStatus,
      actionGateActionId: input.actionGate.actionId,
      actionGateDecision: input.actionGate.finalDecision,
      approvalId: input.approvalRecord?.approvalId ?? null,
      toolRiskClass: input.capability?.allowedRiskClass ?? input.actionGate.riskClass,
    },
    warnings: input.warnings ?? [],
    errors: input.errors ?? [],
  };
}

export function classifyActionGateRuntimeReportStatus(input: {
  capability?: ToolCapability | null;
  actionGate: ActionGate;
  preExecutionPlan?: ActionGatePreExecutionPlan | null;
  lowRiskDecision?: LowRiskAllowlistDecision | null;
  approvalWriteDecision?: ApprovalGatedWriteDecision | null;
  toolResult?: ToolResult | null;
}): ActionGateRuntimeReportStatus {
  const { capability, actionGate, preExecutionPlan, lowRiskDecision, approvalWriteDecision, toolResult } = input;

  if (!actionGate.requiredChecks.runtimeSpecBoundaryValid || !actionGate.requiredChecks.traceBoundaryValid) {
    return "invalid_boundary";
  }

  if (!capability) {
    return "unknown_tool";
  }

  if (toolResult) {
    if (toolResult.executionStatus === "executed_success" || toolResult.executionStatus === "executed_failure") {
      return "executed_result_present";
    }
    if (toolResult.executionStatus === "execution_denied") {
      return "denied";
    }
    if (toolResult.executionStatus === "execution_blocked" || toolResult.executionStatus === "execution_cancelled" || toolResult.executionStatus === "execution_error") {
      return "blocked";
    }
  }

  if (approvalWriteDecision) {
    if (approvalWriteDecision.status === "ready_for_future_write_execution") {
      return "ready_for_future_execution";
    }
    if (approvalWriteDecision.status === "preview_required_before_approval") {
      return "preview_required";
    }
    if (approvalWriteDecision.status === "dry_run_required_before_approval") {
      return "dry_run_required";
    }
    if (approvalWriteDecision.status === "approval_missing" || approvalWriteDecision.status === "approval_invalid") {
      return "approval_required";
    }
    if (approvalWriteDecision.status.startsWith("blocked_")) {
      return "blocked";
    }
  }

  if (preExecutionPlan) {
    if (preExecutionPlan.blocked) {
      return "blocked";
    }
    if (preExecutionPlan.previewPlan.required) {
      return "preview_required";
    }
    if (preExecutionPlan.dryRunPlan.required) {
      return "dry_run_required";
    }
  }

  if (lowRiskDecision) {
    return lowRiskDecision.eligible ? "planning_ready" : "blocked";
  }

  if (actionGate.finalDecision === "allow_after_approval") {
    return "approval_required";
  }

  if (actionGate.finalDecision === "allow_direct") {
    return "planning_ready";
  }

  if (actionGate.finalDecision === "deny") {
    return "denied";
  }

  if (actionGate.finalDecision === "block" || actionGate.finalDecision === "review_required") {
    return "blocked";
  }

  return "inspection_only";
}

export function summarizeActionGateRuntimeState(input: {
  capability?: ToolCapability | null;
  actionGate: ActionGate;
  preExecutionPlan?: ActionGatePreExecutionPlan | null;
  lowRiskDecision?: LowRiskAllowlistDecision | null;
  approvalWriteDecision?: ApprovalGatedWriteDecision | null;
  toolResult?: ToolResult | null;
}): ActionGateRuntimeReportSummary[] {
  return [
    { label: "runtimeSpecBoundary", value: String(input.actionGate.sourceRuntimeSpecBoundaryStatus ?? "null") },
    { label: "traceBoundary", value: String(input.actionGate.sourceTraceBoundaryStatus ?? "null") },
    { label: "capabilityKnown", value: String(Boolean(input.capability)) },
    { label: "riskClass", value: String(input.capability?.allowedRiskClass ?? input.actionGate.riskClass) },
    { label: "gateState", value: input.actionGate.gateState },
    { label: "finalDecision", value: input.actionGate.finalDecision },
    { label: "previewRequired", value: String(input.preExecutionPlan?.previewPlan.required ?? input.actionGate.previewRequirement.required) },
    { label: "dryRunRequired", value: String(input.preExecutionPlan?.dryRunPlan.required ?? input.actionGate.dryRunRequirement.required) },
    { label: "lowRiskEligible", value: String(input.lowRiskDecision?.eligible ?? false) },
    { label: "approvalReady", value: String(input.approvalWriteDecision?.eligibleForFutureWriteExecution ?? false) },
    { label: "toolResultStatus", value: String(input.toolResult?.executionStatus ?? "none") },
  ];
}

export function createActionGateRuntimeReport(input: {
  capability?: ToolCapability | null;
  actionGate: ActionGate;
  preExecutionPlan?: ActionGatePreExecutionPlan | null;
  lowRiskDecision?: LowRiskAllowlistDecision | null;
  approvalWriteDecision?: ApprovalGatedWriteDecision | null;
  toolResult?: ToolResult | null;
}): ActionGateRuntimeReport {
  const status = classifyActionGateRuntimeReportStatus(input);
  const summaries = summarizeActionGateRuntimeState(input);
  const sections: ActionGateRuntimeReportSection[] = [
    {
      title: "Boundaries",
      status: input.actionGate.requiredChecks.runtimeSpecBoundaryValid && input.actionGate.requiredChecks.traceBoundaryValid ? "valid" : "invalid",
      details: [
        `RuntimeSpecBoundary: ${String(input.actionGate.sourceRuntimeSpecBoundaryStatus ?? "null")}`,
        `TraceBoundary: ${String(input.actionGate.sourceTraceBoundaryStatus ?? "null")}`,
      ],
    },
    {
      title: "Capability",
      status: input.capability ? "known" : "unknown",
      details: [
        `toolId: ${input.capability?.toolId ?? input.actionGate.proposedToolId}`,
        `riskClass: ${input.capability?.allowedRiskClass ?? input.actionGate.riskClass}`,
      ],
    },
    {
      title: "Gate",
      status: input.actionGate.gateState,
      details: [
        `finalDecision: ${input.actionGate.finalDecision}`,
        `reason: ${input.actionGate.auditMeta.decisionReason}`,
      ],
    },
    {
      title: "PreExecution",
      status: input.preExecutionPlan?.status ?? "not_provided",
      details: [
        `previewRequired: ${String(input.preExecutionPlan?.previewPlan.required ?? false)}`,
        `dryRunRequired: ${String(input.preExecutionPlan?.dryRunPlan.required ?? false)}`,
      ],
    },
    {
      title: "Readiness",
      status: input.approvalWriteDecision?.status ?? input.lowRiskDecision?.status ?? "not_provided",
      details: [
        `lowRiskEligible: ${String(input.lowRiskDecision?.eligible ?? false)}`,
        `approvalReady: ${String(input.approvalWriteDecision?.eligibleForFutureWriteExecution ?? false)}`,
      ],
    },
    {
      title: "ToolResult",
      status: input.toolResult?.executionStatus ?? "none",
      details: [
        `auditReference: ${String(input.toolResult?.auditReference ?? null)}`,
        `approvalReference: ${String(input.toolResult?.approvalReference ?? null)}`,
      ],
    },
  ];

  const notes = [
    "Runtime report is an inspectable state surface only.",
    "Runtime report is not approval and is not execution.",
    "Executed status only comes from ToolResult executionStatus.",
    "Tool execution remains a future/later lane.",
  ];

  return {
    actionId: input.actionGate.actionId,
    toolId: input.capability?.toolId ?? input.actionGate.proposedToolId,
    toolName: input.capability?.toolName ?? input.actionGate.proposedToolName,
    status,
    riskClass: input.capability?.allowedRiskClass ?? input.actionGate.riskClass,
    summaries,
    sections,
    finalReason: input.toolResult?.outputSummary || input.actionGate.auditMeta.decisionReason,
    notes,
  };
}

export function summarizeActionGateRuntimeReportForTool(report: ActionGateRuntimeReport): ActionGateRuntimeReportView {
  return {
    mode: "compact",
    actionId: report.actionId,
    toolId: report.toolId,
    toolName: report.toolName,
    status: report.status,
    riskClass: report.riskClass,
    finalReason: report.finalReason,
    summaries: report.summaries,
    notes: report.notes,
    boundaries: {
      inspectionOnly: true,
      notApproval: true,
      notExecution: true,
      notPermission: true,
      executedStatusDerivedOnlyFromToolResult: true,
      currentLaneDoesNotRunTools: true,
    },
  };
}

export function redactActionGateRuntimeReport(report: ActionGateRuntimeReport): ActionGateRuntimeReportView {
  return {
    mode: "public_redacted",
    actionId: report.actionId,
    toolId: report.toolId,
    toolName: report.toolName,
    status: report.status,
    riskClass: report.riskClass,
    finalReason: report.finalReason,
    summaries: report.summaries.filter((summary) => ["runtimeSpecBoundary", "traceBoundary", "capabilityKnown", "riskClass", "toolResultStatus"].includes(summary.label)),
    notes: report.notes,
    boundaries: {
      inspectionOnly: true,
      notApproval: true,
      notExecution: true,
      notPermission: true,
      executedStatusDerivedOnlyFromToolResult: true,
      currentLaneDoesNotRunTools: true,
    },
  };
}

export function createActionGateRuntimeReportToolResponse(
  report: ActionGateRuntimeReport,
  mode: ActionGateRuntimeReportViewMode = "full",
): ActionGateRuntimeReportView {
  if (mode === "compact") {
    return summarizeActionGateRuntimeReportForTool(report);
  }
  if (mode === "public_redacted") {
    return redactActionGateRuntimeReport(report);
  }
  return {
    mode: "full",
    actionId: report.actionId,
    toolId: report.toolId,
    toolName: report.toolName,
    status: report.status,
    riskClass: report.riskClass,
    finalReason: report.finalReason,
    summaries: report.summaries,
    sections: report.sections,
    notes: report.notes,
    boundaries: {
      inspectionOnly: true,
      notApproval: true,
      notExecution: true,
      notPermission: true,
      executedStatusDerivedOnlyFromToolResult: true,
      currentLaneDoesNotRunTools: true,
    },
  };
}

export function createLowRiskAllowlistPolicy(): LowRiskAllowlistPolicy {
  return {
    allowlistTag: "low-risk-direct",
    allowedRiskClasses: ["read_only", "low_risk_direct"],
    notes: [
      "Low-risk direct does not mean unrestricted execution.",
      "Eligibility requires a known capability, valid boundaries, and explicit allowlist policy.",
      "Writes, deletes, publishing, plugin mutation, and external transmission are not low-risk direct.",
    ],
  };
}

export function createApprovalGatedWritePolicy(): ApprovalGatedWritePolicy {
  return {
    notes: [
      "Approval-gated write flow is pre-execution only.",
      "Approval is required for durable mutation and does not equal execution.",
      "Preview and dry-run do not equal execution.",
      "Destructive/sensitive and external-transmission flows remain separate from this lane.",
    ],
  };
}

export function evaluateApprovalGatedWriteReadiness(
  actionGate: ActionGate,
  capability: ToolCapability | null,
  input?: { approvalRecord?: ApprovalRecord | null },
  policy: ApprovalGatedWritePolicy = createApprovalGatedWritePolicy(),
): ApprovalGatedWriteDecision {
  const approvalRecord = input?.approvalRecord ?? null;
  const previewPlan = planActionGatePreviewDryRun(actionGate, capability);
  const notes = [
    ...policy.notes,
    "Approval readiness is a pre-execution artifact only and does not execute the write.",
    "ToolResult must be created later by an actual execution lane, not by approval readiness evaluation.",
    "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves.",
  ];

  if (!capability) {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      status: "blocked_unknown_tool",
      eligibleForFutureWriteExecution: false,
      reasonCode: "unknown_tool",
      reason: "Unknown tools cannot enter approval-gated write readiness.",
      approvalStatus: "approval_missing",
      rollbackBackupStatus: "not_required",
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: false,
      notes,
    };
  }

  if (!actionGate.requiredChecks.runtimeSpecBoundaryValid || !actionGate.requiredChecks.traceBoundaryValid) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_boundary_violation",
      eligibleForFutureWriteExecution: false,
      reasonCode: "boundary_violation",
      reason: "Boundary validation failed or is incomplete; approval-gated write readiness is blocked.",
      approvalStatus: "approval_missing",
      rollbackBackupStatus: "not_required",
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (capability.allowedRiskClass === "external_transmission" || capability.externalTransmissionAllowed) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_external_transmission",
      eligibleForFutureWriteExecution: false,
      reasonCode: "external_transmission_separate_lane",
      reason: "External transmission requires a separate gated lane and is not handled by approval-gated write readiness.",
      approvalStatus: "approval_required",
      rollbackBackupStatus: "not_required",
      previewRequiredBeforeApproval: capability.previewRequired,
      dryRunRequiredBeforeApproval: capability.dryRunRequired,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (capability.allowedRiskClass === "destructive_or_sensitive") {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_destructive_or_sensitive",
      eligibleForFutureWriteExecution: false,
      reasonCode: "destructive_or_sensitive_separate_lane",
      reason: "Destructive or sensitive actions require a stronger dedicated lane and are not handled by approval-gated write readiness.",
      approvalStatus: "approval_required",
      rollbackBackupStatus: capability.backupRequired ? "backup_required" : (capability.rollbackSupported ? "rollback_required" : "not_required"),
      previewRequiredBeforeApproval: capability.previewRequired,
      dryRunRequiredBeforeApproval: capability.dryRunRequired,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (capability.allowedRiskClass !== "approval_gated_write") {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_not_write_capability",
      eligibleForFutureWriteExecution: false,
      reasonCode: "not_approval_gated_write",
      reason: "Only approval_gated_write capabilities are eligible for this readiness lane.",
      approvalStatus: capability.approvalRequired ? "approval_required" : "approval_not_required",
      rollbackBackupStatus: "not_required",
      previewRequiredBeforeApproval: capability.previewRequired,
      dryRunRequiredBeforeApproval: capability.dryRunRequired,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (capability.directExecutionAllowed) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_not_write_capability",
      eligibleForFutureWriteExecution: false,
      reasonCode: "write_capability_must_not_be_direct",
      reason: "Approval-gated write capability must not be directly executable.",
      approvalStatus: "approval_required",
      rollbackBackupStatus: "not_required",
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (previewPlan.previewPlan.required) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "preview_required_before_approval",
      eligibleForFutureWriteExecution: false,
      reasonCode: "preview_required_before_approval",
      reason: "Preview must be completed before approval-gated write readiness can advance.",
      approvalStatus: "approval_required",
      rollbackBackupStatus: capability.backupRequired ? "backup_required" : (capability.rollbackSupported ? "rollback_required" : "not_required"),
      previewRequiredBeforeApproval: true,
      dryRunRequiredBeforeApproval: capability.dryRunRequired,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (previewPlan.dryRunPlan.required) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "dry_run_required_before_approval",
      eligibleForFutureWriteExecution: false,
      reasonCode: "dry_run_required_before_approval",
      reason: "Dry-run must be completed before approval-gated write readiness can advance.",
      approvalStatus: "approval_required",
      rollbackBackupStatus: capability.backupRequired ? "backup_required" : (capability.rollbackSupported ? "rollback_required" : "not_required"),
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: true,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  const rollbackBackupStatus: RollbackBackupRequirementStatus = capability.backupRequired && capability.rollbackSupported
    ? "rollback_and_backup_required"
    : capability.backupRequired
      ? "backup_required"
      : capability.rollbackSupported
        ? "rollback_required"
        : "not_required";

  if (!approvalRecord) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "approval_missing",
      eligibleForFutureWriteExecution: false,
      reasonCode: "approval_missing",
      reason: "Approval record is required before future write execution can become ready.",
      approvalStatus: "approval_missing",
      rollbackBackupStatus,
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (!approvalRecord.valid) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "approval_invalid",
      eligibleForFutureWriteExecution: false,
      reasonCode: "approval_invalid",
      reason: "Approval record is present but invalid for this approval-gated write action.",
      approvalStatus: "approval_invalid",
      rollbackBackupStatus,
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (rollbackBackupStatus === "rollback_required") {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "rollback_required",
      eligibleForFutureWriteExecution: false,
      reasonCode: "rollback_required",
      reason: "Rollback planning is still required before future write execution can become ready.",
      approvalStatus: "approval_present",
      rollbackBackupStatus,
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  if (rollbackBackupStatus === "backup_required" || rollbackBackupStatus === "rollback_and_backup_required") {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "backup_required",
      eligibleForFutureWriteExecution: false,
      reasonCode: "backup_required",
      reason: "Backup preparation is still required before future write execution can become ready.",
      approvalStatus: "approval_present",
      rollbackBackupStatus,
      previewRequiredBeforeApproval: false,
      dryRunRequiredBeforeApproval: false,
      approvalRecord,
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes,
    };
  }

  return {
    actionId: actionGate.actionId,
    toolId: capability.toolId,
    toolName: capability.toolName,
    status: "ready_for_future_write_execution",
    eligibleForFutureWriteExecution: true,
    reasonCode: "ready_for_future_write_execution",
    reason: "Approval-gated write prerequisites are modeled as satisfied; future execution still requires a later execution lane.",
    approvalStatus: "approval_present",
    rollbackBackupStatus: "ready",
    previewRequiredBeforeApproval: false,
    dryRunRequiredBeforeApproval: false,
    approvalRecord,
    requiresToolResultAuditLater: capability.requiresToolResultAudit,
    notes,
  };
}

export function canProceedApprovalGatedWrite(
  actionGate: ActionGate,
  capability: ToolCapability | null,
  input?: { approvalRecord?: ApprovalRecord | null },
  policy?: ApprovalGatedWritePolicy,
): boolean {
  return evaluateApprovalGatedWriteReadiness(actionGate, capability, input, policy).eligibleForFutureWriteExecution;
}

export function evaluateLowRiskDirectEligibility(
  actionGate: ActionGate,
  capability: ToolCapability | null,
  policy: LowRiskAllowlistPolicy = createLowRiskAllowlistPolicy(),
): LowRiskAllowlistDecision {
  const baseNotes = [
    ...policy.notes,
    "This decision is an eligibility artifact only and does not execute a tool.",
    "ToolResult must be created later by an actual execution lane, not by allowlist evaluation.",
    "RuntimeSpec and Trace may inform planning but do not authorize execution by themselves.",
  ];

  if (!capability) {
    return {
      actionId: actionGate.actionId,
      toolId: actionGate.proposedToolId,
      toolName: actionGate.proposedToolName,
      status: "blocked_unknown_tool",
      eligible: false,
      reasonCode: "unknown_tool",
      reason: "Unknown tools are not eligible for low-risk direct execution.",
      requiresToolResultAuditLater: false,
      notes: baseNotes,
    };
  }

  if (!actionGate.requiredChecks.runtimeSpecBoundaryValid || !actionGate.requiredChecks.traceBoundaryValid) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_boundary_violation",
      eligible: false,
      reasonCode: "boundary_violation",
      reason: "Boundary validation failed or is incomplete; direct execution eligibility is blocked.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (!policy.allowedRiskClasses.includes(capability.allowedRiskClass as "read_only" | "low_risk_direct")) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_risk_class",
      eligible: false,
      reasonCode: "risk_class_not_allowed",
      reason: "Only read_only and low_risk_direct capabilities may be considered for low-risk direct eligibility.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (capability.previewRequired || actionGate.previewRequirement.required) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_requires_preview",
      eligible: false,
      reasonCode: "preview_required",
      reason: "Capabilities that require preview are not eligible for low-risk direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (capability.dryRunRequired || actionGate.dryRunRequirement.required) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_requires_dry_run",
      eligible: false,
      reasonCode: "dry_run_required",
      reason: "Capabilities that require dry-run are not eligible for low-risk direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (capability.approvalRequired || actionGate.approvalRequirement.required) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_requires_approval",
      eligible: false,
      reasonCode: "approval_required",
      reason: "Capabilities that require approval are not eligible for low-risk direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (capability.externalTransmissionAllowed) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_external_transmission",
      eligible: false,
      reasonCode: "external_transmission",
      reason: "External transmission is not eligible for low-risk direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (capability.backupRequired || capability.rollbackSupported) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_mutation_risk",
      eligible: false,
      reasonCode: "mutation_or_rollback_risk",
      reason: "Capabilities with backup or rollback posture are treated as mutation-risk and not eligible for low-risk direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (!capability.directExecutionAllowed) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_risk_class",
      eligible: false,
      reasonCode: "direct_execution_not_allowed",
      reason: "Capability policy does not allow direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  if (!(capability.allowlistTags ?? []).includes(policy.allowlistTag)) {
    return {
      actionId: actionGate.actionId,
      toolId: capability.toolId,
      toolName: capability.toolName,
      status: "blocked_not_allowlisted",
      eligible: false,
      reasonCode: "missing_allowlist_tag",
      reason: "Capability is not explicitly allowlisted for low-risk direct execution.",
      requiresToolResultAuditLater: capability.requiresToolResultAudit,
      notes: baseNotes,
    };
  }

  return {
    actionId: actionGate.actionId,
    toolId: capability.toolId,
    toolName: capability.toolName,
    status: "allowed_low_risk_direct",
    eligible: true,
    reasonCode: "eligible_low_risk_direct",
    reason: "Capability is known, bounded, local-only, non-mutating, and explicitly allowlisted for low-risk direct execution.",
    requiresToolResultAuditLater: capability.requiresToolResultAudit,
    notes: baseNotes,
  };
}

export function canProceedLowRiskDirect(actionGate: ActionGate, capability: ToolCapability | null, policy?: LowRiskAllowlistPolicy): boolean {
  return evaluateLowRiskDirectEligibility(actionGate, capability, policy).eligible;
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
