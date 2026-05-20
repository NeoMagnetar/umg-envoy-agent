# UMG Envoy Alpha6 — Working Runtime Path Live Promotion

Date: 2026-05-19

## Verdict

`ALPHA6_WORKING_RUNTIME_PATH_LIVE_READY`

## Baseline

- source verdict: `ALPHA6_WORKING_RUNTIME_PATH_SOURCE_READY`
- source commit: `04599e5a9cfe107cab1238871b2692e5e5fc5afe`
- source report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-WORKING-RUNTIME-PATH-SOURCE-2026-05-19.md`
- previous live checkpoint: `ALPHA6_REAL_BLOCK_LIBRARY_SLEEVE_GRAPH_INDEX_LIVE_READY`
- previous live commit: `ef347959fcbd56af609074243a7267b88e883335`

## Promotion

- source package path: `C:\.openclaw\workspace\work\public-next\package`
- installed extension path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- built entrypoint: `dist/plugin-entry.js`
- live entrypoint: `dist/plugin-entry.js`
- version: `0.3.0-alpha.6`
- files copied:
  - `plugin-entry.js`
  - `plugin-entry.d.ts`
  - `block-library-resolver.js`
  - `block-library-resolver.d.ts`
- reload method used: OpenClaw gateway restart signal (`SIGUSR1` via `gateway.restart`)

## New Live Tools Confirmed

- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

## Live Runtime Preview Proof

- sleeveId tested: `neomagnetar-dynamic-persona-v1`
- preview status: `RUNTIME_PREVIEW_READY`
- compile status: `COMPILED`
- runtimeSpecVersion: `RuntimeSpecV0`
- Active Stack projection status: `ACTIVE_STACK_PROJECTION_READY_WITH_SOURCE_CONTEXT`
- response-envelope preview status: `RESPONSE_ENVELOPE_FRAGMENT_READY`
- tool request status: declared tool request surfaced
- execution status: `not_performed`

## Regression Checks

Confirmed:
- old Alpha6 tools still work live
- sleeve graph index still works
- response envelope fragment still works
- Active Stack projection still works
- recursion bug did not return
- OpenClaw health ok

## Safety Confirmations

Confirmed:
- no public publish
- no package publish
- no UMG-Block-Library mutation
- no full library scan
- no unbounded recursive traversal
- no external MOLT block file loading
- no trigger evaluation
- no uncontrolled execution
- direct_source remains `not_enabled`
- automatic response takeover remains `false`

## Known Limitations

- public package / ClawHub may still be behind the local installed extension
- `umg_envoy_runtime_run` is not required and was not needed for this lane
- execution remains dry-run / preview only
- active sleeve auto-discovery remains limited
- deeper NeoStack payload inspection remains a later lane

## Next Recommended Task

`ALPHA6_PUBLIC_PACKAGE_SYNC_OR_ALPHA7_CUT_DECISION`
