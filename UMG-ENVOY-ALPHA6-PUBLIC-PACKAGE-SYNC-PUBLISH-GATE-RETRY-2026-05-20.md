# UMG Envoy Alpha6 — Public Package Sync Publish Gate Retry

Date: 2026-05-20

## Verdict

`ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_GATE_RETRY_READY`

## Baseline

- prior publish gate hold: `HOLD_ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_GATE`
- prior hold report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PUBLISH-GATE-2026-05-19.md`
- version bump / package artifact fix verdict: `ALPHA6_PACKAGE_ARTIFACT_DIST_COMPILER_INCLUSION_FIX_READY`
- package artifact fix report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PACKAGE-ARTIFACT-DIST-COMPILER-INCLUSION-FIX-2026-05-20.md`
- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7\umg-envoy-agent-0.3.0-alpha.7.tgz`
- artifact SHA256: `6DAC4AAFAB0DDF7CC18F1E6235A93AB447D76E29F561BB3486E96FCA58A7E97F`
- installed extension version: `0.3.0-alpha.7`
- installed extension path: `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`

## Artifact

Confirmed:
- package version = `0.3.0-alpha.7`
- package root verified
- archive content verified
- `package/dist/compiler/compiler-adapter.js` present
- `package/dist/compiler/**` present
- `package/dist/plugin-entry.js` present
- `package/package.json` present
- `package/openclaw.plugin.json` present

## Live Candidate

OpenClaw plugin info confirms:
- plugin id: `umg-envoy-agent`
- status: loaded
- source: `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- origin: global
- version: `0.3.0-alpha.7`
- recorded version: `0.3.0-alpha.7`
- install source: archive
- install path: `~\.openclaw\extensions\umg-envoy-agent`

OpenClaw health confirms:
- `ok = true`
- only non-blocking housekeeping, no plugin blocker

Minimal live runtime preview probe passed without restart:
- sleeveId = `neomagnetar-dynamic-persona-v1`
- `previewStatus = RUNTIME_PREVIEW_READY`
- `compileStatus = COMPILED`
- `runtimeSpecVersion = RuntimeSpecV0`
- `executionStatus = not_performed`
- no `RangeError`
- no `Maximum call stack size exceeded`

Live preview also confirmed:
- Active Stack preview present
- response envelope preview present
- declared tool requests present
- `automaticResponseTakeover = false`
- trigger evaluation not performed
- uncontrolled execution not performed

## Destination

ClawHub package inspection:
- package = `umg-envoy-agent`
- owner = `neomagnetar`
- public latest version = `0.3.0-alpha.6`
- candidate version = `0.3.0-alpha.7`
- auth/config status = ready for inspection
- publish destination = known (`ClawHub community package`)
- version policy status = `ok`

Interpretation:
- prior same-version conflict is resolved
- public destination is still on `0.3.0-alpha.6`
- candidate `0.3.0-alpha.7` is the correct next publish version

## Repo State

Known unresolved repo hygiene issue:
- commit cleanup remains unresolved
- unrelated dirty files remain in the broader workspace
- no unrelated files were staged in this retry lane
- no destructive cleanup performed
- commit cleanup deferred to separate lane

Recommended deferred lane:
- `ALPHA6_REPO_BOUNDARY_AND_REPORT_COMMIT_CLEANUP`

## Safety

Confirmed in this retry lane:
- no publish performed
- no Alpha7 cut performed
- no UMG-Block-Library mutation
- no restart performed during this retry lane
- no rebuild performed during this retry lane
- no tgz regeneration performed during this retry lane
- no destructive cleanup performed
- no unrelated dirty files staged

## Recommendation

Next recommended task:

`ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_EXECUTION`
