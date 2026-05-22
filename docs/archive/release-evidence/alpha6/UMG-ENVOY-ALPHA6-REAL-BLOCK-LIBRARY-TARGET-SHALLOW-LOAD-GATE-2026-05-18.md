# UMG Envoy Alpha6 — Real Block Library Target Shallow Load Gate

Date: 2026-05-18

## Verdict

`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_GATE_SOURCE_READY`

## Baseline

Previous step:
- `ALPHA6_REAL_BLOCK_LIBRARY_MANIFEST_ENTRY_LOOKUP_LIVE_READY`

Previous commit:
- `0cefe10`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- source entry: `src/plugin-entry.ts`
- version: `0.3.0-alpha.6`
- current live tools:
 - `umg_envoy_block_library_status`
 - `umg_envoy_block_library_manifest_index`
 - `umg_envoy_block_library_manifest_entry_lookup`

## Scope

This step added the read-only target shallow-load gate.

This step added:
- `umg_envoy_block_library_target_shallow_load_gate`
- shallow-load eligibility decision
- target policy gate
- reason codes
- next safe action
- payload-not-loaded enforcement
- shallow-load gate smoke

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

- `umg_envoy_block_library_target_shallow_load_gate`

## Allow Decisions

Confirmed:
- `primary.sample` → `ALLOW_SHALLOW_LOAD`
- `directive.sample` → `ALLOW_SHALLOW_LOAD`
- `trigger.sample` → `ALLOW_SHALLOW_LOAD`

Confirmed:
- `canShallowLoad = true`
- `payloadLoaded = false`
- `recursiveLoad = false`

## Deny Decisions

Confirmed:
- `archive/sample-basic_minimal.json` → `DENY_FORBIDDEN_TARGET`
- `SLV.OPERATOR.json` → `DENY_OUTSIDE_ALLOWLIST`
- `sleeve-neomagnetar-dynamic-persona-v1.json` → `DENY_OUTSIDE_ALLOWLIST`
- `missing.sample` → `DENY_ENTRY_NOT_FOUND`
- missing query → `DENY_QUERY_REQUIRED`
- unsupported manifest kind → `DENY_UNSUPPORTED_MANIFEST_KIND`
- recursive load mode → `DENY_UNSUPPORTED_LOAD_MODE`

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
`ALPHA6_REAL_BLOCK_LIBRARY_TARGET_SHALLOW_LOAD_GATE_LIVE_PROMOTION`
