# UMG Envoy Agent 0.2.2 Release Checklist

Release candidate boundary only.
Do not publish, tag, or create a GitHub release until this checklist is explicitly approved.

## Required validation

- `npm run check`
- `npm run build`
- `npm run smoke`
- `npm run validate:umg:e2e -- --sleevePath "<path>" --libraryRoot "<path>" --compilerRepoPath "<path>"`
- `npm run pack:dry`

## E2E gate expectations

- response-only path passes
- temp-write path passes
- compiler bridge exit code is `0`
- required relation assertions pass
- contamination guard passes
- temp cleanup passes

## Package audit expectations

Confirm pack dry-run does not include:
- `.tmp-stage*`
- `runtime-spec.json`
- `trace.json`
- `diagnostics.json`
- `relation-matrix.umg`
- `resolved.ir.json`
- `FILESET-COMPARISON-VALIDATED-VS-RELEASE-CLONE.md`
- `RELEASE-BLOCKER-PACK-CONTAMINATION-REPORT.md`
- `UMG-Block-Library` contents
- `umg-compiler` contents
- local absolute-path artifacts

## Cleanliness guard

- Envoy tracked working tree clean
- UMG-Block-Library clean
- umg-compiler clean
- no runtime outputs committed
- no package tarball committed
