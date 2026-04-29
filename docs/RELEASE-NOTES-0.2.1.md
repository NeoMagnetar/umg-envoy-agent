# UMG Envoy Agent 0.2.1 Release Notes

Date: 2026-04-26

## Summary

Patch release for ClawHub compatibility. Adds required config schema declaration for code plugin publication. No compiler/runtime behavior changes from v0.2.0.

## Fixed

- added required ClawHub config schema declaration for code plugin publication

## Validation

- `npm install` passed
- `npm run check` passed
- `npm run build` passed
- `npm run smoke` passed
- `npm run pack:dry` passed

## Follow-up after 0.2.1

- Stage 10B.3/10C validated the external-cli UMG v1 E2E path on local main using:
  - sleeve load
  - structural validation
  - artifact resolution
  - canonical IR generation
  - compiler bridge invocation
  - runtime-spec / trace / diagnostics capture
  - relation matrix emission
- Stage 11B adds a repeatable repo-supported validation gate via:
  - `npm run validate:umg:e2e -- --sleevePath <path> --libraryRoot <path> --compilerRepoPath <path>`
- This is validation hardening only; it does not publish a release or change compiler behavior.
