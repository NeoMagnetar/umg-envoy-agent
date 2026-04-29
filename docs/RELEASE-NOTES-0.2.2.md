# UMG Envoy Agent 0.2.2 Release Notes

Date: 2026-04-29
Release Type: Release candidate / release-hardening patch

## Summary

UMG Envoy Agent 0.2.2 prepares a conservative release candidate after the Stage 10/11 UMG v1 validation hardening work.

It preserves the validated external compiler bridge path, strengthens relation matrix coverage, and adds a repeatable repo-supported E2E gate so the local UMG v1 pipeline can be revalidated before any publication step.

## Included validation hardening

- validated external compiler bridge path using explicit sleeve / library / compiler repo inputs
- stronger relation matrix coverage for:
  - route/governance relation
  - NeoBlock relation family
  - overlay relation family
  - capability relation family
- repeatable E2E validation gate:
  - `npm run validate:umg:e2e -- --sleevePath <path> --libraryRoot <path> --compilerRepoPath <path>`
- contamination guard covering:
  - Envoy repo
  - UMG-Block-Library
  - umg-compiler
- temp-only runtime output policy for:
  - `runtime-spec.json`
  - `trace.json`
  - `diagnostics.json`
  - `relation-matrix.umg`
  - `resolved.ir.json`

## Validation

- `npm run check`
- `npm run build`
- `npm run smoke`
- `npm run validate:umg:e2e`
- `npm run pack:dry`

## Release boundary

- package / ClawHub audit is still required before publish
- no publish was performed in this stage
- no tag was created in this stage
- no GitHub release was created in this stage
