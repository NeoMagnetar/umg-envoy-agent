# UMG Envoy Agent 0.2.0 Release Notes

Date: 2026-04-26  
Commit: `a7b8e76`  
Branch: `release/umg-envoy-agent-0.2.0`  
Tag: `v0.2.0`

## Release Summary

UMG Envoy Agent 0.2.0 upgrades the public plugin from a path/planner-focused package into a public-safe compiler-backed OpenClaw plugin.

## Added

- bundled public compiler adapter
- bundled public sample sleeves
- bundled public sample blocks
- runtime validation
- sleeve compilation
- compiler smoke test
- compiler matrix/status reporting
- `public-content/` folder
- compiler contract docs
- public content model docs

## Changed

- upgraded package and manifest version to `0.2.0`
- simplified public documentation
- aligned tool surface with compiler-backed behavior
- preserved path/planner utilities

## Removed

- legacy public sleeve builder files
- stale 0.1.2-era docs
- legacy package leftovers
- contaminated nested output structures

## Validation

- `npm install` passed
- `npm run check` passed
- `npm run build` passed
- `npm run smoke` passed
- `npm run pack:dry` passed
- pack output clean: 49 files, 12.8 kB package, 51.1 kB unpacked

## Safety

- no `node_modules` in package output
- no `dist/dist`
- no `dist/src`
- no `docs/docs`
- no private runtime roots
- no personal absolute path config
- no dirty workspace release

## Known Scope

- public-safe bundled compiler adapter
- not full private personal runtime
- runtime mutation remains disabled by default
