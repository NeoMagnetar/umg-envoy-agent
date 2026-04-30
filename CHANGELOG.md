# Changelog

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
- bundled public sample sleeves
- bundled public sample blocks
- runtime validation
- sleeve compilation
- compiler smoke test
- compiler matrix/status reporting
- `public-content/` folder
- compiler contract docs
- public content model docs

### Changed

- upgraded package and manifest version to `0.2.0`
- simplified public documentation
- aligned tool surface with compiler-backed behavior
- preserved path/planner utilities

### Removed

- legacy public sleeve builder files
- stale 0.1.2-era docs
- legacy package leftovers
- contaminated nested output structures

### Validation

- `npm install` passed
- `npm run check` passed
- `npm run build` passed
- `npm run smoke` passed
- `npm run pack:dry` passed
- pack output clean: 49 files, 12.8 kB package, 51.1 kB unpacked

### Safety

- no `node_modules` in package output
- no `dist/dist`
- no `dist/src`
- no `docs/docs`
- no private runtime roots
- no personal absolute path config
- no dirty workspace release

### Known Scope

- public-safe bundled compiler adapter
- not full private personal runtime
- runtime mutation remains disabled by default
