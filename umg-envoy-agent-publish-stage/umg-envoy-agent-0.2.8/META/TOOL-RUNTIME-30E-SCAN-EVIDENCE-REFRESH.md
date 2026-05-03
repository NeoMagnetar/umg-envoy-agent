# TOOL-RUNTIME-30E — Scan Pending Follow-Up / Evidence Refresh

## Summary
A read-only post-publish follow-up was performed for `umg-envoy-agent@0.2.9`.

## ClawHub CLI evidence
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

## Public page evidence
The ClawHub public page content fetched from `https://clawhub.com/packages/umg-envoy-agent` (redirecting to `https://clawhub.ai/plugins/umg-envoy-agent`) showed the corrected `v0.2.9` public-facing package text, including:
- `UMG Envoy Agent v0.2.9`
- bundled-adapter/public-safe package description
- explicit public package boundary text
- explicit statement that the public package does not ship external compiler process bridge behavior
- presence of both current and historical release-note framing in the published package text

## Interpretation
This confirms two important things at once:
1. the published public-facing package content is the corrected `v0.2.9` package line
2. the final scan verdict is still not available through the current read-only CLI check and remains `pending`

## Boundary preserved
This phase did not republish, regenerate the package, or claim final scan clearance.
