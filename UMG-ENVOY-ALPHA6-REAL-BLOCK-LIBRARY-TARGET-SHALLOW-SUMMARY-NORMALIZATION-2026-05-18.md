# UMG Envoy Alpha6 — Real Block Library Target Shallow Summary Normalization

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SUMMARY_NORMALIZATION_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SINGLE_LIVE_READY`

Previous commit:
- `c686d10`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`
- current live tools:
 - `umg_envoy_block_library_status`
 - `umg_envoy_block_library_manifest_index`
 - `umg_envoy_block_library_manifest_entry_lookup`
 - `umg_envoy_block_library_target_shallow_load_gate`
 - `umg_envoy_block_library_target_shallow_load_single`

## Scope

This step added normalized shallow target summaries.

This step added:
- `umg_envoy_block_library_target_shallow_summary_normalize`
- stable normalized summary schema
- artifact kind classification
- artifact id extraction
- MOLT type extraction
- identity summary
- metadata summary
- content summary
- provenance summary
- reference count summary
- bounded content preview
- shallow summary normalization smoke

This step did not:
- recursively load the full library
- load referenced targets
- execute anything
- enable direct_source
- load HUMAN as machine source
- load archive lanes
- load Resleever lanes
- modify UMG-Block-Library
- publish
- package
- use stale plugin-entry-public runtime truth

## New Tool

- `umg_envoy_block_library_target_shallow_summary_normalize`

## Confirmed Normalized Summaries

Confirmed:
- `primary.sample`
 - `artifactKind = neoblock`
 - `artifactId = primary.sample`
 - `moltType = Primary`
 - `summaryStatus = NORMALIZED`
- `directive.sample`
 - `moltType = Directive`
- `trigger.sample`
 - `moltType = Trigger`

Confirmed:
- `payloadLoaded = true`
- `recursiveLoad = false`
- `loadStatus = shallow_loaded`
- `parseStatus = PARSED_JSON`
- content preview is bounded
- reference summary is counted but not resolved
- `resolvedRefs = 0`
- `loadedRefs = 0`

## Denied / Hold Cases

Confirmed:
- `archive/sample-basic_minimal.json` → `HOLD_TARGET_FORBIDDEN`
- `SLV.OPERATOR.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- unsupported summary profile → `HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED`
- raw target dump → `HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED`

## Verification

Passed:
- `openclaw plugins info umg-envoy-agent`
- `openclaw doctor --non-interactive`
- `openclaw health --json`
- `npm run check`
- `npm run build`
- `node scripts/alpha6-path-valid-smoke.mjs`
- `node scripts/alpha6-path-invalid-smoke.mjs`
- `node scripts/alpha6-real-block-library-resolver-smoke.mjs`
- `node scripts/alpha6-real-block-library-manifest-index-smoke.mjs`
- `node scripts/alpha6-real-block-library-manifest-entry-lookup-smoke.mjs`
- `node scripts/alpha6-real-block-library-target-shallow-load-gate-smoke.mjs`
- `node scripts/alpha6-real-block-library-target-shallow-load-single-smoke.mjs`
- `node scripts/alpha6-real-block-library-target-shallow-summary-normalization-smoke.mjs`

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- recursive full-library load = `not_performed`
- referenced target loading = `not_performed`
- HUMAN machine loading = `not_performed`
- archive loading = `not_performed`
- Resleever loading = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SUMMARY_NORMALIZATION_LIVE_PROMOTION`
