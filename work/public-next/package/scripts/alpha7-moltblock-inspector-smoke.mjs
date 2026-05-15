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
const tool = defs.find((def) => def.name === "umg_envoy_moltblock_inspect");

record("all previous tools still register and moltblock inspector is added", () => {
  assert(tool, "moltblock inspector tool missing");
  assert(names.length === 23, `expected 23 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("missing moltBlockId returns HOLD_MOLTBLOCK_ID_REQUIRED", async () => {
  const result = await tool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_MOLTBLOCK_ID_REQUIRED", `expected HOLD_MOLTBLOCK_ID_REQUIRED, got ${parsed.hold.code}`);
  return parsed;
});

record("primary.sample returns visible loaded MOLT block", async () => {
  const result = await tool.execute({ moltBlockId: "primary.sample", neoblockId: "primary.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.parentNeoBlock.neoblockId === "primary.sample", `expected parent neo block primary.sample, got ${parsed.parentNeoBlock?.neoblockId}`);
  assert(parsed.parentNeoBlock.resolutionStatus === "SHALLOW_LOADED", `expected SHALLOW_LOADED, got ${parsed.parentNeoBlock?.resolutionStatus}`);
  assert(parsed.moltBlock.moltBlockId === "primary.sample", `expected primary.sample MOLT id, got ${parsed.moltBlock?.moltBlockId}`);
  assert(parsed.moltBlock.moltType === "Primary", `expected Primary, got ${parsed.moltBlock?.moltType}`);
  assert(parsed.moltBlock.moltTypeSource === "shallow_loaded_target", `expected shallow_loaded_target, got ${parsed.moltBlock?.moltTypeSource}`);
  assert(parsed.moltBlock.state === "ON", `expected ON, got ${parsed.moltBlock?.state}`);
  assert(parsed.moltBlock.source === "shallow_loaded_target", `expected shallow_loaded_target source, got ${parsed.moltBlock?.source}`);
  return parsed;
});

record("directive.sample with parent context returns HOLD_NEOBLOCK_TARGET_AVAILABLE_NOT_LOADED", async () => {
  const result = await tool.execute({ moltBlockId: "directive.sample", neoblockId: "directive.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_NEOBLOCK_TARGET_AVAILABLE_NOT_LOADED", `expected HOLD_NEOBLOCK_TARGET_AVAILABLE_NOT_LOADED, got ${parsed.hold.code}`);
  assert(parsed.parentNeoBlock.neoblockId === "directive.sample", `expected parent directive.sample, got ${parsed.parentNeoBlock?.neoblockId}`);
  assert(parsed.parentNeoBlock.resolutionStatus === "TARGET_AVAILABLE_NOT_LOADED", `expected TARGET_AVAILABLE_NOT_LOADED, got ${parsed.parentNeoBlock?.resolutionStatus}`);
  return parsed;
});

record("directive.sample without parent context returns HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH", async () => {
  const result = await tool.execute({ moltBlockId: "directive.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH", `expected HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH, got ${parsed.hold.code}`);
  return parsed;
});

record("missing.sample returns HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH", async () => {
  const result = await tool.execute({ moltBlockId: "missing.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH", `expected HOLD_MOLTBLOCK_NOT_FOUND_IN_VISIBLE_GRAPH, got ${parsed.hold.code}`);
  return parsed;
});

record("unknown sleeve returns HOLD_SLEEVE_NOT_FOUND", async () => {
  const result = await tool.execute({ sleeveId: "does-not-exist", moltBlockId: "primary.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_SLEEVE_NOT_FOUND", `expected HOLD_SLEEVE_NOT_FOUND, got ${parsed.hold.code}`);
  return parsed;
});

record("readonly boundaries remain intact", async () => {
  const result = await tool.execute({ moltBlockId: "primary.sample", neoblockId: "primary.sample" });
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
if (failed.length > 0) {
  process.exit(1);
}
