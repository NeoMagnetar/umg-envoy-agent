# UMG First Governed Execution Alpha Trace

## Status
Design gate only.

## Dashboard Relationship
Future dashboard should show a dedicated section:

`FIRST GOVERNED EXECUTION ALPHA`

Recommended wording:
- `Alpha Target: mcp.server_metadata`
- `Status: eligible / blocked / preflight_required`
- `Preflight: pass_future_only`
- `Approval: not required`
- `Checkpoint: not required`
- `Execution: not performed in design gate`

This is design guidance only in this phase; the current dashboard is not widened here.

Blocked example:
- `Alpha Target: desktop_bridge.file_delete`
- `Status: blocked`
- `Reason: destructive tools are outside alpha v0`
- `Execution: No tools executed.`

## Matrix Relationship
The matrix should eventually represent structural alpha concepts, not execution claims.

Preferred conceptual pattern:
- `◆ runtime_spec ●`
- ` → ⚖ governed_execution_handoff ●`
- ` → ⛓ preflight ●`
- ` → 🔧 mcp.server_metadata ○ metadata_only`
- ` → ⚑ execution_alpha_trace`

Blocked example:
- `🔧 desktop_bridge.file_delete ⊘`
- ` → ⚖ alpha_policy_block ⊘`
- ` → ! destructive tools outside alpha v0`

Forbidden edges:
- `executes_tool`
- `ran_destructive_action`
- `wrote_file`
- `deleted_file`
- `remote_connected`
- `agent_started`

## Drill-Down Relationship
Drill-down should eventually answer:
- why a tool is eligible for alpha
- why a tool is blocked
- what preflight checks are required
- what result payload policy applies
- whether approval/checkpoint are required

Minimum acceptable future surfaces:
- inspect alpha eligibility
- inspect alpha block reason
- inspect result payload policy
- inspect preflight checks

## Design Boundary
Trace remains declarative only.

> No tools executed in design gate.
