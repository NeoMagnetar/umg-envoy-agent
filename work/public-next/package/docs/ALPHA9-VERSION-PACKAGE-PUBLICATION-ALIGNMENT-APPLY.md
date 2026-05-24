# Alpha9 Version / Package / Publication Alignment Apply

## 1. Purpose

This lane applies the version/package/publication metadata alignment identified by the previous audit.

## 2. Baseline Alignment Audit

Baseline commit:
- `1a0367bf2cad52f73dc8f8bb5fb2c8d5368d8c27`

Previous lane status:
- `alignment_audit_ready`

## 3. Version Transition

- `previousVersion=0.3.0-alpha.12`
- `appliedVersion=0.3.0-alpha.13`

Current feature set:
- `controlled_action_runtime_report_plugin_owned_access_ui_model`

## 4. Files Updated

Updated files:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `dist/*` as rebuilt outputs

Added files:
- `docs/ALPHA9-VERSION-PACKAGE-PUBLICATION-ALIGNMENT-APPLY.md`
- `fixtures/action-gates/alpha9-version-package-publication-alignment-apply-v1.json`
- `scripts/alpha9-version-package-publication-alignment-apply-smoke.mjs`

## 5. Metadata Surfaces Aligned

Aligned surfaces:
- package version
- plugin manifest version
- current README/public summary wording
- rebuild outputs after metadata change

Historical lane/history docs were preserved where they are clearly historical evidence.

## 6. README / Public Wording Update

README/public wording now describes:
- UMG Envoy Agent as a modular cognitive architectural runtime inside OpenClaw
- read-only controlled-action runtime report visibility
- plugin-owned access surface
- local install verification artifacts
- user-facing examples and demo/preview packets
- TypeScript UI render-model preview
- explicit non-execution boundary

## 7. Validation / Version Expectation Updates

Current package/manfiest version now aligns to:
- `0.3.0-alpha.13`

Validation continues to pass after rebuild and did not require broad historical fixture rewriting.

## 8. Dist / Build Verification

- `npm run build`: PASS
- rebuilt dist outputs reflect current source/package state
- no publish/package release action performed

## 9. Public Allowed Claims

Allowed claims retained:
- read-only controlled-action runtime report source implemented
- plugin-owned access surface implemented
- local installed plugin file verification completed
- user-facing examples included
- demo packet included
- TypeScript UI render-model implemented
- UI preview packet included
- safety flags preserve non-execution / non-approval / non-recording posture

## 10. Public Disallowed Claims

Disallowed claims preserved:
- live CLI invocation proven
- generic OpenClaw plugin tool call protocol implemented
- live mounted UI
- execution tools enabled
- approval-gated writes enabled
- bridge actions enabled
- direct_source enabled
- automatic takeover enabled

## 11. Remaining Publish Prerequisites

Remaining prepublish prerequisites:
- final prepublish validation pass
- staging/package metadata sanity check
- confirm public description surfaces stay within allowed claims
- review any release-note/changelog packaging if needed

## 12. Boundaries Preserved

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

## 13. Recommended Next Lane

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_PREPUBLISH_VALIDATION_SOURCE`
