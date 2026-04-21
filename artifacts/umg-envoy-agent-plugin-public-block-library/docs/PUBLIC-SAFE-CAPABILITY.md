# Public-Safe Capability

## Supported now
The public-safe lane currently supports:
- planner shorthand docs/examples
- `parse-path`
- `validate-path`
- `render-path`
- `build-path`
- high-level status reporting
- high-level matrix summary reporting

## Fail-closed posture
The public-safe lane remains fail-closed for:
- invalid planner docs
- unsupported semantics that are not intentionally widened into the public lane

## Intentionally not widened
The public-safe lane does **not** currently expose:
- full `path-trace`
- full `adapter-trace`
- full `compiler-trace`
- raw bridge provenance
- recovery internals
- internal operator lane detail
- full internal modulation-heavy support promises

## Current release posture
This is a selective outward-facing subset of the internal lane, not a full export of the internal subsystem.
