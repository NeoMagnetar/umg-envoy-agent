# TOOL-RUNTIME-28 — v0.2.9 Staged Artifact Review

## Summary

A local staged `v0.2.9` public Envoy candidate was inspected from the packed `.tgz` artifact.

Branch under review:
- `fix/public-envoy-surface-v0.2.9`

Working tree:
- `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8`

## Reviewed staged artifact
- file: `umg-envoy-agent-0.2.9.tgz`
- local SHA-256: `C2F00379783FEB5525E4309207E8A6F538A766004B591C5DF7F4D59A11370645`

## Review findings

### Public-surface correction succeeded on the core scanner-sensitive surface
Confirmed in the packed `0.2.9` candidate:
- no `dist/compiler/compiler-process.js`
- no `dist/compiler/compiler-bridge.js`
- no bridge-dependent `relation-matrix-emitter.js`
- no shipped `node:child_process` process-execution surface in the public artifact
- no shipped `spawn(` process-execution surface in the public artifact
- no `umg_envoy_compile_ir_bridge` public tool exposure
- no `compile-ir-bridge` public CLI exposure
- no `umg_envoy_emit_relation_matrix` public tool exposure
- no `emit-relation-matrix` public CLI exposure

### Validation result
Re-run result:
- `npm run validate:public-surface` passed
- output: `PUBLIC_SURFACE_OK`

### Remaining metadata inconsistencies
The packed candidate still contains several version/surface-description inconsistencies that should be corrected before any publish-readiness approval is considered:

#### 1. `openclaw.plugin.json` still reports version `0.2.8`
Packed file review showed:
- `openclaw.plugin.json` version still `0.2.8`

#### 2. `openclaw.plugin.json` top-level config metadata still references removed public surfaces
Packed file review showed `config.properties` still includes descriptive entries for:
- `compilerBridge`
- `relationMatrix`

Even though the stricter `configSchema` no longer exposes those public settings, the top-level metadata still implies those surfaces exist in the public package.

#### 3. `dist/plugin-entry.js` still reports plugin/status version `0.2.8`
Packed file review showed:
- status payload version still `0.2.8`

#### 4. `dist/plugin-entry.js` description string is still broader than the corrected public surface
Packed file review showed the exported entry description still mentions runtime outputs, traces, diagnostics, and relation matrices in a way that overstates the corrected public package boundary.

## Decision

Current staged candidate state is:
- surface-corrected on the core dangerous-exec path
- not yet publish-ready because of stale metadata/version/surface-description inconsistencies

## Recommended next action
Before any publish-readiness approval review:
- correct packed artifact metadata/version strings
- remove stale top-level config metadata that still names removed public surfaces
- narrow stale description language in packed plugin entry if needed
- re-pack and re-review the candidate

## Boundary preserved
This phase reviewed the staged artifact only.
It did not publish, tag, upload, or claim ClawHub cleared the package.
