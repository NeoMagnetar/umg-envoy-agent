import plugin from "../dist/plugin-entry-public.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
const tool = defs.find((def) => def.name === "umg_envoy_runtime_ir_matrix_full");

record("all previous tools still register and runtime ir matrix full is added", () => {
  assert(tool, "runtime ir matrix full tool missing");
  assert(names.includes("umg_envoy_response_envelope_draft"), "expected umg_envoy_response_envelope_draft");
  assert(names.length === 26, `expected 26 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("default call returns runtime IR matrix", async () => {
  const result = await tool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.activeSleeve.sleeveId === "neomagnetar-dynamic-persona-v1", `expected active sleeve neomagnetar-dynamic-persona-v1, got ${parsed.activeSleeve?.sleeveId}`);
  assert(parsed.mode === "public_curated", `expected public_curated, got ${parsed.mode}`);
  assert(parsed.readOnly === true, "expected readOnly=true");
  assert(parsed.execution === "not_performed", "expected execution=not_performed");
  assert(parsed.directSource === "not_enabled", "expected directSource=not_enabled");
  assert(Array.isArray(parsed.matrix.nodes), "expected matrix.nodes array");
  assert(Array.isArray(parsed.matrix.edges), "expected matrix.edges array");
  assert(parsed.matrix.stateBuckets && typeof parsed.matrix.stateBuckets === "object", "expected stateBuckets object");
  assert(Array.isArray(parsed.matrix.route), "expected route array");
  assert(parsed.matrix.nodes.some((node) => node.kind === "sleeve" && node.id === "neomagnetar-dynamic-persona-v1"), "expected sleeve node");
  assert(parsed.matrix.nodes.some((node) => node.kind === "neostack_marker" && node.id === "NO_DECLARED_NEOSTACKS"), "expected NO_DECLARED_NEOSTACKS marker");
  assert(parsed.matrix.nodes.some((node) => node.kind === "neoblock" && node.id === "primary.sample"), "expected primary.sample neoblock");
  assert(parsed.matrix.nodes.some((node) => node.kind === "moltblock" && node.id === "primary.sample::Primary"), "expected primary.sample / Primary moltblock");
  assert(parsed.matrix.nodes.some((node) => node.kind === "neoblock" && node.id === "directive.sample"), "expected directive.sample dormant ref");
  assert(parsed.matrix.nodes.some((node) => node.kind === "neoblock" && node.id === "trigger.sample"), "expected trigger.sample dormant ref");
  assert(parsed.matrix.edges.some((edge) => edge.relation === "contains_marker"), "expected contains_marker edge");
  assert(parsed.matrix.edges.some((edge) => edge.relation === "references"), "expected references edge");
  assert(parsed.matrix.edges.some((edge) => edge.relation === "available_ref"), "expected available_ref edge");
  assert(parsed.matrix.edges.some((edge) => edge.relation === "exposes_molt_summary"), "expected exposes_molt_summary edge");
  assert(Array.isArray(parsed.matrix.stateBuckets.ON), "expected stateBuckets.ON");
  assert(Array.isArray(parsed.matrix.stateBuckets.DORMANT), "expected stateBuckets.DORMANT");
  assert(Array.isArray(parsed.matrix.stateBuckets.REFERENCE_ONLY), "expected stateBuckets.REFERENCE_ONLY");
  assert(Array.isArray(parsed.matrix.stateBuckets.OFF), "expected stateBuckets.OFF");
  assert(parsed.matrix.dormantRefs.length === 6, `expected dormant refs=6, got ${parsed.matrix.dormantRefs.length}`);
  const lanes = new Map(parsed.matrix.excludedLanes.map((lane) => [lane.lane, lane]));
  assert(lanes.has("archive"), "expected archive excluded lane");
  assert(lanes.has("HUMAN"), "expected HUMAN excluded lane");
  assert(lanes.has("Resleever"), "expected Resleever excluded lane");
  assert(lanes.has("direct_source"), "expected direct_source excluded lane");
  assert(typeof parsed.nlProjection === "string" && parsed.nlProjection.length > 0, "expected nlProjection string");
  assert(parsed.nlProjection.includes("Runtime IR Matrix"), "expected nlProjection Runtime IR Matrix");
  assert(parsed.nlProjection.includes("Nodes"), "expected nlProjection Nodes");
  assert(parsed.nlProjection.includes("Edges"), "expected nlProjection Edges");
  assert(parsed.nlProjection.includes("Excluded Lanes"), "expected nlProjection Excluded Lanes");
  assert(parsed.nlProjection.includes("Route"), "expected nlProjection Route");
  return parsed;
});

record("unknown sleeve returns HOLD_SLEEVE_NOT_FOUND", async () => {
  let failed = false;
  try {
    await tool.execute({ sleeveId: "does-not-exist" });
  } catch (error) {
    failed = true;
    assert(String(error).includes("HOLD_SLEEVE_NOT_FOUND"), `expected HOLD_SLEEVE_NOT_FOUND, got ${error}`);
  }
  assert(failed, "expected tool to reject unknown sleeve");
  return { ok: true };
});

record("no recursive loading or forbidden machine loading occurs", async () => {
  const result = await tool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.readOnly === true, "expected readOnly=true");
  assert(parsed.execution === "not_performed", "expected execution=not_performed");
  assert(parsed.directSource === "not_enabled", "expected directSource=not_enabled");
  return {
    readOnly: parsed.readOnly,
    execution: parsed.execution,
    directSource: parsed.directSource
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
if (failed.length > 0) process.exit(1);
