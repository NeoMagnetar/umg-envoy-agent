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
const neostackTool = defs.find((def) => def.name === "umg_envoy_neostack_inspect");

record("all previous tools still register and neostack inspector is added", () => {
  assert(neostackTool, "neostack inspector tool missing");
  assert(names.includes("umg_envoy_neoblock_inspect"), "expected umg_envoy_neoblock_inspect");
  assert(names.includes("umg_envoy_moltblock_inspect"), "expected umg_envoy_moltblock_inspect");
  assert(names.includes("umg_envoy_runtime_ir_path"), "expected umg_envoy_runtime_ir_path");
  assert(names.length === 24, `expected 24 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("calling without neostackId returns HOLD_NEOSTACK_ID_REQUIRED", async () => {
  const result = await neostackTool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.requested.sleeveId === "neomagnetar-dynamic-persona-v1", `expected default sleeve, got ${parsed.requested.sleeveId}`);
  assert(parsed.hold.code === "HOLD_NEOSTACK_ID_REQUIRED", `expected HOLD_NEOSTACK_ID_REQUIRED, got ${parsed.hold.code}`);
  assert(parsed.readOnly === true, "expected readOnly=true");
  assert(parsed.execution === "not_performed", "expected execution=not_performed");
  assert(parsed.directSource === "not_enabled", "expected directSource=not_enabled");
  return parsed;
});

record("current sleeve returns HOLD_NO_DECLARED_NEOSTACKS_FOR_SLEEVE honestly", async () => {
  const result = await neostackTool.execute({ neostackId: "persona.runtime.core" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_NO_DECLARED_NEOSTACKS_FOR_SLEEVE", `expected HOLD_NO_DECLARED_NEOSTACKS_FOR_SLEEVE, got ${parsed.hold.code}`);
  assert(parsed.sleeveSummary.declaredNeoStackCount === 0, `expected declaredNeoStackCount=0, got ${parsed.sleeveSummary.declaredNeoStackCount}`);
  assert(parsed.sleeveSummary.explicitNeoBlockRefCount === 7, `expected explicitNeoBlockRefCount=7, got ${parsed.sleeveSummary.explicitNeoBlockRefCount}`);
  assert(parsed.sleeveSummary.childrenMode === "EXPLICIT_NEOBLOCK_REFS_FALLBACK", `expected childrenMode=EXPLICIT_NEOBLOCK_REFS_FALLBACK, got ${parsed.sleeveSummary.childrenMode}`);
  assert(parsed.fallback.kind === "explicit_neoblock_refs", `expected explicit fallback kind, got ${parsed.fallback.kind}`);
  assert(parsed.fallback.available === true, "expected fallback available=true");
  assert(parsed.fallback.refs.includes("primary.sample"), "expected primary.sample fallback ref");
  assert(parsed.fallback.refs.includes("trigger.sample"), "expected trigger.sample fallback ref");
  assert(parsed.neostack === null, "expected neostack=null when no declared neostacks exist");
  return parsed;
});

record("unknown sleeve returns HOLD_SLEEVE_NOT_FOUND", async () => {
  const result = await neostackTool.execute({ sleeveId: "does-not-exist", neostackId: "persona.runtime.core" });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === false, "expected ok=false");
  assert(parsed.hold.code === "HOLD_SLEEVE_NOT_FOUND", `expected HOLD_SLEEVE_NOT_FOUND, got ${parsed.hold.code}`);
  return parsed;
});

record("no forbidden machine loading or execution occurs", async () => {
  const result = await neostackTool.execute({ neostackId: "persona.runtime.core" });
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
