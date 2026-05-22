# UMG-ENVOY-ALPHA6-IMPLEMENTATION-STEP1-RESULTS.md

## 1. Verdict

**ALPHA6_PUBLIC_CURATED_RESOLVER_SKELETON_READY**

---

## 2. Scope

Implementation Step 1 completed a **real code change** for Alpha.6:
- minimal read-only real-library resolver skeleton
- mode supported: `public_curated`
- no publish
- no package/release step
- no runtime execution of sleeves
- no Resleever activation
- no writes to the real UMG Block Library

---

## 3. Files Changed

### New files
- `C:\.openclaw\workspace\work\public-next\package\src\real-library-resolver.ts`
- `C:\.openclaw\workspace\work\public-next\package\scripts\alpha6-real-library-resolver-smoke.mjs`

### Modified files
- `C:\.openclaw\workspace\work\public-next\package\src\plugin-entry-public.ts`
- `C:\.openclaw\workspace\work\public-next\package\package.json`

---

## 4. Resolver Module Path

Resolver module added at:
- `src/real-library-resolver.ts`

Current exported implementation:
- `resolveRealLibraryPublicCurated(input)`

Input shape supported now:
```json
{
  "libraryRoot": "C:\\.openclaw\\workspace\\UMG-Block-Library",
  "mode": "public_curated"
}
```

---

## 5. What The Resolver Actually Does Right Now

Implemented behavior:
1. normalizes `libraryRoot`
2. checks root existence
3. rejects forbidden path classes at the root level
4. rejects unsupported modes
5. loads `sleeves/manifests/catalog.json`
6. parses JSON safely
7. validates top-level shape enough to require a `sleeves` array
8. returns structured read-only resolver result
9. does **not** resolve full sleeve internals yet
10. does **not** execute anything
11. does **not** write anything

Important Step 1 design choice in final implementation:
- the resolver **loads and reports the curated catalog successfully even when some catalog entries point to paths that are not yet Step-1-loadable**
- those entries are surfaced as warnings instead of hard-failing the whole resolver

That change was necessary because the curated public catalog currently includes source paths such as `../archive/...`, and Step 1 was supposed to load the catalog read-only, not fully resolve every catalog target yet.

---

## 6. New Tool Added Or Not Added

### Added
A new read-only tool was added:
- `umg_envoy_real_library_status`

Behavior:
- calls the new resolver in `public_curated` mode
- returns JSON text
- does not replace the alpha.5 bundled-public tools
- does not change the default bundled-public behavior

CLI bridge also added:
- `umg-envoy real-library-status`

---

## 7. Resolver Result Shape

Current success result shape is effectively:
```json
{
  "ok": true,
  "mode": "public_curated",
  "libraryRoot": "C:\\.openclaw\\workspace\\UMG-Block-Library",
  "entrypoint": "sleeves/manifests/catalog.json",
  "catalogLoaded": true,
  "sleeveCount": 3,
  "sleeves": [
    {
      "id": "slv-operator",
      "name": "SLV.OPERATOR",
      "status": "needs_normalization",
      "source_path": "../SLV.OPERATOR.json",
      "notes": "..."
    }
  ],
  "warnings": [
    "source path not yet loadable in Step 1: sample-basic-minimal",
    "..."
  ],
  "errors": [],
  "trace": {
    "forbiddenPathCheck": "passed",
    "resleeverCheck": "passed",
    "entrypointCheck": "passed",
    "parseCheck": "passed",
    "allowlistCheck": "passed"
  }
}
```

Current failure result shape is:
```json
{
  "ok": false,
  "mode": "public_curated",
  "libraryRoot": "...",
  "entrypoint": "sleeves/manifests/catalog.json",
  "catalogLoaded": false,
  "sleeveCount": 0,
  "sleeves": [],
  "warnings": [],
  "errors": [
    {
      "code": "HOLD_ENTRYPOINT_MISSING",
      "message": "..."
    }
  ],
  "trace": {}
}
```

---

## 8. Required Error Codes Implemented

Implemented codes:
- `HOLD_LIBRARY_ROOT_MISSING`
- `HOLD_FORBIDDEN_ROOT_PATH`
- `HOLD_RESLEEVER_CONTAMINATION_RISK`
- `HOLD_UNSUPPORTED_MODE`
- `HOLD_ENTRYPOINT_MISSING`
- `HOLD_CATALOG_PARSE_FAILED`
- `HOLD_CATALOG_SHAPE_UNKNOWN`
- `HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST`

### Observed in smoke results
Observed during smoke checks:
- `HOLD_LIBRARY_ROOT_MISSING`
- `HOLD_FORBIDDEN_ROOT_PATH`
- `HOLD_UNSUPPORTED_MODE`

Not observed during smoke in the final passing run:
- `HOLD_RESLEEVER_CONTAMINATION_RISK` (the tested Resleever path was caught first by forbidden-path classification)
- `HOLD_ENTRYPOINT_MISSING`
- `HOLD_CATALOG_PARSE_FAILED`
- `HOLD_CATALOG_SHAPE_UNKNOWN`
- `HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST`

---

## 9. Smoke / Check / Build Results

### Command: `npm run check`
Result:
- passed

### Command: `npm run build`
Result:
- passed

### Command: `node scripts/alpha6-real-library-resolver-smoke.mjs`
Result:
- final pass succeeded

### Important implementation issue encountered and fixed
Initial smoke failure:
- the first resolver implementation hard-failed when the curated public catalog contained source paths outside the Step 1 allowlist / inside forbidden path classes
- this prevented successful catalog load even though Step 1 was only meant to load the catalog read-only

Fix applied:
- changed Step 1 behavior so non-Step-1-loadable catalog source paths generate warnings instead of immediate resolver failure
- preserved root-level denylist protection and unsupported-mode protection
- preserved entrypoint existence/parse/shape enforcement

This was a real implementation bug found by smoke and corrected before final result.

---

## 10. Existing Alpha.5 Tool Surface Regression Check

Result:
- existing alpha.5 public tools still register

Registered tools after Step 1:
1. `umg_envoy_status`
2. `umg_envoy_library_status`
3. `umg_envoy_library_search`
4. `umg_envoy_runtime_spec_dry_run`
5. `umg_envoy_runtime_visibility_header`
6. `umg_envoy_runtime_molt_map`
7. `umg_envoy_runtime_dashboard`
8. `umg_envoy_runtime_ir_matrix`
9. `umg_envoy_runtime_inspect`
10. `umg_envoy_local_readonly_plan`
11. `umg_envoy_local_readonly_scan`
12. `umg_envoy_alpha_demo`
13. `umg_envoy_sleeve_list`
14. `umg_envoy_sleeve_inspect`
15. `umg_envoy_sleeve_demo`
16. `umg_envoy_real_library_status`

Conclusion:
- no existing alpha.5 tool surface regression detected in registration

---

## 11. Resolver Result Summary

### Library root used
- `C:\.openclaw\workspace\UMG-Block-Library`

### Mode used
- `public_curated`

### Entrypoint used
- `sleeves/manifests/catalog.json`

### Catalog load status
- loaded successfully

### Sleeve count observed
- `3`

### Interpretation of current Step 1 status
The skeleton now proves:
- plugin code can read from the real UMG Block Library root
- plugin code can load the curated public catalog
- plugin code can return structured readonly results
- plugin code can reject bad roots/modes safely

The skeleton does **not** yet prove:
- full safe resolution of every catalog `source_path`
- full sleeve-object loading from curated entries
- direct-source mode
- runtime execution integration

---

## 12. Step 1 Limits / Non-Goals Still Preserved

Still intentionally not done:
- no publish
- no package output route changes
- no artifact mutation
- no direct-source resolver mode
- no runtime execution
- no child process use inside plugin runtime
- no Resleever loading
- no HUMAN-doc blending into machine resolution
- no full sleeve-internal resolution

---

## 13. Whether Step 2 Can Begin

**Yes.**

Recommended next step:
- Step 2 should resolve only **safe curated catalog targets** under explicit rules
- likely start with entries whose `source_path` resolves within allowed public-curated machine lanes
- define which public-curated catalog entries are loadable now vs warning-only
- keep readonly posture

---

## 14. Final Verdict

**ALPHA6_PUBLIC_CURATED_RESOLVER_SKELETON_READY**
