# UMG Envoy Agent

UMG Envoy Agent is a public-safe OpenClaw plugin package that exposes a narrowed planner shorthand surface from the broader internal UMG Envoy lane.

It is intended to provide a safe outward-facing subset, not the full internal planner / adapter / compiler operator system.

## Release status

**Version:** `0.1.0`
**Release posture:** public-safe first release candidate

## What it does
This public package exposes a public-safe planner shorthand surface for:
- parsing planner shorthand
- validating planner shorthand
- rendering planner shorthand
- building a human-inspectable planner path from a message
- reporting high-level status and matrix summary

## Supported public-safe commands
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

## Intentionally not widened
This public package does **not** expose:
- full `path-trace`
- full `adapter-trace`
- full `compiler-trace`
- raw bridge provenance
- recovery internals
- internal operator lane detail
- the full internal modulation-heavy runtime promise

## Included package contents
This public-safe package includes:
- `dist/` compiled plugin runtime
- `docs/` public-safe docs
- selected vendored public-safe assets required by this subset

## Install
### Option A - local path install in OpenClaw
Use the plugin folder directly:

- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin-public-block-library`

### Package prerequisites
- Node.js `>=22`
- OpenClaw plugin runtime compatible with plugin API `1`

### Build
From the plugin root:

```bash
npm install
npm run build
```

If you are using the already-prepared packaged release, `dist/` is already included.

## Configuration
Config schema lives in:
- `openclaw.plugin.json`

## Public-safe posture
This package is a selective outward-facing subset of the internal UMG Envoy lane.
It should be evaluated as a bounded public-safe planner utility package, not as the full internal architecture export.

## See also
- `docs/TOOL-SURFACE.md`
- `docs/PUBLIC-SAFE-CAPABILITY.md`
- `docs/INSTALL.md`
- `docs/PUBLISHABILITY-ASSESSMENT.md`
