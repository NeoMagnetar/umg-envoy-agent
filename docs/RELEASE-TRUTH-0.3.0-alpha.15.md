# Release Truth — UMG Envoy Agent 0.3.0-alpha.15

## Scope

This document records repo-scoped release truth for `umg-envoy-agent` version `0.3.0-alpha.15` at:

- HEAD: `b88341c77201014faf0d12671ffbb962d08a58d1`
- Repo: `C:\.openclaw\workspace\umg-envoy-agent-release-clean`

It is intentionally limited to evidence available in this repository and the referenced Fable-class audit baseline. It does **not** claim live OpenClaw host readiness, live CLI readiness, ClawHub publication, or installed-runtime validation.

## Confirmed release facts

### Version

Confirmed version for this repo line:

- `package.json` version: `0.3.0-alpha.15`
- `openclaw.plugin.json` version: `0.3.0-alpha.15`

### Package / manifest / README alignment

The package metadata and manifest version align at `0.3.0-alpha.15`.

The README also identifies this line as `v0.3.0-alpha.15` and describes the current package as the alpha.15 repo state.

This alignment statement is limited to the release/version line and current package identity. It does **not** imply that every README capability statement is fully validated for live host execution.

### Build/check script truth

Confirmed script bindings in this repo:

- `npm run check` = `tsc --noEmit`
- `npm run build` = `tsc`
- `npm run pack:dry` = `npm pack --dry-run`

### Validation truth recorded for this repo line

The following evidence is carried forward for `0.3.0-alpha.15`:

- `npm run check` passes as the TypeScript no-emit check for this repo lane.
- `npm run build` passes as the TypeScript build for this repo lane.
- `npm pack --dry-run` passes for this repo lane.
- governance tests recorded `119` assertions and `0` failures.

### Lint / no-shadow truth

There is no ESLint / pnpm / `no-shadow` blocker in this repository release lane.

Specifically:

- `src/infra/state-migrations.ts` does **not** exist in this repository.
- the previously discussed `no-shadow` blocker at `src/infra/state-migrations.ts:1985:9` belongs to parent OpenClaw/core validation work, not to `umg-envoy-agent`.
- this repo should not be described as failing on that core-path blocker.

## Separation of truths

This repository truth document is intentionally narrower than OpenClaw-core truth.

It confirms repo-scoped package facts for `umg-envoy-agent` `0.3.0-alpha.15`, but it does **not** claim any of the following:

- ClawHub publication is complete
- npm publication is complete
- live OpenClaw CLI help/readiness is proven
- installed OpenClaw runtime mutation or validation was performed
- installed plugin validation was performed on a live host

## Unresolved items carried forward

The following issues remain open and should continue to be stated honestly:

- `README.md` still overclaims some live/staged capabilities relative to what is proven here.
- `PUBLIC-VARIANT-OVERVIEW.md` is stale.
- `load_sleeve` is registered in source but absent from the manifest.
- no CI exists for this repo line.
- live OpenClaw host status and ClawHub/publication status remain separate questions and are not proven by this document.

## Evidence posture

This document is additive documentation only. It does not modify code, versions, manifests, packaging metadata, or publication state.
