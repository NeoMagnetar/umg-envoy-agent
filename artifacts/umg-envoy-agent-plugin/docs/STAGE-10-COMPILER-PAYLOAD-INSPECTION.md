# Stage 10 — Compiler Payload Inspection

## Goal
Inspect the exact compiler-side payloads for accepted adapted cases and determine what `hasErrors: true` actually means.

This pass does not widen semantics.
It surfaces compiler-side detail for already accepted adapted cases.

## Key finding
The accepted adapted cases are not failing because the planner is invalid or because the adapter invocation path is collapsing.

They are producing concrete compiler-side validation and warning payloads.

## Observed compiler-side payloads
For accepted adapted cases, the compiler trace includes explicit events such as:

### True validation errors
- `ERR_NO_PRIMARY_DEFINED`
  - `Stack S.MOD.01 has no primary blocks.`
  - `Stack S.MOD.02 has no primary blocks.`
  - `Stack S.MOD.03 has no primary blocks.`

### Warnings / representability pressure
- `WARN_MULTIPLE_INSTRUCTION_ACTIVE`
  - modulation stacks currently keep multiple instruction blocks active without explicit alternates bundle semantics
  - examples:
    - `Stack S.MOD.01 has 4 instructions without explicit alternates bundle; all remain active.`
    - `Stack S.MOD.02 has 2 instructions without explicit alternates bundle; all remain active.`
    - `Stack S.MOD.03 has 2 instructions without explicit alternates bundle; all remain active.`

### Informational events
- `INFO_IMPLICIT_BUNDLE`
- `INFO_BUNDLE_APPLIED`
- `INFO_STACK_GATE_ACTIVE`
- `INFO_VALIDATE_DONE`

These show the compiler is attempting to normalize the adapted input rather than outright rejecting it at load time.

## Classification of current compiler payloads
### `ERR_NO_PRIMARY_DEFINED`
Classification:
- `true_compile_failure`

Reason:
- this is an explicit compiler validation error
- it is not warning noise
- it indicates the adapted planner-to-compiler shape currently omits a compiler-required primary block layer

### `WARN_MULTIPLE_INSTRUCTION_ACTIVE`
Classification:
- `adapter_shape_mismatch`

Reason:
- the current adapted modulation groups are being represented as multiple simultaneously active instruction blocks in a way compiler-v0 warns about
- this does not necessarily mean the planner intent is wrong
- it means the current adapter representation is not yet mapping modulation-style grouped intent into the compiler’s preferred alternates/primary structure

### Informational bundle/gate events
Classification:
- `expected_warning_or_noise` = no
- `result-surface interpretation mismatch` = no
- these are ordinary compiler trace notes

Reason:
- they are useful context, not unexplained error flags

## Revised Stage 9/10 interpretation
The earlier Stage 9 label of `compiler_result_interpretation_mismatch` was the correct provisional label before payload inspection.

After Stage 10 payload inspection, the picture is now clearer:
- part of the remaining seam is a true compile failure (`ERR_NO_PRIMARY_DEFINED`)
- part is an adapter-shape mismatch (`WARN_MULTIPLE_INSTRUCTION_ACTIVE`)

So the unresolved seam is no longer merely interpretation noise.
It is now specific and actionable.

## Provenance continuity
The inspection still preserves full provenance continuity:
- planner-side summary
- adapter-side summary
- compiler-side trace events and error codes

This means the seam is now visible end to end.

## Practical conclusion
Current accepted adapted cases are **not yet truly compiler-clean**.
They are adapter-accepted, but compiler-v0 is correctly signaling two concrete issues:
1. missing primary block representation
2. modulation groups currently encoded as multiple active instruction blocks without explicit alternates semantics

## Recommended next move
If continuing, the next narrow lane should be:
- Stage 11 — compiler-shape alignment

That stage should address only:
1. adding/deriving required primary representation for adapted stacks
2. deciding how modulation groups should map into compiler-v0’s expected alternates/active structure

Do not widen planner semantics yet.
Do not rewrite bundle/merge semantics yet.
