# UMG Envoy Alpha6 — Real Block Library Target Shallow Load Gate Live Promotion

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_GATE_LIVE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_GATE_SOURCE_READY`

Previous commit:
- `9b029cf`

Previous report:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-REAL-BLOCK-LIBRARY-TARGET-SHALLOW-LOAD-GATE-2026-05-18.md`

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

## Live Allow Decisions

Confirmed:
- `primary.sample` → `ALLOW_SHALLOW_LOAD`
- `directive.sample` → `ALLOW_SHALLOW_LOAD`
- `trigger.sample` → `ALLOW_SHALLOW_LOAD`

Confirmed for allow decisions:
- `canShallowLoad = true`
- `payloadLoaded = false`
- `recursiveLoad = false`

## Live Deny Decisions

Confirmed:
- `archive/sample-basic_minimal.json` → `DENY_FORBIDDEN_TARGET`
- `SLV.OPERATOR.json` → `DENY_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `DENY_OUTSIDE_ALLOWLIST`
- `missing.sample` → `DENY_ENTRY_NOT_FOUND`
- missing query → `DENY_QUERY_REQUIRED`
- unsupported manifest kind → `DENY_UNSUPPORTED_MANIFEST_KIND`
- recursive load mode → `DENY_UNSUPPORTED_LOAD_MODE`

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
`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_SINGLE_SOURCE`
