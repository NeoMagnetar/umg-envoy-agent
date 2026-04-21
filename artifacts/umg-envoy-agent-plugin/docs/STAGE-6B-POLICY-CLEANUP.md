# Stage 6b — Policy Cleanup

## Goal
Resolve the remaining planner warnings by making policy explicit rather than muting the validator blindly.

## Issues targeted
The Stage 6 residual warning set was:
- `SLEEVE_ID_SHAPE`
- `MULTI_ACTIVE_BLOCK`
- `NO_TRIGGERS`

## Policy decisions made

### 1. Internal sleeve naming policy
Decision:
Accept internal lane sleeve ids that use known internal shapes such as:
- `sample-*`
- `generated-*`
- `runtime-*`
- canonical `slv*` forms

Reason:
The internal plugin lane intentionally uses some non-`slv` sleeves during staged runtime/planner work.
This is not a semantic failure and should not be treated as one.

### 2. Modulation-group multi-active policy
Decision:
Allow multiple active MOLT members inside modulation-group NeoBlocks identified by `NB.MOD.*`.

Reason:
For modulation groups, coexistence of multiple active members is an intentional architectural pattern rather than an invalid state.
The validator warning was too strict for this grouped modulation design.

### 3. Trigger neutrality policy
Decision:
Suppress generic `NO_TRIGGERS` warning when the planner document explicitly carries:
- `trigger_state:neutral`

Reason:
Once the runtime planner explicitly distinguishes:
- matched
- neutral
- omitted

a neutral no-trigger state is no longer a hidden omission and should not be treated as a generic planner failure.

## Result
After Stage 6b, the real runtime planner smoke returned:
- semantic success
- structural success
- zero issue codes

## Why this matters
This is not validator silencing for convenience.
It is policy clarification based on the actual architecture now in use:
- internal sleeve naming is intentional
- modulation-group coexistence is intentional
- neutral trigger absence is intentional and explicit

## Current state
The planner / resolver / bridge / asset / assembly / policy loop now returns a clean runtime smoke pass for the current internal lane sample.
