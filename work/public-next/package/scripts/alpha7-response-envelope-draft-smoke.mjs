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
const tool = defs.find((def) => def.name === "umg_envoy_response_envelope_draft");

record("all previous tools still register and response envelope draft is added", () => {
  assert(tool, "response envelope draft tool missing");
  assert(names.length === 26, `expected 26 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

record("default call returns response envelope draft", async () => {
  const result = await tool.execute({});
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.activeStack.activeSleeve === "neomagnetar-dynamic-persona-v1", `expected active sleeve neomagnetar-dynamic-persona-v1, got ${parsed.activeStack?.activeSleeve}`);
  assert(parsed.mode === "public_curated", `expected public_curated, got ${parsed.mode}`);
  assert(parsed.readOnly === true, "expected readOnly=true");
  assert(parsed.execution === "not_performed", "expected execution=not_performed");
  assert(parsed.directSource === "not_enabled", "expected directSource=not_enabled");
  assert(parsed.activeStack, "expected activeStack");
  assert(parsed.envoyIntuition, "expected envoyIntuition");
  assert(!/chain[- ]of[- ]thought|hidden reasoning|step-by-step hidden analysis/i.test(parsed.envoyIntuition.text), "envoyIntuition contains disallowed reasoning markers");
  assert(parsed.moltMap, "expected moltMap");
  assert(typeof parsed.formalResponseContent === "string", "expected formalResponseContent");
  assert(parsed.irMatrix, "expected irMatrix when includeIrMatrix=true");
  assert(parsed.metadata, "expected metadata when includeMetadata=true");
  assert(typeof parsed.nlProjection === "string" && parsed.nlProjection.length > 0, "expected nlProjection string");
  assert(parsed.nlProjection.includes("Active Stack"), "expected Active Stack section");
  assert(parsed.nlProjection.includes("Envoy Intuition"), "expected Envoy Intuition section");
  assert(parsed.nlProjection.includes("Current Context — MOLT Map"), "expected MOLT Map section");
  assert(parsed.nlProjection.includes("Formal Response Content"), "expected Formal Response Content section");
  assert(parsed.nlProjection.includes("Runtime IR Matrix"), "expected Runtime IR Matrix section");
  assert(parsed.nlProjection.includes("Metadata"), "expected Metadata section");
  return parsed;
});

record("IR matrix and metadata can be omitted", async () => {
  const result = await tool.execute({ includeIrMatrix: false, includeMetadata: false });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.ok === true, "expected ok=true");
  assert(parsed.irMatrix === null, "expected irMatrix=null when includeIrMatrix=false");
  assert(parsed.metadata === null, "expected metadata=null when includeMetadata=false");
  return parsed;
});

record("custom MOLT fields and formal response content are reflected", async () => {
  const result = await tool.execute({
    directive: "inspect_runtime_visibility",
    instruction: "show_response_envelope",
    subject: "UMG Envoy Agent",
    primary: "response envelope draft",
    philosophy: "visibility before execution",
    blueprint: "active stack → MOLT map → IR matrix → response payload",
    formalResponseContent: "custom formal response"
  });
  const parsed = JSON.parse(result.content[0].text);
  assert(parsed.moltMap.Directive === "inspect_runtime_visibility", "expected custom Directive");
  assert(parsed.moltMap.Instruction === "show_response_envelope", "expected custom Instruction");
  assert(parsed.formalResponseContent === "custom formal response", "expected custom formalResponseContent");
  assert(parsed.nlProjection.includes("Directive: inspect_runtime_visibility"), "expected custom directive in nlProjection");
  assert(parsed.nlProjection.includes("custom formal response"), "expected custom formal response in nlProjection");
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

record("readonly boundaries remain intact", async () => {
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
