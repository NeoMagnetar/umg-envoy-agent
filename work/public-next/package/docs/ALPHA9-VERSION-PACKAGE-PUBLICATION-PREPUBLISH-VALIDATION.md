# Alpha9 Version / Package / Publication Prepublish Validation

## 1. Purpose

This lane validates the aligned `0.3.0-alpha.13` package before any staging, npm publish, ClawHub publish, release tag, or GitHub release.

## 2. Baseline

Baseline commit:
- `ca46f5b178fbbd856e9f0d44f4ff5d62dc78e01d`

Current version:
- `0.3.0-alpha.13`

Feature set:
- `controlled_action_runtime_report_plugin_owned_access_ui_model`

## 3. Version Confirmation

Confirmed:
- `package.json` version = `0.3.0-alpha.13`
- `openclaw.plugin.json` version = `0.3.0-alpha.13`

## 4. Metadata Confirmation

Confirmed:
- README/public summary aligned to the controlled-action runtime report + plugin-owned access + TypeScript UI render-model story
- no unsafe public claims found in current package/manfiest/README surfaces
- no stale current-version metadata remained in package/manfiest surfaces

## 5. Validation Commands Run

Commands run:
- `npm run build`
- `npm run validate:alpha-current`
- `node scripts/alpha9-version-package-publication-alignment-apply-smoke.mjs`
- `node scripts/alpha9-version-package-publication-alignment-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-release-readiness-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-ui-component-preview-packet-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-ui-component-demo-render-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-ui-component-implementation-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-local-install-verify-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-implementation-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-tool-surface-implementation-smoke.mjs`
- `node scripts/alpha9-controlled-action-runtime-report-integration-smoke.mjs`
- `npm pack --dry-run`
- `npm pack --json --dry-run`

## 6. Dry Pack Result

Dry pack result:
- command: `npm pack --dry-run` / `npm pack --json --dry-run`
- passed: yes
- package name: `umg-envoy-agent`
- package version: `0.3.0-alpha.13`
- file count: validated from npm pack inventory
- unpacked size: validated from npm pack inventory
- tarball name preview: provided by npm dry run
- `.tgz created`: no
- `.tgz committed`: no

## 7. Package Content Audit

Package content audit status:
- pass

Confirmed present:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `dist/plugin-entry.js`
- `dist/controlled-action-runtime-report-integration.js`
- `dist/controlled-action-runtime-report-tool-surface.js`
- `dist/controlled-action-runtime-report-plugin-owned-access.js`
- `dist/ui/ControlledActionRuntimeReportDashboard.js`
- `dist/ui/runtime-report-status-model.js`
- `dist/ui/runtime-report-view-model.js`
- `dist/ui/runtime-report-demo-data.js`
- `dist/ui/runtime-report-components.js`

Noted packaging behavior:
- `docs/`, `fixtures/`, and `schemas/` are included
- `scripts/` were not included in the current package output
- this is acceptable for prepublish validation as long as it is intentional

## 8. Required Files Confirmed

Required package materials confirmed:
- package metadata present
- plugin manifest present
- README present
- required dist runtime report files present
- required dist UI render-model files present

## 9. Forbidden Files Excluded

Forbidden package inclusions confirmed absent:
- `node_modules/`
- `.env`
- `artifacts/`
- `../../../artifacts/`
- local installed plugin copies
- `.tgz` package artifacts

## 10. Public Claim Audit

Safe public description remains:
- read-only controlled-action runtime report visibility
- plugin-owned access surface
- local install verification artifacts
- user-facing examples
- demo/preview packets
- TypeScript UI render-model

Must still not claim:
- live CLI invocation proven
- generic OpenClaw `plugin.tools.call` protocol implemented
- OpenClaw core patch implemented
- live mounted UI
- action execution enabled
- approval-gated writes enabled
- bridge actions enabled
- direct_source enabled
- automatic takeover enabled

## 11. Known Caveats

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

## 12. Publish Blockers, If Any

Current blockers:
- none for prepublish validation

Caveat to preserve before any public release action:
- do not overstate CLI/live-UI proof

## 13. Boundaries Preserved

- no package publish
- no ClawHub publish
- no release tag
- no runtime mutation
- no installed plugin changes
- no gateway restart
- no live tool call
- no execution
- no approval
- no live recording
- no external transmission

## 14. Recommended Next Lane

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_STAGE_PACKAGE_SOURCE`
