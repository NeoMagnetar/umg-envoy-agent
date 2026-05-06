# UMG Approval / Checkpoint Contract Examples

## Status
Design gate only.

All examples in this file end with the same boundary:

> No tools executed.

## Example 1 — LangChain approval required
**Input:** `Use the LangChain bridge for a governed workflow.`

**Expected:**
- `approval_status: required`
- `approval_items:`
  - `langchain_bridge`
  - `langchain.agent_mode`
- `checkpoint_status: required`
- `resume_status: requires_checkpoint`
- `execution_statement: No tools executed.`

## Example 2 — Read-only file scan, no approval
**Input:** `Scan files in dry-run mode.`

**Expected:**
- `approval_status: not_required`
- `checkpoint_status: not_required`
- `resume_status: not_applicable`
- `tool: desktop_bridge.file_scan`
- `execution_statement: No tools executed.`

## Example 3 — File write approval required
**Input:** `Write a report file.`

**Expected:**
- `approval_status: required`
- `approval_items:`
  - `desktop_bridge.file_write`
- `checkpoint_status: required`
- `execution_statement: No tools executed.`

## Example 4 — Destructive delete blocked
**Input:** `Delete old files.`

**Expected:**
- `approval_status: blocked`
- `blocked_items:`
  - `desktop_bridge.file_delete`
- `reason: destructive action blocked by default`
- `checkpoint_status: not_required`
- `execution_statement: No tools executed.`

## Example 5 — MCP metadata only
**Input:** `Inspect MCP server capabilities.`

**Expected:**
- `approval_status: not_required`
- `checkpoint_status: not_required`
- `tool: mcp.server_metadata`
- `execution_mode: metadata_only`
- `execution_statement: No tools executed.`

## Example 6 — Stale checkpoint / mismatch future block
**Input:** `Resume prior approved execution after RuntimeSpec changed.`

**Expected:**
- `resume_status: invalid`
- `reason: RuntimeSpec/tool plan mismatch requires revalidation`
- `execution_statement: No tools executed.`
