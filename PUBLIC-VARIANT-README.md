# UMG Envoy Agent Public Package Notes

UMG Envoy Agent is a modular cognitive architecture runtime for OpenClaw that exposes a bounded public-safe planner and path-building surface from the broader UMG system.

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

## Excluded internal lanes

The public package intentionally excludes:
- compiler/build orchestration
- runtime promotion and rollback
- authoring/scaffolding lanes
- broader internal operator-heavy runtime surfaces
- internal trace-heavy lanes

## Packaging note

This package should be read as a bounded public runtime release, not as a claim that the public package equals the full internal UMG system in depth or operational breadth.
