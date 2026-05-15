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
const neoblockTool = defs.find((def) => def.name === "umg_envoy_neoblock_inspect");

record("all previous tools still register and neoblock inspector is added", () => {
  assert(neoblockTool, "neoblock inspector tool missing");
  assert(names.includes("umg_envoy_moltblock_inspect"), "expected umg_envoy_moltblock_inspect");
  assert(names.includes("umg_envoy_runtime_ir_path"), "expected umg_envoy_runtime_ir_path");
  assert(names.length === 24, `expected 24 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("missing neoblockId returns HOLD_NEOBLOCK_ID_REQUIRED", async () => {
  const result = await neoblockTool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_NEOBLOCK_ID_REQUIRED", `expected HOLD_NEOBLOCK_ID_REQUIRED, got ${parsed.hold.code}`);
  return parsed;
});

record("primary.sample returns ok with shallow-visible MOLT summary", async () => {
  const result = await neoblockTool.execute({ neoblockId: "primary.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.neoblock.neoblockId === "primary.sample", `expected primary.sample, got ${parsed.neoblock?.neoblockId}`);
  assert(parsed.neoblock.state === "ON", `expected state=ON, got ${parsed.neoblock.state}`);
  assert(parsed.neoblock.resolutionStatus === "SHALLOW_LOADED", `expected SHALLOW_LOADED, got ${parsed.neoblock.resolutionStatus}`);
  assert(parsed.neoblock.moltType === "Primary", `expected moltType=Primary, got ${parsed.neoblock.moltType}`);
  assert(parsed.neoblock.moltTypeSource === "shallow_loaded_target", `expected shallow_loaded_target, got ${parsed.neoblock.moltTypeSource}`);
  assert(Array.isArray(parsed.moltBlocks) && parsed.moltBlocks.length === 1, `expected one shallow-visible MOLT summary, got ${parsed.moltBlocks.length}`);
  assert(parsed.moltBlocks[0].moltType === "Primary", `expected moltBlocks[0].moltType=Primary, got ${parsed.moltBlocks[0].moltType}`);
  assert(parsed.moltBlocks[0].state === "ON", `expected moltBlocks[0].state=ON, got ${parsed.moltBlocks[0].state}`);
  return parsed;
});

record("directive.sample reports target available not loaded", async () => {
  const result = await neoblockTool.execute({ neoblockId: "directive.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.neoblock.neoblockId === "directive.sample", `expected directive.sample, got ${parsed.neoblock?.neoblockId}`);
  assert(parsed.neoblock.state === "DORMANT", `expected state=DORMANT, got ${parsed.neoblock.state}`);
  assert(parsed.neoblock.resolutionStatus === "TARGET_AVAILABLE_NOT_LOADED", `expected TARGET_AVAILABLE_NOT_LOADED, got ${parsed.neoblock.resolutionStatus}`);
  assert(Array.isArray(parsed.moltBlocks) && parsed.moltBlocks.length === 0, `expected no loaded MOLT blocks, got ${parsed.moltBlocks.length}`);
  assert(parsed.notes.some((note) => note.code === "MOLT_BLOCKS_NOT_LOADED"), "expected MOLT_BLOCKS_NOT_LOADED note");
  return parsed;
});

record("trigger.sample reports available-but-not-loaded truthfully", async () => {
  const result = await neoblockTool.execute({ neoblockId: "trigger.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.neoblock.neoblockId === "trigger.sample", `expected trigger.sample, got ${parsed.neoblock?.neoblockId}`);
  assert(["DORMANT", "WATCHING"].includes(parsed.neoblock.state), `expected DORMANT or WATCHING, got ${parsed.neoblock.state}`);
  assert(parsed.neoblock.resolutionStatus === "TARGET_AVAILABLE_NOT_LOADED", `expected TARGET_AVAILABLE_NOT_LOADED, got ${parsed.neoblock.resolutionStatus}`);
  return parsed;
});

record("missing.sample returns HOLD_NEOBLOCK_REF_NOT_FOUND_IN_SLEEVE", async () => {
  const result = await neoblockTool.execute({ neoblockId: "missing.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_NEOBLOCK_REF_NOT_FOUND_IN_SLEEVE", `expected HOLD_NEOBLOCK_REF_NOT_FOUND_IN_SLEEVE, got ${parsed.hold.code}`);
  return parsed;
});

record("unknown sleeve returns HOLD_SLEEVE_NOT_FOUND", async () => {
  const result = await neoblockTool.execute({ sleeveId: "does-not-exist", neoblockId: "primary.sample" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_SLEEVE_NOT_FOUND", `expected HOLD_SLEEVE_NOT_FOUND, got ${parsed.hold.code}`);
  return parsed;
});

record("readonly boundaries remain intact", async () => {
  const result = await neoblockTool.execute({ neoblockId: "primary.sample" });
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
