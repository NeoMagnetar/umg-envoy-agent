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

record("resolver returns ok:true when catalog exists and parses", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(result.ok === true, "expected ok=true");
  assert(result.catalogLoaded === true, "expected catalogLoaded=true");
  assert(result.sleeveCount >= 1, "expected at least one sleeve");
  return { sleeveCount: result.sleeveCount, trace: result.trace };
});

record("resolver rejects missing root", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\does-not-exist\\UMG-Block-Library",
    mode: "public_curated"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_LIBRARY_ROOT_MISSING", "expected HOLD_LIBRARY_ROOT_MISSING");
  return result.errors[0];
});

record("resolver rejects forbidden path", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\backups",
    mode: "public_curated"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_FORBIDDEN_ROOT_PATH", "expected HOLD_FORBIDDEN_ROOT_PATH");
  return result.errors[0];
});

record("resolver rejects unsupported mode", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
    mode: "direct_source"
  });
  assert(result.ok === false, "expected ok=false");
  assert(result.errors[0]?.code === "HOLD_UNSUPPORTED_MODE", "expected HOLD_UNSUPPORTED_MODE");
  return result.errors[0];
});

record("resolver rejects Resleever path", () => {
  const result = resolveRealLibraryPublicCurated({
    libraryRoot: "C:\\.openclaw\\workspace\\artifacts\\releases\\umg-envoy-agent-0.1.0\\umg-envoy-agent-plugin\\vendor\\UMG_Envoy_Resleever",
    mode: "public_curated"
  });
  assert(result.ok === false, "expected ok=false");
  assert(
    result.errors[0]?.code === "HOLD_FORBIDDEN_ROOT_PATH" || result.errors[0]?.code === "HOLD_RESLEEVER_CONTAMINATION_RISK",
    "expected HOLD_FORBIDDEN_ROOT_PATH or HOLD_RESLEEVER_CONTAMINATION_RISK"
  );
  return result.errors[0];
});

record("existing alpha.5 public tools still register", () => {
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
    "umg_envoy_real_library_status"
  ];
  const names = defs.map((def) => def.name);
  const missing = expected.filter((name) => !names.includes(name));
  assert(missing.length === 0, `missing tools: ${missing.join(", ")}`);
  return { toolCount: names.length, names };
});

const failed = results.filter((result) => !result.ok);
console.log(JSON.stringify({ ok: failed.length === 0, results }, null, 2));
if (failed.length > 0) {
  process.exit(1);
}
