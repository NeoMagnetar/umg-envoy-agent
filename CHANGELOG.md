# Changelog

## Unreleased

## 0.3.0-alpha.14 - 2026-05-29

Alpha release continuing the public alpha-track line already used for current public latest.

### Changed

- Adds the bounded runtime-facing capability story built around RuntimeSpecBoundary, TraceBoundary, ActionGate modeling, conservative ToolCapabilityRegistry seed policy, ToolResult audit records, and runtime report inspection.
- Keeps `umg_envoy_low_risk_direct_tool_run` bounded to exactly six static safe tools:
  - `umg_envoy_status`
  - `umg_envoy_validate_runtime_output`
  - `umg_envoy_parse_path`
  - `umg_envoy_validate_path`
  - `umg_envoy_render_path`
  - `umg_envoy_action_gate_runtime_report_view`
- Preserves explicit direct-execution exclusions for:
  - `umg_envoy_load_sleeve`
  - `umg_envoy_compile_ir_bridge`
  - `umg_envoy_emit_relation_matrix`
  - `umg_envoy_compile_sleeve`
  - `umg_envoy_build_path`
  - unknown tools
  - arbitrary dispatch
  - writes / deletes
  - package or plugin mutation
  - external/network transmission
- Keeps approval-gated writes modeled but not executable in the runtime surface.
- Keeps bridge/emission paths blocked from direct execution in this release.

### Notes

- This is an alpha release and follows the existing public alpha-track latest story.
- RuntimeSpec remains non-executing and Trace remains non-permission.
- Direct runtime execution now produces ToolResult audit records for bounded safe tools only.
- `umg_envoy_load_sleeve` remains registered and conservatively seeded, but stays internal-only / blocked-public under current policy and is excluded from the first direct adapter set.
- `validate:umg:e2e` still requires external input (`sleevePath` / `UMG_E2E_SLEEVE_PATH`).

## 0.2.8

Install metadata validation correction release.

### Fixed

- Corrects `openclaw.install.minHostVersion` to the OpenClaw installer-required semver floor format `>=2026.3.23`.
- Preserves `openclaw.compat.pluginApi` as `>=1.2.0`.
- Preserves runtime, compiler bridge, artifact resolver, relation matrix, sleeve, block, NeoBlock, and NeoStack behavior.

### Notes

- This release exists because `0.2.7` fixed the plugin API version axis but still used `>=2026.3.23-1` in `install.minHostVersion`, which the installer rejects.
- No runtime behavior changes are included.

## 0.2.7 - 2026-04-30

Compatibility metadata correction release.

### Fixed

- Corrects `openclaw.compat.pluginApi` from the OpenClaw host/build version axis to the plugin API semver axis.
- Adds/uses `openclaw.install.minHostVersion` for host-version gating.
- Allows compatible OpenClaw runtimes exposing plugin API `1.2.0` to pass the install compatibility gate.

### Notes

- No runtime/compiler/relation/artifact-resolver behavior changes.
- v0.2.7 preserves the hardened ClawHub package surface introduced in v0.2.5/v0.2.6.
- v0.2.7 remains the intended ClawHub latest/default release after publication.

## 0.2.6 - 2026-04-29

ClawHub latest-tag correction release.

### Fixed

- Ensures the ClawHub publish tag set includes the reserved `latest` tag explicitly.
- Corrects the release-process issue where custom semantic tags replaced the default `latest` tag.
- Preserves the hardened v0.2.5 artifact surface and runtime behavior.

### Notes

- v0.2.5 remains the hardened artifact milestone.
- v0.2.6 is the intended package-level latest/default ClawHub release.
- No runtime/compiler/relation/artifact-resolver behavior changes.

## 0.2.5 - 2026-04-29

Hardened ClawHub publication cleanup.

### Changed

- Prepares a clean-staged ClawHub release so the published artifact surface contains only intended public plugin files.
- Documents that 0.2.4 proved the ClawHub publish path but shipped a broader artifact surface than intended.
- Preserves 0.2.4 metadata polish and package description improvements.
- Clarifies that maintainer-only scripts, local reports, source tree, and legacy draft files are not part of the hardened ClawHub artifact.
- Keeps runtime behavior unchanged.

### Validation

- build/check/smoke/pack dry-run pass.
- canonical UMG E2E validation passes.
- staged ClawHub file inventory is explicitly audited before publish.

## 0.2.4 - 2026-04-29

Metadata polish before first ClawHub publication.

### Changed

- Improved package/plugin description for clearer ClawHub listing presentation.
- Replaced stale pre-publication README wording with durable publication-status language.
- Added package keywords for clearer discovery and tag alignment.
- No runtime behavior changes.

## 0.2.3 - 2026-04-29

Publication-readiness cleanup for UMG Envoy Agent.

### Changed

- Updated README and release-facing documentation to remove stale release-candidate framing.
- Clarified UMG Envoy Agent as an OpenClaw-facing bridge for UMG sleeves, artifact resolution, canonical IR generation, compiler execution, and runtime output inspection.
- Added clearer terminology for UMG, Envoy, Sleeve, MOLT, Canonical IR, Runtime Spec, Trace, Diagnostics, and Relation Matrix.
- Improved fresh-tester guidance for understanding what ships, what does not ship, and which validation commands are maintainer-only.
- Clarified that the E2E validation script is a repo-maintainer validation gate rather than a normal packaged runtime surface.

### Package Hygiene

- Reviewed package file inclusion rules for ClawHub-first publication.
- Kept maintainer-only validation surfaces out of the published package.
- Removed unnecessary package-surface noise where appropriate.

### Publication Status

- ClawHub publication remains intentionally separate from this patch until final re-audit and explicit publish authorization.

## 0.2.1 - 2026-04-26

### Fixed

- Added required ClawHub config schema declaration for code plugin publication.
- No functional compiler/runtime changes from 0.2.0.

## 0.2.0 - 2026-04-26

- Commit: `a7b8e76`
- Branch: `release/umg-envoy-agent-0.2.0`
- Tag: `v0.2.0`

### Summary

UMG Envoy Agent 0.2.0 upgrades the public plugin from a path/planner-focused package into a public-safe compiler-backed OpenClaw plugin.

### Added

- bundled public compiler adapter
- bounded public sleeve compilation into RuntimeSpec output
- runtime output validation and diagnostics surfaces
- trace and relation matrix support surfaces
- public-safe runtime-facing plugin registration
