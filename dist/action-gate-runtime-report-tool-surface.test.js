import { createActionGateRuntimeReport, createActionGateRuntimeReportToolResponse, createProposedActionGate, createToolResultAuditDraft, redactActionGateRuntimeReport, summarizeActionGateRuntimeReportForTool, } from "./action-gate-types.js";
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
    toolId: "inspect.tool",
    toolName: "Inspect Tool",
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
};
console.log("=== ActionGate Runtime Report Tool Surface Tests ===");
const gate = createProposedActionGate({
    actionId: "rt-1",
    proposedToolName: "Inspect Tool",
    proposedToolId: "inspect.tool",
    actionKind: "inspect",
    riskClass: "read_only",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
const baseReport = createActionGateRuntimeReport({
    actionGate: gate,
    capability,
});
const fullView = createActionGateRuntimeReportToolResponse(baseReport, "full");
assert("full report response includes boundary language", fullView.boundaries.notExecution === true && fullView.boundaries.notApproval === true);
assert("full report response is JSON-serializable", typeof JSON.stringify(fullView) === "string");
const compactView = summarizeActionGateRuntimeReportForTool(baseReport);
assert("compact report preserves status and non-execution boundary", compactView.status === baseReport.status && compactView.boundaries.notExecution === true);
assert("compact report omits sections", compactView.sections === undefined);
const redactedView = redactActionGateRuntimeReport(baseReport);
assert("redacted/public report removes sensitive detail while preserving status", redactedView.status === baseReport.status && (redactedView.sections === undefined));
assert("redacted/public report preserves boundary language", redactedView.boundaries.notPermission === true);
const notExecutedDraft = createToolResultAuditDraft({
    actionGate: gate,
    capability,
    executionStatus: "not_executed",
    inputSummary: "inspect input",
    outputSummary: "no execution",
});
const notExecutedReport = createActionGateRuntimeReport({
    actionGate: gate,
    capability,
    toolResult: notExecutedDraft,
});
const notExecutedView = createActionGateRuntimeReportToolResponse(notExecutedReport, "compact");
assert("helper does not create ToolResult", notExecutedView.status !== "executed_result_present");
assert("helper does not convert readiness into permission", notExecutedView.boundaries.notPermission === true);
const executedSuccessDraft = createToolResultAuditDraft({
    actionGate: gate,
    capability,
    executionStatus: "executed_success",
    inputSummary: "inspect input",
    outputSummary: "inspect success",
});
executedSuccessDraft.finishedAt = "2026-05-29T20:10:00Z";
const executedReport = createActionGateRuntimeReport({
    actionGate: gate,
    capability,
    toolResult: executedSuccessDraft,
});
const executedView = createActionGateRuntimeReportToolResponse(executedReport, "full");
assert("executed result appears only when ToolResult executionStatus is executed_success or executed_failure", executedView.status === "executed_result_present");
assert("helper does not execute tools", !executedView.finalReason.includes("executed by helper"));
assert("helper does not write files", executedSuccessDraft.filesChanged.length === 0);
console.log(`=== ActionGate Runtime Report Tool Surface Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
