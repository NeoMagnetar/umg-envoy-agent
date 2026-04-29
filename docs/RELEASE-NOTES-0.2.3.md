# UMG Envoy Agent 0.2.3 Release Notes

Date: 2026-04-29
Release Type: publication-cleanup patch

## Summary

UMG Envoy Agent 0.2.3 is a narrow publication-readiness cleanup patch.

It does not add new runtime features or alter compiler behavior. Instead, it removes stale release-candidate framing, improves UMG/Envoy terminology for fresh testers, clarifies what ships in the package, and keeps maintainer-only validation surfaces out of the published package output.

## Changed

- updated README and release-facing documentation to remove stale active release-candidate framing
- clarified UMG Envoy Agent as an OpenClaw-facing bridge for sleeves, artifact resolution, canonical IR generation, compiler execution, and runtime output inspection
- added clearer terminology for UMG, Envoy, Sleeve, MOLT, Canonical IR, Runtime Spec, Trace, Diagnostics, and Relation Matrix
- improved fresh-tester guidance for what ships, what does not ship, and which validation commands are maintainer-only
- clarified that `validate:umg:e2e` is a repo-maintainer validation gate rather than a normal packaged runtime surface
- removed `package-lock.json` from the published package surface

## Historical clarification

- `v0.2.2` began as a release-hardening / release-candidate stage
- `v0.2.2` was later tagged and released on GitHub
- package / ClawHub publication remained intentionally separate
- `v0.2.3` prepares the package for a later final publication step without performing it

## Validation

- `npm run check`
- `npm run build`
- `npm run smoke`
- `npm run validate:umg:e2e`
- `npm run pack:dry`

## Publication boundary

- no npm publish was performed in this stage
- no ClawHub publish was performed in this stage
- no GitHub release was created in this stage
- no tag was created in this stage
