# TOOL-RUNTIME-30D — Post-Publish Scan Evidence

## Current package state
- package: `umg-envoy-agent`
- latest version: `0.2.9`
- owner: `neomagnetar`
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`
- source ref: `fix/public-envoy-surface-v0.2.9`

## Read-only evidence captured
From `clawhub package inspect umg-envoy-agent` after publish:
- family: `Code Plugin`
- latest: `0.2.9`
- executes code: `yes`
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
- verification: `source-linked / artifact-only`
- verification summary: `Validated package structure and linked the release to source metadata.`
- scan: `pending`

## Missing final evidence
A final ClawHub scan verdict was not yet available at the time of this capture.
No final clear/review/reject state was visible yet.

## Interpretation
The publish succeeded and the corrected public package is live as `0.2.9`, but the scan pipeline has not yet produced a final visible verdict.

## Boundary preserved
This phase did not republish, mutate the package, or claim ClawHub clearance.
