# UMG Envoy Agent 0.2.0

UMG Envoy Agent 0.2.0 is a public-safe OpenClaw plugin with a bundled UMG compiler adapter, bundled public sample sleeves and blocks, runtime validation, sleeve compilation, and path/planner utilities.

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
- npm run pack:dry

## Entry point

- dist/plugin-entry.js
