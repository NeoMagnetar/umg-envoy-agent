# UMG Envoy Alpha6 — Real Block Library MOLTBlock Visible Extractor Source
Date: 2026-05-18

## Verdict
`ALPHA6_REAL_BLOCK_LIBRARY_MOLTBLOCK_VISIBLE_EXTRACTOR_SOURCE_READY`

## Baseline
Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_NEOBLOCK_INSPECTOR_LIVE_READY`

Previous commit:
- `e3a1e659580ec30e6a487dfe4b0afcaefca2f1b5`

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

## Scope
This step added the read-only visible MOLT extractor source implementation.

This step added:
- `umg_envoy_block_library_moltblock_visible_extract`
- one-NeoBlock visible MOLT extraction
- MOLT type exposure
- MOLT-shaped content summary
- role/status/title extraction when visible
- reference count summary
- trigger non-evaluation confirmation
- visible MOLT extractor smoke

This step did not:
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
- `umg_envoy_block_library_moltblock_visible_extract`

## Confirmed Visible MOLT Extractions
Confirmed:
- `primary.sample`
- `extractStatus = VISIBLE_MOLT_EXTRACTED`
- `sourceNeoblockId = primary.sample`
- `moltType = Primary`
- `directive.sample`
- `moltType = Directive`
- `trigger.sample`
- `moltType = Trigger`

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
- missing query → `HOLD_VISIBLE_MOLT_EXTRACT_QUERY_REQUIRED`
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
- `node scripts/alpha6-real-block-library-neoblock-inspector-smoke.mjs`
- `node scripts/alpha6-real-block-library-moltblock-visible-extractor-smoke.mjs`

Doctor notes observed during verification:
- no UMG/plugin-specific warning surfaced
- unrelated orphan transcript and session lock notices were present in doctor output

## Safety Confirmations
Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- recursive full-library load = `not_performed`
- referenced target loading = `not_performed`
- external MOLT block file loading = `not_performed`
- HUMAN machine loading = `not_performed`
- archive loading = `not_performed`
- Resleever loading = `not_performed`
- trigger evaluation = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task
Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLTBLOCK_VISIBLE_EXTRACTOR_LIVE_PROMOTION`
