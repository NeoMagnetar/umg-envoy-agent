# UMG Envoy Agent 0.3.0-alpha.6

UMG Envoy Agent 0.3.0-alpha.6 is a minimized public-safe OpenClaw plugin stabilization candidate for read-only/demo UMG alpha surfaces. The published artifact keeps only the public entrypoint, bundled public sample content, runtime validation/demo utilities, and the approved safe tool surface.

## Alpha.6 capability note

Alpha.6 adds read-only real-library public_curated inspection:
- real-library status
- real sleeve list
- real sleeve inspect
- explicit reference extraction
- reference classification
- target availability check
- one approved NeoBlock shallow load
- shallow-load runtime summary

Alpha.6 remains read-only:
- no tool execution
- no recursive graph resolution
- no direct_source mode
- no archive/HUMAN/Resleever fallback

## What it does

- compiles bundled public sleeves into RuntimeSpec-like output
- validates runtime output honestly
- lists bundled sleeves and block libraries
- inspects bundled public sleeves
- keeps public path parse/validate/render/build tools
- runs smoke/demo flows against bundled public content only

## Public-safe posture

- public-safe and read-only/demo oriented
- bundled public sample sleeves and blocks only
- no compiler bridge/process internals in the published artifact
- no MCP bridge files in the published artifact
- no LangChain bridge files in the published artifact
- no approval/resume/execution bridge internals in the published artifact

## Default posture

- allowRuntimeWrites: false
- contentMode: bundled-public
- compilerMode: bundled-adapter
- debug: false

## Install

- `openclaw plugins install clawhub:umg-envoy-agent@0.3.0-alpha.6`

## Build and test

- npm install
- npm run check
- npm run build
- npm run smoke
- npm run pack:dry

## Entry point

- dist/plugin-entry-public.js
