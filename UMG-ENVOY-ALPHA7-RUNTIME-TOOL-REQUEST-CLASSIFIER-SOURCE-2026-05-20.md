# UMG Envoy Agent — Alpha7 Runtime Tool Request Classifier Source

Date: 2026-05-20

## Verdict

`ALPHA7_RUNTIME_TOOL_REQUEST_CLASSIFIER_SOURCE_READY`

## Baseline

- Alpha7 branch: `alpha7/from-public-synced-alpha6`
- Alpha6 public baseline: `umg-envoy-agent@0.3.0-alpha.7`
- design report: `C:\.openclaw\workspace\UMG-ENVOY-ALPHA7-RUNTIME-EXECUTION-GATE-DESIGN-SOURCE-2026-05-20.md`
- starting version: `0.3.0-alpha.7`
- target / implementation version: `0.3.0-alpha.8`

## Implemented

### Classifier types

Added runtime tool request classification model in active source.

Implemented type surfaces:
- `RuntimeToolRequestClassificationV0`
- classification state union
- risk level union
- execution mode union
- exported `RuntimeSpecV0`

Primary file:
- `work/public-next/package/src/block-library-resolver.ts`

### Policy map

Added initial tiny read-only classifier allowlist for:
- `umg_envoy_block_library_status`
- `umg_envoy_block_library_manifest_index`
- `umg_envoy_block_library_manifest_entry_lookup`
- `umg_envoy_block_library_sleeve_graph_index`
- `umg_envoy_runtime_preview`
- `umg_envoy_runtime_compile`
- `umg_envoy_sleeve_resolve`

Default unknown behavior:
- `classification = blocked_unimplemented`
- `executionMode = blocked`
- `allowlisted = false`
- `approvalRequired = false`

Blocked-policy hints include side-effectful or unsafe classes such as:
- publish
- restart
- install
- delete/remove/write
- shell/exec
- git write
- filesystem/network
- trigger-driven execution

### Classifier function

Implemented:
- `classifyRuntimeToolRequests(...)`

Behavior:
- classify explicit `runtimeSpec.toolRequests`
- or compile runtime from `sleeveId` in dry-run mode if needed
- return normalized classifications
- never execute tools
- never create approval checkpoints
- always return `executionStatus = not_performed`

### Tool registration

Added tool:
- `umg_envoy_runtime_tool_request_classify`

Contract:
- `umg.runtime.tool_request.classify.v1`

Required output fields implemented:
- `outputContract.contractId`
- `outputContract.contractStatus`
- `classificationStatus`
- `sourceRuntimeSpecId`
- `sleeveId`
- `requestCount`
- `classifications[]`
- `blockedCount`
- `approvalRequiredCount`
- `readOnlyCount`
- `unknownCount`
- `executionStatus = not_performed`
- `audit`
- `trace`

Required audit posture implemented:
- `execution = not_performed`
- `triggerEvaluation = not_performed`
- `approvalCheckpointCreated = false`
- `toolExecution = not_performed`
- `libraryMutation = not_performed`
- `packageMutation = not_performed`
- `restart = not_performed`
- `publish = not_performed`

### Smoke script

Added:
- `work/public-next/package/scripts/alpha7-runtime-tool-request-classifier-smoke.mjs`

Smoke verifies:
- source entry remains `src/plugin-entry.ts`
- package/plugin version = `0.3.0-alpha.8`
- classifier tool registers
- empty toolRequests classify cleanly
- real sleeve classification works for `neomagnetar-dynamic-persona-v1`
- compile path stays dry-run only
- contract id = `umg.runtime.tool_request.classify.v1`
- execution remains `not_performed`
- no approval checkpoint creation
- no trigger evaluation
- no restart
- no publish
- no UMG-Block-Library mutation
- unknown request becomes blocked/unknown, not executed
- known read-only request classifies safely
- old runtime preview still works
- no recursion regression

## Shared Runtime Version Drift Correction

Because this lane bumped implementation version to alpha.8, active runtime outputs also needed to report alpha.8 consistently.

### Stale version surfaces fixed

Narrow correction pass applied only to active Alpha7 implementation/runtime surfaces and stale smoke expectations.

Patched active source/runtime surfaces:
- `work/public-next/package/src/plugin-entry.ts`
- `work/public-next/package/src/plugin-entry-public.ts`
- `work/public-next/package/src/block-library-resolver.ts` (classifier addition + active runtime use, version-threading kept consistent)

Patched stale smoke expectations:
- `work/public-next/package/scripts/alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-manifest-index-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-resolver-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-sleeve-graph-index-smoke.mjs`

Boundary preserved:
- no historical Alpha6 reports were rewritten
- no published Alpha6 audit files were changed
- no published artifact metadata was altered retroactively

### Result

Active shared-runtime outputs now consistently report:
- `version = 0.3.0-alpha.8`
- `runtimeVersion = 0.3.0-alpha.8`

## Tool

- `umg_envoy_runtime_tool_request_classify`

## Contract

- `umg.runtime.tool_request.classify.v1`

## Confirmed

- RuntimeSpecV0 `toolRequests` are classified
- no execution performed
- dry_run/default behavior preserved
- unknown requests blocked or held
- read-only requests classified safely
- old Alpha6 runtime preview still works
- recursion regression did not return
- no restart
- no package
- no publish
- no UMG-Block-Library mutation

## Validation

Passed:
- `npm run check`
- `npm run build`
- `node scripts\alpha7-runtime-tool-request-classifier-smoke.mjs`
- `node scripts\alpha6-working-runtime-path-smoke.mjs`
- `node scripts\alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `node scripts\alpha6-real-block-library-sleeve-graph-index-smoke.mjs`
- `node scripts\alpha6-real-block-library-response-envelope-fragment-smoke.mjs`
- `node scripts\alpha6-real-block-library-active-stack-projection-smoke.mjs`
- `node scripts\alpha6-real-block-library-response-envelope-active-stack-integration-smoke.mjs`
- `node scripts\alpha6-real-block-library-manifest-index-smoke.mjs`
- `node scripts\alpha6-real-block-library-resolver-smoke.mjs`

## Files Changed

Lane-relevant source/docs/scripts changed:
- `work/public-next/package/package.json`
- `work/public-next/package/package-lock.json`
- `work/public-next/package/openclaw.plugin.json`
- `work/public-next/package/README.md`
- `work/public-next/package/src/block-library-resolver.ts`
- `work/public-next/package/src/plugin-entry.ts`
- `work/public-next/package/src/plugin-entry-public.ts`
- `work/public-next/package/scripts/alpha7-runtime-tool-request-classifier-smoke.mjs`
- `work/public-next/package/scripts/alpha6-response-envelope-active-stack-recursion-fix-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-manifest-index-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-resolver-smoke.mjs`
- `work/public-next/package/scripts/alpha6-real-block-library-sleeve-graph-index-smoke.mjs`

## Next Recommended Task

`ALPHA7_RUNTIME_EXECUTION_GATE_PLAN_SOURCE`
