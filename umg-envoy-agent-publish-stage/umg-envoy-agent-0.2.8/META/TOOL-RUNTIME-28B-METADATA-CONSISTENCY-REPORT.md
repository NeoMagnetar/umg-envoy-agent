# TOOL-RUNTIME-28B — Metadata Consistency Report

## Summary

The staged `v0.2.9` public Envoy candidate received a metadata consistency correction pass after TOOL-RUNTIME-28 identified stale version/surface-description drift.

## Corrections applied
- `openclaw.plugin.json` version corrected to `0.2.9`
- stale top-level `config.properties` entries for removed public surfaces (`compilerBridge`, `relationMatrix`) removed
- `dist/plugin-entry.js` status payload version corrected to `0.2.9`
- `dist/plugin-entry.js` exported description narrowed to match the corrected bundled-adapter-only public surface
- `README.md` version/header and public-surface description language narrowed to match the corrected public artifact
- invalid JSON introduced during the first metadata correction attempt was fixed before final repack

## Re-validation result
- `npm run validate:public-surface` passed
- output: `PUBLIC_SURFACE_OK`

## Re-packed artifact
- file: `umg-envoy-agent-0.2.9.tgz`
- final local SHA-256: `016951EBB535CB93032D5BD0979A06227B5AC6DB98EC79D48EAAA40614CEC418`

## Final packed checks
- packed `openclaw.plugin.json` version: `0.2.9`
- packed `package.json` version: `0.2.9`
- packed top-level config keys: `allowRuntimeWrites`, `compilerMode`, `contentMode`, `debug`, `defaultSleeveId`
- packed public `dist` search found no matches for:
  - `node:child_process`
  - `spawn(`
  - `umg_envoy_compile_ir_bridge`
  - `compile-ir-bridge`
  - `umg_envoy_emit_relation_matrix`
  - `emit-relation-matrix`

## Review conclusion
The metadata consistency blockers identified in TOOL-RUNTIME-28 appear resolved in the final re-packed candidate.
This supports moving from a no-publish metadata hold into an explicit approval review posture only.

## Boundary preserved
This phase corrected metadata/docs/description drift only.
It did not publish, tag, upload, or claim ClawHub cleared the package.
