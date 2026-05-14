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
  assert(result.trace.recursiveResolution === "not_performed_step3", "expected recursiveResolution=not_performed_step3");
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
