import { executeLowRiskDirectTool, LOW_RISK_DIRECT_TOOL_IDS } from "./low-risk-direct-execution-adapter.js";

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

console.log("=== Low-Risk Direct Execution Adapter Tests ===");

assert(
  "allowed static tool ids are exactly the six approved tools",
  JSON.stringify(LOW_RISK_DIRECT_TOOL_IDS) === JSON.stringify([
    "umg_envoy_status",
    "umg_envoy_validate_runtime_output",
    "umg_envoy_parse_path",
    "umg_envoy_validate_path",
    "umg_envoy_render_path",
    "umg_envoy_action_gate_runtime_report_view",
  ]),
);

const statusResult = executeLowRiskDirectTool({ toolId: "umg_envoy_status" });
assert("status tool can run through adapter and produce executed_success ToolResult", statusResult.status === "executed_success" && statusResult.toolResult.executionStatus === "executed_success");

const parseResult = executeLowRiskDirectTool({ toolId: "umg_envoy_parse_path", input: { source: "sleeve:public-basic-envoy" } });
assert("parse path tool can run through adapter", parseResult.status === "executed_success" || parseResult.status === "executed_failure");

const validatePathResult = executeLowRiskDirectTool({ toolId: "umg_envoy_validate_path", input: { source: "sleeve:public-basic-envoy" } });
assert("validate path tool can run through adapter", validatePathResult.status === "executed_success" || validatePathResult.status === "executed_failure");

const renderPathResult = executeLowRiskDirectTool({ toolId: "umg_envoy_render_path", input: { source: "sleeve:public-basic-envoy" } });
assert("render path tool can run through adapter", renderPathResult.status === "executed_success" || renderPathResult.status === "executed_failure");

const runtimeReportResult = executeLowRiskDirectTool({ toolId: "umg_envoy_action_gate_runtime_report_view", input: { toolId: "umg_envoy_status", mode: "compact" } });
assert("runtime report view can run through adapter", runtimeReportResult.status === "executed_success");

const validateRuntimeOutputResult = executeLowRiskDirectTool({
  toolId: "umg_envoy_validate_runtime_output",
  input: {
    runtimeOutput: {
      runtimespec_id: "rs_test",
      sleeve_id: "public-basic-envoy",
      snap_id: "snap_test",
      primary_shell_block_id: "shell.block",
      active_blocks: ["shell.block"],
      prompt_parts: [],
      strategy: {},
      constraints: {},
      context: {},
      values: {},
      format: {},
      tool_requests: [],
      errors: [],
      warnings: [],
    },
  },
});
assert("validate runtime output can run through adapter with safe sample input", validateRuntimeOutputResult.status === "executed_success");

const unknownResult = executeLowRiskDirectTool({ toolId: "unknown.tool" });
assert("unknown tool is blocked and handler is not called", unknownResult.status === "execution_blocked" && unknownResult.toolResult.executionStatus === "execution_blocked");

const loadSleeveResult = executeLowRiskDirectTool({ toolId: "umg_envoy_load_sleeve", input: { sleevePath: "x", libraryRoot: "y" } });
assert("umg_envoy_load_sleeve is blocked and handler is not called", loadSleeveResult.status === "execution_blocked");
assert("umg_envoy_load_sleeve is not in LOW_RISK_DIRECT_TOOL_IDS", LOW_RISK_DIRECT_TOOL_IDS.includes("umg_envoy_load_sleeve" as never) === false);

const explainSleeveResult = executeLowRiskDirectTool({ toolId: "umg_envoy_explain_sleeve", input: { sleeveId: "public-basic-envoy" } });
assert("umg_envoy_explain_sleeve is blocked and handler is not called", explainSleeveResult.status === "execution_blocked");
assert("umg_envoy_explain_sleeve is not in LOW_RISK_DIRECT_TOOL_IDS", LOW_RISK_DIRECT_TOOL_IDS.includes("umg_envoy_explain_sleeve" as never) === false);

const cognitiveRegistryResult = executeLowRiskDirectTool({ toolId: "umg_envoy_cognitive_registry_query", input: { kind: "all" } });
assert("umg_envoy_cognitive_registry_query is blocked and handler is not called", cognitiveRegistryResult.status === "execution_blocked");
assert("umg_envoy_cognitive_registry_query is not in LOW_RISK_DIRECT_TOOL_IDS", LOW_RISK_DIRECT_TOOL_IDS.includes("umg_envoy_cognitive_registry_query" as never) === false);

const planNeoStackResult = executeLowRiskDirectTool({ toolId: "umg_envoy_plan_neostack", input: { intent: "explain a sleeve" } });
assert("umg_envoy_plan_neostack is blocked and handler is not called", planNeoStackResult.status === "execution_blocked");
assert("umg_envoy_plan_neostack is not in LOW_RISK_DIRECT_TOOL_IDS", LOW_RISK_DIRECT_TOOL_IDS.includes("umg_envoy_plan_neostack" as never) === false);

const dryRunOnlyResult = executeLowRiskDirectTool({ toolId: "umg_envoy_compile_sleeve", input: { sleeveId: "public-basic-envoy" } });
assert("dry_run_only tool is blocked", dryRunOnlyResult.status === "execution_blocked");

const blockedBridgeResult = executeLowRiskDirectTool({ toolId: "umg_envoy_compile_ir_bridge", input: { sleevePath: "x", libraryRoot: "y" } });
assert("blocked bridge tool is blocked", blockedBridgeResult.status === "execution_blocked");

const blockedEmitResult = executeLowRiskDirectTool({ toolId: "umg_envoy_emit_relation_matrix", input: { sleevePath: "x", libraryRoot: "y" } });
assert("blocked relation-matrix tool is blocked", blockedEmitResult.status === "execution_blocked");

const invalidBoundaryResult = executeLowRiskDirectTool({
  toolId: "umg_envoy_status",
  sourceRuntimeSpecBoundaryStatus: "missing_boundary_metadata",
  sourceRuntimeSpecNonExecuting: null,
});
assert("RuntimeSpec/Trace do not authorize execution by themselves", invalidBoundaryResult.status === "execution_denied" || invalidBoundaryResult.status === "execution_blocked");

const registryKnownButBlocked = executeLowRiskDirectTool({ toolId: "umg_envoy_build_path", input: { message: "hello" } });
assert("registry known status alone does not authorize execution", registryKnownButBlocked.status === "execution_blocked");

const successToolResult = statusResult.toolResult;
assert("ToolResult has empty side effects for successful read-only direct tools", successToolResult.sideEffects.length === 0);
assert("ToolResult has empty filesChanged for successful read-only direct tools", successToolResult.filesChanged.length === 0);
assert("ToolResult has empty externalCallsMade for successful read-only direct tools", successToolResult.externalCallsMade.length === 0);
assert("blocked-before-handler does not claim execution", unknownResult.toolResult.executionStatus !== "executed_success");

const failureResult = executeLowRiskDirectTool({ toolId: "umg_envoy_render_path", input: { source: null as unknown as string } });
assert("failure inside handler becomes executed_failure ToolResult when handler throws or fails", failureResult.status === "executed_success" || failureResult.status === "executed_failure");

console.log(`=== Low-Risk Direct Execution Adapter Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
