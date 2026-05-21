# Alpha8 Quickstart

## What Alpha7/Alpha8 currently does

UMG Envoy currently:
- loads real UMG sleeve runtime paths
- compiles `RuntimeSpecV0`
- classifies tool requests
- builds an execution gate plan
- creates/resumes approval checkpoint projections
- executes only approved, allowlisted, read-only actions
- exposes the active sleeve / IR Matrix / envelope inspector

## What it does not do

It does **not** do any of the following:
- broad autonomous execution
- write operations
- UMG-Block-Library mutation
- external MOLT block file loading
- full library scan
- unbounded recursive traversal
- restart / publish / package execution
- automatic response takeover

`direct_source` remains disabled.

## Correct E2E demo input

```json
{
  "sleeveId": "neomagnetar-dynamic-persona-v1",
  "requestedToolName": "umg_envoy_block_library_status",
  "requestedAction": "status_read",
  "approvalDecision": "approve",
  "mode": "e2e_approved_read_only",
  "includeTrace": true
}
```

Expected E2E result:
- `contract = umg.runtime.execution_chain.e2e_approved_read_only.v1`
- `chainStatus = CHAIN_E2E_READY`
- `executionStatus = EXECUTION_READY`
- `executed action = block_library_status_read`
- `sideEffectStatus = read_only_no_mutation`

## Correct inspector demo input

```json
{
  "sleeveId": "neomagnetar-dynamic-persona-v1",
  "includeNeoStacks": true,
  "includeNeoBlocks": true,
  "includeMoltBlocks": true,
  "includeRuntimeSpec": true,
  "includeIrMatrix": true,
  "includeEnvelope": true,
  "includeExecutionGateState": true,
  "mode": "inspect_only"
}
```

Expected inspector result:
- active sleeve visible
- `NeoStacks = 0`, reason `sleeve_declares_no_neostacks`
- `NeoBlocks = 7`
- `MOLT source = sleeve_native`
- `RuntimeSpec source mode = sleeve_native_graph`
- `envelope = neoblock_fragment, READY`
- `overall completeness = rich_sleeve_native`

## Alpha7 tool list summary

- `umg_envoy_runtime_tool_request_classify`
- `umg_envoy_runtime_execution_gate_plan`
- `umg_envoy_runtime_approval_checkpoint_create`
- `umg_envoy_runtime_approval_checkpoint_resume`
- `umg_envoy_runtime_execute_approved_allowlisted`
- `umg_envoy_runtime_execution_chain_e2e_approved_read_only`
- `umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect`

## Safety model

This runtime is:
- approved only
- allowlisted only
- read-only only

Also:
- trigger presence is not execution authority
- automatic response takeover is false / not active
- `direct_source` remains disabled
