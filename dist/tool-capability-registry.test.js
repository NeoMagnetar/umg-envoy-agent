import { createBlockedUnknownToolGate, createToolCapabilityRegistry, getRiskClassPolicy, resolveToolCapability, isToolCapabilityKnown, canToolRunDirectly, requiresApprovalForCapability, requiresPreviewForCapability, requiresDryRunForCapability, requiresBackupForCapability, } from "./action-gate-types.js";
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
console.log("=== Tool Capability Registry Tests ===");
const knownEntries = [
    {
        toolId: "umg_envoy_status",
        toolName: "UMG Envoy Status",
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
        allowlistTags: ["local", "inspection"],
        notes: ["Bounded local status inspection."],
    },
    {
        toolId: "umg_envoy_compile_sleeve",
        toolName: "UMG Envoy Compile Sleeve",
        toolCategory: "projection",
        allowedRiskClass: "dry_run_only",
        directExecutionAllowed: false,
        approvalRequired: false,
        previewRequired: false,
        dryRunSupported: true,
        dryRunRequired: true,
        rollbackSupported: false,
        backupRequired: false,
        externalTransmissionAllowed: false,
        blockedSurfaces: ["network", "plugin_state"],
        auditRequirements: ["tool_result", "dry_run_record"],
        requiresToolResultAudit: true,
        notes: ["Projection only; no live execution authority."],
    },
    {
        toolId: "umg_envoy_publish_now",
        toolName: "UMG Envoy Publish Now",
        toolCategory: "publication",
        allowedRiskClass: "external_transmission",
        directExecutionAllowed: false,
        approvalRequired: true,
        previewRequired: true,
        dryRunSupported: true,
        dryRunRequired: false,
        rollbackSupported: false,
        backupRequired: false,
        externalTransmissionAllowed: true,
        blockedSurfaces: [],
        auditRequirements: ["tool_result", "approval_reference"],
        requiresToolResultAudit: true,
        notes: ["External transmission remains separately gated."],
    },
];
const registry = createToolCapabilityRegistry(knownEntries);
const resolvedStatus = resolveToolCapability(registry, "umg_envoy_status");
const unknown = resolveToolCapability(registry, "unknown.tool");
assert("known tool resolves by toolId", resolvedStatus?.toolId === "umg_envoy_status");
assert("unknown tool resolves as null", unknown === null);
assert("known tool check returns true", isToolCapabilityKnown(registry, "umg_envoy_status") === true);
assert("unknown tool check returns false", isToolCapabilityKnown(registry, "unknown.tool") === false);
assert("read_only can run direct when capability allows it", canToolRunDirectly(resolvedStatus ?? null) === true);
assert("unknown tool cannot run direct", canToolRunDirectly(unknown) === false);
const lowRiskPolicy = getRiskClassPolicy("low_risk_direct");
assert("low_risk_direct can be direct by policy", lowRiskPolicy.directExecutionAllowed === true);
const dryRunPolicy = getRiskClassPolicy("dry_run_only");
assert("dry_run_only requires dry run", dryRunPolicy.dryRunRequired === true);
assert("dry_run_only supports dry run", dryRunPolicy.dryRunSupported === true);
const previewPolicy = getRiskClassPolicy("preview_only");
assert("preview_only requires preview", previewPolicy.previewRequired === true);
const approvalWritePolicy = getRiskClassPolicy("approval_gated_write");
assert("approval_gated_write requires approval", approvalWritePolicy.approvalRequired === true);
assert("approval_gated_write requires backup", approvalWritePolicy.backupRequired === true);
const destructivePolicy = getRiskClassPolicy("destructive_or_sensitive");
assert("destructive_or_sensitive does not allow direct execution", destructivePolicy.directExecutionAllowed === false);
assert("destructive_or_sensitive requires preview", destructivePolicy.previewRequired === true);
assert("destructive_or_sensitive requires dry run when possible in policy", destructivePolicy.dryRunRequired === true);
const transmissionCapability = resolveToolCapability(registry, "umg_envoy_publish_now");
assert("external_transmission requires approval", requiresApprovalForCapability(transmissionCapability) === true);
assert("external_transmission requires preview", requiresPreviewForCapability(transmissionCapability) === true);
assert("external_transmission does not require backup by default", requiresBackupForCapability(transmissionCapability) === false);
const compileCapability = resolveToolCapability(registry, "umg_envoy_compile_sleeve");
assert("registry capability can require dry run", requiresDryRunForCapability(compileCapability) === true);
const blockedPolicy = getRiskClassPolicy("blocked");
assert("blocked never runs direct", blockedPolicy.directExecutionAllowed === false);
assert("blocked does not claim ToolResult audit requirement", blockedPolicy.requiresToolResultAudit === false);
const unknownGate = createBlockedUnknownToolGate({
    actionId: "unknown-1",
    proposedToolName: "Unknown Tool",
    proposedToolId: "unknown.tool",
    actionKind: "unknown",
    sourceRuntimeSpecBoundaryStatus: "valid_non_executing_artifact",
    sourceRuntimeSpecNonExecuting: true,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
assert("unknown tool gate never becomes direct", unknownGate.finalDecision !== "allow_direct");
assert("unknown tool gate is blocked or review-required", unknownGate.finalDecision === "review_required" || unknownGate.finalDecision === "block");
const boundaryFailedUnknownGate = createBlockedUnknownToolGate({
    actionId: "unknown-2",
    proposedToolName: "Unknown Unsafe Tool",
    proposedToolId: "unknown.unsafe.tool",
    actionKind: "unknown",
    sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
    sourceRuntimeSpecNonExecuting: null,
    sourceTraceBoundaryStatus: "valid_audit_artifact",
    sourceTraceAuditOnly: true,
});
assert("RuntimeSpec/Trace are not treated as authorization by registry helpers", boundaryFailedUnknownGate.finalDecision === "block");
const toolResult = {
    actionId: "result-1",
    toolName: "Registry Test Tool",
    toolId: "registry.test.tool",
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
assert("registry does not create ToolResult", toolResult.executionStatus === "proposed");
assert("registry helpers do not execute tools", typeof resolvedStatus?.toolId === "string" && !("execute" in resolvedStatus));
console.log(`=== Tool Capability Registry Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
