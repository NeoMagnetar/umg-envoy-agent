# UMG First Governed Execution Alpha Results

## Status
Design gate only.

## Result Object Shape
The alpha should eventually report a structured result object like `GovernedExecutionAlphaResultV0`.

Core fields:
- identity: result id, handoff id, runtime spec id, trace id
- execution mode: `governed_alpha`
- execution status
- chosen tool id
- tool binding status / risk / execution mode
- preflight summary
- approval summary
- checkpoint summary
- result payload policy
- execution boundary
- warnings

## Result Payload Policy
Each future alpha result must declare one of:
- `metadata`
- `read_only_summary`
- `none`

### Metadata policy
For `mcp.server_metadata`, `resolver.library_status`, `resolver.library_search`, `tool.capability_summary`:
- payload type: `metadata`
- contains file content: false
- contains sensitive data: false by default assumption, unless later policy says otherwise
- redaction required: policy-defined if metadata can still expose sensitive endpoints or identifiers

### Read-only summary policy
For `desktop_bridge.file_scan`:
- payload type: `read_only_summary`
- contains file content: false by default
- contains sensitive data: possible
- redaction required: likely yes under conservative local policy

## Execution Boundary Fields
Even in a later implementation, alpha v0 must preserve:
- `write_performed: false`
- `delete_performed: false`

For this design gate, the execution statement must remain:

> No tools executed in design gate.

## Status Semantics
- `not_executed`: design or preflight-only outcome
- `blocked`: alpha policy forbids the tool
- `preflight_failed`: allowlisted target failed one or more required checks
- `executed_metadata_only_future`: reserved future state
- `executed_read_only_future`: reserved future state

## Design Boundary
Result shape is defined here only.
