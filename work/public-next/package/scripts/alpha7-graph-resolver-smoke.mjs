import plugin from "../dist/plugin-entry-public.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const results = [];

function record(name, fn) {
  try {
    const detail = fn();
    results.push({ name, ok: true, detail });
  } catch (error) {
    results.push({ name, ok: false, error: String(error?.stack || error) });
  }
}

const defs = [];
plugin.register({ registerTool(def) { defs.push(def); } }, {});
const names = defs.map((def) => def.name);
const currentSleeveTool = defs.find((def) => def.name === "umg_envoy_current_sleeve_status");

record("package registers existing tools plus current sleeve status", () => {
  const expectedAlpha6 = [
    "umg_envoy_status",
    "umg_envoy_library_status",
    "umg_envoy_library_search",
    "umg_envoy_runtime_spec_dry_run",
    "umg_envoy_runtime_visibility_header",
    "umg_envoy_runtime_molt_map",
    "umg_envoy_runtime_dashboard",
    "umg_envoy_runtime_ir_matrix",
    "umg_envoy_runtime_inspect",
    "umg_envoy_local_readonly_plan",
    "umg_envoy_local_readonly_scan",
    "umg_envoy_alpha_demo",
    "umg_envoy_sleeve_list",
    "umg_envoy_sleeve_inspect",
    "umg_envoy_sleeve_demo",
    "umg_envoy_real_library_status",
    "umg_envoy_real_sleeve_list",
    "umg_envoy_real_sleeve_inspect"
  ];
  const missing = expectedAlpha6.filter((name) => !names.includes(name));
  assert(missing.length === 0, `missing Alpha.6 tools: ${missing.join(", ")}`);
  assert(names.includes("umg_envoy_current_sleeve_status"), "expected umg_envoy_current_sleeve_status");
  assert(names.includes("umg_envoy_sleeve_tree"), "expected umg_envoy_sleeve_tree");
  assert(names.includes("umg_envoy_neostack_inspect"), "expected umg_envoy_neostack_inspect");
  assert(names.includes("umg_envoy_neoblock_inspect"), "expected umg_envoy_neoblock_inspect");
  assert(names.includes("umg_envoy_moltblock_inspect"), "expected umg_envoy_moltblock_inspect");
  assert(names.length === 23, `expected 23 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("current sleeve status returns ok true and readonly boundaries", async () => {
  assert(currentSleeveTool, "current sleeve tool missing");
  const result = await currentSleeveTool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.mode === "public_curated", `expected mode=public_curated, got ${parsed.mode}`);
  assert(parsed.readOnly === true, "expected readOnly=true");
  assert(parsed.execution === "not_performed", `expected execution=not_performed, got ${parsed.execution}`);
  assert(parsed.directSource === "not_enabled", `expected directSource=not_enabled, got ${parsed.directSource}`);
  assert(parsed.activeSleeve && typeof parsed.activeSleeve.sleeveId === "string" && parsed.activeSleeve.sleeveId.length > 0, "expected activeSleeve.sleeveId");
  assert(parsed.graphSummary && typeof parsed.graphSummary.neoblockCount === "number", "expected graphSummary");
  assert(parsed.activationStateSummary && typeof parsed.activationStateSummary.ON === "number", "expected activationStateSummary");
  const lanes = new Map((parsed.excludedLanes ?? []).map((entry) => [entry.lane, entry]));
  assert(lanes.has("archive"), "expected archive excluded lane");
  assert(lanes.has("HUMAN"), "expected HUMAN excluded lane");
  assert(lanes.has("Resleever"), "expected Resleever excluded lane");
  assert(lanes.has("direct_source"), "expected direct_source excluded lane");
  assert(lanes.get("archive").state === "OFF", "expected archive OFF");
  assert(lanes.get("HUMAN").state === "REFERENCE_ONLY", "expected HUMAN REFERENCE_ONLY");
  assert(lanes.get("Resleever").state === "OFF", "expected Resleever OFF");
  assert(lanes.get("direct_source").state === "OFF", "expected direct_source OFF");
  assert(Array.isArray(parsed.currentRoute), "expected currentRoute array");
  assert(parsed.currentRoute.some((entry) => entry.kind === "sleeve" && entry.state === "ON"), "expected ON sleeve route");
  assert(parsed.currentRoute.some((entry) => entry.kind === "neoblock" && entry.id === "primary.sample" && entry.state === "ON"), "expected ON primary.sample route");
  return parsed;
});

record("no recursive execution or forbidden machine loading is reported", async () => {
  const result = await currentSleeveTool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.execution === "not_performed", "expected execution not_performed");
  assert(parsed.directSource === "not_enabled", "expected directSource not_enabled");
  assert(parsed.excludedLanes.some((entry) => entry.lane === "HUMAN" && entry.reason === "not_machine_loaded"), "expected HUMAN not_machine_loaded");
  assert(parsed.excludedLanes.some((entry) => entry.lane === "archive" && entry.reason === "forbidden"), "expected archive forbidden");
  assert(parsed.excludedLanes.some((entry) => entry.lane === "Resleever" && entry.reason === "not_allowed"), "expected Resleever not_allowed");
  return {
    execution: parsed.execution,
    directSource: parsed.directSource,
    excludedLanes: parsed.excludedLanes
  };
});

const settled = await Promise.all(results.map(async (entry) => {
  if (entry.detail && typeof entry.detail?.then === "function") {
    try {
      const detail = await entry.detail;
      return { ...entry, detail };
    } catch (error) {
      return { name: entry.name, ok: false, error: String(error?.stack || error) };
    }
  }
  return entry;
}));

const failed = settled.filter((result) => !result.ok);
console.log(JSON.stringify({ ok: failed.length === 0, results: settled }, null, 2));
if (failed.length > 0) {
  process.exit(1);
}
