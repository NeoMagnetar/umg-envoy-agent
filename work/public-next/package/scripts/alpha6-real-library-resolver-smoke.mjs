import plugin from "../dist/plugin-entry-public.js";
import { resolveRealLibraryPublicCurated } from "../dist/real-library-resolver.js";

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

record("real root + public_curated returns ok:true", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(result.ok === true, "expected ok=true");
  return { sleeveCount: result.sleeveCount, trace: result.trace };
});

record("catalog loads", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(result.catalogLoaded === true, "expected catalogLoaded=true");
  return { catalogLoaded: result.catalogLoaded };
});

record("sleeves array is returned", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(Array.isArray(result.sleeves), "expected sleeves array");
  assert(result.sleeves.length >= 1, "expected at least one sleeve");
  return { sleeveCount: result.sleeves.length };
});

record("per-sleeve resolutionStatus exists", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(result.sleeves.every((sleeve) => typeof sleeve.resolutionStatus === "string"), "expected all sleeves to have resolutionStatus");
  return result.sleeves.map((sleeve) => ({ id: sleeve.id, resolutionStatus: sleeve.resolutionStatus }));
});

record("unsafe ../archive entries do not crash the resolver", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(result.ok === true, "expected resolver to survive archive entry presence");
  return { warnings: result.warnings.length };
});

record("unsafe entries are classified, not followed", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  const unsafe = result.sleeves.find((sleeve) => sleeve.sourcePath?.includes("archive"));
  assert(Boolean(unsafe), "expected archive-backed entry");
  assert(unsafe.resolutionStatus === "REJECTED_FORBIDDEN_SOURCE_PATH" || unsafe.resolutionStatus === "NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST", "expected unsafe classification");
  return unsafe;
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

record("Resleever-class paths still reject", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\artifacts\\releases\\umg-envoy-agent-0.1.0\\umg-envoy-agent-plugin\\vendor\\UMG_Envoy_Resleever",
    mode: "public_curated"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_FORBIDDEN_ROOT_PATH" || result.errors[0]?.code === "HOLD_RESLEEVER_CONTAMINATION_RISK", "expected resleever rejection");
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

record("original alpha.5 tools still register and tool count is 17", () => {
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
    "umg_envoy_real_sleeve_list"
  ];
  const names = defs.map((def) => def.name);
  const missing = expected.filter((name) => !names.includes(name));
  assert(missing.length === 0, `missing tools: ${missing.join(", ")}`);
  assert(names.length === 17, `expected 17 tools, got ${names.length}`);
  return { toolCount: names.length, names };
});

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({ ok: failed.length === 0, results }, null, 2));
if (failed.length > 0) {
  process.exit(1);
}
