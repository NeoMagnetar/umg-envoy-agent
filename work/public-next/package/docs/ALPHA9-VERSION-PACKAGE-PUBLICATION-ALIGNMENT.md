# Alpha9 Version / Package / Publication Alignment

## 1. Purpose

This lane inventories and audits all version/package/public-facing metadata surfaces that must be aligned before the next alpha publish.

The Alpha9 version/package/publication alignment audit does not bump versions, publish packages, mutate runtime state, call live plugin tools, grant approval, record live decisions, execute actions, write files outside this repo artifact, transmit data externally, modify installed plugin files, or restart OpenClaw. It inventories alignment requirements for the next apply lane only.

## 2. Current Release-Readiness Baseline

Baseline commit:
- `474c11a219dd65b4cdc5bc1d95d0fd3d57e4e5f1`

Previous status:
- `release_alignment_ready`

Feature set:
- controlled-action runtime report
- plugin-owned access surface
- local install verification
- TypeScript UI render-model
- demo / preview / handoff packet chain

## 3. Current Version State

Current package version:
- `0.3.0-alpha.12`

Recommended next version:
- `0.3.0-alpha.13`

Current branch:
- `alpha7/from-public-synced-alpha6`

## 4. Why Version Confusion Exists

Version confusion exists because the package/story now spans:
- Alpha7 branch naming
- Alpha9 feature-lane naming
- current package version `0.3.0-alpha.12`
- recommended next publish `0.3.0-alpha.13`
- historical references to earlier alpha lanes across docs/scripts/fixtures

Without alignment, a public/package view could present mixed branch/feature/version signals.

## 5. Version Surface Inventory

Version surfaces inventoried:
- `package.json`
- `openclaw.plugin.json`
- `README.md` if present
- docs tree
- dist tree
- validation scripts
- fixtures
- package staging metadata
- installed local plugin metadata
- ClawHub/public-facing description

Current observed package/manfiest state:
- `package.json` version: `0.3.0-alpha.12`
- `openclaw.plugin.json` version: `0.3.0-alpha.12`

Branch-name caveat:
- branch remains `alpha7/from-public-synced-alpha6`, which should not be presented as the release version story

## 6. Stale Alpha Reference Inventory

Inventory findings:
- stale references to earlier alphas exist across docs/scripts/fixtures/dist
- historical Alpha6 / Alpha7 / Alpha8 / Alpha9 references remain in repo artifacts for traceability and test coverage
- those references are not automatically wrong, but public/package-facing surfaces must not read as if multiple alpha versions are simultaneously current

## 7. Recommended Next Version

Recommended next version:
- `0.3.0-alpha.13`

This lane does not apply the bump.

## 8. Public Feature Summary for Next Alpha

Safe public summary for next alpha:
- read-only controlled-action runtime report source implemented
- plugin-owned runtime report access surface implemented
- local installed plugin file verification completed
- user-facing examples included
- demo packet included
- presentation handoff included
- visual UI wireframe included
- TypeScript UI render-model implemented
- UI demo render validated
- UI preview packet included
- safety flags preserve non-execution / non-approval / non-recording posture

## 9. Allowed Public Claims

Allowed public claims:
- read-only controlled-action runtime report source implemented
- plugin-owned runtime report access surface implemented
- local installed plugin file verification completed
- user-facing examples included
- demo packet included
- presentation handoff included
- visual UI wireframe included
- TypeScript UI render-model implemented
- UI demo render validated
- UI preview packet included
- safety flags preserve non-execution / non-approval / non-recording posture

## 10. Disallowed Public Claims

Disallowed public claims:
- live CLI invocation proven
- generic OpenClaw plugin tool call protocol implemented
- OpenClaw core patch implemented
- live mounted UI
- execution tools enabled
- approval-gated writes enabled
- business automation actions enabled
- bridge actions enabled
- direct_source enabled
- automatic takeover enabled

## 11. Files to Align in Next Lane

The next apply lane should reconcile:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- docs/public summary
- dist outputs
- validation scripts
- package staging metadata
- installed local plugin metadata
- ClawHub/public-facing description

## 12. Publish Readiness Prerequisites

Publish readiness prerequisites:
- version bump applied consistently
- manifest/package/docs public version surfaces aligned
- public summary wording aligned to allowed claims only
- disallowed claims removed from publish-facing surfaces
- dist rebuilt after metadata changes
- validation scripts checked for version assumptions
- staging metadata updated for alpha.13

## 13. Recommended Next Lane

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_ALIGNMENT_APPLY_SOURCE`
