# UMG Envoy Alpha6 — Build Environment Repair for Official Runtime

Date: 2026-05-18

## Verdict

`ALPHA6_BUILD_ENVIRONMENT_REPAIRED_FOR_OFFICIAL_RUNTIME`

## Baseline

Previous hold:
- `HOLD_SOURCE_BUILD_ENVIRONMENT_BROKEN`

Blocked task:
- `ALPHA6_REAL_BLOCK_LIBRARY_RESOLVER`

Official Alpha6 runtime truth:
- entrypoint: `dist/plugin-entry.js`
- surface: `compiler-backed 12-tool runtime`
- version: `0.3.0-alpha.6`

## Root Cause

The local TypeScript install was malformed.

Observed before repair:
- `node_modules/typescript/bin/tsc` existed
- `node_modules/typescript/lib/tsc.js` was missing
- `npm run check` failed
- `npm run build` failed
- direct `tsc` failed

## Repair

Command used:

```powershell
npm ci --include=dev
```

Reason:
- restored `node_modules` from `package-lock.json`
- repaired local TypeScript package files
- did not require source reset
- did not discard prepared resolver patch

## TypeScript Verification

Confirmed after repair:
- `node_modules/typescript/bin/tsc` exists
- `node_modules/typescript/lib/tsc.js` exists
- `npx tsc --version` succeeded
- `npm ls typescript` succeeded

Observed:
- Node: `v24.14.0`
- npm: `11.9.0`
- TypeScript: `5.9.3`

## Build Verification

Passed:
- `npm run check`
- `npm run build`

Built outputs confirmed:
- `dist/plugin-entry.js`
- `dist/block-library-resolver.js`

Observed built files:
- `C:\.openclaw\workspace\work\public-next\package\dist\plugin-entry.js`
- `C:\.openclaw\workspace\work\public-next\package\dist\block-library-resolver.js`

## Resolver Verification

Passed:
- `node scripts\alpha6-path-valid-smoke.mjs`
- `node scripts\alpha6-path-invalid-smoke.mjs`
- `node scripts\alpha6-real-block-library-resolver-smoke.mjs`

Confirmed from smoke:
- valid path fixtures pass
- invalid path fixtures fail cleanly
- malformed freeform input is rejected
- resolver tool registers in the built source runtime
- library root detected: `C:\.openclaw\workspace\UMG-Block-Library`
- lane classification works
- `HUMAN = REFERENCE_ONLY`
- forbidden lanes remain forbidden
- `readOnly = true`
- `execution = not_performed`
- `directSource = not_enabled`
- no recursive full-library load
- no UMG-Block-Library mutation

## OpenClaw Verification

Observed:
- `openclaw plugins info umg-envoy-agent`: loaded, version `0.3.0-alpha.6`, source `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- `openclaw doctor --non-interactive`: no UMG warnings, plugin errors `0`
- `openclaw health --json`: `ok: true`

Important distinction:
- the **source build is repaired and verified**
- the **live installed extension has not yet been updated from the rebuilt source dist**

Evidence:
- live `openclaw plugins info umg-envoy-agent` still shows the older 12-tool loaded surface and does **not yet** list `umg_envoy_block_library_status`
- therefore the build lane is repaired, but resolver finalization into the installed OpenClaw runtime is still a separate next step

## Scope

This task repaired the build environment only.

This task did not:
- publish
- package
- reset source
- clean the repo
- modify UMG-Block-Library
- modify .gitmodules
- stage node_modules
- stage artifacts
- stage skills

## Remaining Task

Now resume:
`ALPHA6_REAL_BLOCK_LIBRARY_RESOLVER_FINALIZE`

That next task should promote the rebuilt official source outputs into the installed/live runtime deliberately, then re-run OpenClaw plugin verification so the new resolver tool is present in the loaded extension.
