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

console.log("=== Low-Risk Direct Runtime Tool Surface Tests ===");

assert("runtime tool surface allowed ids remain exactly the approved six", JSON.stringify(LOW_RISK_DIRECT_TOOL_IDS) === JSON.stringify([
  "umg_envoy_status",
  "umg_envoy_validate_runtime_output",
  "umg_envoy_parse_path",
  "umg_envoy_validate_path",
  "umg_envoy_render_path",
  "umg_envoy_action_gate_runtime_report_view",
]));

const statusResult = executeLowRiskDirectTool({ toolId: "umg_envoy_status" });
assert("status tool returns executed_success ToolResult", statusResult.status === "executed_success" && statusResult.toolResult.executionStatus === "executed_success");

const parseResult = executeLowRiskDirectTool({ toolId: "umg_envoy_parse_path", input: { source: "sleeve:public-basic-envoy" } });
assert("parse path tool works or returns controlled failure", parseResult.status === "executed_success" || parseResult.status === "executed_failure");

const validateResult = executeLowRiskDirectTool({ toolId: "umg_envoy_validate_path", input: { source: "sleeve:public-basic-envoy" } });
assert("validate path tool works or returns controlled failure", validateResult.status === "executed_success" || validateResult.status === "executed_failure");

const renderResult = executeLowRiskDirectTool({ toolId: "umg_envoy_render_path", input: { source: "sleeve:public-basic-envoy" } });
assert("render path tool works or returns controlled failure", renderResult.status === "executed_success" || renderResult.status === "executed_failure");

const runtimeReportResult = executeLowRiskDirectTool({ toolId: "umg_envoy_action_gate_runtime_report_view", input: { toolId: "umg_envoy_status", mode: "compact" } });
assert("runtime report view tool returns adapter response", runtimeReportResult.status === "executed_success");

const unknownResult = executeLowRiskDirectTool({ toolId: "unknown.tool" });
assert("unknown tool is blocked", unknownResult.status === "execution_blocked");

const loadSleeveResult = executeLowRiskDirectTool({ toolId: "umg_envoy_load_sleeve", input: { sleevePath: "x", libraryRoot: "y" } });
assert("load_sleeve is blocked", loadSleeveResult.status === "execution_blocked");

const explainSleeveResult = executeLowRiskDirectTool({ toolId: "umg_envoy_explain_sleeve", input: { sleeveId: "public-basic-envoy" } });
assert("explain_sleeve is blocked", explainSleeveResult.status === "execution_blocked");

const bridgeResult = executeLowRiskDirectTool({ toolId: "umg_envoy_compile_ir_bridge", input: {} });
assert("bridge tool is blocked", bridgeResult.status === "execution_blocked");

const dryRunOnlyResult = executeLowRiskDirectTool({ toolId: "umg_envoy_compile_sleeve", input: { sleeveId: "public-basic-envoy" } });
assert("dry-run-only tool is blocked", dryRunOnlyResult.status === "execution_blocked");

assert("no arbitrary handler dispatch exists beyond static map", LOW_RISK_DIRECT_TOOL_IDS.includes("umg_envoy_compile_ir_bridge" as never) === false);
assert("ToolResult has empty sideEffects for successful direct tools", statusResult.toolResult.sideEffects.length === 0);
assert("ToolResult has empty filesChanged for successful direct tools", statusResult.toolResult.filesChanged.length === 0);
assert("ToolResult has empty externalCallsMade for successful direct tools", statusResult.toolResult.externalCallsMade.length === 0);
assert("blocked tool does not produce executed_success", unknownResult.toolResult.executionStatus !== "executed_success");

const invalidBoundaryResult = executeLowRiskDirectTool({
  toolId: "umg_envoy_status",
  sourceTraceBoundaryStatus: "boundary_violation",
  sourceTraceAuditOnly: null,
});
assert("RuntimeSpec/Trace do not authorize execution by themselves", invalidBoundaryResult.status === "execution_denied" || invalidBoundaryResult.status === "execution_blocked");

console.log(`=== Low-Risk Direct Runtime Tool Surface Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
