# UMG Envoy Agent Alpha.6 — Package Files Allowlist Fix

Date: 2026-05-14

## Verdict

`ALPHA6_PACKAGE_FILES_ALLOWLIST_FIXED`

## Previous Hold

Previous task:
- `ALPHA6_LOCAL_PACKAGE_DRY_RUN_RETRY`

Correct hold:
- `HOLD_ALPHA6_PACKAGE_REQUIRED_FILES_MISSING`

Reason:
- `dist/plugin-entry-public.js` was present
- `dist/real-library-resolver.js` was missing from the npm dry-run package file list

## Root Cause

Package file inclusion did not include the Alpha.6 resolver runtime output.

This was a package contents / allowlist issue, not contamination.

## Files Modified

- `work/public-next/package/package.json`

## Package Files Fix

Required runtime dist files now included:
- `dist/plugin-entry-public.js`
- `dist/plugin-entry-public.d.ts`
- `dist/real-library-resolver.js`
- `dist/real-library-resolver.d.ts`

## Verification

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-library-resolver-smoke.mjs`
- `npm pack --dry-run --json`

## Package Identity

| Field | Value |
|---|---|
| name | `umg-envoy-agent` |
| version | `0.3.0-alpha.6` |
| filename | `umg-envoy-agent-0.3.0-alpha.6.tgz` |
| total files | `34` |
| package size | `not reported in dry-run json` |
| unpacked size | `114876` |

## Required Files Present After Fix

| Required File / Lane | Present |
|---|---|
| `package.json` | yes |
| `openclaw.plugin.json` | yes |
| `README.md` | yes |
| `PUBLIC-VARIANT-README.md` | yes |
| `dist/plugin-entry-public.js` | yes |
| `dist/real-library-resolver.js` | yes |
| `public-content/` | yes |

## Forbidden Files Check

Forbidden package entries found:
- `0`

Confirmed excluded:
- `artifacts/`
- `skills/`
- `UMG-Block-Library/`
- `archive/`
- `backups/`
- `plugin-backups/`
- `release-staging/`
- `umg-envoy-agent-release-clean/`
- `umg-envoy-agent-publish-stage/`
- `Resleever`
- `UMG_Envoy_Resleever`
- `node_modules/`
- local diagnostics
- logs
- zips
- tgz artifacts

## Runtime Capability Preserved

Confirmed:
- tool count remains `18`
- runtime/status version remains `0.3.0-alpha.6`
- shallow-load runtime summary works
- no recursion
- no execution
- no direct_source mode
- no archive/HUMAN/Resleever fallback

## Scope Boundary

This step did not:
- publish alpha.6
- install alpha.6
- run non-dry npm pack
- modify UMG-Block-Library
- modify .gitmodules
- stage dist files
- stage source files
- stage artifacts or skills

## Required Next Task

Next task:
`ALPHA6_LOCAL_PACKAGE_DRY_RUN_FINALIZE_REPORT`
