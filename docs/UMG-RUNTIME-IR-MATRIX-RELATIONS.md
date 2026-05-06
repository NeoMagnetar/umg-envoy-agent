# UMG Runtime IR Matrix Relations

## Purpose

This document defines how Runtime IR Matrix v0 relations should be interpreted.

The goal is not execution planning.
The goal is structural clarity:
- what was selected
- what contains what
- what references what
- what is blocked
- what requires approval
- what exists as support-only context
- what governance surface applies
- what trace and MOLT references correspond to the matrix

## Relation model

Every edge should be read as a structural statement inside a dry-run runtime projection.

Example:
- `runtime_spec -> neostack : selects`
means:
- RuntimeSpec selected this NeoStack in dry-run

It does **not** mean:
- a live sleeve was activated
- a tool ran
- LangChain or MCP executed

## Required v0 relations

### selects
Use when RuntimeSpec selected an artifact.

Common patterns:
- `runtime_spec -> sleeve`
- `runtime_spec -> neostack`
- `runtime_spec -> neoblock`
- `runtime_spec -> molt_block`

Interpretation:
- selected in dry-run RuntimeSpec
- not executed

### contains
Use for structural containment.

Common patterns:
- `sleeve -> neostack`
- `neostack -> neoblock`
- `runtime_dashboard -> matrix_placeholder` later if introduced

Interpretation:
- one runtime structure structurally contains another
- containment does not imply live activation

### references
Use for non-owning structural linkage.

Common patterns:
- `runtime_spec -> molt_map`
- `runtime_spec -> matrix_placeholder`
- `runtime_spec -> trace_event`

Interpretation:
- this node points to another projection or reference surface

### constrains
Use when a constraint node limits or conditions another node.

Common patterns:
- `constraint -> tool_binding`
- `constraint -> neostack`

Interpretation:
- this runtime element is conditioned by a rule or protected boundary

### requests_tool
Use when a selected runtime artifact requests a tool binding.

Common patterns:
- `neostack -> tool_binding`
- `neoblock -> tool_binding`

Interpretation:
- requested tool binding intent exists
- no execution occurred

### requires_approval
Use when a binding or route is approval-gated.

Common patterns:
- `tool_binding -> constraint`
- `tool_binding -> governance`

Interpretation:
- this structural route cannot proceed without approval
- no checkpoint bypass is implied

### blocked_by
Use when a node or route is blocked by policy or boundary rules.

Common patterns:
- `tool_binding -> governance`
- `support_artifact -> constraint`
- `matrix_placeholder -> governance`

Interpretation:
- represented, but blocked
- no execution and no override

### governed_by
Use when a runtime artifact or binding is subject to governance.

Common patterns:
- `tool_binding -> governance`
- `neostack -> governance`
- `runtime_spec -> governance`

Interpretation:
- governed execution plane remains authoritative

### supports_explanation
Use when support artifacts inform explanation only.

Common patterns:
- `support_artifact -> runtime_spec`
- `support_artifact -> sleeve`

Interpretation:
- support-only context is attached for explanatory use
- not runtime-selectable

### maps_to_molt_field
Use when a structural node corresponds to a MOLT role projection.

Common patterns:
- `neostack -> molt_map`
- `constraint -> molt_map`
- `tool_binding -> molt_map`

Interpretation:
- structural relation to MOLT role projection
- does not replace MOLT Map

### emits_trace
Use for trace linkage.

Common patterns:
- `runtime_spec -> trace_event`
- `governance -> trace_event`
- `warning -> trace_event`

Interpretation:
- this matrix corresponds to trace visibility
- no hidden reasoning is implied

### has_warning
Use when a runtime structure carries a warning.

Common patterns:
- `runtime_spec -> warning`
- `neostack -> warning`
- `tool_binding -> warning`

Interpretation:
- warning applies to this runtime structure or relation

## Example 1 — LangChain NeoStack Dry-Run

Input:
- Use the LangChain bridge for a governed workflow.

Representative relations:
- `runtime_spec -> NS.UMG.LANGCHAIN_BRIDGE.v0.1 : selects`
- `NS.UMG.LANGCHAIN_BRIDGE.v0.1 -> tool.langchain_bridge : requests_tool`
- `tool.langchain.agent_mode -> gov.runtime : requires_approval`
- `tool.langchain.agent_mode -> gov.runtime : governed_by`
- `runtime_spec -> trace_id : emits_trace`
- `NS.UMG.LANGCHAIN_BRIDGE.v0.1 -> molt_map : maps_to_molt_field`

Required interpretation:
- LangChain bridge is selected in dry-run.
- `langchain.agent_mode` requires approval.
- No execution occurred.

## Example 2 — Assembled Runtime / No Sleeve Found

Input:
- Build a one-off file report.

Representative relations:
- `runtime_spec -> warning.no_matching_sleeve : has_warning`
- `runtime_spec -> gov.dry_run : governed_by`
- `runtime_spec -> trace_id : emits_trace`
- `runtime_spec -> matrix_placeholder.active_sleeve_none : references`

Required interpretation:
- The runtime is assembled.
- No sleeve is falsely claimed.
- No execution occurred.

## Example 3 — Support Artifact Query

Input:
- Explain how this sleeve works.

Representative relations:
- `support_artifact.human_doc -> runtime_spec : supports_explanation`
- `support_artifact.human_doc -> constraint.support_non_runtime_selectable : blocked_by`
- `runtime_spec -> gov.support_docs_rule : governed_by`
- `runtime_spec -> trace_id : emits_trace`

Required interpretation:
- Support docs may inform explanation.
- Support docs are not runtime-selected.
- No execution occurred.

## Relation selection guidance

Prefer the most literal non-executing relation.

Examples:
- use `requests_tool`, not `executes_tool`
- use `blocked_by`, not `failed_to_run`
- use `references`, not `activates`
- use `supports_explanation`, not `loads_runtime_doc`

## Future-only relations

These may be documented for future phases only:
- `activates`
- `deactivates`
- `reconfigures`
- `resumes_from_checkpoint`
- `executes_tool`

Do not use them in v0 outputs.
They imply live semantics outside the boundary of this design gate.
