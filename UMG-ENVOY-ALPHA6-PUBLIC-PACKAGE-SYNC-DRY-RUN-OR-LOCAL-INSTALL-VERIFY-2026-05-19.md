# UMG Envoy Alpha6 — Public Package Sync Dry Run / Local Install Verify

Date: 2026-05-19

## Verdict

`ALPHA6_PUBLIC_PACKAGE_SYNC_LOCAL_INSTALL_VERIFY_READY`

## Baseline

- prep verdict: `ALPHA6_PUBLIC_PACKAGE_SYNC_PREP_READY`
- prep commit: `5f7b9075ed029e1ab3916039f09a75f24c64e986`
- prep report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PREP-2026-05-19.md`
- staging path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.6`
- version recommendation: keep `0.3.0-alpha.6`
- live-ready state: `ALPHA6_WORKING_RUNTIME_PATH_LIVE_READY`

## Staged Package Candidate

- package root: valid
- `package.json`: present at staging root
- `openclaw.plugin.json`: present at staging root
- entrypoint: `dist/plugin-entry.js`
- version: `0.3.0-alpha.6`
- included directories: `dist`, `docs`, `public-content`
- forbidden-file scan: clean
- `npm pack --dry-run`: passed
- local tgz created: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.6\umg-envoy-agent-0.3.0-alpha.6.tgz`
- sha256: captured during verification

## Local Install Verification

- method used: controlled installed-extension swap from staged package candidate
- backup path: created under `C:\.openclaw\workspace\alpha6-local-install-verify-backups`
- installed extension path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
- candidate installed/synced: yes
- backup restored: no
- installed candidate kept: yes
- reload result: success via established OpenClaw restart method
- plugin info result: loaded, version `0.3.0-alpha.6`, entrypoint `dist/plugin-entry.js`
- health result: ok true

## Live Tool Verification

Confirmed new runtime tools present:
- `umg_envoy_block_library_sleeve_graph_drilldown`
- `umg_envoy_sleeve_select`
- `umg_envoy_sleeve_resolve`
- `umg_envoy_runtime_compile`
- `umg_envoy_runtime_preview`

Confirmed old Alpha6 tools present:
- `umg_envoy_block_library_status`
- `umg_envoy_block_library_manifest_index`
- `umg_envoy_block_library_manifest_entry_lookup`
- `umg_envoy_block_library_target_shallow_load_gate`
- `umg_envoy_block_library_target_shallow_load_single`
- `umg_envoy_block_library_target_shallow_summary_normalize`
- `umg_envoy_block_library_neoblock_inspect`
- `umg_envoy_block_library_moltblock_visible_extract`
- `umg_envoy_block_library_molt_map_fragment`
- `umg_envoy_block_library_molt_map_compose`
- `umg_envoy_block_library_response_envelope_fragment`
- `umg_envoy_block_library_active_stack_projection`
- `umg_envoy_block_library_sleeve_graph_index`

## Runtime Preview Proof

- sleeveId: `neomagnetar-dynamic-persona-v1`
- previewStatus: `RUNTIME_PREVIEW_READY`
- compileStatus: `COMPILED`
- runtimeSpecVersion: `RuntimeSpecV0`
- Active Stack preview: confirmed
- response-envelope preview: confirmed
- declared tool requests: confirmed
- execution: `not_performed`

## Regression Checks

Confirmed:
- old Alpha6 tools still work
- sleeve graph index still works
- response envelope fragment still works
- Active Stack projection still works
- recursion bug did not return
- no `RangeError`
- no `Maximum call stack size exceeded`

## Safety Confirmations

Confirmed:
- no public publish
- no ClawHub publish
- no npm publish
- no Alpha7 cut
- no UMG-Block-Library mutation
- no `.gitmodules` change
- no trigger evaluation
- no uncontrolled execution
- `automaticResponseTakeover = false`

## Recommendation

Next lane:
`ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_GATE`
