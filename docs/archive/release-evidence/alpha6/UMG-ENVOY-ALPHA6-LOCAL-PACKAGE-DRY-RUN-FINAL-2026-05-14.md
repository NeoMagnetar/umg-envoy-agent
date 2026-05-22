# UMG Envoy Agent Alpha.6 — Local Package Dry-Run Final

Date: 2026-05-14

## Verdict

`ALPHA6_LOCAL_PACKAGE_DRY_RUN_FINAL_READY`

## Baseline

Previous hold:
- `HOLD_ALPHA6_PACKAGE_REQUIRED_FILES_MISSING`

Corrective step:
- `ALPHA6_PACKAGE_FILES_ALLOWLIST_FIXED`

Allowlist fix commit:
- `2fb9c932568338a1fe58cfa1ee0d93e8fb0da9d7`

## Scope

This step finalized the local npm package dry-run evidence after the package files allowlist fix.

This step did not:
- publish alpha.6
- run ClawHub publish
- install the package
- run non-dry npm pack
- modify package metadata
- modify source files
- modify UMG-Block-Library
- modify .gitmodules
- stage dist files

## Pre-Dry-Run Verification

Passed:
- `npm run check`
- `npm run build`
- `node scripts/alpha6-real-library-resolver-smoke.mjs`

## Package Identity

| Field | Value |
|---|---|
| name | `umg-envoy-agent` |
| version | `0.3.0-alpha.6` |
| filename | `umg-envoy-agent-0.3.0-alpha.6.tgz` |
| total files | `34` |
| package size | `13996` |
| unpacked size | `114876` |

## Required Files Present

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

## Dist Working Tree Note

Local `dist/` files remain modified after build:
- `dist/plugin-entry-public.js`
- `dist/real-library-resolver.js`
- `dist/real-library-resolver.d.ts`

These files were not staged or committed in this task.

## Raw Dry-Run Evidence

Raw dry-run file list:
- `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PACKAGE-FILE-LIST-FINAL-2026-05-14.txt`

This raw file remains local/uncommitted.

## Alpha.6 Runtime Capability Preserved

Confirmed:
- tool count remains `18`
- original alpha.5 tools still register
- alpha.6 real-library tools still register
- runtime/status version reports `0.3.0-alpha.6`
- shallow-load runtime summary works
- no recursion
- no execution
- no direct_source mode
- no archive/HUMAN/Resleever fallback

## Holds Before Publish

Alpha.6 must not be published yet.

Remaining holds:
- `HOLD_PUBLISH_UNTIL_LOCAL_INSTALL_VERIFICATION`
- `HOLD_PUBLISH_UNTIL_NO_PUBLISH_FINAL_GATE`

## Required Next Task

Next task:
`ALPHA6_LOCAL_INSTALL_VERIFICATION`
