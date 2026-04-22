# UMG Envoy Agent

## What this public release is

UMG Envoy Agent is a modular cognitive architecture runtime built on the UMG system. This public release exposes a bounded planner and path-building surface for parsing, validating, rendering, and building human-inspectable runtime paths, while intentionally excluding internal compiler, rollback, promotion, and operator-heavy lanes from the public package.

## Public surface

This public package supports:
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

## What this release is not

This is not the full internal UMG runtime lane.
It intentionally does not ship:
- internal compiler/build process lanes
- rollback or promotion flows
- runtime authoring and scaffolding lanes
- operator-heavy internal runtime behavior
- full trace-heavy internal surfaces

## Current purpose

This package is the trust-cleanup public release line for UMG Envoy Agent.
Its purpose is to present a bounded, reviewable, public-safe runtime surface whose docs, metadata, and artifact behavior match each other cleanly.
