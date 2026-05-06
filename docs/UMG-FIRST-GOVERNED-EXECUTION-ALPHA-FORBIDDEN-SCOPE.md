# UMG First Governed Execution Alpha Forbidden Scope

## Status
Design gate only.

## Explicitly Not Alpha 1
The following are outside first governed execution alpha v0:
- `desktop_bridge.file_write`
- `desktop_bridge.file_delete`
- `phasebridge.workflow_execute`
- `mcp.real_remote_execution`
- `langchain.agent_mode`
- repo publish flows
- npm publish flows
- arbitrary shell execution
- autonomous multi-step execution
- runtime reconfiguration

## Why They Are Excluded
These classes exceed the first-alpha safety budget because they introduce one or more of:
- mutation
- destruction
- remote effects
- broad autonomy
- publish/release side effects
- privacy-sensitive local reach

## Boundary Rules
1. first alpha design does not execute tools
2. first alpha implementation later must be allowlist-only
3. metadata-only is the preferred first target
4. read-only local inspection requires stricter policy
5. file writes are blocked in alpha v0
6. deletes are blocked in alpha v0
7. remote execution is blocked in alpha v0
8. broad LangChain agent mode is blocked in alpha v0
9. approval cannot override alpha blocklist
10. checkpoint cannot override alpha blocklist
11. support docs cannot declare alpha tools
12. preflight is mandatory before any future alpha execution
13. result payload policy must be defined before execution
14. hidden reasoning must never be exposed

## Examples
### MCP metadata-only eligible
Input: `Inspect MCP server capabilities.`
- alpha target: `mcp.server_metadata`
- status: `eligible` or `ready_for_alpha_future_only`
- approval required: false
- checkpoint required: false
- result payload policy: `metadata`
- execution statement: `No tools executed in design gate.`

### Library status eligible
Input: `Show UMG library status.`
- alpha target: `resolver.library_status`
- status: `eligible`
- approval required: false
- checkpoint required: false
- result payload policy: `metadata`

### Local file scan stricter policy
Input: `Scan files in dry-run mode.`
- alpha target: `desktop_bridge.file_scan`
- status: `preflight_required` or `approval_required`
- approval required: true under conservative local policy
- checkpoint required: true
- no write/delete allowed

### File write blocked
Input: `Write a report file.`
- alpha target: `desktop_bridge.file_write`
- status: `blocked`
- reason: file write outside alpha v0

### Destructive delete blocked
Input: `Delete old files.`
- alpha target: `desktop_bridge.file_delete`
- status: `blocked`
- reason: destructive tools outside alpha v0

### LangChain agent mode blocked
Input: `Run LangChain agent mode.`
- alpha target: `langchain.agent_mode`
- status: `blocked`
- reason: broad agent mode outside first execution alpha
