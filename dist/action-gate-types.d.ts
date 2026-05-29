import type { RuntimeSpecBoundaryStatus, TraceBoundaryStatus } from "./types.js";
export type ToolRiskClass = "read_only" | "dry_run_only" | "preview_only" | "low_risk_direct" | "approval_gated_write" | "destructive_or_sensitive" | "external_transmission" | "blocked";
export type ActionGateState = "proposed" | "preview_required" | "dry_run_required" | "approval_required" | "allowed_direct" | "allowed_after_approval" | "denied" | "blocked" | "executed" | "failed" | "superseded" | "expired";
export type ActionGateDecision = "allow_direct" | "allow_after_approval" | "require_preview" | "require_dry_run" | "deny" | "block" | "review_required";
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
export interface ToolCapabilityRegistryEntry extends ToolCapability {
}
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
export type ActionGatePreExecutionStatus = "preview_not_required" | "preview_required" | "dry_run_required" | "preview_ready" | "dry_run_ready" | "approval_required_after_preview" | "blocked_before_preview" | "blocked_before_dry_run";
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
export type LowRiskAllowlistStatus = "allowed_low_risk_direct" | "blocked_unknown_tool" | "blocked_boundary_violation" | "blocked_requires_preview" | "blocked_requires_dry_run" | "blocked_requires_approval" | "blocked_external_transmission" | "blocked_mutation_risk" | "blocked_not_allowlisted" | "blocked_risk_class";
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
export type ApprovalRequirementStatus = "approval_not_required" | "approval_required" | "approval_missing" | "approval_present" | "approval_invalid";
export type RollbackBackupRequirementStatus = "not_required" | "rollback_required" | "backup_required" | "rollback_and_backup_required" | "ready";
export type ApprovalGatedWriteStatus = "approval_not_required" | "approval_required" | "approval_missing" | "approval_present" | "approval_invalid" | "preview_required_before_approval" | "dry_run_required_before_approval" | "rollback_required" | "backup_required" | "ready_for_future_write_execution" | "blocked_boundary_violation" | "blocked_not_write_capability" | "blocked_external_transmission" | "blocked_destructive_or_sensitive" | "blocked_unknown_tool";
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
export declare function getRiskClassPolicy(riskClass: ToolRiskClass): ToolRiskClassPolicy;
export declare function classifyRiskClassPolicy(riskClass: ToolRiskClass): ToolRiskClassPolicy;
export declare function createToolCapabilityRegistry(entries: ToolCapabilityRegistryEntry[]): ToolCapabilityRegistry;
export declare function resolveToolCapability(registry: ToolCapabilityRegistry, toolId: string): ToolCapabilityRegistryEntry | null;
export declare function isToolCapabilityKnown(registry: ToolCapabilityRegistry, toolId: string): boolean;
export declare function canToolRunDirectly(capability: ToolCapability | null): boolean;
export declare function requiresApprovalForCapability(capability: ToolCapability | null): boolean;
export declare function requiresPreviewForCapability(capability: ToolCapability | null): boolean;
export declare function requiresDryRunForCapability(capability: ToolCapability | null): boolean;
export declare function requiresBackupForCapability(capability: ToolCapability | null): boolean;
export declare function createLowRiskAllowlistPolicy(): LowRiskAllowlistPolicy;
export declare function createApprovalGatedWritePolicy(): ApprovalGatedWritePolicy;
export declare function evaluateApprovalGatedWriteReadiness(actionGate: ActionGate, capability: ToolCapability | null, input?: {
    approvalRecord?: ApprovalRecord | null;
}, policy?: ApprovalGatedWritePolicy): ApprovalGatedWriteDecision;
export declare function canProceedApprovalGatedWrite(actionGate: ActionGate, capability: ToolCapability | null, input?: {
    approvalRecord?: ApprovalRecord | null;
}, policy?: ApprovalGatedWritePolicy): boolean;
export declare function evaluateLowRiskDirectEligibility(actionGate: ActionGate, capability: ToolCapability | null, policy?: LowRiskAllowlistPolicy): LowRiskAllowlistDecision;
export declare function canProceedLowRiskDirect(actionGate: ActionGate, capability: ToolCapability | null, policy?: LowRiskAllowlistPolicy): boolean;
export declare function planActionGatePreviewDryRun(actionGate: ActionGate, capability: ToolCapability | null): ActionGatePreExecutionPlan;
export declare function canProceedDirectly(actionGate: ActionGate): boolean;
export declare function requiresApproval(actionGate: ActionGate): boolean;
export declare function requiresPreview(actionGate: ActionGate): boolean;
export declare function requiresRollback(actionGate: ActionGate): boolean;
export declare function createBlockedUnknownToolGate(input: UnknownToolIntent): ActionGate;
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
export declare function createProposedActionGate(input: ProposedActionGateInput): ActionGate;
