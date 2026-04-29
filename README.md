# UMG Envoy Agent 0.2.2 Release Candidate

UMG Envoy Agent 0.2.2 is a release-candidate public-safe OpenClaw plugin with a bundled UMG compiler adapter, a validated external compiler bridge path, repeatable UMG v1 E2E validation, bundled public sample sleeves and blocks, runtime validation, sleeve compilation, and path/planner utilities.

## What it does

- compiles bundled public sleeves into RuntimeSpec-like output
- validates runtime output honestly
- lists bundled sleeves and block libraries
- compares sleeves
- keeps public path parse/validate/render/build tools
- runs a smoke test that proves the public compiler loop works

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public
- compilerMode: bundled-adapter
- debug: false

## Build and test

- npm install
- npm run check
- npm run build
- npm run smoke
- npm run validate:umg:e2e -- --sleevePath "<path-to-sleeve.json>" --libraryRoot "<path-to-UMG-Block-Library>" --compilerRepoPath "<path-to-umg-compiler>"
- npm run pack:dry

## External UMG v1 validation requirements

- external compiler bridge validation requires an explicit sleeve path
- external compiler bridge validation requires an explicit `UMG-Block-Library` root
- external compiler bridge validation requires an explicit `umg-compiler` repo path
- runtime outputs remain temp-only and are not intended for commit

## Entry point

- dist/plugin-entry.js
