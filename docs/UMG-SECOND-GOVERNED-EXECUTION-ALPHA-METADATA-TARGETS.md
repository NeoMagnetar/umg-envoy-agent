# UMG Second Governed Execution Alpha Metadata Targets

## Status
Design gate only.

## Existing Implemented Target
### resolver.library_status
Reference target already implemented in first alpha.

Policy:
- metadata_only
- risk_level: none
- approval_required: false
- checkpoint_required: false
- payload_type: metadata

## Next Eligible Targets
### resolver.library_search
Allowed payload:
- artifact IDs
- artifact kinds
- titles
- short descriptions
- provenance fields
- status/canonical flags
- score/reasons
- support/runtime split

Disallowed payload:
- full file contents
- full support document text
- raw secret/config values
- arbitrary filesystem content
- uncontrolled large payloads

Required safeguards:
- limit parameter required
- default limit: 10
- hard max limit: 25
- query string sanitized
- support docs remain support_only
- no full-content expansion

### tool.capability_summary
Allowed payload:
- known tool IDs
- status
- risk level
- execution mode
- governance policy
- approval requirement
- blocked/default state

Disallowed payload:
- credentials
- environment variables
- raw adapter configs
- executable command strings
- secrets

## Candidate-Only Target
### mcp.server_metadata
Candidate only.

It should not be implemented next unless design review proves all of the following:
- no server start
- no remote connection
- no tool execution
- no MCP invocation
- metadata adapter output only
- no secret/env/config leakage

## Still Blocked
- `desktop_bridge.file_scan`
- `desktop_bridge.file_write`
- `desktop_bridge.file_delete`
- `phasebridge.workflow_execute`
- `mcp.real_remote_execution`
- `langchain.agent_mode`
- `repo.write`
- `repo.publish`
- `shell.command`
- `npm.publish`

## Immediate v2 Allowlist Design
```ts
export type GovernedMetadataAlphaToolV2 =
 | "resolver.library_status"
 | "resolver.library_search"
 | "tool.capability_summary";
```

Optional future candidate only:
```ts
| "mcp.server_metadata"
```
