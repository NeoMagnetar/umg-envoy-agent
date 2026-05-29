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
    rollbackSupported: boolean;
    externalTransmissionAllowed: boolean;
    blockedSurfaces: string[];
    auditRequirements: string[];
}
export interface ToolCapabilityRegistryEntry extends ToolCapability {
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
export declare function classifyRiskClassPolicy(riskClass: ToolRiskClass): {
    directExecutionAllowed: boolean;
    requiresApproval: boolean;
    requiresPreview: boolean;
    requiresDryRun: boolean;
    requiresRollback: boolean;
};
export declare function canProceedDirectly(actionGate: ActionGate): boolean;
export declare function requiresApproval(actionGate: ActionGate): boolean;
export declare function requiresPreview(actionGate: ActionGate): boolean;
export declare function requiresRollback(actionGate: ActionGate): boolean;
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
export declare function createProposedActionGate(input: ProposedActionGateInput): ActionGate;
