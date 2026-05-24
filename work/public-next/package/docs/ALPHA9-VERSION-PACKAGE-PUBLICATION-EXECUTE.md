# Alpha9 Version / Package / Publication Execute

## 1. Purpose

This lane executed the approved package publication for `umg-envoy-agent@0.3.0-alpha.13` using the pre-approved staged artifact.

## 2. Approval Baseline

- baseline commit: `8d2d6d5ea0655cd463830af6f9a7ca6c451f1023`
- approval statement recorded for staged artifact SHA256 `C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502`

## 3. Approved Artifact Path

- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13\umg-envoy-agent-0.3.0-alpha.13.tgz`

## 4. Approved Artifact Hash

- `C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502`

## 5. Pre-Publish Artifact Verification

Verified immediately before publish:
- artifact exists
- SHA256 matches approved hash
- extracted `package.json` name = `umg-envoy-agent`
- extracted `package.json` version = `0.3.0-alpha.13`
- extracted `openclaw.plugin.json` version = `0.3.0-alpha.13`
- `README.md` present
- `dist/plugin-entry.js` present
- `dist/ui/ControlledActionRuntimeReportDashboard.js` present

## 6. NPM Authentication / Registry Readiness

- npm authentication: available at execution time
- registry checked before publish execution

## 7. Publish Command Executed

Command executed:
- `npm publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13\umg-envoy-agent-0.3.0-alpha.13.tgz" --access public`

## 8. Publish Result

Publish result:
- npm publish executed successfully
- package published to npm registry

## 9. Registry Verification

Registry verification confirmed:
- `npm view umg-envoy-agent@0.3.0-alpha.13 version`
- `npm view umg-envoy-agent@0.3.0-alpha.13 dist.tarball`
- `npm view umg-envoy-agent@0.3.0-alpha.13 dist.shasum`
- `npm view umg-envoy-agent@0.3.0-alpha.13 dist.integrity`

## 10. ClawHub Status

ClawHub status:
- no separate ClawHub publish command was executed in this lane
- ClawHub remains `not_verified_or_separate_flow`

## 11. Known Caveat

Direct live CLI invocation proof remains:
- `not_available_from_current_cli_surface`

## 12. Boundaries Preserved

- no release tag
- no GitHub release
- no runtime mutation
- no installed plugin changes in this lane
- no gateway restart in this lane
- no live tool call
- no execution
- no approval
- no live recording

## 13. Recommended Next Lane

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_POST_PUBLISH_VERIFY_SOURCE`
