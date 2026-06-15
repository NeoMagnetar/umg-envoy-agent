# CI Gate Automation Plan — 0.3.0-alpha.15

## 1. Purpose

This document defines the docs-only CI and gate-automation plan for `umg-envoy-agent` `0.3.0-alpha.15`.

Its purpose is to protect the current verified green state without changing source, manifests, runtime state, release state, or publication state.

This plan does **not** implement CI yet. It specifies what future CI should protect.

## 2. Current Verified Gate Truth

Current verified alpha.15 truth to preserve:

- `package.json` version: `0.3.0-alpha.15`
- `openclaw.plugin.json` version: `0.3.0-alpha.15`
- README identifies the repo line as `v0.3.0-alpha.15`
- `npm run check = tsc --noEmit`
- `npm run build = tsc`
- `npm pack --dry-run` passes
- governance tests recorded `119` assertions and `0` failures`
- no ESLint/pnpm/`no-shadow` blocker exists in the public `umg-envoy-agent` repo
- `src/infra/state-migrations.ts` does not exist in this repo
- `umg_envoy_load_sleeve` remains source-present but not part of the alpha.15 manifest-declared public surface
- low-risk direct runner remains a six-tool bounded adapter
- `ToolResult` remains the only execution-truth artifact

## 3. Required CI Gates

Future CI should include at minimum these required gates:

1. **Install gate**
   - clean install on supported Node version
   - fail on dependency or lock-resolution breakage

2. **Type-check gate**
   - run `npm run check`
   - protects TypeScript no-emit health

3. **Build gate**
   - run `npm run build`
   - protects distributable compile health

4. **Package dry-run gate**
   - run `npm pack --dry-run`
   - protects packability and package-surface coherence

5. **Governance test gate**
   - run the repo’s governance and boundary test suites
   - protects execution-boundary semantics

6. **Docs consistency gate**
   - enforce version alignment and public-surface wording consistency

7. **Surface integrity gate**
   - ensure manifest/tool-surface/doc boundaries do not drift silently

## 4. Governance Test Gates

CI should explicitly protect the rule:

**ToolResult is the only execution-truth artifact.**

The governance gate bundle should protect these invariants:

- RuntimeSpec is not permission
- Trace is not permission
- diagnostics are not permission
- preview/dry-run/approval are not execution
- ActionGate is not execution
- ToolCapabilityRegistry is not execution
- known capability is not authorized capability
- low-risk direct runner is narrow and not arbitrary execution
- `umg_envoy_load_sleeve` remains excluded from the low-risk direct runner

Recommended CI test command set, based on current `package.json` scripts:

- `npm run test:runtime-spec-boundary`
- `npm run test:trace-boundary`
- `npm run test:action-gate-types`
- `npm run test:tool-capability-registry`
- `npm run test:action-gate-preview-dry-run`
- `npm run test:low-risk-allowlisted-tool-flow`
- `npm run test:approval-gated-write-tool-flow`
- `npm run test:tool-result-audit-record`
- `npm run test:action-gate-runtime-report-surface`
- `npm run test:action-gate-runtime-report-tool-surface`
- `npm run test:tool-capability-registry-seed`
- `npm run test:tool-manifest-alignment`
- `npm run test:low-risk-direct-execution-adapter`
- `npm run test:low-risk-direct-runtime-tool-surface`

## 5. Package / Archive Gates

CI should verify package/archive truth for alpha.15:

- `npm pack --dry-run` succeeds
- the package includes the intended public files
- the package excludes non-shipping or repo-private artifacts
- package/manifest/README version alignment remains intact

Future CI should add a simple release-truth consistency script or equivalent check for:

- `package.json` version
- `openclaw.plugin.json` version
- README current-version string

CI should fail if those diverge.

## 6. Documentation Consistency Gates

CI should enforce public-document consistency, at minimum:

1. **Manifest vs docs/TOOL-SURFACE consistency**
   - declared tool ids in `openclaw.plugin.json` must match the manifest-aligned public tool list in `docs/TOOL-SURFACE.md`

2. **Version-framing consistency**
   - current public docs should not reintroduce stale current-version framing such as:
     - `v0.2.2`
     - `v0.2.3`
     - `0.2.2`
     - `0.2.3`
     - `Stage 14D`
     - `this patch` as a stale current-lane reference

3. **Load-sleeve classification consistency**
   - docs must continue to classify `umg_envoy_load_sleeve` as source-present but not part of the alpha.15 manifest-declared public surface

4. **Execution-boundary wording consistency**
   - docs must not blur RuntimeSpec / Trace / diagnostics / preview / dry-run / approval / ActionGate / ToolCapabilityRegistry into execution claims

5. **Phantom blocker guard**
   - no accidental `src/infra/state-migrations.ts` phantom blocker should be reintroduced into UMG Envoy tracking
   - CI should fail if repo docs or release-truth automation incorrectly frame that OpenClaw/core path as a repo-local `umg-envoy-agent` blocker

## 7. Explicitly Excluded From CI For Now

CI should **not** run these by default yet:

- live OpenClaw host CLI validation
- ClawHub publication
- release commands
- local private repo integration
- MCP/Hermes runtime integration
- NeoUO/private downstream tests
- smoke tests that might start a server or require host runtime state
- maintainer-only `validate:umg:e2e` flows that depend on local adjacent private/public repo layout
- installed-runtime mutation or installed-plugin mutation

These remain separate future lanes because they are environment-dependent, publication-dependent, or outside the bounded public repo truth for alpha.15.

## 8. Proposed Workflow Shape

Do not create this yet, but a future minimal workflow should look like:

- `.github/workflows/ci.yml`

Suggested job layout:

1. `install`
   - checkout repo
   - setup Node
   - run `npm install`

2. `check`
   - run `npm run check`

3. `build`
   - run `npm run build`

4. `governance-tests`
   - run the governance and boundary script set from `package.json`

5. `pack-dry-run`
   - run `npm pack --dry-run`

6. `docs-consistency`
   - run lightweight scripted checks for:
     - version alignment
     - manifest vs `docs/TOOL-SURFACE.md` consistency
     - stale version-string detection
     - `umg_envoy_load_sleeve` classification wording
     - phantom `state-migrations.ts` blocker contamination

Recommended sequencing:
- install → check → build → governance-tests → pack-dry-run → docs-consistency

## 9. Failure Meaning

A failing CI gate should be interpreted narrowly:

- **check failed** → TypeScript contract drift or compile-safety regression
- **build failed** → distributable compile regression
- **governance test failed** → boundary contract regression, execution-semantics drift, or low-risk runner policy drift
- **pack dry-run failed** → packaging/archive regression
- **docs consistency failed** → public-truth drift, stale version framing, or surface-classification mismatch
- **phantom blocker guard failed** → OpenClaw/core tracking contamination was reintroduced into `umg-envoy-agent` repo truth

A CI failure should not be interpreted as publication failure, live host failure, or ClawHub failure unless a later dedicated lane adds those gates explicitly.

## 10. Acceptance Criteria

A future CI implementation should be considered acceptable when all of the following are true:

- `npm run check` passes in CI
- `npm run build` passes in CI
- governance test suite passes in CI
- `npm pack --dry-run` passes in CI
- package/manifest/README version alignment check passes
- manifest vs `docs/TOOL-SURFACE.md` consistency check passes
- stale current-version string scan passes
- `umg_envoy_load_sleeve` non-manifest public-surface classification check passes
- no `src/infra/state-migrations.ts` phantom blocker contamination appears in repo-truth checks
- no live-host, publication, or private-repo assumptions are required for default CI green state

## 11. Future CI Implementation Lane

Recommended next implementation lane:

- create a minimal GitHub Actions workflow at `.github/workflows/ci.yml`
- keep first implementation conservative
- use only repo-local checks already proven by alpha.15 release truth
- avoid host-runtime, publication, or private-adjacent dependencies in the first CI lane
