import { createActionGateRuntimeReport, createApprovalGatedWritePolicy, createBlockedUnknownToolGate, createLowRiskAllowlistPolicy, createProposedActionGate, createToolResultAuditDraft, evaluateApprovalGatedWriteReadiness, evaluateLowRiskDirectEligibility, planActionGatePreviewDryRun, } from "./action-gate-types.js";
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
console.log("=== ActionGate Runtime Report Surface Tests ===");
const inspectionGate = createProposedActionGate({
    actionId: "rr-1",
    proposedToolName: "Inspect Tool",
    proposedToolId: "inspect.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const inspectionCapability = capability({ toolId: "inspect.tool", toolName: "Inspect Tool" });
const inspectionReport = createActionGateRuntimeReport({
    actionGate: inspectionGate,
    capability: inspectionCapability,
    preExecutionPlan: planActionGatePreviewDryRun(inspectionGate, inspectionCapability),
});
assert("report exists for inspection-only state", inspectionReport.status === "planning_ready" || inspectionReport.status === "inspection_only");
const invalidBoundaryGate = createProposedActionGate({
    actionId: "rr-2",
    proposedToolName: "Unsafe Tool",
    proposedToolId: "unsafe.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
    sourceRuntimeSpecNonExecuting: null,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const invalidBoundaryReport = createActionGateRuntimeReport({
    actionGate: invalidBoundaryGate,
    capability: capability({ toolId: "unsafe.tool", toolName: "Unsafe Tool" }),
});
assert("invalid RuntimeSpecBoundary produces invalid_boundary or blocked report", invalidBoundaryReport.status === "invalid_boundary" || invalidBoundaryReport.status === "blocked");
const invalidTraceGate = createProposedActionGate({
    actionId: "rr-3",
    proposedToolName: "Unsafe Trace Tool",
    proposedToolId: "unsafe-trace.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "boundary_violation",
    sourceTraceAuditOnly: null,
});
const invalidTraceReport = createActionGateRuntimeReport({
    actionGate: invalidTraceGate,
    capability: capability({ toolId: "unsafe-trace.tool", toolName: "Unsafe Trace Tool" }),
});
assert("TraceBoundary violation produces blocked or review-needed report", invalidTraceReport.status === "invalid_boundary" || invalidTraceReport.status === "blocked");
const unknownGate = createBlockedUnknownToolGate({
    actionId: "rr-4",
    proposedToolName: "Unknown Tool",
    proposedToolId: "unknown.tool",
    actionKind: "unknown",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const unknownReport = createActionGateRuntimeReport({ actionGate: unknownGate, capability: null });
assert("unknown tool produces unknown_tool / blocked report", unknownReport.status === "unknown_tool" || unknownReport.status === "blocked");
const previewGate = createProposedActionGate({
    actionId: "rr-5",
    proposedToolName: "Preview Tool",
    proposedToolId: "preview.tool",
    actionKind: "preview",
    riskClass: "preview_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const previewCapability = capability({ toolId: "preview.tool", toolName: "Preview Tool", allowedRiskClass: "preview_only", directExecutionAllowed: false, previewRequired: true, dryRunSupported: true });
const previewReport = createActionGateRuntimeReport({
    actionGate: previewGate,
    capability: previewCapability,
    preExecutionPlan: planActionGatePreviewDryRun(previewGate, previewCapability),
});
assert("preview-required state reports preview_required", previewReport.status === "preview_required");
const dryRunGate = createProposedActionGate({
    actionId: "rr-6",
    proposedToolName: "Dry Run Tool",
    proposedToolId: "dryrun.tool",
    actionKind: "projection",
    riskClass: "dry_run_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const dryRunCapability = capability({ toolId: "dryrun.tool", toolName: "Dry Run Tool", allowedRiskClass: "dry_run_only", directExecutionAllowed: false, dryRunSupported: true, dryRunRequired: true });
const dryRunReport = createActionGateRuntimeReport({
    actionGate: dryRunGate,
    capability: dryRunCapability,
    preExecutionPlan: planActionGatePreviewDryRun(dryRunGate, dryRunCapability),
});
assert("dry-run-required state reports dry_run_required", dryRunReport.status === "dry_run_required");
const lowRiskGate = createProposedActionGate({
    actionId: "rr-7",
    proposedToolName: "Low Risk Tool",
    proposedToolId: "lowrisk.tool",
    actionKind: "inspect",
    riskClass: "low_risk_direct",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const lowRiskCapability = capability({ toolId: "lowrisk.tool", toolName: "Low Risk Tool", allowedRiskClass: "low_risk_direct" });
const lowRiskReport = createActionGateRuntimeReport({
    actionGate: lowRiskGate,
    capability: lowRiskCapability,
    preExecutionPlan: planActionGatePreviewDryRun(lowRiskGate, lowRiskCapability),
    lowRiskDecision: evaluateLowRiskDirectEligibility(lowRiskGate, lowRiskCapability, createLowRiskAllowlistPolicy()),
});
assert("low-risk direct eligibility reports planning/ready state without execution", lowRiskReport.status === "planning_ready" || lowRiskReport.status === "ready_for_future_execution");
const writeGate = createProposedActionGate({
    actionId: "rr-8",
    proposedToolName: "Write Tool",
    proposedToolId: "write.tool",
    actionKind: "write",
    riskClass: "approval_gated_write",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const writeCapability = capability({ toolId: "write.tool", toolName: "Write Tool", allowedRiskClass: "approval_gated_write", directExecutionAllowed: false, approvalRequired: true, dryRunSupported: true, backupRequired: false });
const approvalRequiredReport = createActionGateRuntimeReport({
    actionGate: writeGate,
    capability: writeCapability,
    preExecutionPlan: planActionGatePreviewDryRun(writeGate, writeCapability),
    approvalWriteDecision: evaluateApprovalGatedWriteReadiness(writeGate, writeCapability, undefined, createApprovalGatedWritePolicy()),
});
assert("approval-gated readiness reports approval_required or ready_for_future_execution, not execution", approvalRequiredReport.status === "approval_required" || approvalRequiredReport.status === "ready_for_future_execution");
const notExecutedDraft = createToolResultAuditDraft({
    actionGate: writeGate,
    capability: writeCapability,
    executionStatus: "not_executed",
    inputSummary: "write input",
    outputSummary: "not executed",
});
const notExecutedReport = createActionGateRuntimeReport({
    actionGate: writeGate,
    capability: writeCapability,
    toolResult: notExecutedDraft,
});
assert("ToolResult not_executed does not report executed_success", notExecutedReport.status !== "executed_result_present");
const executedSuccessDraft = createToolResultAuditDraft({
    actionGate: writeGate,
    capability: writeCapability,
    executionStatus: "executed_success",
    inputSummary: "write input",
    outputSummary: "write success",
});
executedSuccessDraft.finishedAt = "2026-05-29T20:00:00Z";
const executedSuccessReport = createActionGateRuntimeReport({
    actionGate: writeGate,
    capability: writeCapability,
    toolResult: executedSuccessDraft,
});
assert("ToolResult executed_success reports executed_result_present", executedSuccessReport.status === "executed_result_present");
assert("RuntimeReport does not authorize execution", !executedSuccessReport.notes.some((note) => /authorizes execution/i.test(note)));
assert("helper does not execute tools", !executedSuccessReport.finalReason.includes("executed by helper"));
assert("helper does not write files", executedSuccessDraft.filesChanged.length === 0);
console.log(`=== ActionGate Runtime Report Surface Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
