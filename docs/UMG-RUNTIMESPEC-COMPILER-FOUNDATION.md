# UMG RuntimeSpec Compiler Foundation

## Purpose

RuntimeSpec is the bridge between the Cognitive Registry Plane and the Governed Execution Plane.

- The resolver/index/search layer answers: what exists, where it came from, whether it is canonical, whether it is runtime-selectable, and whether it is support-only.
- The governed execution layer answers: what may run, what requires approval, what can resume, and how LangChain/MCP/tool execution remains contained.
- RuntimeSpec answers: what artifacts are active for this task, what constraints apply, what tool bindings are requested, and what governance handoff must later be honored.

RuntimeSpec is **compiled configuration**, not execution permission.

## Design constraints

1. RuntimeSpec cannot override governance.
2. RuntimeSpec cannot silently select HUMAN support docs as runtime artifacts.
3. RuntimeSpec cannot make support-only artifacts runtime-selectable.
4. RuntimeSpec cannot bypass approval checkpoints or resume controls.
5. RuntimeSpec cannot enable MCP or LangChain execution beyond existing policy.
6. RuntimeSpec must preserve provenance for every selected artifact.
7. RuntimeSpec must emit warnings when selection is partial, assembled, or missing a sleeve.

## Design scope for this gate

This gate covers:
- v0 schema design
- artifact selection boundaries
- governance integration boundaries
- trace event model
- future matrix/MOLT/IR hooks
- examples

This gate does **not** implement:
- live compiler execution
- RuntimeSpec-based tool execution
- matrix generation
- MOLT Map generation
- runtime reconfiguration
- draft writing

## Plane boundary

### 1. Cognitive Registry Plane

Inputs to RuntimeSpec:
- canonical artifacts
- generated_index/index/manifest provenance
- support-only artifacts
- source mode
- artifact kind/source/status/tags/capabilities/domains

### 2. Governed Execution Plane

Outputs from RuntimeSpec:
- requested tool bindings
- blocked tool bindings
- approval-required hints
- governance mode
- trace handoff
- matrix reference placeholders

RuntimeSpec sits between them. It does not replace either plane.

## Selection boundary rules

### Runtime-selectable artifacts

RuntimeSpec may select only artifacts that are:
- canonical or otherwise explicitly approved package-lane artifacts
- runtime_selectable = true
- not support_only
- not HUMAN markdown support docs
- not deprecated unless explicitly allowed later
- provenance-backed by manifest, index, or generated_index

### Non-selectable artifacts

RuntimeSpec must not select:
- HUMAN support docs
- support_only artifacts
- runtime_selectable = false artifacts
- unknown fallback artifacts
- ungoverned external capability surfaces

### Support artifacts

Support artifacts may be attached as documentation/context only:
- `support_artifacts[]`
- runtime_selectable remains false
- no execution implied
- used for explanation/help/guide-style tasks

## Default selection order for v0

Keep it simple:
1. Sleeve if one strongly matches.
2. NeoStack if no sleeve strongly matches.
3. NeoBlock if task is narrow.
4. MOLT blocks only as supporting constraints around selected higher-level artifacts.

This is intentionally conservative and not a general intelligence selector.

## Missing sleeve behavior

If no sleeve is suitable, RuntimeSpec may still compile an assembled runtime:

- `runtime_kind: assembled_runtime`
- `active_sleeve: null`
- `active_neostacks`, `active_neoblocks`, `active_molt_blocks` may still be populated
- warning required: no matching sleeve found

Do not pretend a real sleeve exists when it does not.

## Future path

After this design gate, the next safe implementation phase would be:
- RuntimeSpec Compiler Foundation — Read-Only Dry-Run Implementation

That phase would compile RuntimeSpec objects without changing live execution behavior.
