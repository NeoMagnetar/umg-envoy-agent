# UMG Envoy Agent 0.2.2 Release Notes

Date: 2026-04-29
Release Type: release-hardening patch (historically began as release-candidate framing before GitHub release v0.2.2)

## Summary

UMG Envoy Agent 0.2.2 captured the Stage 10/11 UMG v1 validation hardening work and served as the GitHub proof milestone for this package line.

It preserves the validated external compiler bridge path, strengthens relation matrix coverage, and adds a repeatable repo-supported E2E gate so the local UMG v1 pipeline can be revalidated before any later package publication step.

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

- package / ClawHub audit was still required before package publication
- no publish was performed in this stage
- no package publication was performed in this stage
- this document reflects the pre-publication hardening boundary even though GitHub release `v0.2.2` was later created
- `v0.2.3` handles the follow-up publication-readiness cleanup
