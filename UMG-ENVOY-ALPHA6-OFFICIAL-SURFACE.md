# UMG Envoy Alpha6 Official Surface

## Official Local Alpha6 Surface
For the current recovered local alpha6 checkpoint, the official runtime truth is:
- entrypoint: `dist/plugin-entry.js`
- runtime style: compiler-backed
- install source: `path`
- state: local recovered working checkpoint

## Official Tool Family
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

## What Alpha6 Is Not
Alpha6 local runtime is not the same thing as:
- the verified public-safe alpha5 ClawHub release
- the earlier public-entrypoint packaging story built around `dist/plugin-entry-public.js`
- a publish-ready distribution in its current local recovered form

## Alpha5 Historical Baseline
The public verified baseline remains:
- package: `umg-envoy-agent`
- version: `0.3.0-alpha.5`
- entrypoint model: `dist/plugin-entry-public.js`
- posture: public-safe baseline

## Why This Distinction Matters
The system just recovered from exactly the kind of mismatch where:
- OpenClaw loaded one thing
- metadata described another thing
- plugin discovery became fragile

Alpha6 should therefore be treated as a single declared truth from this point forward:
- local alpha6 runtime truth = compiler-backed `plugin-entry.js`

## Path Tool Interpretation
The earlier parse/validate/render failures were not runtime failures.
They were invalid-input failures caused by non-UMG freeform text.
With real UMG grammar fixtures, the path tools pass.

## Immediate Next Step After This Alignment
After runtime/manifest truth is aligned, the next product step should be:
- real block-library resolver work on top of the compiler-backed alpha6 line

Not before.
