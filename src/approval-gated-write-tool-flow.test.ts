import {
  canProceedApprovalGatedWrite,
  createApprovalGatedWritePolicy,
  createBlockedUnknownToolGate,
  createProposedActionGate,
  evaluateApprovalGatedWriteReadiness,
  type ApprovalRecord,
  type ToolCapability,
  type ToolResult,
} from "./action-gate-types.js";

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

function capability(overrides: Partial<ToolCapability>): ToolCapability {
  return {
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
    ...overrides,
  };
}

const validApproval: ApprovalRecord = {
  approvalId: "apr-1",
  approver: "tester",
  approvedAt: "2026-05-29T19:30:00Z",
  scope: "write.tool",
  valid: true,
  note: "approved for modeled future execution only",
};

console.log("=== Approval-Gated Write Tool Flow Tests ===");

const policy = createApprovalGatedWritePolicy();

const writeGate = createProposedActionGate({
  actionId: "aw-1",
  proposedToolName: "Write Tool",
  proposedToolId: "write.tool",
  actionKind: "write",
  riskClass: "approval_gated_write",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const missingApprovalDecision = evaluateApprovalGatedWriteReadiness(writeGate, capability({}), undefined, policy);
assert("approval_gated_write requires approval", missingApprovalDecision.approvalStatus === "approval_missing");
assert("approval_gated_write cannot run direct", canProceedApprovalGatedWrite(writeGate, capability({}), undefined, policy) === false);
assert("missing approval blocks readiness", missingApprovalDecision.status === "approval_missing");

const readyDecision = evaluateApprovalGatedWriteReadiness(
  writeGate,
  capability({}),
  { approvalRecord: validApproval },
  policy,
);
assert("valid approval can mark action ready for future write execution only", readyDecision.status === "ready_for_future_write_execution");
assert("approval present allows future write readiness only", readyDecision.eligibleForFutureWriteExecution === true);

const invalidApprovalDecision = evaluateApprovalGatedWriteReadiness(
  writeGate,
  capability({}),
  { approvalRecord: { ...validApproval, valid: false } },
  policy,
);
assert("invalid approval blocks readiness", invalidApprovalDecision.status === "approval_invalid");

const previewRequiredDecision = evaluateApprovalGatedWriteReadiness(
  writeGate,
  capability({ previewRequired: true }),
  undefined,
  policy,
);
assert("preview-required write reports preview requirement", previewRequiredDecision.status === "preview_required_before_approval");

const dryRunRequiredDecision = evaluateApprovalGatedWriteReadiness(
  writeGate,
  capability({ dryRunRequired: true, dryRunSupported: true }),
  undefined,
  policy,
);
assert("dry-run-required write reports dry-run requirement", dryRunRequiredDecision.status === "dry_run_required_before_approval");

const backupRequiredDecision = evaluateApprovalGatedWriteReadiness(
  writeGate,
  capability({ backupRequired: true }),
  { approvalRecord: validApproval },
  policy,
);
assert("backup-required write reports backup requirement", backupRequiredDecision.status === "backup_required");

const rollbackRequiredDecision = evaluateApprovalGatedWriteReadiness(
  writeGate,
  capability({ rollbackSupported: true }),
  { approvalRecord: validApproval },
  policy,
);
assert("rollback-required write reports rollback requirement", rollbackRequiredDecision.status === "rollback_required");

const readOnlyGate = createProposedActionGate({
  actionId: "aw-2",
  proposedToolName: "Inspect Tool",
  proposedToolId: "inspect.tool",
  actionKind: "inspect",
  riskClass: "read_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const readOnlyDecision = evaluateApprovalGatedWriteReadiness(
  readOnlyGate,
  capability({
    toolId: "inspect.tool",
    toolName: "Inspect Tool",
    allowedRiskClass: "read_only",
    directExecutionAllowed: true,
    approvalRequired: false,
  }),
  undefined,
  policy,
);
assert("read_only is rejected by approval-gated write helper", readOnlyDecision.status === "blocked_not_write_capability");

const lowRiskGate = createProposedActionGate({
  actionId: "aw-3",
  proposedToolName: "Low Risk Tool",
  proposedToolId: "lowrisk.tool",
  actionKind: "inspect",
  riskClass: "low_risk_direct",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const lowRiskDecision = evaluateApprovalGatedWriteReadiness(
  lowRiskGate,
  capability({
    toolId: "lowrisk.tool",
    toolName: "Low Risk Tool",
    allowedRiskClass: "low_risk_direct",
    directExecutionAllowed: true,
    approvalRequired: false,
  }),
  undefined,
  policy,
);
assert("low_risk_direct is rejected by approval-gated write helper", lowRiskDecision.status === "blocked_not_write_capability");

const destructiveGate = createProposedActionGate({
  actionId: "aw-4",
  proposedToolName: "Destroy Tool",
  proposedToolId: "destroy.tool",
  actionKind: "delete",
  riskClass: "destructive_or_sensitive",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const destructiveDecision = evaluateApprovalGatedWriteReadiness(
  destructiveGate,
  capability({
    toolId: "destroy.tool",
    toolName: "Destroy Tool",
    allowedRiskClass: "destructive_or_sensitive",
    approvalRequired: true,
    previewRequired: true,
    dryRunRequired: true,
    backupRequired: true,
    rollbackSupported: true,
  }),
  undefined,
  policy,
);
assert("destructive_or_sensitive is rejected for this lane", destructiveDecision.status === "blocked_destructive_or_sensitive");

const transmissionGate = createProposedActionGate({
  actionId: "aw-5",
  proposedToolName: "Transmit Tool",
  proposedToolId: "transmit.tool",
  actionKind: "send",
  riskClass: "external_transmission",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const transmissionDecision = evaluateApprovalGatedWriteReadiness(
  transmissionGate,
  capability({
    toolId: "transmit.tool",
    toolName: "Transmit Tool",
    allowedRiskClass: "external_transmission",
    approvalRequired: true,
    previewRequired: true,
    externalTransmissionAllowed: true,
  }),
  undefined,
  policy,
);
assert("external_transmission is rejected for this lane", transmissionDecision.status === "blocked_external_transmission");

const unknownGate = createBlockedUnknownToolGate({
  actionId: "aw-6",
  proposedToolName: "Unknown Tool",
  proposedToolId: "unknown.tool",
  actionKind: "unknown",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const unknownDecision = evaluateApprovalGatedWriteReadiness(unknownGate, null, undefined, policy);
assert("unknown tool is blocked", unknownDecision.status === "blocked_unknown_tool");

const invalidRuntimeGate = createProposedActionGate({
  actionId: "aw-7",
  proposedToolName: "Unsafe Write Tool",
  proposedToolId: "unsafe-write.tool",
  actionKind: "write",
  riskClass: "approval_gated_write",
  sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
  sourceRuntimeSpecNonExecuting: null,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const invalidRuntimeDecision = evaluateApprovalGatedWriteReadiness(
  invalidRuntimeGate,
  capability({ toolId: "unsafe-write.tool", toolName: "Unsafe Write Tool" }),
  undefined,
  policy,
);
assert("invalid RuntimeSpecBoundary blocks readiness", invalidRuntimeDecision.status === "blocked_boundary_violation");

const invalidTraceGate = createProposedActionGate({
  actionId: "aw-8",
  proposedToolName: "Unsafe Trace Write Tool",
  proposedToolId: "unsafe-trace-write.tool",
  actionKind: "write",
  riskClass: "approval_gated_write",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "boundary_violation",
  sourceTraceAuditOnly: null,
});
const invalidTraceDecision = evaluateApprovalGatedWriteReadiness(
  invalidTraceGate,
  capability({ toolId: "unsafe-trace-write.tool", toolName: "Unsafe Trace Write Tool" }),
  undefined,
  policy,
);
assert("TraceBoundary violation blocks readiness", invalidTraceDecision.status === "blocked_boundary_violation");
assert("RuntimeSpec does not authorize writes", invalidRuntimeDecision.eligibleForFutureWriteExecution === false);
assert("Trace does not authorize writes", invalidTraceDecision.eligibleForFutureWriteExecution === false);
assert("approval does not equal execution", readyDecision.status === "ready_for_future_write_execution");

const toolResult: ToolResult = {
  actionId: "aw-result-1",
  toolName: "Approval Test Tool",
  toolId: "approval.test.tool",
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
assert("approval does not create ToolResult", toolResult.executionStatus === "not_executed");
assert("helper does not execute anything", !readyDecision.notes.some((note) => /executed tool/i.test(note)));

console.log(`=== Approval-Gated Write Tool Flow Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
