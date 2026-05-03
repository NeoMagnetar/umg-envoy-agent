# TOOL-RUNTIME-32 — v0.2.10 Packaging Hygiene / ClawPack Clean Release Plan

## Summary
A clean `v0.2.10` packaging-hygiene branch was prepared to preserve the corrected public-safe code from `v0.2.9` while removing accidental audit/build byproducts from the packed public artifact.

## Branch
- `fix/v0.2.10-packaging-hygiene`

## Changes made
- bumped `package.json` version to `0.2.10`
- bumped `openclaw.plugin.json` version to `0.2.10`
- bumped `dist/plugin-entry.js` status version to `0.2.10`
- updated README top-line/current-candidate wording to `v0.2.10`
- added `docs/RELEASE-NOTES-0.2.10.md`
- added strict `files` allowlist in `package.json`
- added defensive `.npmignore`

## Packaging goal
The public package should now include only the intended public-safe plugin contents:
- `dist/`
- selected `docs/`
- `openclaw.plugin.json`
- `package.json`
- `README.md`
- `public-content/`

And should exclude working trash such as:
- `META/`
- `_inspect_*`
- local `.tgz` archives
- temp consumer audit folders

## Validation result
- `npm run validate:public-surface` passed
- output included `PUBLIC_SURFACE_OK`

## Packed artifact
- artifact: `umg-envoy-agent-0.2.10.tgz`
- local SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`

## Packed artifact hygiene result
The packed `v0.2.10` candidate was inspected and reflects the allowlisted package shape instead of the cluttered working folder shape.

## Consumer install result
A fresh temp consumer install audit for `v0.2.10` succeeded.
Installed package version was `0.2.10` and forbidden-surface search still returned `NO_MATCHES` for:
- `node:child_process`
- `spawn(`
- `umg_envoy_compile_ir_bridge`
- `compile-ir-bridge`
- `umg_envoy_emit_relation_matrix`
- `emit-relation-matrix`

## Interpretation
This supports a clean `v0.2.10` release plan whose purpose is packaging hygiene only, not runtime-behavior change.

## Boundary preserved
This phase did not publish `v0.2.10`, did not touch Desktop Bridge or PhaseBridge, and did not reintroduce bridge-execution public tools.
