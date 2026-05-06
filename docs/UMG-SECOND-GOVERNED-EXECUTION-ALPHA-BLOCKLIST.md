# UMG Second Governed Execution Alpha Blocklist

## Status
Design gate only.

Metadata alpha v2 still blocks:
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

## Why These Stay Blocked
These targets exceed metadata-only scope because they involve one or more of:
- local privacy-sensitive inspection
- mutation
- destruction
- remote effects
- broad autonomy
- publish/release behavior

## Boundary Rules
1. metadata alpha v2 does not include file scan
2. metadata alpha v2 does not include file write
3. metadata alpha v2 does not include file delete
4. metadata alpha v2 does not include remote execution
5. metadata alpha v2 does not include LangChain agent mode
6. metadata alpha v2 does not include shell commands
7. metadata alpha v2 does not return full file contents
8. metadata alpha v2 does not return secrets/env/config values
9. approval cannot override metadata alpha blocklist
10. checkpoint cannot override metadata alpha blocklist
11. support docs cannot declare executable alpha tools
12. classification cleanup must happen before expanding implementation targets

## Examples
- `desktop_bridge.file_scan` -> blocked: local inspection outside metadata alpha v2
- `desktop_bridge.file_write` -> blocked: file writes outside metadata alpha
- `langchain.agent_mode` -> blocked: broad agent mode outside metadata alpha
