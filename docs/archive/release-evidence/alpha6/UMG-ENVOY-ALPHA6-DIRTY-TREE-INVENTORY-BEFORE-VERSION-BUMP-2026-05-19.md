# UMG Envoy Alpha6 — Dirty Tree Inventory Before Version Bump

Date: 2026-05-19

## Scope

Inventory only. No destructive cleanup performed.

## Current HEAD

- repo root inspected from: `C:\.openclaw\workspace\work\public-next\package`
- current HEAD at package repo: `d53a63e`

## Branch / Status Summary

The working tree is dirty at both the broader workspace level and the package subtree level.

### Package-subtree tracked modifications

- `work/public-next/package/dist/plugin-entry-public.js`
- `work/public-next/package/dist/real-library-resolver.d.ts`
- `work/public-next/package/dist/real-library-resolver.js`
- `work/public-next/package/tsconfig.json`

### Package-subtree untracked content

Key categories:

- build/config/source additions
  - `work/public-next/package/config/`
  - `work/public-next/package/src/compiler/`
  - `work/public-next/package/src/public-path-builder.ts`
  - `work/public-next/package/src/types.ts`
  - `work/public-next/package/src/umg-path-parser.ts`
  - `work/public-next/package/src/umg-path-renderer.ts`
  - `work/public-next/package/src/umg-path-types.ts`
  - `work/public-next/package/src/umg-path-validator.ts`
- built outputs
  - `work/public-next/package/dist/block-library-resolver.*`
  - `work/public-next/package/dist/compiler/*`
  - `work/public-next/package/dist/plugin-entry.*`
  - `work/public-next/package/dist/umg-graph-resolver.*`
- docs/scripts
  - `work/public-next/package/docs/`
  - `work/public-next/package/scripts/alpha6-path-invalid-smoke.mjs`
  - `work/public-next/package/scripts/alpha6-path-valid-smoke.mjs`
  - `work/public-next/package/scripts/alpha6-real-block-library-resolver-smoke.mjs`
  - `work/public-next/package/scripts/validate-public-manifest.mjs`
- prior inspection snapshots / artifacts
  - `work/public-next/package/_alpha4_inspect/`
  - `work/public-next/package/_alpha5_final_inspect/`
  - `work/public-next/package/_inspect_alpha3/`
  - `work/public-next/package/_inspect_alpha3_final/`
  - `work/public-next/package/_inspect_alpha3_schema_fix/`
  - `work/public-next/package/_integrity_gate_inspect/`
- package tarballs
  - `work/public-next/package/umg-envoy-agent-0.3.0-alpha.3.tgz`
  - `work/public-next/package/umg-envoy-agent-0.3.0-alpha.4.tgz`
  - `work/public-next/package/umg-envoy-agent-0.3.0-alpha.5.tgz`
- helper ignore file
  - `work/public-next/package/.gitignore`

### Broader workspace tracked churn outside the package subtree

Observed outside `work/public-next/package`:

- massive tracked deletions under `artifacts/umg-envoy-agent-plugin/vendor/UMG_Envoy_Resleever/...`
- tracked modifications under `skills/clawhub-plugin-packager/...`
- tracked deletions under `skills/clawhub-packager/...`

These are not safe to treat as package-version-bump noise.

## Expected-vs-Unexpected Assessment

### Expected package-lane-looking items

Likely package-lane related:

- package docs under `work/public-next/package/docs/`
- package source under `work/public-next/package/src/...`
- package dist outputs under `work/public-next/package/dist/...`
- package smoke/validation scripts under `work/public-next/package/scripts/...`
- prior inspect folders under `work/public-next/package/_*inspect/`
- older local `.tgz` artifacts under the package subtree

These look like build, inspection, or packaging work products, not random unrelated files.

### Potentially sensitive / mixed-lane items inside package subtree

- `work/public-next/package/package.json` already includes `alpha7:*` smoke script names while the package version still reads `0.3.0-alpha.6`
- `work/public-next/package/tsconfig.json` has been changed from public-entry-oriented compilation toward `src/plugin-entry.ts`, `src/block-library-resolver.ts`, and `src/compiler/**/*.ts`
- tracked `dist/plugin-entry-public.js` and `dist/real-library-resolver.*` are modified while newer runtime/compiler outputs are untracked

This indicates the package subtree already contains lane-mixed evolution, not a pristine alpha.6-only branch.

### Clearly unrelated or broader-workspace risk items

Not safe to include in the version-bump lane:

- `artifacts/umg-envoy-agent-plugin/vendor/UMG_Envoy_Resleever/...` tracked deletions
- `skills/clawhub-plugin-packager/...` tracked modifications
- `skills/clawhub-packager/...` tracked deletions

These should remain unstaged for this lane.

## Source Changes vs Reports vs Artifacts

### Source changes present

Yes.

Inside the package subtree there are real source/config changes, not just reports:

- `tsconfig.json` tracked diff
- untracked `src/compiler/**`
- untracked runtime/path source files
- untracked docs/scripts supporting newer runtime shape

### Reports only

No. The dirty tree is not report-only.

### Generated-looking files

Yes.

- `dist/**`
- historical `.tgz` files
- `_*inspect/**`

## Safe-to-Leave-Unstaged Assessment

Safe to leave unstaged in this lane:

- broad workspace churn outside `work/public-next/package`
- old package tarballs
- old inspect folders
- unrelated skills changes
- unrelated artifacts/vendor deletions

Potentially lane-relevant and should be reviewed before commit:

- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `package-lock.json` if version changes propagate there
- `tsconfig.json` only if needed for this exact validated package path
- any source/dist files that are directly required to rebuild the version-bumped package candidate

## Cleanup Recommendation

- destructive cleanup performed: no
- destructive cleanup recommended now: no
- `git reset --hard`, `git clean -fd`, and `git clean -fdx` should remain avoided

Recommended handling:

1. keep the broader workspace churn untouched
2. constrain the version-bump lane to package metadata + required package-source/build inputs only
3. avoid staging unrelated skill/vendor/artifact churn
4. create the alpha.7 candidate from the package subtree only
5. if build or validation requires lane-mixed source that effectively exceeds a pure version bump, document it explicitly in the prep report

## Hold Assessment

At this inventory stage, I do **not** conclude an automatic stop on `HOLD_ALPHA6_VERSION_BUMP_DIRTY_TREE_CONTAINS_UNRELATED_SOURCE_CHANGES`, because:

- the package subtree itself appears to contain the active package work lane
- the clearly unrelated churn can be left unstaged and untouched

However, there is real mixed-lane risk inside the package subtree because alpha.7-oriented script naming already exists before the explicit version bump. Any resulting commit must remain narrowly scoped and must not silently absorb unrelated workspace churn.
