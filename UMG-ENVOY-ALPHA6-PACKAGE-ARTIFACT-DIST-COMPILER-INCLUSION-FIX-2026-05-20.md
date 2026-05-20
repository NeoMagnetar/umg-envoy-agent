# UMG Envoy Alpha6 — Package Artifact dist/compiler Inclusion Fix

Date: 2026-05-20

## Verdict

`ALPHA6_PACKAGE_ARTIFACT_DIST_COMPILER_INCLUSION_FIX_READY`

## Baseline

- prior hold report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-VERSION-BUMP-AND-PACKAGE-SYNC-PREP-2026-05-19.md`
- alpha.7 artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7\umg-envoy-agent-0.3.0-alpha.7.tgz`
- old hash observed before fix: `62CBE9257CEBF2D40C5403607F4D72D079771F9D11A694AB0D6FCC5C93A5B1D2`
- live safe state before retry: restored/confirmed healthy and then upgraded successfully from alpha.6 to alpha.7

## Diagnosis

Real blocker discovered during archive install verification:

- packed archive omitted required runtime subtree under `dist/compiler/**`
- specifically, installed archive result was missing `dist/compiler/compiler-adapter.js`
- staged candidate and source `dist` both contained the compiler subtree
- omission source was package inclusion rules, not build output generation

Root cause:
- `package.json` `files` whitelist enumerated selected `dist/*` files but did **not** include `dist/compiler/**`
- `.npmignore` was not present and was not the cause

## Fix

Package inclusion rule patched in:
- `C:\.openclaw\workspace\work\public-next\package\package.json`

Change made:
- previous selective `files` whitelist replaced with `dist/**`

Resulting inclusion set:
- `dist/**`
- `README.md`
- `openclaw.plugin.json`
- `package.json`
- `docs`
- `public-content`

This fix changes package artifact inclusion only.

No runtime behavior changes were intentionally introduced.

## Validation

### Source / stage confirmation before repack

Confirmed:
- source `dist/compiler/compiler-adapter.js` exists
- staged `dist/compiler/compiler-adapter.js` exists
- staged `dist/compiler/**` subtree is non-empty

### Build and smoke validation after inclusion fix

Passed:
- `npm run check`
- `npm run build`

Required smoke chain passed:
- `node scripts\alpha6-real-block-library-response-envelope-fragment-smoke.mjs`
- `node scripts\alpha6-real-block-library-active-stack-projection-smoke.mjs`
- `node scripts\alpha6-real-block-library-response-envelope-active-stack-integration-smoke.mjs`
- `node scripts\alpha6-real-block-library-sleeve-graph-index-smoke.mjs`
- `node scripts\alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `node scripts\alpha6-working-runtime-path-smoke.mjs`

Confirmed during smokes:
- working runtime path still works
- recursion bug did not return
- no `RangeError`
- no `Maximum call stack size exceeded`

### Packaging validation

Regenerated staging root:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7`

`npm pack --dry-run`: passed

`npm pack`: passed

New artifact:
- path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7\umg-envoy-agent-0.3.0-alpha.7.tgz`
- SHA256: `6DAC4AAFAB0DDF7CC18F1E6235A93AB447D76E29F561BB3486E96FCA58A7E97F`

Direct archive content verification passed:
- `package/dist/compiler/compiler-adapter.js`
- `package/dist/compiler/compiler-matrix.js`
- `package/dist/compiler/compiler-smoke.js`
- `package/dist/compiler/content-loader.js`
- `package/dist/compiler/runtime-validator.js`
- `package/package.json`
- `package/openclaw.plugin.json`
- `package/dist/plugin-entry.js`

### Temp extract verify

Temp extract verify passed at:
- `C:\.openclaw\workspace\alpha6-package-extract-verify\umg-envoy-agent-0.3.0-alpha.7-fixed`

Confirmed in extracted package:
- `package/package.json`
- `package/openclaw.plugin.json`
- `package/dist/plugin-entry.js`
- `package/dist/compiler/compiler-adapter.js`
- version = `0.3.0-alpha.7`
- entrypoint = `dist/plugin-entry.js`

### Local install replacement / activation

Installed extension path:
- `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

Fresh rollback backup created outside the live extensions scan root:
- `C:\.openclaw\workspace\alpha6-local-install-verify-backups\umg-envoy-agent-before-alpha6-0.3.0-alpha.7-fixed-install-20260520-061736`

Install method used:
- move existing installed alpha.6 extension into workspace backup area
- archive install fixed tgz with OpenClaw
- allow the already in-flight restart/install cycle to complete
- no additional restart loops after that

OpenClaw plugin info after activation:
- status: loaded
- version: `0.3.0-alpha.7`
- recorded version: `0.3.0-alpha.7`
- source: `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- origin: `global`
- install source: archive
- install path: `~\.openclaw\extensions\umg-envoy-agent`

Health:
- `ok = true`

### Live runtime preview proof

Runtime preview input:

```json
{
  "sleeveId": "neomagnetar-dynamic-persona-v1",
  "previewFormat": "summary",
  "includeActiveStack": true,
  "includeMoltMap": true,
  "includeEnvelope": true,
  "includeToolRequests": true
}
```

Confirmed live on installed alpha.7:
- `outputContract.contractId = umg.runtime.preview.v1`
- `previewStatus = RUNTIME_PREVIEW_READY`
- `compileStatus = COMPILED`
- `runtimeSpecVersion = RuntimeSpecV0`
- Active Stack preview confirmed
- response-envelope preview confirmed
- declared tool requests confirmed
- `executionStatus = not_performed`
- `automaticResponseTakeover = false`
- no `RangeError`
- no `Maximum call stack size exceeded`
- no trigger evaluation
- no uncontrolled execution
- no UMG-Block-Library mutation

### Old tool regression / recursion check

Confirmed old Alpha6 tools still live and working:
- `umg_envoy_block_library_status`
- `umg_envoy_block_library_sleeve_graph_index`
- `umg_envoy_block_library_response_envelope_fragment`
- `umg_envoy_block_library_active_stack_projection`
- plus full tool list present in plugin info

Confirmed:
- sleeve graph index works
- response envelope fragment works
- Active Stack projection works
- recursion regression did not return
- no `RangeError`
- no `Maximum call stack size exceeded`

## Safety

Confirmed in this lane:
- no public publish performed
- no Alpha7 cut performed
- no UMG-Block-Library mutation
- dirty tree not destructively cleaned
- unrelated dirty files were not staged
- no `git reset --hard`
- no `git clean -fd`
- no `git clean -fdx`
- no `git add .`
- no `git add -A`

## Recommendation

Next recommended task:

`ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_GATE_RETRY`
