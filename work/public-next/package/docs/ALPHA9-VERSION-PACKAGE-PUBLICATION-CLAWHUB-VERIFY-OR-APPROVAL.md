# ALPHA9 Version Package Publication ClawHub Verify Or Approval
Date: 2026-05-24
Workspace: `C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`
Baseline commit: `19b4eb4d0d3c9972efff9563f13ead0f7b96612d`

## Purpose

Diagnose whether the public ClawHub listing for `umg-envoy-agent` is automatically synced from npm, stale/cached, or governed by a separate ClawHub package publish flow.

## Boundaries preserved

- no npm republish
- no ClawHub publish
- no release tag
- no GitHub release
- no runtime mutation
- no installed plugin modification
- no gateway restart
- no live tool call

## Checks run

### 1) npm registry checks
Commands requested:

- `npm view umg-envoy-agent@0.3.0-alpha.13 version`
- `npm view umg-envoy-agent versions --json`
- `npm view umg-envoy-agent@0.3.0-alpha.13 description`
- `npm view umg-envoy-agent@0.3.0-alpha.13 dist.tarball`
- `npm view umg-envoy-agent@0.3.0-alpha.13 repository`
- `npm view umg-envoy-agent@0.3.0-alpha.13 readme --json`

Observed result from current environment:

- npm returned `E404 Not Found - GET https://registry.npmjs.org/umg-envoy-agent`
- therefore current live npm verification from this lane is **not** confirming the prior publish claim
- this does **not** justify republishing npm from this lane
- this lane remains focused on source-of-truth diagnosis for ClawHub listing behavior

### 2) Local repo metadata inspection

Observed local source state:

- `package.json` version: `0.3.0-alpha.13`
- `openclaw.plugin.json` version: `0.3.0-alpha.13`
- `README.md` heading: `# UMG Envoy Agent 0.3.0-alpha.13`
- README public story is aligned to alpha.13 source state

### 3) ClawHub public page inspection

Read-only fetch of:

- `https://clawhub.ai/plugins/umg-envoy-agent`

Observed public page content:

- displayed heading: `UMG Envoy Agent 0.3.0-alpha.12`
- README/body content still describes alpha.12
- install section still references older public release text

This confirms the user-visible ClawHub page is stale relative to local alpha.13 repo state.

### 4) ClawHub CLI package inspection

Command:

- `clawhub package inspect umg-envoy-agent`

Observed package metadata:

- package found in ClawHub package registry
- latest version reported: `0.3.0-alpha.12`
- `Updated: 2026-05-22T15:13:33.884Z`
- summary still matches alpha.12-era package story
- source commit shown was older than current baseline flow

This strongly indicates ClawHub package metadata is **not** automatically showing alpha.13 from the current source lane.

### 5) ClawHub publish-flow inspection

Observed CLI capabilities:

- `clawhub package inspect <name>` exists
- `clawhub package publish <path>` exists

This is evidence of a **separate ClawHub package publish flow** for plugins/packages.

The installed skill guidance also documents package publish explicitly:

- `clawhub package publish ./my-plugin --family code-plugin --name my-plugin --display-name "My Plugin" --version 1.0.0 --changelog "Initial release"`

## Findings

### npmVersion
- `unknown_from_current_check`

Reason:
- direct npm view commands returned 404 from this lane, so the registry claim could not be re-verified here

### clawHubDisplayedVersion
- `0.3.0-alpha.12`

### clawHubReadmeVersion
- `0.3.0-alpha.12`

### clawHubCurrentVersion
- `0.3.0-alpha.12`

### separateClawHubPublishCommandFound
- `true`

### clawHubLikelyCached
- `false`

Reason:
- the CLI package inspect path itself reports latest=`0.3.0-alpha.12`, which points more strongly to a separate package-publication state than to simple site-cache lag alone

### clawHubPublishRequired
- `true`

Reason:
- ClawHub exposes an explicit package publish command
- ClawHub inspect still reports alpha.12 as latest
- public page still renders alpha.12 README/content
- therefore ClawHub appears to require its own publish/update flow for this package listing

## Conclusion

Verdict:
- ClawHub is currently showing an older published package state (`0.3.0-alpha.12`)
- local source is aligned to `0.3.0-alpha.13`
- evidence supports **separate ClawHub package publication** rather than automatic adoption of the latest local/npm-adjacent state

Direct live CLI invocation proof remains:
- `liveCallProof=not_available_from_current_cli_surface`

## Final status

- `status=clawhub_mismatch_detected`
- `recommendedNextLane=ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_PUBLISH_APPROVAL_SOURCE`

## Suggested next step

If the user wants the ClawHub page itself updated, the next lane should be:

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_PUBLISH_APPROVAL_SOURCE`

That lane should:
- request explicit approval for ClawHub package publish
- publish through the ClawHub package flow, not npm republish
- verify post-publish that ClawHub inspect and public page both move to alpha.13