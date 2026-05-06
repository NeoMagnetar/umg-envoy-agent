# UMG Sleeve Tool-Binding Approvals

## Purpose

This document defines approval-related design rules for declarative sleeve tool-binding intent.

The purpose is to make approval state visible before any future governed execution phase.

## Approval model v0

A tool binding may be:
- requested
- available
- blocked
- requires approval
- metadata-only
- mock-only

Approval design is still declarative in this gate.
No approval execution path is added.

## Approval-required examples

Examples of tools that should commonly classify as `requires_approval`:
- `langchain.agent_mode`
- `desktop_bridge.file_write`
- `phasebridge.workflow_execute`
- repo-write or publish surfaces

Classification shape:
- `status: requires_approval`
- `risk_level: medium` or `high`
- `approval_required: true`
- `execution_mode: approval_required`

## Blocked-by-default examples

Examples that should commonly classify as blocked by default:
- `desktop_bridge.file_delete`
- destructive overwrite tools
- unknown real remote execution
- unsafe MCP remote execution

Classification shape:
- `status: blocked`
- `risk_level: destructive` or `high`
- `approval_required: true`
- `execution_mode: blocked`

## Metadata-only examples

Examples that should remain metadata-only:
- `mcp.server_metadata`
- `tool.capability_summary`

Classification shape:
- `status: metadata_only`
- `risk_level: none`
- `approval_required: false`
- `execution_mode: metadata_only`

## Mock-only examples

Examples that should remain mock-only:
- local example adapters
- test-only or simulated servers

Classification shape:
- `status: mock_only`
- `execution_mode: mock_only`

## Approval visibility rules

The user should be able to see:
- which tool was requested
- why it is approval-gated
- what risk level applies
- what governance policy blocks or gates it
- that no execution occurred

Suggested dashboard wording:
- `desktop_bridge.file_scan — requested, requires approval`
- `langchain.agent_mode — requires approval`
- `mcp.real_remote_execution — blocked`
- `Execution: No tools executed.`

## Drill-down relationship

Drill-down should eventually answer:
- what approval requirement applies to this tool?
- what risk level applies?
- what governance policy blocked it?

Suggested result shape:
- `tool_id`
- `status`
- `risk_level`
- `execution_mode`
- `approval_required`
- `blocked_reason`
- `execution_statement: No tools executed.`

## RuntimeSpec relationship

RuntimeSpec should eventually include richer structured bindings in addition to the current top-level arrays:
- `requested`
- `available`
- `blocked`
- `requires_approval`
- `metadata_only`
- `mock_only`
- `bindings[]`

This keeps existing summary surfaces while enabling future detailed policy display.

## Examples

### Example 1 — LangChain NeoStack
Input:
- `Use the LangChain bridge for a governed workflow.`

Expected:
- `langchain_bridge: available/governed`
- `langchain.agent_mode: requires_approval`
- `No tools executed.`

### Example 2 — Selected sleeve with read-only tool
Input:
- `Use a file inventory sleeve to scan files in dry-run mode.`

Expected:
- `desktop_bridge.file_scan: requested / requires_approval or dry_run depending policy`
- `No tools executed.`

### Example 3 — Destructive tool blocked
Input:
- `Use a cleanup sleeve to delete old files.`

Expected:
- `desktop_bridge.file_delete: blocked`
- `risk_level: destructive`
- `approval_required: true`
- `execution_mode: blocked`
- `No tools executed.`

### Example 4 — MCP metadata only
Input:
- `Inspect MCP server capabilities.`

Expected:
- `mcp.server_metadata: metadata_only`
- `No tools executed.`

### Example 5 — Support doc tool confusion
Input:
- `Use the tool listed in this README guide.`

Expected:
- support docs may explain tool usage
- support docs do not declare executable tool binding
- `No tools executed.`

## Boundary rules

1. Tool-binding policy is declarative only.
2. Tool-binding policy does not execute tools.
3. Tool-binding policy does not activate sleeves.
4. Tool-binding policy does not bypass approval.
5. Tool-binding policy does not bypass checkpoints.
6. Tool-binding policy does not broaden MCP execution.
7. Tool-binding policy does not broaden LangChain execution.
8. Tool-binding policy cannot treat support docs as executable tool declarations.
9. Unknown or destructive tools are blocked by default.
10. `Selected sleeve` does not mean `tool ran`.
