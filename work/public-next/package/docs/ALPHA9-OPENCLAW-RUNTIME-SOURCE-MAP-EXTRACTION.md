# Alpha9 OpenClaw Runtime Source Map Extraction

## Purpose

This lane maps the installed OpenClaw bundled runtime files and their source-map relationships to determine whether a future protocol patch design is safe.

The OpenClaw runtime source map extraction does not implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It maps bundled runtime files and determines whether a future patch design is safe.

## Bundle Inventory

OpenClaw root:
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw`

Confirmed:
- `openclaw.mjs` exists
- `dist` exists
- bundled `.js` files exist
- bundled `.js.map` files exist

Obvious bundle roles identified:
- CLI entry: `openclaw.mjs`
- route/RPC bundle: `dist/routes-B2QX_8fI.js`
- manifest/plugin registry bundle: `dist/manifest-registry-B5JNQdOM.js`
- plugin CLI bundle: `dist/plugins-cli-Cr_hFfbg.js`
- config/root helper bundle: `dist/utils-CS0Ikux6.js`

## Source Map Findings

Source maps were present for the key candidate bundles.

Useful recovered roles from source-map and targeted string inspection:
- `routes-B2QX_8fI.js` => route/RPC/control handlers
- `manifest-registry-B5JNQdOM.js` => plugin manifest / registry / source-root resolution
- `plugins-cli-Cr_hFfbg.js` => plugin CLI listing/inspect/rendering helpers
- `utils-CS0Ikux6.js` => config directory and state root resolution helpers

## OpenClaw Runtime Source Map Table

| Bundled File | Source Map Original | Role | Confidence | Notes |
|---|---|---|---|---|
| `openclaw.mjs` | n/a | CLI entry / gateway command surface | medium | confirms gateway subcommand exists but not the final RPC insertion point |
| `dist/routes-B2QX_8fI.js` | mapped sources present | route / RPC handlers | medium | known gateway-callable methods visible by pattern, but exact plugin-tool insertion point still unclear |
| `dist/manifest-registry-B5JNQdOM.js` | mapped sources present | plugin manifest registry | high | confirmed resolver logic for `global:` plugin source roots |
| `dist/plugins-cli-Cr_hFfbg.js` | mapped sources present | plugin CLI commands | medium | useful for plugin/source display, not enough to prove runtime invocation hook |
| `dist/utils-CS0Ikux6.js` | mapped sources present | config / state-dir helpers | high | confirmed config dir and global extension root resolution |

## Gateway Dispatch Target

- candidate bundled file: `openclaw.mjs`
- candidate route file: `dist/routes-B2QX_8fI.js`
- confidence: medium
- reason: CLI entry and route bundle are clearly implicated, but the exact mutation point for `openclaw gateway call`-driven plugin-tool methods is not isolated to a single safe patch symbol

## RPC Registry Target

- candidate bundled file: `dist/routes-B2QX_8fI.js`
- confidence: medium
- reason: known RPC-style methods appear route-adjacent, but the precise method table / handler registry insertion point remains insufficiently isolated

## Plugin Registry Target

- candidate bundled file: `dist/manifest-registry-B5JNQdOM.js`
- confidence: high
- reason: resolver and plugin source-root logic were already confirmed here, including the mapping from `global:` to the active extension path

## Tool Invocation Target

- candidate bundled file: `dist/routes-B2QX_8fI.js`
- confidence: low
- reason: tool/call-like strings and route behavior exist in the bundle, but a plugin-tool-specific invocation route was not isolated with enough confidence

## Read-Only Enforcement Target

- candidate bundled file: likely `dist/routes-B2QX_8fI.js` or a nearby dispatch helper
- confidence: low
- reason: no exact enforcement hook was isolated for blocking action/write/bridge/approval tools before dispatch

## Go / No-Go Decision

### Decision
- `source_map_insufficient_for_runtime_mutation`

### Reason
The installed OpenClaw bundle and source maps are sufficient to improve the runtime structure map, but they are still not sufficient to isolate:
- a high-confidence gateway dispatch patch target
- a high-confidence RPC method insertion point
- a medium-or-better confidence plugin-tool invocation route
- a medium-or-better confidence read-only enforcement hook

Because those targets remain below the required confidence threshold, a future runtime mutation patch is still unsafe.

## Recommended Next Lane

- `ALPHA9_OPENCLAW_RUNTIME_EXTERNAL_SOURCE_REQUEST_SOURCE`

Reason:
- the bundle/source-map view is no longer enough by itself
- the next safe escalation is to obtain clearer source-level guidance or original source mapping for the OpenClaw runtime surfaces before attempting mutation
