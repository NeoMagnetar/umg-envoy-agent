# INSTALL

## Package
UMG Envoy Agent (`umg-envoy-agent`)

This public package is a **public-safe subset** of the internal UMG Envoy lane.
It is not the full internal planner / adapter / compiler operator surface.

## Package root after extraction or local checkout
- `umg-envoy-agent-plugin-public-block-library/`

## Requirements
- Node.js `>=22`
- OpenClaw runtime compatible with plugin API `1`

## Included in the public-safe release
Expected important contents:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `dist/`
- `docs/`
- selected vendored public-safe library/runtime assets required by this subset

## Supported public-safe commands
- `umg-envoy status`
- `umg-envoy parse-path`
- `umg-envoy validate-path`
- `umg-envoy render-path`
- `umg-envoy build-path`
- `umg-envoy matrix-status`

## Intentionally not widened
This public package does **not** expose:
- `path-trace`
- `adapter-trace`
- `compiler-trace`
- raw bridge provenance
- recovery internals
- internal operator lane detail

## Install path options
### Option 1: use the package as extracted
Extract the release zip and keep the package folder intact.

### Option 2: use the workspace package root directly
Public package root:
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin-public-block-library`

## Build
If the package already contains `dist/`, this step may be unnecessary.

From the package root:

```bash
npm install
npm run build
```

## Initial validation sequence
1. `umg-envoy status`
2. `umg-envoy parse-path --file <path>`
3. `umg-envoy validate-path --file <path>`
4. `umg-envoy render-path --file <path>`
5. `umg-envoy build-path --message "..."`
6. `umg-envoy matrix-status`

## Public-safe posture
This release is intended to provide the approved outward-safe planner shorthand surface only.
It should not be interpreted as the full internal UMG Envoy subsystem.
