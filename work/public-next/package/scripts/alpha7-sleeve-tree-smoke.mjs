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
const sleeveTreeTool = defs.find((def) => def.name === "umg_envoy_sleeve_tree");
const neostackTool = defs.find((def) => def.name === "umg_envoy_neostack_inspect");

record("all previous tools still register and sleeve tree tool is added", () => {
  assert(currentSleeveTool, "current sleeve status tool missing");
  assert(sleeveTreeTool, "sleeve tree tool missing");
  assert(neostackTool, "neostack inspector tool missing");
  assert(names.includes("umg_envoy_neoblock_inspect"), "expected neoblock inspector tool present");
  assert(names.includes("umg_envoy_moltblock_inspect"), "expected moltblock inspector tool present");
  assert(names.includes("umg_envoy_runtime_ir_path"), "expected runtime ir path tool present");
  assert(names.includes("umg_envoy_runtime_ir_matrix_full"), "expected runtime ir matrix full tool present");
  assert(names.length === 25, `expected 25 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("default sleeve tree returns honest fallback tree", async () => {
  const result = await sleeveTreeTool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.mode === "public_curated", `expected mode=public_curated, got ${parsed.mode}`);
  assert(parsed.readOnly === true, "expected readOnly=true");
  assert(parsed.execution === "not_performed", `expected execution=not_performed, got ${parsed.execution}`);
  assert(parsed.directSource === "not_enabled", `expected directSource=not_enabled, got ${parsed.directSource}`);
  assert(parsed.requested.depth === 2, `expected default depth=2, got ${parsed.requested.depth}`);
  assert(parsed.requested.sleeveId === "neomagnetar-dynamic-persona-v1", `expected current sleeve id, got ${parsed.requested.sleeveId}`);
  assert(parsed.tree.kind === "sleeve", `expected root kind=sleeve, got ${parsed.tree.kind}`);
  assert(parsed.tree.state === "ON", `expected root state=ON, got ${parsed.tree.state}`);
  assert(parsed.tree.childrenMode === "EXPLICIT_NEOBLOCK_REFS_FALLBACK", `expected fallback childrenMode, got ${parsed.tree.childrenMode}`);
  assert(parsed.notes.some((note) => note.code === "NO_DECLARED_NEOSTACKS"), "expected NO_DECLARED_NEOSTACKS note");
  assert(parsed.summary.declaredNeoStackCount === 0, `expected declaredNeoStackCount=0, got ${parsed.summary.declaredNeoStackCount}`);
  assert(parsed.summary.explicitNeoBlockRefCount === 7, `expected explicitNeoBlockRefCount=7, got ${parsed.summary.explicitNeoBlockRefCount}`);
  assert(parsed.summary.displayedNeoBlockCount === 7, `expected displayedNeoBlockCount=7, got ${parsed.summary.displayedNeoBlockCount}`);
  assert(parsed.summary.loadedTargetCount === 1, `expected loadedTargetCount=1, got ${parsed.summary.loadedTargetCount}`);
  assert(parsed.tree.children.length === 7, `expected 7 visible neoblock children, got ${parsed.tree.children.length}`);
  assert(parsed.tree.children.some((child) => child.id === "primary.sample" && child.state === "ON"), "expected primary.sample ON");
  assert(parsed.tree.children.filter((child) => child.state === "DORMANT").length === 6, "expected six DORMANT explicit refs");
  return parsed;
});

record("depth 1 returns sleeve-only tree", async () => {
  const result = await sleeveTreeTool.execute({ depth: 1 });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.summary.depthApplied === 1, `expected depthApplied=1, got ${parsed.summary.depthApplied}`);
  assert(Array.isArray(parsed.tree.children) && parsed.tree.children.length === 0, `expected no children at depth 1, got ${parsed.tree.children.length}`);
  return parsed;
});

record("depth 4 shows only shallow-visible MOLT and does not recursively load all targets", async () => {
  const result = await sleeveTreeTool.execute({ depth: 4 });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.summary.depthApplied === 4, `expected depthApplied=4, got ${parsed.summary.depthApplied}`);
  assert(parsed.summary.displayedNeoBlockCount === 7, `expected displayedNeoBlockCount=7, got ${parsed.summary.displayedNeoBlockCount}`);
  assert(parsed.summary.displayedMoltBlockCount === 1, `expected displayedMoltBlockCount=1, got ${parsed.summary.displayedMoltBlockCount}`);
  const primary = parsed.tree.children.find((child) => child.id === "primary.sample");
  assert(primary, "expected primary.sample child");
  assert(Array.isArray(primary.children) && primary.children.length === 1, `expected one shallow-visible MOLT child, got ${primary.children?.length}`);
  assert(primary.children[0].kind === "moltblock", `expected moltblock child, got ${primary.children[0].kind}`);
  assert(primary.children[0].state === "ON", `expected MOLT child ON, got ${primary.children[0].state}`);
  const nonPrimaryWithChildren = parsed.tree.children.filter((child) => child.id !== "primary.sample" && Array.isArray(child.children) && child.children.length > 0);
  assert(nonPrimaryWithChildren.length === 0, "expected no recursive loading for non-primary targets");
  return parsed;
});

record("forbidden lanes remain non-machine-loaded and execution remains off", async () => {
  const result = await currentSleeveTool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.execution === "not_performed", "expected execution not_performed");
  assert(parsed.directSource === "not_enabled", "expected directSource not_enabled");
  assert(parsed.excludedLanes.some((entry) => entry.lane === "archive" && entry.reason === "forbidden"), "expected archive forbidden");
  assert(parsed.excludedLanes.some((entry) => entry.lane === "HUMAN" && entry.reason === "not_machine_loaded"), "expected HUMAN not_machine_loaded");
  assert(parsed.excludedLanes.some((entry) => entry.lane === "Resleever" && entry.reason === "not_allowed"), "expected Resleever not_allowed");
  return parsed.excludedLanes;
});

record("invalid depth 0 returns HOLD_INVALID_TREE_DEPTH", async () => {
  let failed = false;
  try {
    await sleeveTreeTool.execute({ depth: 0 });
  } catch (error) {
    failed = true;
    assert(String(error).includes("HOLD_INVALID_TREE_DEPTH"), `expected HOLD_INVALID_TREE_DEPTH, got ${error}`);
  }
  assert(failed, "expected tool to reject depth 0");
  return { ok: true };
});

record("invalid depth 5 returns HOLD_INVALID_TREE_DEPTH", async () => {
  let failed = false;
  try {
    await sleeveTreeTool.execute({ depth: 5 });
  } catch (error) {
    failed = true;
    assert(String(error).includes("HOLD_INVALID_TREE_DEPTH"), `expected HOLD_INVALID_TREE_DEPTH, got ${error}`);
  }
  assert(failed, "expected tool to reject depth 5");
  return { ok: true };
});

record("unknown sleeve id returns HOLD_SLEEVE_NOT_FOUND", async () => {
  let failed = false;
  try {
    await sleeveTreeTool.execute({ sleeveId: "does-not-exist" });
  } catch (error) {
    failed = true;
    assert(String(error).includes("HOLD_SLEEVE_NOT_FOUND"), `expected HOLD_SLEEVE_NOT_FOUND, got ${error}`);
  }
  assert(failed, "expected tool to reject unknown sleeve");
  return { ok: true };
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
