# UMG Envoy Alpha6 — Real Block Library Manifest Entry Lookup Live Promotion

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_ENTRY_LOOKUP_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_ENTRY_LOOKUP_SOURCE_READY`

Previous commit:
- `ba0844b`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-MANIFEST-ENTRY-LOOKUP-2026-05-18.md`

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

## Live Entry Lookup Probe

Confirmed:
- `primary.sample`
- `directive.sample`
- `trigger.sample`

Expected status:
- `targetPolicy = ALLOWED_NOT_LOADED`
- `loadStatus = not_loaded`

## Live Negative / Policy Cases

Confirmed:
- `missing.sample` → `HOLD_MANIFEST_ENTRY_NOT_FOUND`
- missing query → `HOLD_MANIFEST_ENTRY_QUERY_REQUIRED`
- unsupported manifest kind → `HOLD_MANIFEST_KIND_UNSUPPORTED`
- `includeRaw=true` → `HOLD_RAW_ENTRY_DUMP_NOT_SUPPORTED`
- `archive/sample-basic_minimal.json` → `FORBIDDEN_TARGET`
- `SLV.OPERATOR.json` → `OUTSIDE_ALLOWLIST_TARGET`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `OUTSIDE_ALLOWLIST_TARGET`

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
- no target payload loading
- no recursive full-library load
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
`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_GATE`
