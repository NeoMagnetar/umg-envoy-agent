# ALPHA9 Public Listing Tag Refresh
Date: 2026-05-24
Workspace: `C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`

## Purpose

Investigate whether ClawHub public tag/version drift can be refreshed or simplified without changing runtime behavior or bumping package version.

## Findings

### Primary listing state is correct

Verified live package state:
- current version = `0.3.0-alpha.13`
- latest tag = `0.3.0-alpha.13`
- source commit = `f696fda`
- scan = `clean`

### Tag/version drift remains visible

Current ClawHub inspect output still shows non-latest tag lineage such as:
- `agent-framework=0.2.8`
- `cognition=0.1.2`
- `runtime-spec=0.2.8`
- `openclaw=0.2.8`
- `inspectable=0.1.2`

### Source-controlled tag declaration not found

Inspected:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- metadata alignment lane artifacts

Observed:
- no `keywords` field in `package.json`
- no obvious public tag list in `openclaw.plugin.json`
- no repo-local metadata file in the inspected package root that explains the current ClawHub tag lineage display

### ClawHub CLI capability check

Observed CLI support:
- `clawhub package inspect`
- `clawhub package publish`

Observed missing CLI support:
- no metadata-only tag refresh command surfaced in help
- no tag reassociation or tag cleanup command surfaced in help
- `publish` supports `--tags <tags>` but that appears to govern publish-time tag assignment, not historical tag-version cleanup

## Root-cause classification

Most likely classification:
- `clawhub_historical_tag_lineage_or_registry_association`

Interpretation:
- the stale-looking tag versions appear to be ClawHub-side registry/search metadata lineage
- they do **not** indicate that the live package version is still on `0.2.8` or `0.1.2`
- current public package/version alignment is already correct on alpha.13

## Metadata-only refresh support

Current result:
- `metadataOnlyTagRefreshSupported=false_from_visible_cli_surface`

No supported metadata-only refresh mechanism was found in the current local ClawHub CLI help surface.

## Recommendation

Do **not** bump to alpha.14 for this alone.

Do **not** publish npm again.

Do **not** create a GitHub release or repo tag.

Treat this as a public UX limitation unless one of the following becomes available:
1. a documented ClawHub metadata/tag refresh operation
2. a publish-time tag override flow confirmed to replace historical lineage display
3. direct maintainer guidance that tags can be compacted or re-associated without version bump

## Proposed reduced public tag set

If ClawHub later exposes editable source-controlled tag metadata, use a reduced set:
- `umg`
- `openclaw`
- `cognitive-runtime`
- `modular-ai`
- `runtime-spec`
- `read-only`
- `controlled-action`
- `inspectable`
- `agent-framework`
- `code-plugin`

## Final recommendation before Alpha10

Alpha9 public listing cleanup is sufficiently complete for now:
- package version aligned
- latest tag aligned
- README aligned
- metadata wording aligned
- remaining issue classified as likely ClawHub historical tag behavior

Recommended next lane:
- `ALPHA10_READ_ONLY_INTEGRATION_FOUNDATION_PLAN`