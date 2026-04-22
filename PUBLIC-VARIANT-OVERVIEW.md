# UMG Envoy Agent

## What this public release is

UMG Envoy Agent is a modular cognitive runtime for OpenClaw that lets you parse, validate, render, and build human-inspectable planner paths through a bounded public-safe interface.

UMG Envoy Agent is a modular cognitive architecture runtime built on the UMG system. This public release exposes a bounded planner and path-building surface for parsing, validating, rendering, and building human-inspectable runtime paths, while intentionally excluding internal compiler, rollback, promotion, and operator-heavy lanes from the public package.

## Public surface

This public package supports:
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

## Example workflow

```bash
umg-envoy parse-path --file sample.umg
umg-envoy validate-path --file sample.umg
umg-envoy render-path --file sample.umg
```

## What `matrix-status` is for

`matrix-status` reports the bounded public command surface currently exposed by the package and helps confirm that the public lane is operating in a fail-closed posture.

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
