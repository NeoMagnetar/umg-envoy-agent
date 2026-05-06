# UMG Sleeve Tool-Binding Policy Foundation

## Purpose

Sleeve Tool-Binding Policy answers one structural question:
- when a selected or candidate sleeve exists, what tool-binding intent does it declare?

This policy layer prepares the bridge from:
- dry-run selected sleeve

to:
- governed tool-use plan

without executing anything.

## Core principle

A sleeve does not get to run tools just because it is selected.

A sleeve may only declare:
- tool-binding intent

The governed execution plane later decides whether any tool may run.

Required distinction:
- `Selected Sleeve: sleeve.example.v1`
- `Tool Binding Intent: desktop_bridge.file_scan requested`
- `Approval: required`
- `Execution: No tools executed.`

Not allowed:
- `Selected Sleeve ran desktop_bridge.file_scan.`

## Current runtime relationship

The runtime lane already supports:
- resolver registry
- RuntimeSpecV0 dry-run compilation
- Active Sleeve Selection
- Runtime Visibility Header
- Runtime MOLT Map
- Runtime IR Matrix
- Runtime Dashboard
- Runtime Drill-Down Inspection

Tool-binding policy sits after dry-run sleeve selection and before any future governed execution handoff.

## Tool-binding policy v0 concepts

### Requested tool
A selected sleeve or selected NeoStack may request a tool.

Example:
- `desktop_bridge.file_scan`
- `langchain_bridge`
- `phasebridge.workflow_plan`

Meaning:
- the runtime would need or prefer this tool
- the tool did not run

### Available tool
A requested tool may be available in the plugin environment.

Example:
- `langchain_bridge`

Meaning:
- the plugin recognizes the tool or adapter surface
- this still does not mean the tool may run without approval

### Blocked tool
A tool is blocked if governance says it cannot run.

Example:
- `mcp.real_remote_execution`
- `desktop_bridge.destructive_file_write`

Meaning:
- the current policy prevents the action

### Requires approval
A tool may be available but approval-gated.

Example:
- `langchain.agent_mode`
- `desktop_bridge.file_write`
- `phasebridge.workflow_execute`

Meaning:
- user or governance approval is required before execution

### Metadata-only tool
A tool may expose metadata without execution.

Example:
- `mcp.server_metadata`
- `tool.capability_summary`

Meaning:
- the plugin may inspect metadata only
- it may not execute the tool

### Mock-only tool
A tool may be represented but disabled from live execution.

Example:
- `local_example_server`

Meaning:
- the tool may be simulated or described
- it may not be live-invoked

## Resolution source order

Future implementation should inspect tool-binding intent in this order:
1. selected sleeve explicit `tool_bindings` / `tools`
2. selected NeoStack explicit `tool_bindings` / `tools`
3. selected NeoBlock explicit `tool_bindings` / `tools`
4. selected MOLT block tool request metadata
5. RuntimeSpec `requested_tools`
6. known plugin/tool adapter registry
7. governance policy defaults
8. fallback warning: `no declared tool bindings found`

Hard rule:
- do not infer tool execution from title text alone
- support docs may explain tool usage, but they do not declare executable tool bindings by themselves

## Fields to inspect later

Future implementation should inspect fields like:
- `tools`
- `tool_bindings`
- `requested_tools`
- `required_tools`
- `capabilities.tools`
- `runtime.tools`
- `execution.tools`
- `adapter_bindings`
- `mcp_tools`
- `desktop_bridge`
- `phasebridge`
- `langchain_tools`

## RuntimeSpec relationship

The existing RuntimeSpec already has:
- `requested`
- `available`
- `blocked`
- `requires_approval`

This design gate formalizes and expands those into a richer declarative policy surface.

## Dashboard relationship

The dashboard should eventually show:
- selected sleeve
- tool-binding intent
- classification status
- approval requirement
- no-execution statement

Example:
- `Selected Sleeve: sleeve.example.v1`
- `Tool Binding Intent:`
- `desktop_bridge.file_scan — requested, requires approval`
- `langchain_bridge — available, governed`
- `mcp.real_remote_execution — blocked`
- `Execution: No tools executed.`

## IR Matrix relationship

IR Matrix should eventually represent tool bindings structurally.

Example:
- selected sleeve node
- requested tool node
- blocked tool node
- metadata-only tool node

No execution edges.

## Drill-down relationship

Drill-down should eventually answer:
- what tools does this sleeve request?
- which are available?
- which are blocked?
- which require approval?
- what governance policy applies?

Still structural only.

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
12. `available` does not mean `approved to execute`.
13. `selected sleeve` does not mean `tool ran`.

## Future path

If this design gate passes, the next phase should be:
- Sleeve Tool-Binding Policy — Read-Only Dry-Run Implementation

That later phase may classify tool-binding intent in RuntimeSpec, dashboard, matrix, and drill-down.
It should still not execute tools.
