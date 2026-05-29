import { assertToolResultNotCompilerTrace, createApprovalGatedWritePolicy, createBlockedUnknownToolGate, createProposedActionGate, createToolResultAuditDraft, evaluateApprovalGatedWriteReadiness, linkToolResultToActionGate, validateToolResultAuditRecord, } from "./action-gate-types.js";
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
const capability = {
    toolId: "write.tool",
    toolName: "Write Tool",
    toolCategory: "mutation",
    allowedRiskClass: "approval_gated_write",
    directExecutionAllowed: false,
    approvalRequired: true,
    previewRequired: false,
    dryRunSupported: true,
    dryRunRequired: false,
    rollbackSupported: false,
    backupRequired: false,
    externalTransmissionAllowed: false,
    blockedSurfaces: [],
    auditRequirements: ["tool_result", "approval_reference"],
    requiresToolResultAudit: true,
};
const approvalRecord = {
    approvalId: "apr-2",
    approver: "tester",
    approvedAt: "2026-05-29T19:45:00Z",
    scope: "write.tool",
    valid: true,
};
console.log("=== ToolResult Audit Record Alignment Tests ===");
const actionGate = createProposedActionGate({
    actionId: "tr-1",
    proposedToolName: "Write Tool",
    proposedToolId: "write.tool",
    actionKind: "write",
    riskClass: "approval_gated_write",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const readiness = evaluateApprovalGatedWriteReadiness(actionGate, capability, { approvalRecord }, createApprovalGatedWritePolicy());
const notExecutedDraft = createToolResultAuditDraft({
    actionGate,
    capability,
    approvalRecord,
    executionStatus: "not_executed",
    inputSummary: "planned write input",
    outputSummary: "no execution performed",
    warnings: ["pre-execution audit only"],
});
assert("ToolResult is distinct from compiler Trace", assertToolResultNotCompilerTrace(notExecutedDraft) === true);
assert("ToolResult can link to ActionGate", notExecutedDraft.auditLink.actionGateActionId === actionGate.actionId);
assert("ToolResult can link to ApprovalRecord", notExecutedDraft.auditLink.approvalId === approvalRecord.approvalId);
assert("approval record does not create ToolResult execution", notExecutedDraft.executionStatus === "not_executed");
assert("ready_for_future_write_execution does not create executed ToolResult", readiness.status === "ready_for_future_write_execution" && notExecutedDraft.executionStatus !== "executed_success");
const linkedBlocked = linkToolResultToActionGate({
    ...notExecutedDraft,
    executionStatus: "execution_blocked",
    outputSummary: "blocked before execution",
}, actionGate, capability, approvalRecord);
assert("ToolResult can represent blocked without claiming execution", linkedBlocked.executionStatus === "execution_blocked");
const deniedDraft = createToolResultAuditDraft({
    actionGate,
    capability,
    executionStatus: "execution_denied",
    inputSummary: "denied input",
    outputSummary: "denied before execution",
});
assert("ToolResult can represent denied without claiming execution", deniedDraft.executionStatus === "execution_denied");
const previewDraft = createToolResultAuditDraft({
    actionGate,
    capability,
    executionStatus: "preview_recorded",
    inputSummary: "preview request",
    outputSummary: "preview captured",
});
assert("preview records remain explicitly labeled", previewDraft.executionStatus === "preview_recorded");
const dryRunDraft = createToolResultAuditDraft({
    actionGate,
    capability,
    executionStatus: "dry_run_recorded",
    inputSummary: "dry-run request",
    outputSummary: "dry-run captured",
});
assert("dry-run records remain explicitly labeled", dryRunDraft.executionStatus === "dry_run_recorded");
const unknownGate = createBlockedUnknownToolGate({
    actionId: "tr-2",
    proposedToolName: "Unknown Tool",
    proposedToolId: "unknown.tool",
    actionKind: "unknown",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const unknownDraft = createToolResultAuditDraft({
    actionGate: unknownGate,
    executionStatus: "execution_blocked",
    inputSummary: "unknown tool request",
    outputSummary: "blocked unknown tool",
});
assert("blocked actions can produce audit records without implying success", unknownDraft.executionStatus === "execution_blocked");
const validated = validateToolResultAuditRecord(notExecutedDraft);
assert("valid ToolResult audit draft passes validation", validated.ok === true);
const explicitSuccessDraft = createToolResultAuditDraft({
    actionGate,
    capability,
    approvalRecord,
    executionStatus: "executed_success",
    inputSummary: "success input",
    outputSummary: "success output",
});
assert("executed_success is not produced unless explicitly requested", explicitSuccessDraft.executionStatus === "executed_success");
const traceLikeToolResult = {
    ...notExecutedDraft,
    auditLink: {
        ...notExecutedDraft.auditLink,
        traceBoundarySummary: "compiler_trace_as_execution",
    },
};
assert("compiler Trace is not ToolResult", assertToolResultNotCompilerTrace(traceLikeToolResult) === false);
const invalidRecordCheck = validateToolResultAuditRecord({
    ...linkedBlocked,
    sideEffects: ["pretend side effect"],
});
assert("blocked record with side effects is flagged", invalidRecordCheck.ok === false);
assert("helper does not execute tools", !notExecutedDraft.warnings.some((w) => /executed tool/i.test(w)));
assert("helper does not write files", notExecutedDraft.filesChanged.length === 0);
assert("helper does not mutate runtime state", notExecutedDraft.externalCallsMade.length === 0);
console.log(`=== ToolResult Audit Record Alignment Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
