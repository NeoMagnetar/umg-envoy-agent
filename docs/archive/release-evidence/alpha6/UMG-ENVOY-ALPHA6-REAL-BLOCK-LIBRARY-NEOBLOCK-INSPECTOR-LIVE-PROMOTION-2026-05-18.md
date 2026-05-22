# UMG Envoy Alpha6 — Real Block Library NeoBlock Inspector Live Promotion

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_NEOBLOCK_INSPECTOR_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_NEOBLOCK_INSPECTOR_SOURCE_READY`

Previous commit:
- `e0df8d5`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-NEOBLOCK-INSPECTOR-SOURCE-2026-05-18.md`

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

Pre-promotion live state observed:
- installed extension already on version `0.3.0-alpha.6`
- live entrypoint already resolved from installed extension `dist/plugin-entry.js`
- legacy Alpha6 live block-library tools present
- `umg_envoy_block_library_neoblock_inspect` absent before promotion

## Live NeoBlock Inspections

Confirmed:
- `primary.sample`
 - `inspectStatus = NEOBLOCK_INSPECTED`
 - `artifactKind = neoblock`
 - `moltType = Primary`
- `directive.sample`
 - `inspectStatus = NEOBLOCK_INSPECTED`
 - `artifactKind = neoblock`
 - `moltType = Directive`
- `trigger.sample`
 - `inspectStatus = NEOBLOCK_INSPECTED`
 - `artifactKind = neoblock`
 - `moltType = Trigger`

Confirmed for NeoBlock inspections:
- `payloadLoaded = true`
- `recursiveLoad = false`
- `referenceSummary.resolvedRefs = 0`
- `referenceSummary.loadedRefs = 0`
- trigger evaluation = `not_performed`

## Live Denied / Hold Cases

Confirmed:
- `archive/sample-basic_minimal.json` → `HOLD_TARGET_FORBIDDEN`
- `SLV.OPERATOR.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_NEOBLOCK_INSPECT_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- unsupported summary profile → `HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED`
- raw target dump → `HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED`

## Health

Confirmed:
- `openclaw health --json` reports `ok: true`
- plugin reload succeeded
- plugin info shows the promoted live tool surface including `umg_envoy_block_library_neoblock_inspect`

Notes:
- `openclaw doctor --non-interactive` was invoked pre- and post-promotion but did not return a bounded final report in this lane before timing considerations; no UMG warning surfaced in the returned output and no plugin-load regression was observed.

## Safety Confirmations

Confirmed:
- no execution
- no direct_source
- no recursive full-library load
- no referenced target loading
- no referenced MOLT block loading
- no HUMAN machine loading
- no archive machine loading
- no Resleever loading
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
`ALPHA6_REAL_BLOCK_LIBRARY_MOLTBLOCK_VISIBLE_EXTRACTOR_SOURCE`
