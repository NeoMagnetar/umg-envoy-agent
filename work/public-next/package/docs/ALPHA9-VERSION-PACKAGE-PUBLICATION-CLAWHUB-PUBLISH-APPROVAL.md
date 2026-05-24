# ALPHA9 Version Package Publication ClawHub Publish Approval
Date: 2026-05-24
Workspace: `C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`
Baseline commit: `d9e794b`

## Purpose

Prepare the ClawHub publish approval packet for `umg-envoy-agent@0.3.0-alpha.13`.

This lane does not publish to ClawHub. It prepares the exact ClawHub publish command and records whether explicit approval exists.

## Prior npm publish state

Prior lane artifacts reported:

- package name: `umg-envoy-agent`
- package version: `0.3.0-alpha.13`
- packagePublished=`true`
- npmRegistryVersionVerified=`true`

A later environment-local npm view check returned E404, so this lane does not use that as a reason to republish npm.

## ClawHub mismatch state

Reconfirmed during this lane:

- ClawHub public page previously observed rendering `0.3.0-alpha.12`
- `clawhub package inspect umg-envoy-agent` currently reports `Latest: 0.3.0-alpha.12`
- summary/source metadata remain on older ClawHub state than local alpha.13 source

Therefore:

- `clawHubMismatchDetected=true`
- `clawHubCurrentLatest=0.3.0-alpha.12`

## ClawHub CLI inspection

Observed locally:

- `clawhub` available: yes
- `clawhub package inspect` works: yes
- `clawhub package publish` command available: yes
- dry-run option shown in help: no
- authentication requirement shown in help: not explicit in `publish --help`, but CLI provides `login`, `logout`, `whoami`, and `auth` commands, so authenticated publish should be assumed necessary

Exact help-derived publish syntax:

`clawhub package publish [options] <path>`

Options shown:

- `--family <family>` where family is `code-plugin|bundle-plugin`
- `--name <name>`
- `--display-name <name>`
- `--version <version>`
- `--changelog <text>`
- `--tags <tags>`
- `--bundle-format <format>`
- `--host-targets <targets>`
- `--source-repo <repo>`
- `--source-commit <sha>`
- `--source-ref <ref>`
- `--source-path <path>`

## Staged artifact identity

Artifact path:

`C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13\umg-envoy-agent-0.3.0-alpha.13.tgz`

Artifact verification:

- artifact exists: `true`
- expected SHA256: `C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502`
- actual SHA256: `C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502`
- hash match: `true`

Important CLI-path note:

- local help says `clawhub package publish` publishes from a **folder path**, not a `.tgz` path
- therefore the exact help-derived command uses the staged package folder as `<path>`
- the `.tgz` remains the approval identity artifact for hash verification

Staged package folder:

`C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13`

## Proposed ClawHub publish command

Command source: `clawhub package publish --help`

Proposed exact command:

`clawhub package publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13" --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.3.0-alpha.13 --tags latest --source-repo NeoMagnetar/umg-envoy-agent --source-commit d9e794b --source-ref alpha7/from-public-synced-alpha6 --source-path .`

Associated artifact identity:

- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13\umg-envoy-agent-0.3.0-alpha.13.tgz`
- version: `0.3.0-alpha.13`

## Approval status

- `clawHubPublishApproved=false`
- no exact approval phrase was present in the current instruction
- no publish was attempted

## Required approval phrase

`Approve ClawHub publishing umg-envoy-agent@0.3.0-alpha.13 from staged artifact SHA256 C659660742CB0DB82524C2DCEADE4C759CE2954D992743728474CB873624D502.`

If that exact approval is not present, ClawHub publish must not be executed.

## Boundaries preserved

- no ClawHub publish executed
- no npm republish
- no release tag
- no GitHub release
- no runtime mutation
- no installed plugin modification
- no gateway restart
- no OpenClaw core patch
- no UMG-Block-Library modification
- no Resleever changes
- no MCP server changes
- no execution enablement
- no approval grant
- no live decision recording
- no write actions enabled
- no bridge actions enabled
- no direct_source enabled
- no automatic response takeover enabled
- no `.tgz` committed
- no `../../../artifacts/` cleanup or commit

## Recommended next lane

Because approval is not recorded in this lane, recommended next lane remains:

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_PUBLISH_APPROVAL_SOURCE`

If the exact approval phrase is later provided, the next lane becomes:

- `ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_EXECUTE_SOURCE`