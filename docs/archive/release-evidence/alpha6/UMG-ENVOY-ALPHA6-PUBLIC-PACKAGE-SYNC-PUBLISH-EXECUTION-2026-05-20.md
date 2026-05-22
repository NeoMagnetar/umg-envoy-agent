# UMG Envoy Alpha6 — Public Package Sync Publish Execution

Date: 2026-05-20

## Verdict

`ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_EXECUTION_READY`

## Baseline

- gate retry verdict: `ALPHA6_PUBLIC_PACKAGE_SYNC_PUBLISH_GATE_RETRY_READY`
- gate retry report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA6-PUBLIC-PACKAGE-SYNC-PUBLISH-GATE-RETRY-2026-05-20.md`
- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7\umg-envoy-agent-0.3.0-alpha.7.tgz`
- artifact SHA256: `6DAC4AAFAB0DDF7CC18F1E6235A93AB447D76E29F561BB3486E96FCA58A7E97F`
- candidate version: `0.3.0-alpha.7`
- public latest before publish: `0.3.0-alpha.6`

## Publish

### Final artifact confirmation

Confirmed before publish:
- artifact exists
- SHA256 matched expected value
- archive spot check passed for:
  - `package/dist/compiler/compiler-adapter.js`
  - `package/dist/plugin-entry.js`
  - `package/package.json`
  - `package/openclaw.plugin.json`

### Destination precheck

ClawHub precheck confirmed:
- package: `umg-envoy-agent`
- owner: `neomagnetar`
- public latest before execution: `0.3.0-alpha.6`
- destination recognized
- auth/config ready
- candidate version did not already exist publicly

### Exact publish command

First attempted command (failed due to missing required source metadata flags):

```powershell
clawhub package publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7" --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.3.0-alpha.7 --changelog "Publish verified alpha.7 package with complete dist compiler runtime subtree."
```

Observed failure:
- `Error: --source-repo and --source-commit must be set together`

Successful publish command:

```powershell
clawhub package publish "C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.3.0-alpha.7" --family code-plugin --name umg-envoy-agent --display-name "UMG Envoy Agent" --version 0.3.0-alpha.7 --changelog "Publish verified alpha.7 package with complete dist compiler runtime subtree." --source-repo NeoMagnetar/umg-envoy-agent --source-commit 5d286d097ec7ca0cfbc8e777588a765620a74b09
```

Exact success output summary:
- `Preparing umg-envoy-agent@0.3.0-alpha.7`
- `OK. Published umg-envoy-agent@0.3.0-alpha.7 (rd7bhnefs0wf2ymwv8fsb211xx872py5)`

Published:
- package id: `umg-envoy-agent`
- version: `0.3.0-alpha.7`
- publish token/id: `rd7bhnefs0wf2ymwv8fsb211xx872py5`

## Post-Publish Verification

ClawHub inspect after publish confirms:
- package: `umg-envoy-agent`
- latest public version: `0.3.0-alpha.7`
- updated timestamp: `2026-05-20T15:56:05.891Z`
- summary now reflects runtime-preview package line
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `5d286d097ec7ca0cfbc8e777588a765620a74b09`
- source-linked / artifact-only verification retained
- tool list reflects the validated runtime-preview surface, including:
  - `umg_envoy_block_library_sleeve_graph_drilldown`
  - `umg_envoy_sleeve_select`
  - `umg_envoy_sleeve_resolve`
  - `umg_envoy_runtime_compile`
  - `umg_envoy_runtime_preview`

## Local State Check Without Restart

Local installed extension remained stable:
- plugin id: `umg-envoy-agent`
- status: loaded
- source: `~\.openclaw\extensions\umg-envoy-agent\dist\plugin-entry.js`
- version: `0.3.0-alpha.7`
- recorded version: `0.3.0-alpha.7`
- install source: archive
- install path: `~\.openclaw\extensions\umg-envoy-agent`

OpenClaw health:
- `ok = true`
- no blocking plugin errors

## Safety

Confirmed in this lane:
- no rebuild performed
- no repack performed
- no restart performed
- no Alpha7 cut performed
- no UMG-Block-Library mutation
- unrelated dirty files not staged
- repo cleanup deferred

## Known Follow-Up

Repo boundary / report commit cleanup remains unresolved and separate from publish success.

Recommended follow-up lane:
- `ALPHA6_REPO_BOUNDARY_AND_REPORT_COMMIT_CLEANUP`

## Next Recommended Task

`ALPHA6_REPO_BOUNDARY_AND_REPORT_COMMIT_CLEANUP`
