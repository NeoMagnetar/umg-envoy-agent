import fs from "node:fs";
import { ENVOY_TOOL_CAPABILITY_REGISTRY_SEED, resolveEnvoySeededToolCapability } from "./tool-capability-registry-seed.js";

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

console.log("=== Tool Manifest Alignment Tests ===");

const pluginManifest = JSON.parse(fs.readFileSync(new URL("../openclaw.plugin.json", import.meta.url), "utf8")) as { tools?: string[] };
const manifestTools = new Set(pluginManifest.tools ?? []);
const loadSleeveSeed = resolveEnvoySeededToolCapability("umg_envoy_load_sleeve");
const explainSleeveSeed = resolveEnvoySeededToolCapability("umg_envoy_explain_sleeve");
const cognitiveRegistrySeed = resolveEnvoySeededToolCapability("umg_envoy_cognitive_registry_query");
const planNeoStackSeed = resolveEnvoySeededToolCapability("umg_envoy_plan_neostack");
const composeSleeveSeed = resolveEnvoySeededToolCapability("umg_envoy_compose_sleeve_dry_run");
const validateComposedSleeveSeed = resolveEnvoySeededToolCapability("umg_envoy_validate_composed_sleeve_dry_run");
const candidateLowRiskDirectSet = new Set([
  "umg_envoy_status",
  "umg_envoy_validate_runtime_output",
  "umg_envoy_parse_path",
  "umg_envoy_validate_path",
  "umg_envoy_render_path",
  "umg_envoy_action_gate_runtime_report_view",
]);

assert("manifest advertises umg_envoy_load_sleeve as current public tool", manifestTools.has("umg_envoy_load_sleeve") === true);
assert("manifest advertises umg_envoy_explain_sleeve as current public tool", manifestTools.has("umg_envoy_explain_sleeve") === true);
assert("manifest advertises umg_envoy_cognitive_registry_query as current public tool", manifestTools.has("umg_envoy_cognitive_registry_query") === true);
assert("manifest advertises umg_envoy_plan_neostack as current public tool", manifestTools.has("umg_envoy_plan_neostack") === true);
assert("manifest advertises umg_envoy_compose_sleeve_dry_run as current public tool", manifestTools.has("umg_envoy_compose_sleeve_dry_run") === true);
assert("manifest advertises umg_envoy_validate_composed_sleeve_dry_run as current public tool", manifestTools.has("umg_envoy_validate_composed_sleeve_dry_run") === true);
assert("registry classification for umg_envoy_load_sleeve remains conservative read_only", loadSleeveSeed?.allowedRiskClass === "read_only");
assert("registry classification for umg_envoy_explain_sleeve remains conservative read_only", explainSleeveSeed?.allowedRiskClass === "read_only");
assert("registry classification for umg_envoy_cognitive_registry_query remains conservative read_only", cognitiveRegistrySeed?.allowedRiskClass === "read_only");
assert("registry classification for umg_envoy_plan_neostack remains dry_run_only", planNeoStackSeed?.allowedRiskClass === "dry_run_only");
assert("registry classification for umg_envoy_compose_sleeve_dry_run remains dry_run_only", composeSleeveSeed?.allowedRiskClass === "dry_run_only");
assert("registry classification for umg_envoy_validate_composed_sleeve_dry_run remains dry_run_only", validateComposedSleeveSeed?.allowedRiskClass === "dry_run_only");
assert("umg_envoy_load_sleeve is not direct-executable by default", loadSleeveSeed?.directExecutionAllowed === false);
assert("umg_envoy_explain_sleeve is not direct-executable by default", explainSleeveSeed?.directExecutionAllowed === false);
assert("umg_envoy_cognitive_registry_query is not direct-executable by default", cognitiveRegistrySeed?.directExecutionAllowed === false);
assert("umg_envoy_plan_neostack is not direct-executable by default", planNeoStackSeed?.directExecutionAllowed === false);
assert("umg_envoy_compose_sleeve_dry_run is not direct-executable by default", composeSleeveSeed?.directExecutionAllowed === false);
assert("umg_envoy_validate_composed_sleeve_dry_run is not direct-executable by default", validateComposedSleeveSeed?.directExecutionAllowed === false);
assert("umg_envoy_load_sleeve is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_load_sleeve") === false);
assert("umg_envoy_explain_sleeve is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_explain_sleeve") === false);
assert("umg_envoy_cognitive_registry_query is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_cognitive_registry_query") === false);
assert("umg_envoy_plan_neostack is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_plan_neostack") === false);
assert("umg_envoy_compose_sleeve_dry_run is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_compose_sleeve_dry_run") === false);
assert("umg_envoy_validate_composed_sleeve_dry_run is not in first low-risk direct adapter candidate set", candidateLowRiskDirectSet.has("umg_envoy_validate_composed_sleeve_dry_run") === false);
assert("unknown tools remain blocked/null through seed resolver", resolveEnvoySeededToolCapability("unknown.tool") === null);
assert("seed contains manifest-declared load sleeve policy note", (loadSleeveSeed?.notes ?? []).some((note) => note.includes("manifest-declared")));
assert("all manifest-declared tools except the runtime runner itself are present in the seed", pluginManifest.tools?.filter((toolId) => toolId !== "umg_envoy_low_risk_direct_tool_run").every((toolId) => Boolean(resolveEnvoySeededToolCapability(toolId))) === true);
assert("no low_risk_direct entries are introduced by manifest alignment lane", ENVOY_TOOL_CAPABILITY_REGISTRY_SEED.every((entry) => entry.allowedRiskClass !== "low_risk_direct"));

console.log(`=== Tool Manifest Alignment Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
