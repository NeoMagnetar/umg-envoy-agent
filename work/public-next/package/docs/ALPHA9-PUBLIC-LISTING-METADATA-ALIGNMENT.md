# ALPHA9 Public Listing Metadata Alignment
Date: 2026-05-24
Workspace: `C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`

## Purpose

Clean the public ClawHub listing metadata for alpha.13 without changing runtime behavior.

## Verified baseline

- `package.json` version = `0.3.0-alpha.13`
- `openclaw.plugin.json` version = `0.3.0-alpha.13`
- ClawHub current version = `0.3.0-alpha.13`
- ClawHub latest tag = `0.3.0-alpha.13`
- public page renders alpha.13 README content

## Public listing issues addressed

### README summary tightened

The public README was reduced from a release-ledger-heavy feature dump to a more readable public summary.

### Safer wording around read-only capability

Replaced confusing public wording around "approved allowlisted read-only execution" with clearer validation/inspection language in the summary section.

### Install wording corrected

Changed:
- `next source/package target`

To:
- `current package target`

### Release ledger path corrected

Changed:
- `../RELEASE_LEDGER.md`

To:
- `RELEASE_LEDGER.md`

## Remaining public issue

Tag/version drift may still remain on the ClawHub UI for non-latest discovery tags.

This lane did not change tag registry associations directly. It aligned the public README/metadata wording and confirmed the primary release version is on alpha.13.

## Boundaries preserved

- no source/runtime behavior changes
- no package version changes
- no plugin manifest version changes
- no dist/runtime code changes
- no installed plugin changes
- no npm republish
- no ClawHub publish in this lane
- no release tag
- no GitHub release

## Recommended next lane

If ClawHub supports tag refresh or simplified tag reassociation:
- `ALPHA9_PUBLIC_LISTING_TAG_REFRESH_SOURCE`

Otherwise continue into planning:
- `ALPHA10_READ_ONLY_INTEGRATION_FOUNDATION_PLAN`