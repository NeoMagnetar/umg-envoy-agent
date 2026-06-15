# Public Variant Overview

UMG Envoy Agent `0.3.0-alpha.15` is a bounded public package lane for runtime-facing inspection and governed projection surfaces. Exact declared tool ids for this repo line are defined by `openclaw.plugin.json` and documented in `docs/TOOL-SURFACE.md`.

## Manifest-declared public tools

The current manifest-declared public surface is the tool set listed in `openclaw.plugin.json`. It includes bounded inspection, validation, comparison, path, runtime-report, and low-risk direct-runner surfaces.

## Source-present but not manifest-declared

`umg_envoy_load_sleeve` is source-present in alpha.15, but it is not manifest-declared and should not be described as part of the current public manifest surface.

## Staged / deferred names

Some capability-oriented names in older or broader docs are staged or deferred and should not be read as current manifest-declared tool ids.

## Historical names

Some historical or alternate names may appear in older notes, but they are not the current manifest surface for alpha.15.

## Governance-gated declared tools

`umg_envoy_compile_ir_bridge` and `umg_envoy_emit_relation_matrix` are manifest-declared, but they are gated and config-constrained rather than evidence of unrestricted runtime execution.

## Not proven here

This overview does not prove live OpenClaw host readiness, live CLI readiness, or current ClawHub/publication status.

## Pointers

- `openclaw.plugin.json`
- `docs/TOOL-SURFACE.md`
- `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`
