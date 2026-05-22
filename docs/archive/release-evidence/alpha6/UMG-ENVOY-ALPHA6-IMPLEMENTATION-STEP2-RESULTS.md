# UMG-ENVOY-ALPHA6-IMPLEMENTATION-STEP2-RESULTS.md

## 1. Verdict

**ALPHA6_PUBLIC_CURATED_SLEEVE_LIST_READY**

---

## 2. Scope

Implementation Step 2 expanded the existing Alpha.6 `public_curated` resolver so it can:
- load the curated public sleeve catalog
- keep root/entrypoint/parse protections from Step 1
- classify each sleeve entry safely
- return richer per-sleeve summaries
- avoid following unsafe source paths
- avoid crashing on `../archive/...` catalog entries

No publish was performed.
No direct-source mode was implemented.
No runtime sleeve execution was performed.

---

## 3. Files Changed

### Modified files
- `C:\.openclaw\workspace\work\public-next\package\src\real-library-resolver.ts`
- `C:\.openclaw\workspace\work\public-next\package\src\plugin-entry-public.ts`
- `C:\.openclaw\workspace\work\public-next\package\scripts\alpha6-real-library-resolver-smoke.mjs`

### Built outputs updated
- `C:\.openclaw\workspace\work\public-next\package\dist\real-library-resolver.js`
- `C:\.openclaw\workspace\work\public-next\package\dist\real-library-resolver.d.ts`
- `C:\.openclaw\workspace\work\public-next\package\dist\plugin-entry-public.js`
- `C:\.openclaw\workspace\work\public-next\package\dist\plugin-entry-public.d.ts`

### New report file
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-IMPLEMENTATION-STEP2-RESULTS.md`

---

## 4. Whether `umg_envoy_real_sleeve_list` Was Added

**Yes.**

New Step 2 tool added:
- `umg_envoy_real_sleeve_list`

Behavior:
- calls the `public_curated` resolver
- returns safe sleeve summaries only
- does not inspect deep sleeve internals
- does not execute anything
- does not replace existing alpha.5 tools

CLI helper added as well:
- `umg-envoy real-sleeve-list`

---

## 5. Final Tool Count

Final registered tool count after Step 2:
- `17`

Composition:
- original alpha.5 tools: `15`
- Step 1 tool: `umg_envoy_real_library_status`
- Step 2 tool: `umg_envoy_real_sleeve_list`

Smoke confirmed all expected tools still register.

---

## 6. What Changed In The Resolver

### Step 1 behavior preserved
Preserved from Step 1:
- root normalization
- root existence check
- forbidden-root rejection
- Resleever-class root rejection
- unsupported-mode rejection
- curated catalog entrypoint loading
- safe JSON parse
- top-level catalog shape enforcement

### Step 2 added behavior
For each catalog sleeve entry, the resolver now extracts:
- `id`
- `name`
- `title` (falls back to name when title absent)
- `status`
- `sourcePath`
- `resolvedSourcePath`
- per-sleeve `resolutionStatus`
- per-sleeve warnings/errors

### Per-sleeve resolution statuses implemented
- `LOADABLE_PUBLIC_CURATED`
- `NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST`
- `REJECTED_FORBIDDEN_SOURCE_PATH`
- `NO_SOURCE_PATH`
- `SOURCE_PATH_MISSING_ON_DISK`
- `SOURCE_PATH_SHAPE_UNKNOWN`

### Top-level result counters added
- `loadableSleeveCount`
- `rejectedSleeveCount`
- `unloadableSleeveCount`

### Trace shape extended
Trace now includes:
- `forbiddenPathCheck`
- `resleeverCheck`
- `entrypointCheck`
- `parseCheck`
- `catalogShapeCheck`
- `allowlistCheck`
- `sourcePathPolicy: public_curated_allowlist_only`

---

## 7. Catalog Sleeve Count

Observed curated catalog sleeve count:
- `3`

These entries came from the current curated public catalog:
- `slv-operator`
- `sample-basic-minimal`
- `neomagnetar-dynamic-persona-v1`

---

## 8. Loadable / Rejected / Unloadable Counts

Observed from final Step 2 resolver run:
- `sleeveCount`: `3`
- `loadableSleeveCount`: `1`
- `rejectedSleeveCount`: `1`
- `unloadableSleeveCount`: `1`

Interpretation:
- at least one curated entry resolves inside the explicit `sleeves/` allowlist and is considered loadable
- one curated entry was explicitly rejected as forbidden because it resolves into `archive`
- one curated entry resolved outside the Step 2 public-curated allowlist and was classified as not loadable under current policy

---

## 9. Example Sleeve Summaries

### Example: loadable public-curated entry
Representative shape:
```json
{
  "id": "slv-operator",
  "name": "SLV.OPERATOR",
  "title": "SLV.OPERATOR",
  "status": "needs_normalization",
  "sourcePath": "../SLV.OPERATOR.json",
  "resolvedSourcePath": "C:\\.openclaw\\workspace\\UMG-Block-Library\\sleeves\\SLV.OPERATOR.json",
  "resolutionStatus": "LOADABLE_PUBLIC_CURATED",
  "warnings": [],
  "errors": []
}
```

### Example: forbidden archive-backed entry
Representative shape:
```json
{
  "id": "sample-basic-minimal",
  "name": "Sample Basic Minimal",
  "status": "promoted_reference",
  "sourcePath": "../archive/sample-basic_minimal.json",
  "resolvedSourcePath": "C:\\.openclaw\\workspace\\UMG-Block-Library\\sleeves\\archive\\sample-basic_minimal.json",
  "resolutionStatus": "REJECTED_FORBIDDEN_SOURCE_PATH",
  "warnings": [
    "forbidden source path rejected: ../archive/sample-basic_minimal.json"
  ],
  "errors": []
}
```

### Example: outside-allowlist entry
Representative interpretation:
- resolves outside explicit `C:\.openclaw\workspace\UMG-Block-Library\sleeves\` allowlist
- classified as:
  - `NOT_LOADABLE_OUTSIDE_PUBLIC_CURATED_ALLOWLIST`

---

## 10. Unsafe `source_path` Handling Result

This was the most important Step 2 behavior target.

### Required behavior
When the curated catalog contains unsafe references like `../archive/...`, the resolver must:
- not crash
- not follow unsafe path as loadable public-curated content
- classify it clearly
- keep processing the rest of the catalog

### Final result
Achieved.

Observed unsafe path handling:
- archive-backed curated entry was detected
- normalized path was computed
- path was classified as forbidden
- entry received `REJECTED_FORBIDDEN_SOURCE_PATH`
- resolver still returned `ok: true`
- other entries were still processed

This is the intended Step 2 behavior.

---

## 11. Required Smoke Results

### Command: `npm run check`
Result:
- passed

### Command: `npm run build`
Result:
- passed

### Command: `node scripts/alpha6-real-library-resolver-smoke.mjs`
Result:
- passed

### Smoke assertions covered
1. real root + `public_curated` returns `ok:true`
2. catalog loads
3. sleeves array is returned
4. per-sleeve `resolutionStatus` exists
5. unsafe `../archive` entries do not crash resolver
6. unsafe entries are classified, not followed
7. forbidden paths still reject
8. Resleever-class paths still reject
9. unsupported mode still rejects
10. original alpha.5 tools still register
11. tool count is `17`

---

## 12. Whether Existing Alpha.5 Tools Still Register

**Yes.**

No regression detected in the original alpha.5 public tool surface.

Still registered:
- `umg_envoy_status`
- `umg_envoy_library_status`
- `umg_envoy_library_search`
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_runtime_visibility_header`
- `umg_envoy_runtime_molt_map`
- `umg_envoy_runtime_dashboard`
- `umg_envoy_runtime_ir_matrix`
- `umg_envoy_runtime_inspect`
- `umg_envoy_local_readonly_plan`
- `umg_envoy_local_readonly_scan`
- `umg_envoy_alpha_demo`
- `umg_envoy_sleeve_list`
- `umg_envoy_sleeve_inspect`
- `umg_envoy_sleeve_demo`

Plus new real-library tools:
- `umg_envoy_real_library_status`
- `umg_envoy_real_sleeve_list`

---

## 13. Hold / Error Codes Status

Top-level error/hold codes present in implementation:
- `HOLD_LIBRARY_ROOT_MISSING`
- `HOLD_FORBIDDEN_ROOT_PATH`
- `HOLD_RESLEEVER_CONTAMINATION_RISK`
- `HOLD_UNSUPPORTED_MODE`
- `HOLD_ENTRYPOINT_MISSING`
- `HOLD_CATALOG_PARSE_FAILED`
- `HOLD_CATALOG_SHAPE_UNKNOWN`
- `HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST`
- `HOLD_SOURCE_PATH_POLICY_REGRESSION`
- `HOLD_EXISTING_TOOL_SURFACE_REGRESSION`

Observed in smoke:
- `HOLD_FORBIDDEN_ROOT_PATH`
- `HOLD_UNSUPPORTED_MODE`

Not triggered in this passing run:
- `HOLD_ENTRYPOINT_MISSING`
- `HOLD_CATALOG_PARSE_FAILED`
- `HOLD_CATALOG_SHAPE_UNKNOWN`
- `HOLD_SOURCE_PATH_POLICY_REGRESSION`
- `HOLD_EXISTING_TOOL_SURFACE_REGRESSION`

Note:
- `HOLD_SOURCE_PATH_OUTSIDE_ALLOWLIST` remains defined but Step 2 intentionally treats per-entry outside-allowlist conditions as classification outcomes rather than hard-failing the whole catalog.

---

## 14. Whether Step 3 Can Begin

**Yes.**

Recommended Step 3 focus:
- safely read only `LOADABLE_PUBLIC_CURATED` sleeve targets
- keep strict allowlist enforcement under `sleeves/`
- return shallow structured sleeve-object summaries when the file shape is safe and known
- continue refusing archive/backup/Resleever and outside-allowlist targets
- remain readonly and non-executing

---

## 15. Final Verdict

**ALPHA6_PUBLIC_CURATED_SLEEVE_LIST_READY**
