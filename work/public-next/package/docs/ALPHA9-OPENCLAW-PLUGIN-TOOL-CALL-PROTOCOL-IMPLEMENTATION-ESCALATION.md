# Alpha9 OpenClaw Plugin Tool Call Protocol Implementation Escalation

## Purpose

This lane isolates the future patch targets required for a minimal OpenClaw plugin-tool call protocol implementation, without mutating installed OpenClaw runtime state.

## Prior blocked implementation attempt

A prior implementation attempt correctly stopped before mutating the installed OpenClaw runtime because the patch target was not isolated enough for safe minimal mutation.

## OpenClaw root inspected

- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw`

## Static inspection commands used

Inspection relied on bounded static analysis of the installed OpenClaw runtime bundle, including:
- gateway/rpc term searches
- plugin registry / manifest registry term searches
- tool routing term searches
- direct reads of previously identified first-party bundle files

## Candidate files

High-confidence first-party files identified in prior inspection and reused here:
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\plugins-cli-Cr_hFfbg.js`
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\manifest-registry-B5JNQdOM.js`
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\utils-CS0Ikux6.js`
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\routes-B2QX_8fI.js`
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs`

## Patch Point Matrix

### 1. Gateway call dispatch
- file: `openclaw.mjs`
- function / symbol / handler: CLI entrypoint routing into gateway subcommand handling
- evidence: running gateway process command line executes `openclaw.mjs gateway`; `openclaw gateway call` is a supported CLI surface
- confidence: medium
- risk: medium

### 2. RPC method registry
- file: `dist/routes-B2QX_8fI.js`
- function / symbol / handler: gateway route / RPC handler registrations near known gateway-callable methods and browser/runtime routing
- evidence: previous inspection showed route handlers around control/browser/tool-adjacent sections; gateway RPC methods such as `status` are callable
- confidence: medium
- risk: medium

### 3. Plugin registry access
- file: `dist/manifest-registry-B5JNQdOM.js`
- function / symbol / handler: plugin manifest and source-root resolution logic
- evidence: confirmed resolver mapping for `global:` plugin tokens and plugin source roots
- confidence: high
- risk: low

### 4. Tool metadata extraction
- file: `dist/plugins-cli-Cr_hFfbg.js`
- function / symbol / handler: plugin listing / formatting surfaces including `formatPluginSourceForTable`
- evidence: file already proved how plugin source tokens are rendered and exposed via CLI
- confidence: medium
- risk: low

### 5. Tool invocation route
- file: `dist/routes-B2QX_8fI.js`
- function / symbol / handler: likely gateway/browser/control RPC-adjacent route dispatch for noninteractive calls
- evidence: route bundle contains RPC-like request handling and tool-adjacent logic, but exact plugin-tool invocation insertion point remains less direct than desired
- confidence: low
- risk: high

### 6. Read-only enforcement hook
- file: `dist/routes-B2QX_8fI.js` and/or a nearby gateway RPC dispatch helper
- function / symbol / handler: pre-call validation guard before any plugin tool invocation
- evidence: no exact symbol isolated yet; only a likely requirement that enforcement must happen before tool dispatch
- confidence: low
- risk: high

## Future Patch Plan

### plugin.tools.list
- insertion file: likely gateway RPC dispatch layer in `dist/routes-B2QX_8fI.js`
- handler name: future `plugin.tools.list` method handler
- request shape: `{ id, method: "plugin.tools.list", params: { pluginId, includeMetadata } }`
- response shape: plugin id/version + read-only tool metadata list
- read-only checks: none beyond metadata exposure
- error codes: `plugin_not_found`, `internal_error`
- smoke test: list loaded tools for `umg-envoy-agent`

### plugin.tools.inspect
- insertion file: likely same gateway RPC dispatch layer in `dist/routes-B2QX_8fI.js`
- handler name: future `plugin.tools.inspect` method handler
- request shape: `{ id, method: "plugin.tools.inspect", params: { pluginId, toolName } }`
- response shape: one tool metadata object with supported modes/panels
- read-only checks: metadata-only, no invocation
- error codes: `plugin_not_found`, `tool_not_found`, `internal_error`
- smoke test: inspect `umg_envoy_controlled_action_runtime_report`

### plugin.tools.call
- insertion file: likely same gateway RPC dispatch layer plus a dedicated helper
- handler name: future `plugin.tools.call` method handler
- request shape: `{ id, method: "plugin.tools.call", params: { pluginId, toolName, input } }`
- response shape: read-only tool output with explicit safety metadata
- read-only checks:
  - allowlist-only first implementation
  - only `umg-envoy-agent / umg_envoy_controlled_action_runtime_report`
  - reject unknown/action/write/bridge/approval tools
- error codes:
  - `plugin_not_found`
  - `tool_not_found`
  - `tool_not_read_only`
  - `requires_approval_not_supported`
  - `action_tool_blocked`
  - `write_tool_blocked`
  - `bridge_tool_blocked`
  - `external_transmission_blocked`
  - `invalid_tool_input`
  - `internal_error`
- smoke test: read-only probes for navigation/ascii/structured/panel/invalid-panel

## Future Backup List

If a future implementation lane proceeds, the exact installed OpenClaw files to back up first should be:
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs`
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\routes-B2QX_8fI.js`
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\routes-B2QX_8fI.js.map` if present
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\plugins-cli-Cr_hFfbg.js` if touched
- `C:\Users\Magne\AppData\Roaming\npm\node_modules\openclaw\dist\manifest-registry-B5JNQdOM.js` if touched

Backup root:
- `C:\.openclaw\workspace\alpha9-openclaw-protocol-implementation-backups\`

Backup folder pattern:
- `openclaw-before-plugin-tool-call-protocol-YYYYMMDD-HHMMSS`

## Go / No-Go Decision

### Decision
- `implementation_target_still_unclear`

### Reason
The plugin registry path and global plugin resolution path are isolated with high confidence, but the exact minimal runtime mutation surface for:
- gateway call dispatch
- plugin-tool invocation route
- read-only enforcement hook

is still not isolated with high enough confidence for safe minimal mutation of the installed OpenClaw runtime.

The gateway/RPC insertion point remains only medium confidence, and the invocation/enforcement hook remains low confidence. That is not enough for a safe bundled-runtime patch lane.

## Boundaries

- no protocol implemented
- no runtime modified
- no live tool called
- no execution
- no approval
- no live recording
- no writes
- no bridge enablement
- no direct_source
- no automatic takeover
- no package publish
- no runtime mutation

## Recommended Next Lane

- `ALPHA9_OPENCLAW_RUNTIME_SOURCE_MAP_EXTRACTION_SOURCE`

## Principle

The OpenClaw plugin tool call protocol implementation escalation does not implement protocol methods, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It isolates future patch targets and defines a go/no-go decision only.
