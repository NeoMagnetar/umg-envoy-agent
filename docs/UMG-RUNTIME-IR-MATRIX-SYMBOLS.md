# UMG Runtime IR Matrix Symbol System

## Purpose

Runtime IR Matrix v0 should support a compact symbolic format for fast inspection.

The symbolic matrix is a readable runtime structure projection.
It is not hidden reasoning, not execution, and not a substitute for the structured matrix object.

## Design goals

The symbolic system should be:
- compact
- stable
- readable in logs or debug output
- explicit about dry-run semantics
- able to show selected, blocked, support-only, warning, and placeholder states

## Core symbols

### Node kind symbols

- `◆` RuntimeSpec or sleeve root/runtime anchor
- `▣` NeoStack
- `◇` NeoBlock
- `■` MOLT Block
- `🔧` Tool Binding
- `⚖` Governance
- `⛓` Constraint
- `📘` Support Artifact
- `!` Warning
- `⚑` Trace Event / trace reference
- `?` Placeholder / unavailable surface
- `◌` MOLT Map reference

### State symbols

- `●` selected or active in dry-run
- `○` available
- `⊘` blocked
- `!` warning or approval attention marker
- `~` support_only
- `?` placeholder or unavailable

## Recommended rendering pattern

Use one line per structural relation when possible:

`<indent><node-symbol> <node-id-or-label> <state-symbol>`
`<indent> → <target-symbol> <target-id-or-label> <state-or-annotation>`

Optional short annotations may follow for clarity:
- `requires_approval`
- `support_only`
- `blocked`
- `metadata_only`
- `governed`
- `dry_run`

## Example 1 — LangChain NeoStack Dry-Run

```text
◆ runtime_spec_123 ●
 → ▣ NS.UMG.LANGCHAIN_BRIDGE.v0.1 ●
 → 🔧 langchain_bridge ○
 → 🔧 langchain.agent_mode ! requires_approval
 → ⚖ governed_execution_plane ●
 → ⛓ mcp_policy:metadata_only ○
 → ⛓ langchain_policy:governed ○
 → ⚑ trace_abc ○
```

Interpretation:
- LangChain bridge is selected in dry-run.
- tool binding intent is visible.
- `langchain.agent_mode` requires approval.
- governance remains active.
- no execution occurred.

## Example 2 — Assembled Runtime / No Sleeve Found

```text
◆ runtime_spec_456 ●
 → ? active_sleeve:none ?
 → ! no_matching_sleeve !
 → ⚖ dry_run_governance ●
 → ⚑ trace_def ○
```

Interpretation:
- assembled runtime is represented honestly.
- no sleeve is falsely claimed.
- no execution occurred.

## Example 3 — Support Artifact Query

```text
◆ runtime_spec_789 ●
 → 📘 HUMAN_DOC:how_sleeve_works ~ support_only
 → ⛓ support_docs_non_runtime_selectable ⊘
 → ⚖ support_docs_rule ●
 → ⚑ trace_ghi ○
```

Interpretation:
- support docs are attached for explanation only.
- they remain non-runtime-selectable.
- no execution occurred.

## Example 4 — MOLT linkage sketch

```text
◆ runtime_spec_123 ●
 → ◌ molt_map_123 ○
 → ▣ NS.UMG.LANGCHAIN_BRIDGE.v0.1 ●
   → ◌ Directive ○
 → ⛓ approval_required ○
   → ◌ Instruction ○
 → ? matrix.runtime_live_execution ⊘
```

Interpretation:
- matrix references MOLT projection structurally.
- selected artifacts and constraints can map to MOLT fields.
- live execution remains blocked/unavailable in v0.

## Symbol usage rules

1. Symbols must reflect runtime structure, not private reasoning.
2. `●` means selected/active in dry-run, not executed.
3. `⊘` means blocked or unavailable by policy or design boundary.
4. `~` means support-only and non-runtime-selectable.
5. `?` means placeholder or unavailable surface, not unknown model thought.
6. Warnings should stay explicit rather than implied.
7. Governance and constraints should be visible when they condition runtime structure.

## Serialization guidance

The `symbolic` field in `RuntimeIRMatrixV0` may be a newline-delimited string.

It should be treated as:
- optional
- human-readable
- secondary to the structured node/edge graph

Consumers should not rely on symbolic text as the sole machine-readable source of truth.

## Anti-confusion note

The symbolic matrix is not a reasoning transcript.
It is a compact legend-driven rendering of dry-run runtime structure.
