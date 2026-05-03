# TOOL-RUNTIME-29H — ClawHub Publish Flow / Peer Plugin Research Audit

## Purpose

This phase performs a non-mutating publish-flow and package-shape audit before any final approval/publish step is considered.

The goal is to compare the corrected `umg-envoy-agent` `v0.2.9` candidate against:
- current visible ClawHub CLI/package-publish expectations
- current local OpenClaw/ClawHub documentation guidance
- general peer package norms available through non-mutating package browse/inspect flows

## Current source of truth
- package: `umg-envoy-agent`
- version: `0.2.9`
- artifact: `umg-envoy-agent-0.2.9.tgz`
- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.9.tgz`
- SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`
- branch: `fix/public-envoy-surface-v0.2.9`

## Documentation and CLI audit findings

### ClawHub skill guidance
The installed OpenClaw ClawHub skill documents package publishing in this form:
- `clawhub package publish ./my-plugin --family code-plugin --name my-plugin --display-name "My Plugin" --version 1.0.0 --changelog "Initial release"`

Relevant published-package expectations implied by that guidance:
- package folder path is the publish input
- package family must be `code-plugin`
- package name/display-name/version are explicit publish parameters
- changelog text is expected
- optional source metadata may be attached (`--source-repo`, `--source-commit`, `--source-ref`, `--source-path`)

### Local ClawHub CLI help
Observed help for:
- `clawhub package --help`
- `clawhub package publish --help`

Important audit finding:
- the installed CLI help does **not** advertise a non-mutating `package publish --dry-run` or `package verify` mode in the visible help output
- because of that, this phase did not guess or improvise a mutating publish-like command

### Peer package browse research
`clawhub package explore` produced a browse list dominated by skills and at least one bundle plugin, but did not expose an obvious rich set of public code-plugin peers suitable for strong field-by-field comparison from the available non-mutating surface alone.

Interpretation:
- this audit is primarily a packaging-expectation and artifact-shape audit, not a deep code-plugin peer diff with multiple publicly inspectable comparable plugins

## Candidate package-shape findings

### Core package identity
- `package.json` name/version: `umg-envoy-agent` / `0.2.9`
- `openclaw.plugin.json` display name/version/entry present and coherent
- `openclaw.plugin.json` entry points to `dist/plugin-entry.js`

### Public artifact shape
Top-level package folder contains:
- `dist/`
- `docs/`
- `public-content/`
- `openclaw.plugin.json`
- `package.json`
- `README.md`

This aligns with a straightforward code-plugin package shape.

### Public-safe runtime boundary
The public candidate is aligned to a bundled-adapter/public-safe posture and no longer exposes the removed dangerous-exec bridge surface in the package shipped for review.

### Documentation shape
Current docs present in package folder:
- `COMPILER-CONTRACT.md`
- `RELEASE-NOTES-0.2.8.md`
- `RELEASE-NOTES-0.2.9.md`
- `validate-public-surface.ps1`

This is now more professional than the prior state because the package includes the current `0.2.9` release note and clearly historical `0.2.8` notes.

## Important package-tree hygiene note
The working folder contains audit byproduct directories:
- `_inspect_umg_0_2_9`
- `_inspect_umg_0_2_9b`
- `_inspect_umg_0_2_9c`
- `_inspect_umg_0_2_9_parity`

These are not the source-of-truth publish artifact and must not be used as publish source.
The authoritative source remains the tarball path recorded above.

## Publish-flow risk analysis

### Low-risk / aligned
- explicit package identity exists
- explicit plugin manifest exists
- explicit entrypoint exists
- public-surface correction is already validated
- local consumer install audit succeeded
- `npm publish --dry-run` succeeded
- current approval gate and source-of-truth docs exist

### Remaining caution points
- ClawHub CLI help does not expose a visible non-mutating `package publish --dry-run`/`verify` mode, so final upload should be treated as a deliberate, state-changing command if approval is given later
- working folder contains multiple tarballs and audit folders, so artifact selection discipline matters
- no actual post-upload ClawHub evidence exists yet, so package acceptance/clearance cannot be inferred from local success alone

## Audit conclusion
The corrected `v0.2.9` candidate appears consistent with the visible ClawHub code-plugin publish shape expectations available through local docs and CLI help:
- manifest present
- package metadata present
- public entry present
- public-safe package surface validated
- docs/changelog materials present

No documentation-backed blocker was found in this phase that would, by itself, disqualify the package from a later explicitly approved upload attempt.

## Recommended next action
If approval is requested later:
- use the exact approval wording/template already prepared
- use the tarball source-of-truth only
- treat the upload command as state-changing and capture exact output plus post-upload ClawHub evidence immediately

## Boundary preserved
This phase did not publish, upload, tag, or alter runtime behavior.
