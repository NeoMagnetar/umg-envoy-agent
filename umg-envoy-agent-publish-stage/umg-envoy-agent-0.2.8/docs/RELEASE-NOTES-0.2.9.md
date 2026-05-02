# UMG Envoy Agent v0.2.9 Release Notes

UMG Envoy Agent v0.2.9 is a public-surface correction release for the public ClawHub package.

## What changed

This release narrows the public package to a bundled-adapter/public-safe surface and removes shipped local process-execution bridge exposure from the public artifact.

Public package corrections include:
- removed public bridge tool exposure
- removed public bridge CLI exposure
- removed shipped bridge runner files from the public package surface
- removed shipped dangerous-exec public indicators such as `node:child_process` and `spawn(` from the public package surface
- aligned public package metadata and descriptions to the corrected bundled-adapter-only posture

## What did not change

This release does not:
- publish Desktop Bridge
- publish PhaseBridge
- ship the full compiler repo
- delete compiler bridge source from broader dev/local lanes
- authorize runtime widening or new public execution behavior

## Release intent

This is a package-hardening and public-surface hygiene release.
It is intended to make the public artifact more accurate, narrower, and cleaner for public distribution review.
