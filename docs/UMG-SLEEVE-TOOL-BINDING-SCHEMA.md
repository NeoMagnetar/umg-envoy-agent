# UMG Sleeve Tool-Binding Schema

## Purpose

This document defines the proposed v0 schema for sleeve tool-binding intent.

The schema is declarative only.
It classifies requested tools and governance state without executing anything.

## Status enum

```ts
export type ToolBindingStatus =
  | "requested"
  | "available"
  | "blocked"
  | "requires_approval"
  | "metadata_only"
  | "mock_only"
  | "unavailable"
  | "unknown";
```

## Risk levels

```ts
export type ToolRiskLevel =
  | "none"
  | "low"
  | "medium"
  | "high"
  | "destructive";
```

Suggested meanings:
- `none` → metadata display only
- `low` → read-only local or registry inspection
- `medium` → external API calls, non-destructive automation, multi-step agent flows
- `high` → file writes, repo writes, publish commands, workflow execution
- `destructive` → delete, overwrite, move, publish, remote command execution, credential-affecting operations

## Execution mode enum

```ts
export type ToolExecutionMode =
  | "dry_run"
  | "metadata_only"
  | "mock_only"
  | "approval_required"
  | "blocked"
  | "approved_execution";
```

For this phase:
- `approved_execution` is future-only
- do not implement it yet

## Binding object shape

```ts
export interface SleeveToolBindingV0 {
  tool_id: string;
  label?: string;
  requested_by: {
    artifact_id: string;
    artifact_kind: "sleeve" | "neostack" | "neoblock" | "molt_block";
  };
  status: ToolBindingStatus;
  risk_level: ToolRiskLevel;
  execution_mode: ToolExecutionMode;
  approval_required: boolean;
  blocked_reason?: string;
  governance_policy?: string;
  provenance?: {
    source_kind?: string;
    discovery_method?: string;
    generated_from_lane?: string;
    path?: string;
  };
  warnings: string[];
}
```

## RuntimeSpec relationship

RuntimeSpec should eventually include:

```ts
tool_bindings: {
  requested: string[];
  available: string[];
  blocked: string[];
  requires_approval: string[];
  metadata_only?: string[];
  mock_only?: string[];
  bindings?: SleeveToolBindingV0[];
}
```

This extends the current requested/available/blocked/requires_approval model with richer structured binding output.

## Resolution source order

Tool-binding resolution should inspect sources in this order:
1. selected sleeve explicit tool fields
2. selected NeoStack explicit tool fields
3. selected NeoBlock explicit tool fields
4. selected MOLT block tool metadata
5. RuntimeSpec `requested_tools`
6. known plugin/tool adapter registry
7. governance policy defaults
8. fallback warning: `no declared tool bindings found`

## Artifact fields to inspect later

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

## Interpretation rules

### requested
- the artifact wants the tool
- no execution occurred

### available
- the plugin surface recognizes the tool
- execution may still be blocked or approval-gated elsewhere

### blocked
- governance prevents execution
- blocked by default is preferred for unknown or destructive actions

### requires_approval
- the tool may be recognized but approval is required before execution

### metadata_only
- only metadata inspection is allowed
- no live execution

### mock_only
- the tool may be simulated or represented but not live-run

### unavailable
- not present in the current plugin/tool environment

### unknown
- not enough information to classify safely
- prefer conservative warning behavior

## Hard rule

The schema must never imply that a tool ran.
It describes tool-binding intent only.
