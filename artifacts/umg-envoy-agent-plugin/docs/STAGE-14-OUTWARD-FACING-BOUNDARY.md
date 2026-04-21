# Stage 14 — Outward-Facing Subset and Release Boundary

## Purpose
Define the release boundary for the current internal lane without widening semantics or automatically exposing the full internal subsystem.

This is a boundary-definition pass, not a release implementation pass.

## Boundary classes
- `internal_only`
- `public_safe_now`
- `later_widening_candidate`

## Guiding rule
The public lane should not automatically inherit the full internal lane.
Only surfaces that are stable, inspectable, and safe without leaking internal recovery/provenance complexity should be considered public-safe now.

## 1. Internal-only now
These surfaces should remain internal-only for now.

### Planner / trace surfaces
- full `path-trace`
- full `adapter-trace`
- full `compiler-trace`
- raw runtime/legend bridge provenance surfaces
- internal matrix regression detail beyond summary status

Why:
- these expose internal recovery lanes, generated recovery assets, provenance classes, and internal compiler-shape alignment details that are useful for internal operation/debugging but too sharp for outward-facing default exposure

### Adapter behavior
- planner-to-compiler adapter internals
- explicit stage-11 shape alignment details
- derived primary insertion behavior
- bundle/alternates shaping details used only to satisfy current compiler-v0 expectations

Why:
- stable enough for internal use, but still too coupled to current internal compiler-v0 behavior to present as public-facing stable contract

### Runtime patterns
- full currently supported modulation-heavy internal runtime matrix as a public promise

Why:
- internally proven does not yet mean publicly promised
- public support should lag behind internal capability until the public lane intentionally adopts and documents those patterns

### Internal write/mutation surfaces
- promotion / rollback / authoring mutation commands as part of outward-facing default planner lane exposure

Why:
- these are operationally real, but they are not part of the narrow planner/adapter outward-facing subset decision

## 2. Public-safe now
These are the strongest candidates to expose outward now.

### Planner surfaces
- path shorthand docs/examples as documentation
- `parse-path`
- `validate-path`
- `render-path`
- `build-path` as a human-inspectable planner surface

Why:
- these are already bounded, readable, and useful without exposing the full internal bridge/adapter machinery

### Status/report surfaces
- high-level matrix status summary
- high-level capability summary
- fail-closed behavior summary

Why:
- these communicate supported posture without dumping internal diagnostics

### Fail-closed boundary behavior
Safe to state outward now:
- invalid planner docs are blocked
- unsupported merge/bundle intent is not silently flattened
- current outward-safe lane is intentionally narrower than internal capability

Why:
- this is a stability/safety promise, not an implementation leak

## 3. Later widening candidates
These are not public-safe by default yet, but are reasonable future widening candidates.

### Trace surfaces
- reduced/sanitized planner trace
- reduced/sanitized adapter trace
- reduced/sanitized compiler trace

Condition for widening:
- trace payloads need a public-safe view that hides internal recovery scaffolding and internal-only provenance detail while preserving useful operator inspection

### Adapter behavior summary
- public-facing representation boundary summary
- public-safe compileability report for supported patterns

Condition for widening:
- the public lane must intentionally adopt a narrower supported planner subset and document it as a stable contract

### Supported runtime patterns
- a smaller declared subset of the currently green internal matrix

Condition for widening:
- pattern support must be chosen intentionally, documented clearly, and backed by a public-lane regression gate rather than inherited by accident from the internal lane

## Public-facing boundary summary
### Internal-only
- rich planner/adapter/compiler traces
- recovery/provenance internals
- internal compiler-shape alignment details
- full internal operator lane

### Public-safe now
- planner shorthand docs/examples
- parse / validate / render / build planner surfaces
- high-level capability + fail-closed summaries
- high-level matrix/status reporting

### Later widening candidates
- sanitized trace/report views
- explicit public representability boundary report
- selected supported runtime pattern subset

## Practical conclusion
The internal lane is now strong enough to define an outward-facing boundary.
But the correct move is selective widening, not full export.

The safest immediate outward subset is:
- planner shorthand surface
- high-level validation/build/report surface
- explicit fail-closed posture

The full internal planner/adapter/compiler operator lane should remain internal-only until a narrower public contract is intentionally designed.
