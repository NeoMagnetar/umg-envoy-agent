# UMG Governed Execution Handoff Checkpoints

## Purpose

This document defines checkpoint and resume design rules for governed execution handoff.

The handoff may describe future checkpoint requirements.
It does not create checkpoints in this gate.

## Checkpoint object

```ts
checkpoint: {
  checkpoint_required: boolean;
  checkpoint_policy: "not_required" | "required_before_execution" | "future_only";
  resume_policy: "not_applicable" | "resume_requires_checkpoint" | "future_only";
}
```

## Checkpoint semantics

### not_required
Use when the tool plan is metadata-only or purely read-only dry-run and no stateful external action would need checkpoint control.

### required_before_execution
Use when future execution would need checkpoint discipline before continuing.
Examples:
- approval-gated multi-step actions
- write operations
- workflow execution surfaces
- resumable stateful plans

### future_only
Reserved for later phases when the real approval/checkpoint contract exists.

## Resume semantics

### not_applicable
Use when no checkpointed execution path would exist.

### resume_requires_checkpoint
Use when future resumption should only occur from a checkpointed handoff.

### future_only
Reserved for later implementation phases.

## Typical mapping rules

- metadata-only tool → `checkpoint_required: false`
- blocked tool → `checkpoint_required: false` because execution is blocked
- approval-gated workflow tool → `checkpoint_required: true`
- file-write/publish tool → `checkpoint_required: true`
- purely read-only dry-run file scan → `checkpoint_required: false` unless later policy says otherwise

## Example 1 — LangChain approval handoff

Expected:
- `checkpoint_required: true`
- `checkpoint_policy: required_before_execution`
- `resume_policy: resume_requires_checkpoint`

Reason:
- approval-gated multi-step action should not later run without checkpoint discipline

## Example 2 — Metadata-only MCP handoff

Expected:
- `checkpoint_required: false`
- `checkpoint_policy: not_required`
- `resume_policy: not_applicable`

## Example 3 — Blocked destructive action

Expected:
- `checkpoint_required: false`
- execution is blocked before checkpointing matters

## Boundary rules

1. Handoff checkpoint design does not create checkpoints.
2. Handoff checkpoint design does not write resume state.
3. Handoff checkpoint design does not resume actions.
4. Handoff checkpoint design does not bypass existing approval/checkpoint systems.
5. Checkpoint requirement is descriptive only in this gate.
6. `No tools executed.` remains explicit.
