# ALPHA9 Version Package Publication ClawHub Publish Path Fix
Date: 2026-05-24
Workspace: `C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`

## Purpose

Determine why the approved ClawHub publish attempt failed and identify the correct publishable path for the ClawHub CLI.

## Failed execute-lane finding

The approved publish attempt used:

`clawhub package publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13" ...`

Observed result:

- ClawHub returned: `Error: package.json required`
- ClawHub latest remained `0.3.0-alpha.12`
- public page remained on `0.3.0-alpha.12`

## Path-shape diagnosis

### Staged folder

Path inspected:

`C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.13`

Observed:

- folder exists
- top-level package structure expected by ClawHub CLI was not present
- `package.json` was not visible at the publish target path
- staged `.tgz` identity remains valid, but the folder path itself is not directly publishable in current form

### Repo root

Path inspected:

`C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`

Observed top-level publishable structure present:

- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `dist/`
- `docs/`
- `fixtures/`
- `schemas/`
- `public-content/`

This matches the local CLI help expectation that `clawhub package publish` takes a **folder path**.

## Conclusion

The publish failure was caused by a **publish-path mismatch**, not by approval state.

The correct next publish attempt should target the actual package root folder:

`C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package`

not the broken staged folder path.

## Proposed fixed ClawHub publish command

`clawhub package publish "C:\.openclaw\workspace\worktrees\umg-envoy-alpha7\work\public-next\package" --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.3.0-alpha.13 --tags latest --source-repo NeoMagnetar/umg-envoy-agent --source-commit f696fda --source-ref alpha7/from-public-synced-alpha6 --source-path .`

## Boundaries preserved

- no npm republish
- no release tag
- no GitHub release
- no runtime mutation
- no installed plugin changes
- no gateway restart
- no OpenClaw core patch
- no UMG-Block-Library changes
- no Resleever changes
- no MCP server changes

## Recommended next lane

`ALPHA9_VERSION_PACKAGE_PUBLICATION_CLAWHUB_EXECUTE_SOURCE`