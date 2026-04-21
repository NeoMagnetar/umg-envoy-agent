# PLANNER INTEGRATION STAGES

This file translates the current planner integration brief into a concrete implementation order for the internal plugin lane.

## Stage 1 — Freeze the planner contract (current stage)
Goal: make UMG Path Shorthand v0.2 the explicit planner contract and stop syntax drift.

Required outputs:
- formal contract doc
- explicit terminology for states, relationships, bundles, merges, winners, compiler handoff
- code-level type alignment to the frozen contract
- examples updated to the frozen syntax

Must define canonically:
- headers: `USE`, `AIM`, `NEED`, `SLV`, `TRG`, `GATE`, `LOAD`, `CMP`
- hierarchy containers: `STACK`, `BLOCK`, `MOLT`, `ENDBLOCK`, `ENDSTACK`
- state markers: active, latent, suppressed, off, winner
- relationship markers: parallel, sequence, nested, overlay
- bundle declarations
- merge declarations
- winner path
- compiler handoff stage list

Exit criteria:
- one contract doc exists and is referenced by planner docs
- code type names reflect frozen semantics
- parser/validator/renderer example uses frozen terminology
- no ambiguity about what syntax is valid in v0.2

## Stage 2 — Harden parser + validator
Goal: make planner documents safe to accept.

Required outputs:
- parser tightened to contract
- normalized planner document model
- validator expanded beyond current basic structural checks

Validator must check:
- valid sleeve id
- valid stack ids
- valid block ids
- valid hierarchy nesting
- legal relationship declarations
- no illegal state contradictions
- legal bundle syntax
- legal merge syntax
- legal winner chain
- no forbidden overlaps or impossible requests

Exit criteria:
- valid docs parse/validate cleanly
- invalid docs fail clearly with actionable issue codes
- structural and semantic failure classes are separated

## Stage 3 — Build the legend resolver
Goal: make shorthand ids resolve to real runtime/library objects.

Required outputs:
- resolver over loaded sleeve data
- resolver over NeoStack definitions
- resolver over NeoBlock definitions
- resolver over block library entries
- lane-aware legend loading for internal/public selection later

Exit criteria:
- shorthand references are resolvable objects, not just strings
- validator can use resolver-backed checks
- unresolved references produce explicit diagnostics

## Stage 4 — Build planner-from-runtime
Goal: construct planner documents from live runtime context.

Inputs:
- current message
- trigger hits
- gate changes
- loaded sleeve
- persistent stack state
- runtime context

Required outputs:
- runtime builder that chooses stacks/blocks/states
- bundle/merge/winner intent construction
- deterministic planner snapshot from a live turn

Exit criteria:
- same runtime context yields stable planner output
- builder can explain why stacks/blocks were loaded or suppressed

## Stage 5 — Build compiler adapter
Goal: keep planner expressive while compiler input stays deterministic.

Required outputs:
- planner-to-compiler adapter
- bundle translation
- merge translation
- winner path translation
- suppression/off handling

Exit criteria:
- valid planner docs convert into legal current compiler input
- invalid or unsupported planner semantics fail before compile

## Stage 6 — Trace and introspection
Goal: make planner behavior inspectable.

Trace must show:
- triggers detected
- gates opened/closed
- loaded sleeve
- stacks loaded
- active blocks
- latent blocks
- suppressed blocks
- bundle requests
- merge requests
- winner path
- compiler adapter output
- compiler trace

Exit criteria:
- planner runs are explainable without reading source
- snapshots can be saved for debugging/regression testing

## Stage 7 — Plugin command surface
Goal: expose planner as a first-class subsystem.

Commands:
- `path-build`
- `path-parse`
- `path-validate`
- `path-render`
- `path-trace`
- later: `path-compile`

Exit criteria:
- planner workflows are accessible through plugin tools/commands
- no hidden glue-only planner path remains necessary for normal use

## Stage 8 — Tests
Goal: prove the subsystem before widening scope.

Tests should cover:
- valid planner docs
- invalid planner docs
- trigger -> planner output
- planner -> compiler adapter
- winner path resolution
- off/on state transitions
- multi-turn persistent stack behavior
- merge/bundle compatibility with current compiler constraints

Exit criteria:
- planner contract regression suite exists
- runtime builder and adapter are covered by representative cases

## Lane rule
Do all of this in the internal plugin lane first.
Only after validation should any subset be widened into the public lane.
