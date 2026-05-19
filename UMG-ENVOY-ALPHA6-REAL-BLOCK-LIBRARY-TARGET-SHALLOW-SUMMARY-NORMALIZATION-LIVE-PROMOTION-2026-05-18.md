# UMG Envoy Alpha6 — Real Block Library Target Shallow Summary Normalization Live Promotion

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SUMMARY_NORMALIZATION_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SUMMARY_NORMALIZATION_SOURCE_READY`

Previous commit:
- `1cd044a`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-TARGET-SHALLOW-SUMMARY-NORMALIZATION-2026-05-18.md`

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

## Live Normalized Summaries

Confirmed:
- `primary.sample`
 - `artifactKind = neoblock`
 - `artifactId = primary.sample`
 - `moltType = Primary`
 - `summaryStatus = NORMALIZED`
- `directive.sample`
 - `artifactKind = neoblock`
 - `artifactId = directive.sample`
 - `moltType = Directive`
 - `summaryStatus = NORMALIZED`
- `trigger.sample`
 - `artifactKind = neoblock`
 - `artifactId = trigger.sample`
 - `moltType = Trigger`
 - `summaryStatus = NORMALIZED`

Confirmed for normalized summaries:
- `payloadLoaded = true`
- `recursiveLoad = false`
- `loadStatus = shallow_loaded`
- `parseStatus = PARSED_JSON`
- `contentPreview` is bounded
- `referenceSummary` is counted but not resolved
- `resolvedRefs = 0`
- `loadedRefs = 0`

## Live Denied / Hold Cases

Confirmed:
- `archive/sample-basic_minimal.json` → `HOLD_TARGET_FORBIDDEN`
- `SLV.OPERATOR.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `HOLD_TARGET_OUTSIDE_ALLOWLIST`
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_SHALLOW_SINGLE_LOAD_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- unsupported summary profile → `HOLD_SHALLOW_SUMMARY_PROFILE_UNSUPPORTED`
- raw target dump → `HOLD_RAW_TARGET_DUMP_NOT_SUPPORTED`

## Health

Confirmed:
- `openclaw doctor --non-interactive` clean
- UMG warnings: none
- plugin errors: `0`
- `openclaw health --json` reports `ok: true`

## Safety Confirmations

Confirmed:
- no execution
- no direct_source
- no recursive full-library load
- no referenced target loading
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
`ALPHA6_REAL_BLOCK_LIBRARY_NEOBLOCK_INSPECTOR_SOURCE`
