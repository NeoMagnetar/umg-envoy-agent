# Alpha9 Version / Package / Publication Stage Package

## 1. Purpose

This lane stages a local package artifact for `umg-envoy-agent@0.3.0-alpha.13` and verifies its contents without publishing it.

## 2. Baseline

Baseline commit:
- `731a6f748af75d5532ae0d52789c90d93ad76339`

## 3. Version

- `0.3.0-alpha.13`

## 4. Stage Root

Stage root:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13`

## 5. Pack Command

Pack command used:
- `npm pack --pack-destination C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13`

## 6. Artifact Path

Artifact path:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13\umg-envoy-agent-0.3.0-alpha.13.tgz`

## 7. Artifact SHA256

Artifact SHA256:
- `TBD_FROM_STAGE_FIXTURE`

## 8. Package Metadata Verification

Verified from extracted package:
- `package.json` version = `0.3.0-alpha.13`
- `openclaw.plugin.json` version = `0.3.0-alpha.13`
- `README.md` present
- `dist/plugin-entry.js` present
- `dist/ui/ControlledActionRuntimeReportDashboard.js` present

## 9. Package Content Audit

Content audit passed.

Required package metadata present:
- `package/package.json`
- `package/openclaw.plugin.json`
- `package/README.md`

Required runtime-report dist files present:
- `package/dist/plugin-entry.js`
- `package/dist/controlled-action-runtime-report-integration.js`
- `package/dist/controlled-action-runtime-report-tool-surface.js`
- `package/dist/controlled-action-runtime-report-plugin-owned-access.js`

Required UI render-model dist files present:
- `package/dist/ui/ControlledActionRuntimeReportDashboard.js`
- `package/dist/ui/runtime-report-status-model.js`
- `package/dist/ui/runtime-report-view-model.js`
- `package/dist/ui/runtime-report-demo-data.js`
- `package/dist/ui/runtime-report-components.js`

## 10. Forbidden File Audit

Forbidden package contents were excluded:
- `node_modules/`
- `.env`
- `artifacts/`
- `../../../artifacts/`
- installed plugin copies
- `.tgz` inside the package
- backup folders

## 11. Public Claim Boundaries

Allowed claim posture remains:
- read-only controlled-action runtime report
- plugin-owned access surface
- local verification artifacts
- demo/preview/UI render-model materials

Still disallowed:
- live CLI invocation proven
- generic `plugin.tools.call` protocol implemented
- live mounted UI
- execution enabled
- approval-gated writes enabled
- bridge actions enabled

## 12. Known Caveat

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

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
- no `.tgz` committed

## 14. Recommended Next Lane

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_LOCAL_PACKAGE_INSTALL_VERIFY_SOURCE`
