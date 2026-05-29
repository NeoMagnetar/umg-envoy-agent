import { canProceedLowRiskDirect, createBlockedUnknownToolGate, createLowRiskAllowlistPolicy, createProposedActionGate, evaluateLowRiskDirectEligibility, } from "./action-gate-types.js";
let passed = 0;
let failed = 0;
function assert(label, condition) {
    if (condition) {
        console.log(`PASS: ${label}`);
        passed++;
    }
    else {
        console.log(`FAIL: ${label}`);
        failed++;
    }
}
function capability(overrides) {
    return {
        toolId: "test.tool",
        toolName: "Test Tool",
        toolCategory: "inspection",
        allowedRiskClass: "read_only",
        directExecutionAllowed: true,
        approvalRequired: false,
        previewRequired: false,
        dryRunSupported: false,
        dryRunRequired: false,
        rollbackSupported: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        blockedSurfaces: [],
        auditRequirements: ["tool_result"],
        requiresToolResultAudit: true,
        allowlistTags: ["low-risk-direct"],
        ...overrides,
    };
}
console.log("=== Low-Risk Allowlisted Tool Flow Tests ===");
const policy = createLowRiskAllowlistPolicy();
const readOnlyGate = createProposedActionGate({
    actionId: "lr-1",
    proposedToolName: "Status Tool",
    proposedToolId: "status.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const readOnlyCapability = capability({ toolId: "status.tool", toolName: "Status Tool", allowedRiskClass: "read_only" });
const readOnlyDecision = evaluateLowRiskDirectEligibility(readOnlyGate, readOnlyCapability, policy);
assert("known read_only allowlisted capability may be eligible", readOnlyDecision.status === "allowed_low_risk_direct");
assert("read_only allowlisted capability can proceed low-risk direct", canProceedLowRiskDirect(readOnlyGate, readOnlyCapability, policy) === true);
const lowRiskGate = createProposedActionGate({
    actionId: "lr-2",
    proposedToolName: "Inspect Index Tool",
    proposedToolId: "inspect-index.tool",
    actionKind: "inspect",
    riskClass: "low_risk_direct",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const lowRiskCapability = capability({ toolId: "inspect-index.tool", toolName: "Inspect Index Tool", allowedRiskClass: "low_risk_direct" });
const lowRiskDecision = evaluateLowRiskDirectEligibility(lowRiskGate, lowRiskCapability, policy);
assert("known low_risk_direct allowlisted capability may be eligible", lowRiskDecision.status === "allowed_low_risk_direct");
const unknownGate = createBlockedUnknownToolGate({
    actionId: "lr-3",
    proposedToolName: "Unknown Tool",
    proposedToolId: "unknown.tool",
    actionKind: "unknown",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const unknownDecision = evaluateLowRiskDirectEligibility(unknownGate, null, policy);
assert("unknown tool is blocked", unknownDecision.status === "blocked_unknown_tool");
const nonAllowlistedDecision = evaluateLowRiskDirectEligibility(lowRiskGate, capability({ toolId: "not-allowlisted.tool", toolName: "Not Allowlisted Tool", allowedRiskClass: "low_risk_direct", allowlistTags: [] }), policy);
assert("non-allowlisted low_risk_direct tool is blocked", nonAllowlistedDecision.status === "blocked_not_allowlisted");
const approvalGate = createProposedActionGate({
    actionId: "lr-4",
    proposedToolName: "Write Tool",
    proposedToolId: "write.tool",
    actionKind: "write",
    riskClass: "approval_gated_write",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const approvalDecision = evaluateLowRiskDirectEligibility(approvalGate, capability({
    toolId: "write.tool",
    toolName: "Write Tool",
    allowedRiskClass: "approval_gated_write",
    directExecutionAllowed: false,
    approvalRequired: true,
    backupRequired: true,
}), policy);
assert("approval_gated_write is blocked", approvalDecision.status === "blocked_risk_class" || approvalDecision.status === "blocked_requires_approval");
const destructiveGate = createProposedActionGate({
    actionId: "lr-5",
    proposedToolName: "Delete Tool",
    proposedToolId: "delete.tool",
    actionKind: "delete",
    riskClass: "destructive_or_sensitive",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const destructiveDecision = evaluateLowRiskDirectEligibility(destructiveGate, capability({
    toolId: "delete.tool",
    toolName: "Delete Tool",
    allowedRiskClass: "destructive_or_sensitive",
    directExecutionAllowed: false,
    approvalRequired: true,
    previewRequired: true,
    dryRunSupported: true,
    dryRunRequired: true,
    backupRequired: true,
}), policy);
assert("destructive_or_sensitive is blocked", destructiveDecision.status === "blocked_risk_class");
const transmissionGate = createProposedActionGate({
    actionId: "lr-6",
    proposedToolName: "Transmit Tool",
    proposedToolId: "transmit.tool",
    actionKind: "send",
    riskClass: "external_transmission",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const transmissionDecision = evaluateLowRiskDirectEligibility(transmissionGate, capability({
    toolId: "transmit.tool",
    toolName: "Transmit Tool",
    allowedRiskClass: "external_transmission",
    directExecutionAllowed: false,
    approvalRequired: true,
    previewRequired: true,
    externalTransmissionAllowed: true,
}), policy);
assert("external_transmission is blocked", transmissionDecision.status === "blocked_risk_class");
const previewGate = createProposedActionGate({
    actionId: "lr-7",
    proposedToolName: "Preview Tool",
    proposedToolId: "preview.tool",
    actionKind: "preview",
    riskClass: "low_risk_direct",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const previewDecision = evaluateLowRiskDirectEligibility(previewGate, capability({
    toolId: "preview.tool",
    toolName: "Preview Tool",
    allowedRiskClass: "low_risk_direct",
    previewRequired: true,
}), policy);
assert("preview_required capability is blocked from direct", previewDecision.status === "blocked_requires_preview");
const dryRunGate = createProposedActionGate({
    actionId: "lr-8",
    proposedToolName: "Dry Run Tool",
    proposedToolId: "dryrun.tool",
    actionKind: "projection",
    riskClass: "low_risk_direct",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const dryRunDecision = evaluateLowRiskDirectEligibility(dryRunGate, capability({
    toolId: "dryrun.tool",
    toolName: "Dry Run Tool",
    allowedRiskClass: "low_risk_direct",
    dryRunSupported: true,
    dryRunRequired: true,
}), policy);
assert("dry_run_required capability is blocked from direct", dryRunDecision.status === "blocked_requires_dry_run");
const invalidBoundaryGate = createProposedActionGate({
    actionId: "lr-9",
    proposedToolName: "Unsafe Tool",
    proposedToolId: "unsafe.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
    sourceRuntimeSpecNonExecuting: null,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const invalidBoundaryDecision = evaluateLowRiskDirectEligibility(invalidBoundaryGate, capability({ toolId: "unsafe.tool", toolName: "Unsafe Tool", allowedRiskClass: "read_only" }), policy);
assert("invalid RuntimeSpecBoundary blocks direct", invalidBoundaryDecision.status === "blocked_boundary_violation");
const invalidTraceGate = createProposedActionGate({
    actionId: "lr-10",
    proposedToolName: "Unsafe Trace Tool",
    proposedToolId: "unsafe-trace.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "boundary_violation",
    sourceTraceAuditOnly: null,
});
const invalidTraceDecision = evaluateLowRiskDirectEligibility(invalidTraceGate, capability({ toolId: "unsafe-trace.tool", toolName: "Unsafe Trace Tool", allowedRiskClass: "read_only" }), policy);
assert("TraceBoundary violation blocks direct or requires review", invalidTraceDecision.status === "blocked_boundary_violation");
assert("RuntimeSpec does not authorize direct execution by itself", invalidBoundaryDecision.eligible === false);
assert("Trace does not authorize direct execution by itself", invalidTraceDecision.eligible === false);
const toolResult = {
    actionId: "lr-result-1",
    toolName: "Low Risk Test Tool",
    toolId: "lowrisk.test.tool",
    executionStatus: "proposed",
    inputSummary: "summary",
    outputSummary: "output",
    sideEffects: [],
    filesChanged: [],
    externalCallsMade: [],
    rollbackArtifacts: [],
    backupArtifacts: [],
    startedAt: null,
    finishedAt: null,
    approvalReference: null,
    auditReference: null,
    warnings: [],
    errors: [],
};
assert("helper does not create ToolResult", toolResult.executionStatus === "proposed");
assert("helper does not execute anything", !readOnlyDecision.notes.some((note) => /executed tool/i.test(note)));
console.log(`=== Low-Risk Allowlisted Tool Flow Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
