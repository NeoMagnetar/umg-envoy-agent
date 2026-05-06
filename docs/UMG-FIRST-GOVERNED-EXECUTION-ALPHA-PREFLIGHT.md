# UMG First Governed Execution Alpha Preflight

## Status
Design gate only.

Preflight is mandatory before any future alpha execution.

## Required Preflight Checks
1. tool is in alpha allowlist
2. tool is not blocked
3. tool is not unknown
4. tool is not destructive
5. tool does not write/delete/publish
6. tool is not remote execution
7. RuntimeSpec hash matches checkpoint where checkpoint exists
8. tool plan hash matches checkpoint where checkpoint exists
9. selected context hash matches checkpoint where checkpoint exists
10. approval request matches handoff if approval is required
11. approval scope is exact
12. policy version matches or revalidation passes
13. support docs are not source of tool declaration
14. result payload policy is defined before execution

If any required check fails:
- execution remains blocked

## Metadata-Only Preflight Profile
For tools like `mcp.server_metadata` and `resolver.library_status`:
- approval not required by default
- checkpoint not required by default
- preflight still required
- payload policy must still declare `metadata`

## Read-Only Local Inspection Profile
For `desktop_bridge.file_scan`:
- preflight required
- approval required under conservative v0
- checkpoint required under conservative v0
- result payload policy must avoid raw sensitive dump behavior by default

## Preflight Result Direction
Future implementation should feed into the existing approval/checkpoint layer and produce a structural alpha result object.
It must not silently jump to execution.

## Design Boundary
Preflight here is specified, not run.

> No tools executed in design gate.
