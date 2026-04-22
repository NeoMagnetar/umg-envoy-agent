# Release Notes - UMG Envoy Agent 0.1.1

UMG Envoy Agent v0.1.1 is a trust-cleanup release for the public-safe UMG runtime. This update narrows the shipped public capability surface, removes broader internal/runtime-authoring lanes from the public artifact, aligns package metadata and docs with the actual publish path, and improves release trust through cleaner provenance and a tighter public-facing package.

## Highlights

- narrowed the public runtime surface to the bounded planner and path-building commands
- removed broader internal process-control and operator-heavy build/runtime lanes from the public artifact
- removed broad vendored block-library baggage from the public package
- aligned package docs and metadata with `package.json -> openclaw.extensions` and `package.json -> openclaw.configSchema`
- prepared the package for immutable-tag publishing under `v0.1.1`
