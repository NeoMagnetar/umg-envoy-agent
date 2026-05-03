# TOOL-RUNTIME-30F — Pending Scan Watch / Escalation Window

## Timestamped evidence check
- check time: `2026-05-02T17:35:43.7350324-09:00`

## Read-only ClawHub CLI evidence
From `clawhub package inspect umg-envoy-agent`:
- latest version: `0.2.9`
- owner: `neomagnetar`
- verification: `source-linked / artifact-only`
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`
- source ref: `fix/public-envoy-surface-v0.2.9`
- tools exposed:
  - `umg_envoy_status`
  - `umg_envoy_compiler_smoke_test`
  - `umg_envoy_list_sleeves`
  - `umg_envoy_list_block_libraries`
  - `umg_envoy_compile_sleeve`
  - `umg_envoy_validate_runtime_output`
  - `umg_envoy_compare_sleeves`
  - `umg_envoy_parse_path`
  - `umg_envoy_validate_path`
  - `umg_envoy_render_path`
  - `umg_envoy_build_path`
  - `umg_envoy_matrix_status`
- scan: `pending`

## Public page evidence refresh
The public page still shows the corrected `v0.2.9` public-facing package text and public boundary language.
No regression to the old bridge-execution package presentation was observed in the fetched page text.

## Pending-state interpretation
At this evidence point:
- publish succeeded
- corrected public-safe package shape remains live
- provenance remains linked
- scan verdict still has not resolved beyond `pending`

## Current classification
Use this classification for now:
- pending scan watch active
- no clearance yet
- likely platform-side scan delay if this state persists beyond the immediate post-publish window

## Boundary preserved
This phase did not republish, mutate the package, or claim final scan clearance.
