# UMG Envoy Agent 0.2.5 Release Notes

Date: 2026-04-29
Release Type: hardened ClawHub release candidate

## Summary

UMG Envoy Agent 0.2.5 is the hardened ClawHub release candidate.

`0.2.4` successfully proved the ClawHub publish path, but the published artifact surface was broader than intended. `0.2.5` prepares a clean-staging publication path so only intended public plugin files are shipped.

This patch does not change runtime, compiler, relation matrix, or artifact resolver behavior.

## Changed

- prepares a clean staging directory for hardened ClawHub publication
- documents that repo-root ClawHub publishing is not acceptable for the hardened release path
- preserves improved package description, tags, glossary, tester guidance, and UO-boundary clarification
- clarifies that maintainer-only scripts, local reports, source tree, config directory, and legacy draft files are not part of the hardened ClawHub artifact

## Validation

- `npm run build`
- `npm run check`
- `npm run smoke`
- `npm run validate:umg:e2e`
- `npm run pack:dry`
- staged file inventory audit

## Publication boundary

- no ClawHub publish was performed in this stage
- no npm publish was performed in this stage
- no GitHub release was created in this stage
- no tag was created in this stage
