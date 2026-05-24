# Alpha9 Version / Package / Publication Local Package Install Verify

## 1. Purpose

This lane verifies that the staged `umg-envoy-agent@0.3.0-alpha.13` package artifact can be locally installed/promoted and that the installed plugin metadata/files match alpha.13.

## 2. Baseline Staged Package

Baseline commit:
- `f6ed2963538fa9db8f82406527d41722c62e1738`

Staged artifact:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13\umg-envoy-agent-0.3.0-alpha.13.tgz`

## 3. Artifact Hash Verification

Verified:
- expected SHA256 = `C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502`
- actual SHA256 = `C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502`
- hash match = true

## 4. Installed Plugin Backup

Backup created before local install/promote.

## 5. Local Install / Promote Method

Chosen install method:
- manual extract promote

Method used:
- extract staged `.tgz` to temp folder
- copy extracted `package/*` contents into installed plugin path

Installed plugin path:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## 6. Installed Metadata Verification

Installed metadata verified:
- `package.json` version = `0.3.0-alpha.13`
- `openclaw.plugin.json` version = `0.3.0-alpha.13`

## 7. Installed Dist File Verification

Verified present:
- `dist/plugin-entry.js`
- `dist/controlled-action-runtime-report-plugin-owned-access.js`
- `dist/ui/ControlledActionRuntimeReportDashboard.js`

## 8. Gateway / Plugin List Verification

Local gateway was restarted for verification.

Primary proof remains installed file metadata.
Plugin listing/status was checked where available after restart.

## 9. Source Validation After Install

Post-install source validation:
- `npm run build`: PASS
- `npm run validate:alpha-current`: PASS
- `node scripts/alpha9-version-package-publication-stage-package-smoke.mjs`: PASS
- `node scripts/alpha9-version-package-publication-prepublish-validation-smoke.mjs`: PASS

## 10. Known Caveat

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

## 11. Boundaries Preserved

- no package publish
- no ClawHub publish
- no release tag
- no OpenClaw core patch
- no live tool call
- no execution
- no approval
- no live recording
- no `.tgz` committed

## 12. Recommended Next Lane

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_PUBLISH_READINESS_SOURCE`
