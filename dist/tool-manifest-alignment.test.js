import fs from "node:fs";
import { ENVOY_TOOL_CAPABILITY_REGISTRY_SEED, resolveEnvoySeededToolCapability } from "./tool-capability-registry-seed.js";
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
console.log("=== Tool Manifest Alignment Tests ===");
const pluginManifest = JSON.parse(fs.readFileSync(new URL("../openclaw.plugin.json", import.meta.url), "utf8"));
const manifestTools = new Set(pluginManifest.tools ?? []);
const loadSleeveSeed = resolveEnvoySeededToolCapability("umg_envoy_load_sleeve");
const candidateLowRiskDirectSet = new Set([
    "umg_envoy_status",
    "umg_envoy_validate_runtime_output",
    "umg_envoy_parse_path",
    "umg_envoy_validate_path",
    "umg_envoy_render_path",
    "umg_envoy_action_gate_runtime_report_view",
]);
assert("manifest does not advertise umg_envoy_load_sleeve as current public tool", manifestTools.has("umg_envoy_load_sleeve") === false);
assert("registry classification for umg_envoy_load_sleeve remains conservative read_only", loadSleeveSeed?.allowedRiskClass === "read_only");
assert("umg_envoy_load_sleeve is not direct-executable by default", loadSleeveSeed?.directExecutionAllowed === false);
assert("umg_envoy_load_sleeve is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_load_sleeve") === false);
assert("unknown tools remain blocked/null through seed resolver", resolveEnvoySeededToolCapability("unknown.tool") === null);
assert("seed still contains internal-only/conservative load sleeve policy note", (loadSleeveSeed?.notes ?? []).some((note) => note.includes("not declared in openclaw.plugin.json")));
assert("seed still contains all manifest tools even with load sleeve internal-only policy", pluginManifest.tools?.every((toolId) => Boolean(resolveEnvoySeededToolCapability(toolId))) === true);
assert("no low_risk_direct entries are introduced by manifest alignment lane", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.every((entry) => entry.allowedRiskClass !== "low_risk_direct"));
console.log(`=== Tool Manifest Alignment Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
