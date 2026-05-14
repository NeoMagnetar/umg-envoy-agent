# UMG Envoy Agent — Worktree Stabilization Plan

Date: 2026-05-14

## Verdict

`WORKTREE_STABILIZATION_PLAN_READY`

## Baseline

- Post-Step 7 sanity verdict: `POST_STEP7_SANITY_PASS`
- HEAD: `c27836d73e4ac4c5736511a1053ed07a9965597b`
- Cached index: clean
- Staged entries: `0`

## Dirty Worktree Snapshot

- total status entries: `2262`
- modified tracked: `41`
- deleted tracked: `1952`
- untracked: `269`

## Top-Level Dirty Buckets

| Top-Level Area | Count | Primary Status Types | Classification | Risk | Recommended Action |
|---|---:|---|---|---|---|
| `artifacts/` | `2039` | mostly `D`, some `M`, some `??` | `REVIEW_ARTIFACTS_MASS_DELETIONS` | High | Separate audit; do not stage, delete, restore, or clean broadly |
| `skills/` | `42` | `M`, `D`, some `??` | `REVIEW_SKILLS_WORKSTREAM` | Medium | Separate branch/workstream review |
| `work/` | `34` | mostly `M`, some `??` | Mixed | Medium | Isolate active package lane from local outputs |
| `UMG-Block-Library` | `0` top-level status entries in parent currently | submodule-managed | `KEEP_ACTIVE_BLOCK_LIBRARY` | Medium/High | Treat as independent review unit; no casual pointer/submodule changes |
| `umg-envoy-agent-publish-stage/` | `37` | mostly `??` | `REVIEW_RELEASE_STAGING_OUTPUTS` | High | Exclude from plugin commits |
| `archive/` | `1` | `??` | `ARCHIVE_EXTERNAL` | Medium | Keep out of active source/release lanes |
| `backups/` | `1` | `??` | `ARCHIVE_EXTERNAL` | Medium | Keep out of active source/release lanes |
| `plugin-backups/` | `1` | `??` | `ARCHIVE_EXTERNAL` | Medium | Keep out of active source/release lanes |
| `release-staging/` | `1` | `??` | `REVIEW_RELEASE_STAGING_OUTPUTS` | High | Exclude from plugin commits |
| root reports/scratch/misc | many singletons | mixed `??` | Mixed | Medium | Classify report vs scratch vs external archive case-by-case |

## Active Product Lanes

### Active plugin source lane

- `work/public-next/package/`

Subclassification:
- source:
 - `src/`
 - `scripts/`
 - `package.json`
 - `openclaw.plugin.json`
 - `README.md`
 - `PUBLIC-VARIANT-README.md`
- release-relevant generated:
 - `dist/`
- local generated/review:
 - inspect folders
 - package extracts
 - tgz outputs
 - logs

Notes:
- `dist/` is **not** automatically ignorable because Alpha.5 packaging used built dist outputs
- future cleanup should explicitly decide whether `dist/` remains tracked release-relevant output or becomes generated-only

### Active block library lane

- `UMG-Block-Library/`

Subclassification:
- machine source:
 - `AI/MANIFESTS/`
 - `AI/SLEEVES/`
 - `AI/MOLT-BLOCKS/`
 - `AI/NEOBLOCKS/`
 - `AI/NEOSTACKS/`
 - `AI/GATES/`
- public curated:
 - `sleeves/`
 - `sleeves/manifests/`
- reference only:
 - `HUMAN/`
 - `blocks/molt/`
 - docs/readmes

Submodule warning:
- do not modify or commit submodule pointer casually
- treat `UMG-Block-Library` as an independent review unit

## Do-Not-Load / Do-Not-Ship Lanes

- `artifacts/`
- `archive/`
- `backups/`
- `plugin-backups/`
- `release-staging/`
- `umg-envoy-agent-release-clean/`
- `umg-envoy-agent-publish-stage/`
- `UMG_Envoy_Resleever/`
- `vendor/`
- `tmp-*`
- `scratch/`
- `inspect/`
- `review/`

## Separate Workstreams

### Skills

Classification:
- `REVIEW_SKILLS_WORKSTREAM`

Reason:
- meaningful but not part of Alpha.6 resolver implementation

### Resleever

Classification:
- `REVIEW_RESLEEVER_VENDOR_LANE`

Reason:
- explicitly excluded from current UMG Envoy Agent Alpha.6 resolver lane
- audit marked vendored `UMG_Envoy_Resleever` as an unsafe/do-not-commit boundary

### Artifacts

Classification:
- `REVIEW_ARTIFACTS_MASS_DELETIONS`

Reason:
- contains mass tracked deletions
- mixes packaged outputs, vendored mirrors, release candidates, generated outputs, and historical material

## Reports and Handoffs

Classification:
- `KEEP_REPORTS_AND_HANDOFFS`

Includes:
- `UMG-ENVOY-*.md`
- `UMG-ENVOY-*.json`
- `WORKTREE-STATUS-*.txt`
- `WORKTREE-STATUS-*.csv`

Policy note:
- do not auto-commit all report files
- some are durable handoff documents; others are local diagnostics/scratch
- commit only explicit report subsets per task

## No-Action Zones

Do not run:
- `git add .`
- `git clean -fd`
- `git reset --hard`
- broad `git restore`
- broad folder staging
- broad deletion

## Recommended Next Actions

1. Create release manifest draft.
2. Create gitignore draft.
3. Create separate audit for `artifacts/`.
4. Create separate audit for `skills/`.
5. Create separate submodule state review for `UMG-Block-Library`.
6. Only after stabilization docs exist, decide whether Step 8 should proceed.

## Step 8 Gate

Step 8 may begin only after:
- this stabilization plan exists
- release manifest draft exists
- gitignore draft exists
- no files are staged
- active lanes are identified

## Key Findings Summary

- `artifacts/` is the dominant risk bucket and should remain isolated pending separate review
- `skills/` is a distinct workstream and should not be blended into Alpha.6 plugin commits
- `work/public-next/package/` is the active plugin source lane
- `UMG-Block-Library/` is active but submodule-managed and requires intentional handling
- publish-stage / release-clean / release-staging / backups are not active source lanes and should remain excluded from shipping/loading decisions
