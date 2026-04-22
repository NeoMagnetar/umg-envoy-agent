# UMG Envoy Agent Public Package Notes

UMG Envoy Agent is a modular cognitive runtime for OpenClaw that lets you parse, validate, render, and build human-inspectable planner paths through a bounded public-safe interface.

## Public package purpose

This package is the public-facing bounded release of UMG Envoy Agent.
It is intentionally narrower than the broader internal UMG lane and is designed for review, installation, and public-safe use.

## Public package scope

The public package keeps only the bounded public command surface:
- status
- parse-path
- validate-path
- render-path
- build-path
- matrix-status

## Why this is useful

The public package is designed for readable, reviewable planner workflows. It helps users inspect structure before downstream action instead of exposing the full internal execution or compiler lanes.

## Example workflow

```bash
umg-envoy parse-path --file sample.umg
umg-envoy validate-path --file sample.umg
umg-envoy render-path --file sample.umg
```

## What `matrix-status` is for

`matrix-status` reports the bounded public command surface currently exposed by the package and helps confirm that the public lane is operating in a fail-closed posture.

## Excluded internal lanes

The public package intentionally excludes:
- compiler/build orchestration
- runtime promotion and rollback
- authoring/scaffolding lanes
- broader internal operator-heavy runtime surfaces
- internal trace-heavy lanes

## Packaging note

UMG Envoy Agent is a bounded planner and path-building interface, not the full internal UMG compiler/governance runtime.
