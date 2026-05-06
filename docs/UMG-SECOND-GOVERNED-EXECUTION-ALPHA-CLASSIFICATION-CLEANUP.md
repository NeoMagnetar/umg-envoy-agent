# UMG Second Governed Execution Alpha Classification Cleanup

## Status
Design gate only.

## Problem
The current broader dry-run model still treats some plugin-native metadata targets as unknown or blockable.

That creates a mismatch:
- narrow alpha executor says a plugin-native metadata target is safe
- broader governance layers still describe it as unknown/blocked

That mismatch must be removed before expansion.

## Required Cleanup Targets
The broader dry-run model should classify these as plugin-native metadata-only tools:
- `resolver.library_status`
- `resolver.library_search`
- `tool.capability_summary`

Required classification for all three:
- `status: metadata_only`
- `risk_level: none`
- `execution_mode: metadata_only`
- `approval_required: false`
- `governance_policy: plugin_native_metadata_only`

## MCP Metadata Candidate
For `mcp.server_metadata`, the classification target can be:
- `status: metadata_only`
- `risk_level: none`
- `execution_mode: metadata_only`
- `approval_required: false`
- `governance_policy: mcp_metadata_only`

But execution expansion should still remain candidate-only until separate proof confirms no server start, remote connection, or MCP invocation.

## Expected Outcome After Cleanup
After cleanup:
- handoff should stop blocking `resolver.library_status`
- approval/checkpoint should stop treating plugin-native metadata tools as blocked
- preflight should pass without narrow implementation exceptions for those targets
- dashboard/governance wording should align with actual metadata-only policy

## Recommended Next Implementation Order
1. classification cleanup for plugin-native metadata tools
2. `resolver.library_search`
3. `tool.capability_summary`
4. optional later review of `mcp.server_metadata`

## Examples
### Example 1 — Existing library status remains eligible
Input: `Show UMG library status.`
- target: `resolver.library_status`
- status: eligible / already implemented
- payload_type: metadata
- approval_required: false
- checkpoint_required: false

### Example 2 — Library search metadata eligible
Input: `Search the UMG library for LangChain.`
- target: `resolver.library_search`
- status: eligible for v2 implementation
- payload_type: metadata
- limit: 10
- file_contents: false
- support_doc_full_text: false

### Example 3 — Tool capability summary eligible
Input: `Show available governed tool capabilities.`
- target: `tool.capability_summary`
- status: eligible for v2 implementation
- payload_type: metadata
- secret_values: false

### Example 4 — MCP metadata candidate-only
Input: `Inspect MCP server metadata.`
- target: `mcp.server_metadata`
- status: candidate_only
- reason: must prove no server start, remote connection, or tool invocation

### Example 5 — File scan still blocked
Input: `Scan files.`
- target: `desktop_bridge.file_scan`
- status: blocked
- reason: local privacy-sensitive inspection belongs to later read-only local alpha

### Example 6 — File write blocked
Input: `Write a report file.`
- target: `desktop_bridge.file_write`
- status: blocked
- reason: file writes outside metadata alpha

### Example 7 — LangChain agent blocked
Input: `Run LangChain agent mode.`
- target: `langchain.agent_mode`
- status: blocked
- reason: broad agent mode outside metadata alpha

## Dashboard / Matrix / Drill-Down Guidance
Dashboard wording should emphasize:
- metadata expansion status
- payload policy
- file contents: no
- sensitive data: no
- writes: no
- deletes: no
- external calls: no

Matrix should model:
- metadata target node
- payload policy node
- blocked target node
- no execution edges such as `ran_search`, `scanned_files`, `connected_remote`, or `started_agent`

Drill-down should support future inspection of:
- metadata eligibility
- payload policy
- block reason
- candidate-only reason
