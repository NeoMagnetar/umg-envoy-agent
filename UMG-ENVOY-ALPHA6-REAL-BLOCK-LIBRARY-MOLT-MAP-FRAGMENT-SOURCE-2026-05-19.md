# UMG Envoy Alpha6 — Real Block Library MOLT Map Fragment Source
Date: 2026-05-19

## Verdict
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_SOURCE_READY`

## Baseline
Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLTBLOCK_VISIBLE_EXTRACTOR_LIVE_READY`

Previous commit:
- `753909bbadc4b660bad725b9d40c6337ecce693d`

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
- `umg_envoy_block_library_target_shallow_summary_normalize`
- `umg_envoy_block_library_neoblock_inspect`
- `umg_envoy_block_library_moltblock_visible_extract`

## Scope
This step added the read-only MOLT Map fragment source implementation.

This step added:
- `umg_envoy_block_library_molt_map_fragment`
- one-visible-MOLT fragment projection
- MOLT type to MOLT Map field mapping
- bounded field value extraction
- NL projection for one fragment
- reference count preservation
- source provenance preservation
- MOLT Map fragment smoke

This step did not:
- compose a full MOLT Map
- render a full response envelope
- recursively load the full library
- load referenced targets
- load external MOLT block files
- inspect NeoStacks
- inspect sleeves
- evaluate triggers
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
- `umg_envoy_block_library_molt_map_fragment`

## Confirmed MOLT Map Fragments
Confirmed:
- `primary.sample`
- `fragmentStatus = MOLT_MAP_FRAGMENT_READY`
- `moltType = Primary`
- `moltMapField = Primary`
- NL projection includes `Primary:`
- `directive.sample`
- `moltType = Directive`
- `moltMapField = Directive`
- NL projection includes `Directive:`
- `trigger.sample`
- `moltType = Trigger`
- `moltMapField = Trigger`
- NL projection includes `Trigger:`

Confirmed:
- `payloadLoaded = true`
- `recursiveLoad = false`
- `referenceSummary.resolvedRefs = 0`
- `referenceSummary.loadedRefs = 0`
- trigger evaluation = `not_performed`

## Denied / Hold Cases
Confirmed:
- `archive/sample-basic_minimal.json` → `HOLD_TARGET_FORBIDDEN`
- `SLV.OPERATOR.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_MOLT_MAP_FRAGMENT_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- unsupported summary profile → `HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED`
- unsupported projection format → `HOLD_MOLT_MAP_FRAGMENT_PROJECTION_FORMAT_UNSUPPORTED`
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
- `node scripts/alpha6-real-block-library-neoblock-inspector-smoke.mjs`
- `node scripts/alpha6-real-block-library-moltblock-visible-extractor-smoke.mjs`
- `node scripts/alpha6-real-block-library-molt-map-fragment-smoke.mjs`

## Safety Confirmations
Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- recursive full-library load = `not_performed`
- referenced target loading = `not_performed`
- external MOLT block file loading = `not_performed`
- full MOLT Map composition = `not_performed`
- response envelope rendering = `not_performed`
- trigger evaluation = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task
Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_LIVE_PROMOTION`
