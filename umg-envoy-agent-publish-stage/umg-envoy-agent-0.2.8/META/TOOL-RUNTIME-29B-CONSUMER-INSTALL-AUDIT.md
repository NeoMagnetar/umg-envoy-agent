# TOOL-RUNTIME-29B — Final Local Consumer Install / Dry-Run Audit

## Summary

A clean temporary local consumer project was created and the corrected public `umg-envoy-agent` `v0.2.9` candidate was installed from the local `.tgz` with scripts disabled.

The installed dependency was then inspected as a real consumer package surface.

## Consumer audit project
- path: `C:\.openclaw\workspace\tmp-umg-envoy-consumer-audit`
- install mode: `npm install --ignore-scripts <local-tgz>`

## Candidate under audit
- package: `umg-envoy-agent`
- version: `0.2.9`
- artifact: `umg-envoy-agent-0.2.9.tgz`
- final local SHA-256: `016951EBB535CB93032D5BD0979A06227B5AC6DB98EC79D48EAAA40614CEC418`

## Installed package metadata findings
### package.json
Installed `package.json` showed:
- name: `umg-envoy-agent`
- version: `0.2.9`

### openclaw.plugin.json
Installed `openclaw.plugin.json` showed:
- version: `0.2.9`
- narrowed bundled-adapter/public-safe description
- top-level config properties limited to:
  - `allowRuntimeWrites`
  - `contentMode`
  - `compilerMode`
  - `debug`
  - `defaultSleeveId`
- public tool list limited to public-safe tools

## Installed package content findings
Installed file surface matched the staged public-safe package shape.
Notably absent from installed package contents:
- `dist/compiler/compiler-process.js`
- `dist/compiler/compiler-process.d.ts`
- `dist/compiler/compiler-bridge.js`
- `dist/compiler/compiler-bridge.d.ts`
- `dist/compiler/relation-matrix-emitter.js`
- `dist/compiler/relation-matrix-emitter.d.ts`

## Forbidden surface search
Searches against installed public `dist` and `openclaw.plugin.json` found no matches for:
- `node:child_process`
- `spawn(`
- `umg_envoy_compile_ir_bridge`
- `compile-ir-bridge`
- `umg_envoy_emit_relation_matrix`
- `emit-relation-matrix`

Result:
- `NO_MATCHES`

## npm publish dry-run
A safe `npm publish --dry-run` was run from the installed package copy.

Observed:
- dry-run succeeded
- package name/version resolved as `umg-envoy-agent@0.2.9`
- tarball details reported 56 total files
- no real upload occurred

## Minor follow-up note
One non-blocking polish item remains visible in the installed package surface:
- `docs/RELEASE-NOTES-0.2.8.md` still ships under a `0.2.9` package

This is a documentation naming consistency issue, not a dangerous-exec or public-surface regression.

## Audit conclusion
The corrected `0.2.9` candidate behaves like a coherent local consumer package in install and dry-run inspection.
The dangerous-exec public surface remains absent after installation.
The package remains under no-publish hold until explicit approval is given.
