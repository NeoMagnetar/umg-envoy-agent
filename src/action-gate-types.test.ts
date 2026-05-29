import { classifyRiskClassPolicy, createProposedActionGate, canProceedDirectly, requiresApproval, requiresPreview, requiresRollback, type ToolResult } from "./action-gate-types.js";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${label}`);
    passed++;
  } else {
    console.log(`FAIL: ${label}`);
    failed++;
  }
}

console.log("=== ActionGate Model Types Tests ===");

const readOnlyPolicy = classifyRiskClassPolicy("read_only");
assert("read_only direct policy allowed", readOnlyPolicy.directExecutionAllowed === true);

const lowRiskPolicy = classifyRiskClassPolicy("low_risk_direct");
assert("low_risk_direct allows direct policy", lowRiskPolicy.directExecutionAllowed === true);

const approvalWritePolicy = classifyRiskClassPolicy("approval_gated_write");
assert("approval_gated_write requires approval", approvalWritePolicy.approvalRequired === true);
assert("approval_gated_write requires backup", approvalWritePolicy.backupRequired === true);
assert("approval_gated_write supports dry run", approvalWritePolicy.dryRunSupported === true);

const destructivePolicy = classifyRiskClassPolicy("destructive_or_sensitive");
assert("destructive_or_sensitive does not allow direct execution", destructivePolicy.directExecutionAllowed === false);
assert("destructive_or_sensitive requires preview", destructivePolicy.previewRequired === true);
assert("destructive_or_sensitive requires dry run", destructivePolicy.dryRunRequired === true);

const transmissionPolicy = classifyRiskClassPolicy("external_transmission");
assert("external_transmission requires approval", transmissionPolicy.approvalRequired === true);
assert("external_transmission requires preview", transmissionPolicy.previewRequired === true);
assert("external_transmission allows external transmission", transmissionPolicy.externalTransmissionAllowed === true);

const blockedPolicy = classifyRiskClassPolicy("blocked");
assert("blocked never allows direct execution", blockedPolicy.directExecutionAllowed === false);
assert("blocked does not require ToolResult audit", blockedPolicy.requiresToolResultAudit === false);

const validReadOnlyGate = createProposedActionGate({
  actionId: "act-1",
  proposedToolName: "Inspect Tool",
  proposedToolId: "inspect.tool",
  actionKind: "inspect",
  riskClass: "read_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
assert("read_only can allow direct model decision", canProceedDirectly(validReadOnlyGate) === true);

const approvalGate = createProposedActionGate({
  actionId: "act-2",
  proposedToolName: "Write Tool",
  proposedToolId: "write.tool",
  actionKind: "write",
  riskClass: "approval_gated_write",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
assert("approval_gated_write requires approval", requiresApproval(approvalGate) === true);
assert("approval_gated_write requires rollback", requiresRollback(approvalGate) === true);

const blockedGate = createProposedActionGate({
  actionId: "act-3",
  proposedToolName: "Blocked Tool",
  proposedToolId: "blocked.tool",
  actionKind: "blocked",
  riskClass: "blocked",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
assert("blocked never proceeds", blockedGate.finalDecision === "block");

const invalidRuntimeBoundaryGate = createProposedActionGate({
  actionId: "act-4",
  proposedToolName: "Unsafe Tool",
  proposedToolId: "unsafe.tool",
  actionKind: "write",
  riskClass: "low_risk_direct",
  sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
  sourceRuntimeSpecNonExecuting: null,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
assert("RuntimeSpecBoundary alone does not authorize execution", invalidRuntimeBoundaryGate.finalDecision === "block");

const invalidTraceBoundaryGate = createProposedActionGate({
  actionId: "act-5",
  proposedToolName: "Unsafe Trace Tool",
  proposedToolId: "unsafe.trace.tool",
  actionKind: "inspect",
  riskClass: "read_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "boundary_violation",
  sourceTraceAuditOnly: null,
});
assert("TraceBoundary alone does not authorize execution", invalidTraceBoundaryGate.finalDecision === "block");

const previewGate = createProposedActionGate({
  actionId: "act-6",
  proposedToolName: "Preview Tool",
  proposedToolId: "preview.tool",
  actionKind: "preview",
  riskClass: "preview_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
assert("preview-only requires preview", requiresPreview(previewGate) === true);

const toolResult: ToolResult = {
  actionId: "act-r1",
  toolName: "Inspect Tool",
  toolId: "inspect.tool",
  executionStatus: "not_executed",
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
  auditLink: {
    runtimeSpecBoundaryStatus: null,
    runtimeSpecBoundarySummary: null,
    traceBoundaryStatus: null,
    traceBoundarySummary: null,
    actionGateActionId: null,
    actionGateDecision: null,
    approvalId: null,
    toolRiskClass: null,
  },
  warnings: [],
  errors: [],
};
assert("ToolResult is separate from Trace", !("events" in toolResult));

console.log(`=== ActionGate Model Types Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
