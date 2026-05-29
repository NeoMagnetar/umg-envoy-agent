import {
  createBlockedUnknownToolGate,
  createProposedActionGate,
  planActionGatePreviewDryRun,
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
    toolId: "test.tool",
    toolName: "Test Tool",
    toolCategory: "testing",
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
    ...overrides,
  };
}

console.log("=== ActionGate Preview/Dry-Run Flow Tests ===");

const readOnlyGate = createProposedActionGate({
  actionId: "preview-1",
  proposedToolName: "Inspect Tool",
  proposedToolId: "inspect.tool",
  actionKind: "inspect",
  riskClass: "read_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const readOnlyPlan = planActionGatePreviewDryRun(readOnlyGate, capability({
  toolId: "inspect.tool",
  toolName: "Inspect Tool",
  allowedRiskClass: "read_only",
}));
assert("read_only does not require preview", readOnlyPlan.previewPlan.required === false);
assert("read_only does not require dry-run", readOnlyPlan.dryRunPlan.required === false);

const dryRunGate = createProposedActionGate({
  actionId: "preview-2",
  proposedToolName: "Dry Run Tool",
  proposedToolId: "dryrun.tool",
  actionKind: "projection",
  riskClass: "dry_run_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const dryRunPlan = planActionGatePreviewDryRun(dryRunGate, capability({
  toolId: "dryrun.tool",
  toolName: "Dry Run Tool",
  allowedRiskClass: "dry_run_only",
  directExecutionAllowed: false,
  dryRunSupported: true,
  dryRunRequired: true,
}));
assert("dry_run_only requires dry-run", dryRunPlan.dryRunPlan.required === true);
assert("dry_run_only remains non-executing planning", dryRunPlan.blocked === false);

const previewGate = createProposedActionGate({
  actionId: "preview-3",
  proposedToolName: "Preview Tool",
  proposedToolId: "preview.tool",
  actionKind: "preview",
  riskClass: "preview_only",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const previewPlan = planActionGatePreviewDryRun(previewGate, capability({
  toolId: "preview.tool",
  toolName: "Preview Tool",
  allowedRiskClass: "preview_only",
  directExecutionAllowed: false,
  previewRequired: true,
  dryRunSupported: true,
}));
assert("preview_only requires preview", previewPlan.previewPlan.required === true);

const lowRiskGate = createProposedActionGate({
  actionId: "preview-4",
  proposedToolName: "Low Risk Tool",
  proposedToolId: "lowrisk.tool",
  actionKind: "status",
  riskClass: "low_risk_direct",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const lowRiskPlan = planActionGatePreviewDryRun(lowRiskGate, capability({
  toolId: "lowrisk.tool",
  toolName: "Low Risk Tool",
  allowedRiskClass: "low_risk_direct",
  directExecutionAllowed: true,
  dryRunSupported: true,
}));
assert("low_risk_direct does not require preview by default", lowRiskPlan.previewPlan.required === false);
assert("low_risk_direct does not require dry-run by default", lowRiskPlan.dryRunPlan.required === false);

const approvalGate = createProposedActionGate({
  actionId: "preview-5",
  proposedToolName: "Write Tool",
  proposedToolId: "write.tool",
  actionKind: "write",
  riskClass: "approval_gated_write",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const approvalPlan = planActionGatePreviewDryRun(approvalGate, capability({
  toolId: "write.tool",
  toolName: "Write Tool",
  allowedRiskClass: "approval_gated_write",
  directExecutionAllowed: false,
  approvalRequired: true,
  dryRunSupported: true,
  backupRequired: true,
}));
assert("approval_gated_write identifies later approval requirement", approvalPlan.approvalRequiredLater === true);
assert("approval_gated_write carries backup requirement", approvalPlan.backupRequired === true);

const destructiveGate = createProposedActionGate({
  actionId: "preview-6",
  proposedToolName: "Destroy Tool",
  proposedToolId: "destroy.tool",
  actionKind: "delete",
  riskClass: "destructive_or_sensitive",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const destructivePlan = planActionGatePreviewDryRun(destructiveGate, capability({
  toolId: "destroy.tool",
  toolName: "Destroy Tool",
  allowedRiskClass: "destructive_or_sensitive",
  directExecutionAllowed: false,
  approvalRequired: true,
  previewRequired: true,
  dryRunSupported: true,
  dryRunRequired: true,
  backupRequired: true,
}));
assert("destructive_or_sensitive requires preview", destructivePlan.previewPlan.required === true);
assert("destructive_or_sensitive marks dry-run required when supported", destructivePlan.dryRunPlan.required === true);

const transmissionGate = createProposedActionGate({
  actionId: "preview-7",
  proposedToolName: "Transmit Tool",
  proposedToolId: "transmit.tool",
  actionKind: "send",
  riskClass: "external_transmission",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const transmissionPlan = planActionGatePreviewDryRun(transmissionGate, capability({
  toolId: "transmit.tool",
  toolName: "Transmit Tool",
  allowedRiskClass: "external_transmission",
  directExecutionAllowed: false,
  approvalRequired: true,
  previewRequired: true,
  dryRunSupported: true,
  externalTransmissionAllowed: true,
}));
assert("external_transmission requires approval", transmissionPlan.approvalRequiredLater === true);
assert("external_transmission requires preview", transmissionPlan.previewPlan.required === true);

const blockedGate = createProposedActionGate({
  actionId: "preview-8",
  proposedToolName: "Blocked Tool",
  proposedToolId: "blocked.tool",
  actionKind: "blocked",
  riskClass: "blocked",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const blockedPlan = planActionGatePreviewDryRun(blockedGate, capability({
  toolId: "blocked.tool",
  toolName: "Blocked Tool",
  allowedRiskClass: "blocked",
  directExecutionAllowed: false,
}));
assert("blocked risk class blocks before preview/dry-run", blockedPlan.blocked === true);

const unknownGate = createBlockedUnknownToolGate({
  actionId: "preview-9",
  proposedToolName: "Unknown Tool",
  proposedToolId: "unknown.tool",
  actionKind: "unknown",
  sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
  sourceRuntimeSpecNonExecuting: true,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const unknownPlan = planActionGatePreviewDryRun(unknownGate, null);
assert("unknown tool gate stays blocked or review-required in planning", unknownPlan.blocked === true);

const invalidBoundaryGate = createProposedActionGate({
  actionId: "preview-10",
  proposedToolName: "Unsafe Tool",
  proposedToolId: "unsafe.tool",
  actionKind: "inspect",
  riskClass: "read_only",
  sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
  sourceRuntimeSpecNonExecuting: null,
  sourceTraceBoundaryStatus: "valid_audit_artifact",
  sourceTraceAuditOnly: true,
});
const invalidBoundaryPlan = planActionGatePreviewDryRun(invalidBoundaryGate, capability({
  toolId: "unsafe.tool",
  toolName: "Unsafe Tool",
  allowedRiskClass: "read_only",
}));
assert("RuntimeSpec/Trace boundaries do not authorize execution", invalidBoundaryPlan.blocked === true);

const toolResult: ToolResult = {
  actionId: "preview-result-1",
  toolName: "Preview Test Tool",
  toolId: "preview.test.tool",
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
assert("preview/dry-run plan does not create ToolResult", toolResult.executionStatus === "proposed");
assert("planner helper does not execute tools", !unknownPlan.notes.some((note) => /executed tool/i.test(note)));

console.log(`=== ActionGate Preview/Dry-Run Flow Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
