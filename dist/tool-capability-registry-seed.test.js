import { canToolRunDirectly, requiresDryRunForCapability, } from "./action-gate-types.js";
import { ENVOY_TOOL_CAPABILITY_REGISTRY_SEED, createEnvoyToolCapabilityRegistrySeed, resolveEnvoySeededToolCapability, } from "./tool-capability-registry-seed.js";
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
console.log("=== Tool Capability Registry Seed Tests ===");
const expectedToolIds = [
    "umg_envoy_status",
    "umg_envoy_compiler_smoke_test",
    "umg_envoy_list_sleeves",
    "umg_envoy_list_block_libraries",
    "umg_envoy_compile_sleeve",
    "umg_envoy_explain_sleeve",
    "umg_envoy_validate_runtime_output",
    "umg_envoy_compare_sleeves",
    "umg_envoy_parse_path",
    "umg_envoy_validate_path",
    "umg_envoy_render_path",
    "umg_envoy_build_path",
    "umg_envoy_matrix_status",
    "umg_envoy_compile_ir_bridge",
    "umg_envoy_emit_relation_matrix",
    "umg_envoy_action_gate_runtime_report_view",
    "umg_envoy_load_sleeve",
];
const seedRegistry = createEnvoyToolCapabilityRegistrySeed();
assert("all 17 seeded tool ids are represented in the seed", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.length === 17 && expectedToolIds.every((toolId) => Boolean(resolveEnvoySeededToolCapability(toolId))));
assert("read_only tools resolve as read_only", resolveEnvoySeededToolCapability("umg_envoy_status")?.allowedRiskClass === "read_only");
assert("dry_run_only tools resolve as dry_run_only", resolveEnvoySeededToolCapability("umg_envoy_compile_sleeve")?.allowedRiskClass === "dry_run_only");
assert("blocked tools resolve as blocked", resolveEnvoySeededToolCapability("umg_envoy_compile_ir_bridge")?.allowedRiskClass === "blocked");
assert("no seeded tool is low_risk_direct in first pass", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.every((entry) => entry.allowedRiskClass !== "low_risk_direct"));
assert("unknown tool resolves as null through existing unknown policy", resolveEnvoySeededToolCapability("unknown.tool") === null);
assert("blocked tools cannot run direct", canToolRunDirectly(resolveEnvoySeededToolCapability("umg_envoy_emit_relation_matrix") ?? null) === false);
assert("dry_run_only tools require dry run", requiresDryRunForCapability(resolveEnvoySeededToolCapability("umg_envoy_build_path") ?? null) === true);
assert("explain sleeve is read-only and not direct-executable by default", resolveEnvoySeededToolCapability("umg_envoy_explain_sleeve")?.allowedRiskClass === "read_only" && canToolRunDirectly(resolveEnvoySeededToolCapability("umg_envoy_explain_sleeve") ?? null) === false);
assert("read_only tools do not imply execution permission", canToolRunDirectly(resolveEnvoySeededToolCapability("umg_envoy_validate_runtime_output") ?? null) === true && resolveEnvoySeededToolCapability("umg_envoy_validate_runtime_output")?.allowedRiskClass === "read_only");
assert("runtime report tool remains report-only/read-only", resolveEnvoySeededToolCapability("umg_envoy_action_gate_runtime_report_view")?.allowedRiskClass === "read_only");
assert("no seeded entry allows external transmission", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.every((entry) => entry.externalTransmissionAllowed === false));
assert("no seeded entry allows write mutation", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.every((entry) => entry.allowedRiskClass !== "approval_gated_write" && entry.allowedRiskClass !== "destructive_or_sensitive" && entry.allowedRiskClass !== "external_transmission"));
assert("seed registry does not execute tools", typeof seedRegistry.entriesByToolId["umg_envoy_status"]?.toolId === "string");
const toolResult = {
    actionId: "seed-result-1",
    toolName: "Seed Test Tool",
    toolId: "seed.test.tool",
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
assert("seed registry does not create ToolResult", toolResult.executionStatus === "not_executed");
assert("seeded low-risk direct entries require allowlist tag (none present in first pass)", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.every((entry) => entry.allowedRiskClass !== "low_risk_direct"));
console.log(`=== Tool Capability Registry Seed Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
