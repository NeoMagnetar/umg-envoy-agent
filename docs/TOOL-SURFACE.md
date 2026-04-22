# Tool Surface

## Public-safe surface
This package intentionally exposes only the current approved public-safe UMG planner subset.

## Supported commands

### `umg-envoy status`
High-level public-safe status summary.

### `umg-envoy parse-path`
Parse a planner shorthand file into structured JSON.

### `umg-envoy validate-path`
Validate a planner shorthand file structurally.

### `umg-envoy render-path`
Render a planner shorthand document from shorthand or JSON input.

### `umg-envoy build-path`
Build a public-safe human-inspectable planner path from a message.

This public-safe builder is now sleeve-aware for approved public-safe sleeve profiles, while remaining intentionally narrower than the full internal runtime planner/operator lane.

### `umg-envoy matrix-status`
Return a high-level summary of public-safe matrix/status posture.

## Intentionally not widened
The following remain internal-only and are not part of this public package surface:
- `path-trace`
- `adapter-trace`
- `compiler-trace`
- raw bridge provenance
- recovery internals
- internal operator lane detail

## Fail-closed posture
The public-safe lane remains fail-closed for:
- invalid planner docs
- unsupported semantics not intentionally widened into the public lane

## Design note
This package is a selective outward-facing subset of the internal UMG Envoy lane.
It should not be interpreted as exposing the full internal planner / adapter / compiler operator surface.
