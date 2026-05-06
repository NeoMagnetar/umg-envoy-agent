# UMG First Governed Execution Alpha Scope

## Status
Design gate only.

## Preferred Alpha Target
Primary recommended alpha target:
- `mcp.server_metadata`

Secondary metadata-safe candidates:
- `tool.capability_summary`
- `resolver.library_status`
- `resolver.library_search`

Optional future read-only local candidate:
- `desktop_bridge.file_scan`

That last item is intentionally stricter and should not be treated as equivalent to metadata-only targets.

## Allowlist Policy
Recommended v0 allowlist:
```ts
export type GovernedExecutionAlphaAllowedTool =
 | "mcp.server_metadata"
 | "tool.capability_summary"
 | "resolver.library_status"
 | "resolver.library_search"
 | "desktop_bridge.file_scan";
```

Conservative interpretation:
- first shipping alpha should still prefer `mcp.server_metadata` or `resolver.library_status`
- allowlist membership alone is not enough; preflight and policy still apply

Interpretation:
- first four are metadata-first targets
- `desktop_bridge.file_scan` is optional future local read-only target with stronger constraints

## Blocklist Policy
Blocked in alpha v0:
- `desktop_bridge.file_write`
- `desktop_bridge.file_delete`
- `phasebridge.workflow_execute`
- `mcp.real_remote_execution`
- `langchain.agent_mode`
- `repo.write`
- `repo.publish`
- `shell.command`
- `npm.publish`

## Eligibility Rules
### Metadata-only
Eligible when:
- tool is allowlisted
- tool is not blocked
- tool is not unknown
- tool is not support-doc-derived
- preflight passes

Approval requirement:
- not required by default for metadata-only alpha v0

Checkpoint requirement:
- not required by default for metadata-only alpha v0

### Resolver / Library Status
Treat as metadata execution.
It is eligible under the same low-risk policy as capability inspection.

### Read-only Local Inspection
For `desktop_bridge.file_scan`:
- stricter local privacy posture applies
- approval required under conservative v0
- checkpoint required under conservative v0
- no write/delete/publish behavior allowed

### File Write
Blocked.
Outside alpha v0.

### Destructive Delete
Blocked.
Outside alpha v0.

### Remote Execution
Blocked.
Outside alpha v0.

### LangChain Agent Mode
Blocked.
Outside first alpha.

## Design Boundary
This document defines scope only.
It does not grant execution.
