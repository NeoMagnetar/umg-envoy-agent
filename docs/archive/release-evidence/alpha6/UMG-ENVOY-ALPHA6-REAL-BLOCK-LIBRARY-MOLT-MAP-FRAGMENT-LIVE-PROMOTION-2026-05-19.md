# UMG Envoy Alpha6 — Real Block Library MOLT Map Fragment Live Promotion

Date: 2026-05-19

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_SOURCE_READY`

Previous commit:
- `9b6c993e467404637345d127b800c8e357b359e0`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-MOLT-MAP-FRAGMENT-SOURCE-2026-05-19.md`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- version: `0.3.0-alpha.6`
- source entry: `src/plugin-entry.ts`

## Promoted Artifacts

Copied into installed extension:
- `plugin-entry.js`
- `plugin-entry.d.ts`
- `block-library-resolver.js`
- `block-library-resolver.d.ts`

Installed extension:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Live Tool Verification

Confirmed live tools:
- `umg_envoy_block_library_status`
- `umg_envoy_block_library_manifest_index`
- `umg_envoy_block_library_manifest_entry_lookup`
- `umg_envoy_block_library_target_shallow_load_gate`
- `umg_envoy_block_library_target_shallow_load_single`
- `umg_envoy_block_library_target_shallow_summary_normalize`
- `umg_envoy_block_library_neoblock_inspect`
- `umg_envoy_block_library_moltblock_visible_extract`
- `umg_envoy_block_library_molt_map_fragment`

## Live MOLT Map Fragments

Confirmed:
- `primary.sample`
 - `fragmentStatus = MOLT_MAP_FRAGMENT_READY`
 - `moltType = Primary`
 - `moltMapField = Primary`
 - NL projection includes `Primary:`
- `directive.sample`
 - `fragmentStatus = MOLT_MAP_FRAGMENT_READY`
 - `moltType = Directive`
 - `moltMapField = Directive`
 - NL projection includes `Directive:`
- `trigger.sample`
 - `fragmentStatus = MOLT_MAP_FRAGMENT_READY`
 - `moltType = Trigger`
 - `moltMapField = Trigger`
 - NL projection includes `Trigger:`

Confirmed:
- `payloadLoaded = true`
- `recursiveLoad = false`
- `referenceSummary.resolvedRefs = 0`
- `referenceSummary.loadedRefs = 0`
- trigger evaluation = `not_performed`
- full seven-field MOLT Map composition = `not_performed`

## Live Denied / Hold Cases

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

## Known Limitation

Observed source limitation:
- for entry-id queries, sourcePath provenance uses safe fallback and does not yet backfill the resolved target path

Classification:
- `KNOWN_LIMITATION_SOURCEPATH_PROVENANCE_BACKFILL_PENDING`

This did not block live promotion because:
- manifest lookup worked
- target gate worked
- payload load worked
- MOLT extraction worked
- fragment projection worked
- smoke expectations passed
- no unsafe path was followed

## Health

Confirmed:
- live plugin loaded
- `openclaw health --json` reports `ok: true`
- no UMG/plugin-specific regression surfaced

Observed non-UMG notices:
- orphan transcript files
- one live session lock file
- browser attach/version notes
- memory-search provider readiness notes

Classification:
- `NON_UMG_OPENCLAW_HOUSEKEEPING_SEPARATE_LANE`

## Safety Confirmations

Confirmed:
- no execution
- no direct_source
- no recursive full-library load
- no referenced target loading
- no external MOLT block file loading
- no full MOLT Map composition
- no response envelope rendering
- no HUMAN machine loading
- no archive machine loading
- no Resleever loading
- no trigger evaluation
- no UMG-Block-Library mutation
- no publish
- no package

## Remaining Drift

Still non-authoritative:
- `plugin-entry-public` references
- public-variant docs
- Alpha5/public surface docs

Classification:
- `SOURCE_PACKAGE_DRIFT_NOT_LIVE_RUNTIME_TRUTH`

## Required Next Task

Next task:
`ALPHA6_REAL_BLOCK_LIBRARY_MOLT_MAP_FRAGMENT_PROVENANCE_BACKFILL_SOURCE`
