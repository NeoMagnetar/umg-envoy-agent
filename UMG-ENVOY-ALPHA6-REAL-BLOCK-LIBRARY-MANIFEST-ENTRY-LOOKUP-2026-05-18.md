# UMG Envoy Alpha6 — Real Block Library Manifest Entry Lookup

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_ENTRY_LOOKUP_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_INDEX_LIVE_READY`

Previous commit:
- `28923cd`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`
- current live tools:
 - `umg_envoy_block_library_status`
 - `umg_envoy_block_library_manifest_index`

## Scope

This step added read-only manifest entry lookup for the real UMG Block Library.

This step added:
- `umg_envoy_block_library_manifest_entry_lookup`
- lookup by entry id
- lookup by source path
- manifest kind filtering
- target path policy reporting
- entry lookup smoke

This step did not:
- load target payload files
- recursively load the full library
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

- `umg_envoy_block_library_manifest_entry_lookup`

## Confirmed Lookups

Confirmed:
- `primary.sample`
- `directive.sample`
- `trigger.sample`

Expected status:
- `ALLOWED_NOT_LOADED`
- `loadStatus = not_loaded`

## Negative / Policy Cases

Confirmed:
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_MANIFEST_ENTRY_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- `includeRaw=true` → `HOLD_RAW_ENTRY_DUMP_NOT_SUPPORTED`
- `archive/sample-basic_minimal.json` → `FORBIDDEN_TARGET`
- `SLV.OPERATOR.json` → `OUTSIDE_ALLOWLIST_TARGET`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `OUTSIDE_ALLOWLIST_TARGET`

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

## Safety Confirmations

Confirmed:
- readOnly = `true`
- execution = `not_performed`
- directSource = `not_enabled`
- target payload loading = `not_performed`
- recursive full-library load = `not_performed`
- HUMAN machine loading = `not_performed`
- archive loading = `not_performed`
- Resleever loading = `not_performed`
- UMG-Block-Library mutation = `not_performed`

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_ENTRY_LOOKUP_LIVE_PROMOTION`
