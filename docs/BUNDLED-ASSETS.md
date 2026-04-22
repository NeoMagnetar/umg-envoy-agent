# Bundled Assets

## Included for the first working plugin line
The plugin package currently vendors these upstream surfaces:

### Doctrine
- `spec/ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md`

### Compiler
- `vendor/umg-compiler/compiler-v0/*`
- associated compiler README and package metadata

### Resleever runtime surfaces
- `vendor/UMG_Envoy_Resleever/blocks/*`
- `vendor/UMG_Envoy_Resleever/sleeves/*`
- `vendor/UMG_Envoy_Resleever/runtime/*`
- `vendor/UMG_Envoy_Resleever/compiler/*`
- selected resleever docs

## Why bundle these
Bundling gives the plugin a portable default mode so it can:
- inspect sleeves without external repo assumptions
- inspect block libraries and manifests
- compile against a local canonical compiler baseline
- support runtime promotion logic against a coherent default homebase layout

## Why still allow overrides
The UMG repos are expected to evolve outside the plugin release cadence.

Config overrides allow the operator to point the plugin at live working checkouts when they want the newest compiler or resleever state without repackaging the plugin immediately.

## Stage 2 caution
Bundling a source tree is not the same as wiring the runtime behavior. Stage 3 is where the plugin actually starts using these assets through registered OpenClaw tools.

