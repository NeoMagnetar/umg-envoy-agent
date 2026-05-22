# UMG Envoy Alpha6 — Real Block Library Target Shallow Load Single Source

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SINGLE_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_GATE_LIVE_READY`

Previous commit:
- `b232e1a`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`
- current live tools:
 - `umg_envoy_block_library_status`
 - `umg_envoy_block_library_manifest_index`
 - `umg_envoy_block_library_manifest_entry_lookup`
 - `umg_envoy_block_library_target_shallow_load_gate`

## Scope

This step added read-only single-target shallow loading.

This step added:
- `umg_envoy_block_library_target_shallow_load_single`
- one-target payload read after gate approval
- safe JSON parse
- bounded shallow payload summary
- top-level key extraction
- identity/metadata/provenance summary
- bounded content preview
- reference count summary
- shallow-load single smoke

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

- `umg_envoy_block_library_target_shallow_load_single`

## Allowed Shallow Loads

Confirmed:
- `primary.sample`
- `directive.sample`
- `trigger.sample`

Confirmed:
- `payloadLoaded = true`
- `recursiveLoad = false`
- `loadStatus = shallow_loaded`
- `parseStatus = PARSED_JSON`

## Denied Loads

Confirmed:
- `archive/sample-basic_minimal.json` → `DENY_FORBIDDEN_TARGET`
- `SLV.OPERATOR.json` → `DENY_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `DENY_OUTSIDE_ALLOWLIST`
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- recursive load mode → `HOLD_SHALLOW_SINGLE_LOAD_MODE_UNSUPPORTED`
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
`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SINGLE_LIVE_PROMOTION`
