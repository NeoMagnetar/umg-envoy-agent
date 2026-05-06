# UMG Approval / Checkpoint Contract Preflight

## Status
Design gate only.

Before any future governed execution can occur, preflight validation must succeed.

Failure of any required check blocks future execution.

## Required Checks

### 1. RuntimeSpec match
Verify the `runtime_spec_id` and effective RuntimeSpec content match the governed handoff and checkpoint snapshot.

Block if:
- RuntimeSpec ID differs
- RuntimeSpec hash differs
- handoff references another RuntimeSpec

### 2. Tool plan match
Verify the future execution set matches the checkpointed tool plan hash.

Block if:
- requested tools differ
- approval-required list differs
- blocked list differs
- metadata-only or mock-only classifications differ

### 3. Selected context match
Verify active sleeve, NeoStacks, NeoBlocks, and MOLT blocks still match.

Block if:
- selected sleeve changed
- active runtime artifacts changed
- selected context hash differs

### 4. Approval request match
Verify the approval request still matches the handoff and visible summary.

Block if:
- approval request references another handoff
- approval request hash differs
- visible summary no longer matches actual plan

### 5. Approval validity
Verify approval status is still valid.

Block if:
- decision denied
- decision expired
- decision invalidated
- single-use approval already consumed in a future phase

### 6. Approval scope match
Verify approved items cover the exact requested scope.

Block if:
- scope was `single_tool` but multiple tools are attempted
- scope was `single_handoff` but another handoff is targeted
- scope was `single_runtime_spec` but RuntimeSpec changed

### 7. Blocked tools absent
Verify no blocked tools appear in the future execution set.

Block if:
- destructive blocked tools appear
- policy-blocked tools appear
- blocked-by-default remote tools appear

### 8. Unknown tools absent
Verify every future execution tool is known and classified.

Block if:
- tool is unknown
- tool is unresolved
- tool classification cannot be reproduced

### 9. Policy version match
Verify policy version has not changed, or require explicit revalidation.

Block if:
- governance policy changed
- resolver-derived policy surface changed materially
- no successful revalidation was performed in a later phase

### 10. Checkpoint exists where required
Verify checkpoint identity exists for resumable or approval-gated execution.

Block if:
- checkpoint is missing
- checkpoint is incomplete
- checkpoint status is invalid or expired

### 11. Resume reference validity
Verify the resume reference matches the checkpoint and handoff.

Block if:
- checkpoint ID mismatches
- handoff ID mismatches
- resume status is invalid or expired

### 12. Execution mode allowed
Verify the future execution mode is still permitted under governance.

Block if:
- dry-run-only policy remains in force
- requested mode exceeds approved boundary
- execution path attempts direct bypass

### 13. Support-doc source rejection
Verify support documentation did not originate the tool request.

Block if:
- requested tool provenance is support-only
- explanation artifact is treated as runtime artifact
- approval request includes support-doc-derived tool claims

### 14. User-visible summary match
Verify the approval summary matches the real tool plan.

Block if:
- tools requested differ from summary
- risk wording omits material risk
- blocked items are hidden
- summary implies execution already happened

## Future Preflight Result Model
A later phase may return a structured result like:
- pass/fail per check
- blocking reasons
- exact mismatch fields
- revalidation required flag

But this phase only defines the checks.

## Boundary Statement
Preflight design here does not run execution.

> No tools executed.
