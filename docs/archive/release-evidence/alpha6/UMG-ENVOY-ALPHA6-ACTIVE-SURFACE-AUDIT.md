# UMG Envoy Alpha6 Active Surface Audit

## Verdict
ALPHA6 active surface is live, loadable, and mostly probe-clean in read-only mode, but the package is internally inconsistent.

## Live Runtime State
- Plugin loaded: yes
- Plugin id: `umg-envoy-agent`
- Runtime version: `0.3.0-alpha.6`
- Runtime source: `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- Install source: `path`
- Health: `ok: true`
- Doctor UMG warnings: none
- Plugins loaded: 5
- Plugin errors: 0

## Active Runtime Tool Surface
Live loaded tools from `openclaw plugins info umg-envoy-agent`:
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

This is a compiler-backed surface.

## Critical Internal Mismatch
The live loaded runtime source is `dist/plugin-entry.js`, but the installed `openclaw.plugin.json` still advertises a different alpha6/public surface:
- manifest version: `0.3.0-alpha.6`
- manifest entry: `dist/plugin-entry.js`
- manifest tool list: public alpha6 tool family (`umg_envoy_library_status`, `umg_envoy_runtime_spec_dry_run`, `umg_envoy_alpha_demo`, etc.)

So the current package is split:
- runtime actually loads compiler-backed `plugin-entry.js`
- manifest metadata still describes the public alpha6 intended surface

This is the main structural inconsistency to resolve next.

## Safe Probe Summary
Safe probe output file:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-SAFE-PROBE-RESULTS.json`

Read-only probe results:
- success:
  - `umg_envoy_status`
  - `umg_envoy_compiler_smoke_test`
  - `umg_envoy_list_sleeves`
  - `umg_envoy_list_block_libraries`
  - `umg_envoy_compile_sleeve`
  - `umg_envoy_validate_runtime_output`
  - `umg_envoy_compare_sleeves`
  - `umg_envoy_build_path`
  - `umg_envoy_matrix_status`
- failed with minimal probe string:
  - `umg_envoy_parse_path`
  - `umg_envoy_validate_path`
  - `umg_envoy_render_path`

### Probe Failure Interpretation
Those three failures were not runtime/load failures. They rejected my minimal freeform string because the parser expects a stricter UMG path grammar. That is a format-contract issue, not evidence that the tools are broken.

## What Alpha6 Currently Demonstrates
The current active alpha6 surface proves that the local package can:
- load inside OpenClaw successfully
- expose a stable compiler-backed tool family
- enumerate bundled sleeves and blocks
- compile a bundled sleeve to RuntimeSpec-like output
- validate runtime output
- compare sleeves
- emit a structured path document from a message
- report compiler matrix status

It also confirms that the bundled content lane is still very small:
- sample sleeves: 2
- sample blocks: 7

## Alpha5 vs Alpha6 Comparison
### Alpha5 public verified baseline
- public ClawHub release
- version: `0.3.0-alpha.5`
- public entrypoint: `dist/plugin-entry-public.js`
- safe public read-only surface
- packaging/identity aligned at release time

### Current local recovered alpha6 state
- local path-installed recovery state
- version: `0.3.0-alpha.6`
- live entrypoint: `dist/plugin-entry.js`
- compiler-backed surface
- package metadata partially reflects public-alpha6 intent, not actual loaded runtime surface

### What alpha6 adds over alpha5 baseline
- compiler-backed operations
- sleeve compile/compare/validate workflow
- matrix status / compiler visibility emphasis
- clearer direction toward block-library / runtime-spec generation

### What alpha6 currently lacks
- alignment between manifest metadata and active runtime surface
- formalized public-safe entrypoint parity
- larger bundled public content set
- explicit real block-library resolver on the loaded surface
- clean packaging truth for publishable distribution

## Recommended Direction
Treat current alpha6 as the real working checkpoint, not as a publish candidate.

Recommended next direction:
1. Preserve current alpha6 runtime as a local working checkpoint.
2. Decide whether `plugin-entry.js` becomes the official alpha6 runtime truth.
3. If yes, update package/manifests/tool declarations to match the compiler-backed surface exactly.
4. Then design the next step as a deliberate resolver expansion rather than continuing accidental dual-surface drift.

## Boundaries
- Do not reinstall alpha5 over this state.
- Do not publish this alpha6 state as-is.
- Do not broad-commit workspace changes.
- Do not mix backup/Resleever/vendor lanes into the active source of truth.
