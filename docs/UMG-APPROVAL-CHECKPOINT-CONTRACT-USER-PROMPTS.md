# UMG Approval / Checkpoint Contract User Prompts

## Status
Design gate only.

This document defines what a future approval prompt must show to the user.

## Required Prompt Content
Every future approval prompt must include:
- title
- plain-language action summary
- exact tool list requested for future execution
- risk list in user-visible wording
- blocked items shown separately
- whether checkpointing is required before future execution
- exact scope statement
- expiration statement if applicable
- single-use statement if applicable
- explicit non-execution statement

Required statement:

> No tools executed.

## Prompt Requirements
The prompt must not:
- ask for vague blanket approval
- hide blocked tools
- imply that availability equals approval
- imply that approval already caused execution
- expose hidden chain-of-thought
- allow support docs to masquerade as runtime requests

## Suggested Prompt Skeleton

### Approval Required
**Title:** Approval required for future governed execution request

**Summary:**
A dry-run handoff identified future tool actions that would require explicit approval before any execution discussion can continue.

**Tools requested:**
- `<tool id>`
- `<tool id>`

**Risks:**
- `<plain language risk>`
- `<plain language risk>`

**Blocked items:**
- `<tool id> — cannot be approved under v0>`

**Checkpoint requirement:**
A checkpoint would be required before any future approved execution attempt.

**Scope:**
This request applies only to the exact RuntimeSpec, handoff, and tool plan shown here.

**Execution:**
No tools executed.

### No Approval Required
If all tools are read-only metadata or purely dry-run-visible, the UI may say approval is not required.
But it still must not imply execution occurred.

### Resume Invalid Example
If resume is stale, the UI should say the request is invalid because the RuntimeSpec or tool plan changed and revalidation is required.

## Exact-Scope Wording
Prompt text should clearly state one of:
- this single tool only
- this single governed handoff only
- this single RuntimeSpec only

It must never say things like:
- "approve this category"
- "approve this assistant"
- "approve future tools"

## Design Boundary
This document designs user-visible wording only.
It does not implement prompt dispatch or persistence.
