import plugin from "../dist/plugin-entry-public.js";
import { inspectRealLibraryPublicCuratedSleeve, resolveRealLibraryPublicCurated } from "../dist/real-library-resolver.js";

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

const curated = resolveRealLibraryPublicCurated({
  libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
  mode: "public_curated"
});

record("real curated catalog still loads", () => {
  assert(curated.ok === true, "expected ok=true");
  assert(curated.catalogLoaded === true, "expected catalogLoaded=true");
  return { sleeveCount: curated.sleeveCount, loadableSleeveCount: curated.loadableSleeveCount };
});

record("sleeve list still returns 3 catalog entries", () => {
  assert(curated.sleeveCount === 3, `expected 3 sleeves, got ${curated.sleeveCount}`);
  return { sleeveCount: curated.sleeveCount };
});

record("loadable count is now at least one for normalized catalog", () => {
  assert(curated.loadableSleeveCount >= 1, `expected at least 1 loadable sleeve for normalized catalog snapshot, got ${curated.loadableSleeveCount}`);
  return { loadableSleeveCount: curated.loadableSleeveCount, sleeves: curated.sleeves.map((sleeve) => ({ id: sleeve.id, resolutionStatus: sleeve.resolutionStatus })) };
});

record("inspect returns non-loadable hold for current slv-operator catalog target", () => {
  const result = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: "slv-operator"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED", "expected HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED");
  return result.errors[0];
});

record("inspect succeeds for one LOADABLE_PUBLIC_CURATED entry", () => {
  const result = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: "neomagnetar-dynamic-persona-v1"
  });
  assert(result.ok === true, "expected ok=true");
  assert(result.loaded === true, "expected loaded=true");
  assert(result.resolutionStatus === "LOADABLE_PUBLIC_CURATED", "expected LOADABLE_PUBLIC_CURATED");
  return { sleeveId: result.sleeveId, resolutionStatus: result.resolutionStatus, summary: result.summary };
});

record("step6 reference classification map reports deterministic classified refs without resolution", () => {
  const result = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: "neomagnetar-dynamic-persona-v1"
  });
  assert(result.ok === true, "expected ok=true");
  const expectedRefs = [
    "primary.sample",
    "directive.sample",
    "instruction.sample",
    "subject.sample",
    "philosophy.sample",
    "blueprint.sample",
    "trigger.sample"
  ];
  const classification = result.summary?.referenceClassification;
  assert(classification?.performed === true, "expected referenceClassification.performed=true");
  assert(classification?.references.length === 7, `expected 7 classified refs, got ${classification?.references.length}`);
  assert(classification?.counts.total === 7, `expected total=7, got ${classification?.counts.total}`);
  assert(classification?.counts.neoblock === 7, `expected neoblock=7, got ${classification?.counts.neoblock}`);
  assert(classification?.counts.unknown === 0, `expected unknown=0, got ${classification?.counts.unknown}`);
  assert(classification?.counts.malformed === 0, `expected malformed=0, got ${classification?.counts.malformed}`);
  assert(classification?.counts.duplicate === 0, `expected duplicate=0, got ${classification?.counts.duplicate}`);
  for (const ref of expectedRefs) {
    const matches = classification?.references.filter((entry) => entry.rawRef === ref) ?? [];
    assert(matches.length === 1, `expected exactly one classified entry for ${ref}, got ${matches.length}`);
    assert(matches[0].resolutionStatus === "CLASSIFIED_NOT_RESOLVED_STEP6", `expected CLASSIFIED_NOT_RESOLVED_STEP6 for ${ref}`);
  }
  assert(result.trace.recursiveResolution === "not_performed_step6", "expected recursiveResolution=not_performed_step6");
  assert(result.trace.targetFileLoads === "not_performed", "expected targetFileLoads=not_performed");
  assert(result.trace.execution === "not_performed", "expected execution=not_performed");
  return {
    sleeveId: result.sleeveId,
    referenceCounts: result.summary?.referenceCounts,
    referenceClassification: classification,
    trace: result.trace
  };
});

record("inspect rejects REJECTED_FORBIDDEN_SOURCE_PATH entry", () => {
  const result = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: "sample-basic-minimal"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN", "expected HOLD_SLEEVE_SOURCE_PATH_FORBIDDEN");
  return result.errors[0];
});

record("inspect rejects NO_SOURCE_PATH or missing source path entry if present", () => {
  const noSource = curated.sleeves.find((sleeve) => sleeve.resolutionStatus === "NO_SOURCE_PATH");
  if (!noSource?.id) {
    return { skipped: true, reason: "no NO_SOURCE_PATH entry in current catalog" };
  }
  const result = inspectRealLibraryPublicCuratedSleeve({ sleeveId: noSource.id });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED", "expected HOLD_SLEEVE_NOT_LOADABLE_PUBLIC_CURATED");
  return result.errors[0];
});

record("inspect rejects unknown sleeveId", () => {
  const result = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: "does-not-exist"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_SLEEVE_NOT_FOUND", "expected HOLD_SLEEVE_NOT_FOUND");
  return result.errors[0];
});

record("inspect does not recursively resolve full graph", () => {
  const result = inspectRealLibraryPublicCuratedSleeve({
    sleeveId: "slv-operator"
  });
  assert(result.trace.recursiveResolution === "not_performed_step6", "expected recursiveResolution=not_performed_step6");
  assert(result.trace.targetFileLoads === "not_performed", "expected targetFileLoads=not_performed");
  assert(result.trace.execution === "not_performed", "expected execution=not_performed");
  return result.trace;
});

record("forbidden paths still reject", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\backups",
    mode: "public_curated"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_FORBIDDEN_ROOT_PATH", "expected HOLD_FORBIDDEN_ROOT_PATH");
  return result.errors[0];
});

record("unsupported mode still rejects", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "direct_source"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_UNSUPPORTED_MODE", "expected HOLD_UNSUPPORTED_MODE");
  return result.errors[0];
});

record("original alpha.5 tools still register and tool count is 18", () => {
  const defs = [];
  plugin.register({ registerTool(def) { defs.push(def); } }, {});
  const expected = [
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
  const names = defs.map((def) => def.name);
  const missing = expected.filter((name) => !names.includes(name));
  assert(missing.length === 0, `missing tools: ${missing.join(", ")}`);
  assert(names.length === 18, `expected 18 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({ ok: failed.length === 0, results }, null, 2));
if (failed.length > 0) {
  process.exit(1);
}
