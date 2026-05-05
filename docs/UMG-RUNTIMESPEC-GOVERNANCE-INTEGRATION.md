# UMG RuntimeSpec Governance Integration

## Core rule

RuntimeSpec may describe what should be active.
It may not decide what is allowed to execute.

The governed execution plane remains authoritative for:
- tool permission checks
- approval checkpoints
- approval persistence
- resume contracts
- safe resume execution
- LangChain containment
- MCP containment

## How RuntimeSpec feeds governance

RuntimeSpec should hand off:
- selected runtime artifacts
- requested tool bindings
- blocked tool expectations
- approval-required hints
- trace_id
- matrix_id placeholder
- warnings about assembled/partial runtime state

Example binding view:

```json
{
  "tool_bindings": {
    "requested": ["langchain_bridge"],
    "available": ["langchain_bridge"],
    "requires_approval": ["langchain_bridge.agent_mode"],
    "blocked": ["mcp.real_remote_execution"]
  }
}
```

The governed execution plane then determines whether any call may proceed.

## Approval preservation

RuntimeSpec must not bypass:
- approval checkpoints
- approval state transitions
- resume contract validation
- idempotency protection

If RuntimeSpec selects an artifact or tool binding that later implies approval, the correct behavior is:
- record it in constraints/tool_bindings
- emit APPROVAL_REQUIRED trace intent at design/selection level if useful later
- let the governed execution plane perform real approval handling

## MCP and LangChain policy preservation

RuntimeSpec must respect existing policy:
- MCP default: blocked_by_default / metadata_only
- LangChain default: governed, not unbounded

RuntimeSpec cannot promote MCP or LangChain into broader authority than current governance already allows.

## Missing sleeve / partial runtime warnings

If selection is partial or assembled:
- keep status honest
- emit selection warnings
- do not claim a first-class sleeve runtime exists

## Future integration path

### Next safe implementation phase
- read-only RuntimeSpec compilation only

### Later possible phases
- governance handoff object generation
- matrix linkage
- MOLT Map linkage
- dry-run selectable artifact graph inspection

But RuntimeSpec should remain a compiled specification layer, not a silent execution switch.
