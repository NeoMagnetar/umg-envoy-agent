# Public Variant README

This minimized public alpha.6 stabilization candidate mirrors the compiler-backed architecture of the personal OpenClaw variant without shipping private roots, private runtime state, or private workspace assumptions.

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

It bundles:
- sample blocks
- sample sleeves
- runtime examples
- a public compiler adapter
- public-safe OpenClaw tools

Public entrypoint:
- dist/plugin-entry-public.js
