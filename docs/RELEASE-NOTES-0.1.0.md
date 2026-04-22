# Release Notes — UMG Envoy Agent 0.1.0

## Release posture
**Public-safe first release candidate**

This release is the first outward-facing public-safe subset of the broader internal UMG Envoy lane.
It is not the full internal planner / adapter / compiler operator system.

## What shipped
- native OpenClaw plugin package identity: `umg-envoy-agent`
- compiled public-safe runtime in `dist/`
- manifest/config schema in `openclaw.plugin.json`
- public-safe planner shorthand docs and examples
- public-safe command surface for parse / validate / render / build / status / matrix summary
- pruned/hardened public package contents for the approved outward-safe subset

## Public-safe command surface included
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

## Intentionally not widened in this release
- full `path-trace`
- full `adapter-trace`
- full `compiler-trace`
- raw bridge provenance
- recovery internals
- internal operator lane detail
- full internal modulation-heavy runtime promise

## What this release is for
This package is intended to provide:
- a public-safe planner shorthand surface
- a bounded outward-facing utility package
- explicit fail-closed posture for invalid/unsupported public-lane intent

## Packaging/readiness posture
This release candidate has been:
- boundary-defined
- subset-implemented
- content-pruned
- artifact-hardened
- release-verified for the approved public-safe subset

## Bottom line
This is a real public-safe outward-facing release candidate for the UMG Envoy planner shorthand surface.
It should be evaluated as a selective public package, not as a full export of the internal UMG architecture lane.
