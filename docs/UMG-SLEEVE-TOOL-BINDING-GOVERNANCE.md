# UMG Sleeve Tool-Binding Governance

## Purpose

This document defines governance mapping rules for declarative sleeve tool-binding intent.

The goal is to show:
- which tools are requested
- which are available
- which are blocked
- which require approval
- which are metadata-only
- which are mock-only

without executing anything.

## Governance mapping rules

### Read-only metadata

Classification:
- `status: metadata_only`
- `risk_level: none`
- `approval_required: false`
- `execution_mode: metadata_only`

Examples:
- `mcp.server_metadata`
- `tool.capability_summary`

### Read-only local inspection

Classification:
- `status: available`
- `risk_level: low`
- `approval_required: false` or `true` depending on local policy
- `execution_mode: dry_run`

Examples:
- non-destructive local inspection tools
- registry/status inspectors

### Agent mode / multi-step workflow

Classification:
- `status: requires_approval`
- `risk_level: medium`
- `approval_required: true`
- `execution_mode: approval_required`

Examples:
- `langchain.agent_mode`
- `phasebridge.workflow_plan`
- multi-step automation agents

### File write / repo write / publish

Classification:
- `status: requires_approval` or `blocked`
- `risk_level: high`
- `approval_required: true`
- `execution_mode: approval_required` or `blocked`

Examples:
- `desktop_bridge.file_write`
- repo mutation surfaces
- publish commands

### Delete / overwrite / destructive action

Classification:
- `status: blocked`
- `risk_level: destructive`
- `approval_required: true`
- `execution_mode: blocked`

Examples:
- `desktop_bridge.file_delete`
- destructive overwrite operations
- remote destructive automation

### Unknown real remote execution

Classification:
- `status: blocked`
- `risk_level: high`
- `approval_required: true`
- `execution_mode: blocked`

Examples:
- `mcp.real_remote_execution`
- unknown remote command bridges

## Availability does not equal approval

A tool may be:
- available
- but still requires approval
- or blocked by current governance

Hard rule:
- `available` does not mean `approved to execute`

## Support-doc boundary

Support docs may explain tools.
Support docs do not declare executable tool bindings by themselves.

Examples of disallowed reasoning:
- README mentions a command → therefore tool is executable
- guide references desktop bridge → therefore tool is approved

These are not valid inferences.

## RuntimeSpec relationship

RuntimeSpec should eventually expose:
- raw requested tool ids
- classified binding objects
- approval requirements
- blocked reasons
- governance policy summary

All of this remains dry-run and declarative.

## Dashboard relationship

Dashboard wording should eventually look like:
- `Tool Binding Intent:`
- `desktop_bridge.file_scan — requested, requires approval`
- `langchain_bridge — available, governed`
- `mcp.real_remote_execution — blocked`
- `Execution: No tools executed.`

Avoid wording like:
- tool executed
- tool running
- sleeve ran tool
- MCP connected live
- LangChain agent started

## IR Matrix relationship

IR Matrix should eventually represent tool nodes structurally.

### Requested tool
```text
◆ runtime_spec ●
 → ◆ sleeve.example.v1 ● selected
 → 🔧 desktop_bridge.file_scan ! requires_approval
```

### Blocked tool
```text
🔧 mcp.real_remote_execution ⊘
 → ⚖ blocked_by governance
```

### Metadata-only tool
```text
🔧 mcp.server_metadata ○ metadata_only
```

No execution edges.
Do not add:
- `executes_tool`
- `ran_tool`
- `started_agent`
- `remote_connected`

## Boundary rules

1. Tool-binding policy is declarative only.
2. Tool-binding policy does not execute tools.
3. Tool-binding policy does not activate sleeves.
4. Tool-binding policy does not bypass approval.
5. Tool-binding policy does not bypass checkpoints.
6. Tool-binding policy does not broaden MCP execution.
7. Tool-binding policy does not broaden LangChain execution.
8. Tool-binding policy does not mutate RuntimeSpec except in future compiled dry-run output.
9. Tool-binding policy cannot treat support docs as tool declarations.
10. Tool-binding policy cannot infer dangerous tool access from loose text.
11. Unknown or destructive tools are blocked by default.
12. `selected sleeve` does not mean `tool ran`.
