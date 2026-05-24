# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Design

## 1. Purpose

This lane designs a local, Envoy-owned read-only access surface for `umg_envoy_controlled_action_runtime_report` without depending on a generic OpenClaw plugin-tool call protocol.

The goal is to make the runtime report verifiable through an Envoy-owned surface such as a plugin-owned Gateway method, a plugin-owned CLI command, or both in staged order.

## 2. Why Generic Plugin-Tool Call Is Blocked

The current blocker is not the Envoy tool implementation. The blocker is that no generic noninteractive OpenClaw plugin-tool call surface has been proven from the installed CLI/runtime surface.

That means the risky path would be patching unknown OpenClaw bundled runtime internals to add or force a generic plugin tool invocation protocol. That path remains lower confidence and broader in blast radius than needed for a read-only local verification goal.

## 3. Why Plugin-Owned Access Is Safer

A plugin-owned access surface is safer because:
- it stays on Envoy-owned code paths instead of patching OpenClaw core bundles
- it narrows scope to one read-only report surface
- it keeps future implementation localized to known Envoy files
- it allows verification without needing a generic `plugin.tools.call` protocol
- it aligns better with documented native-plugin/runtime-capability patterns

## 4. Proposed Gateway Method

Preferred Stage 1 method:
- `umg.envoy.controlledActionRuntimeReport`

Intent:
- expose a read-only Gateway method owned by Envoy
- return report data derived from the existing tool surface
- never dispatch execution, write, approval, bridge, or recording actions

Example request:

```json
{
  "id": "req-001",
  "method": "umg.envoy.controlledActionRuntimeReport",
  "params": {
    "reportMode": "ascii_only",
    "includeAscii": true,
    "includeNavigation": false,
    "includeStructuredReport": false
  }
}
```

Example response:

```json
{
  "id": "req-001",
  "ok": true,
  "result": {
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "toolMode": "read_only_report_preview",
    "asciiReport": "...",
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false,
    "fileWritten": false,
    "externalTransmissionPerformed": false,
    "packagePublished": false
  }
}
```

## 5. Proposed CLI Command

Preferred Stage 2 wrapper:
- `openclaw umg-envoy runtime-report`

Example command shapes:
- `openclaw umg-envoy runtime-report --mode ascii_only`
- `openclaw umg-envoy runtime-report --mode full`
- `openclaw umg-envoy runtime-report --panel blocked_capabilities`
- `openclaw umg-envoy runtime-report --navigation`

Intent:
- provide a human-usable CLI wrapper for the same read-only report surface
- either call the Envoy-owned Gateway method or share the same integration layer
- keep behavior narrow, deterministic, and read-only

## 6. Read-Only Guarantees

The future plugin-owned access surface must preserve these guarantees:
- no execution
- no approval
- no live recording
- no write actions
- no bridge actions
- no direct_source
- no automatic takeover
- no package publish
- no external contact
- no OpenClaw core patch

The access surface should expose report-only output and explicitly carry negative side-effect flags in responses.

## 7. Input / Output Shape

### Gateway method input
Expected params shape:
- `reportMode`: `ascii_only | full | panel`
- `includeAscii`: boolean
- `includeNavigation`: boolean
- `includeStructuredReport`: boolean
- optional future `panel`: string

### Gateway method output
Expected result shape:
- `toolName`
- `toolMode`
- optional `asciiReport`
- optional `navigation`
- optional `structuredReport`
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`
- `fileWritten=false`
- `externalTransmissionPerformed=false`
- `packagePublished=false`

### CLI output
Expected CLI output should support:
- plain text / ascii report mode
- optional JSON mode later if needed
- read-only exit behavior with no hidden side effects

## 8. Future Files To Change

Likely future Envoy-side files only:
- `src/plugin-entry.ts`
- `src/controlled-action-runtime-report-tool-surface.ts`
- `src/controlled-action-runtime-report-integration.ts`
- `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-IMPLEMENTATION.md`
- `scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-implementation-smoke.mjs`
- `dist/plugin-entry.js`
- `dist/plugin-entry.d.ts`
- `openclaw.plugin.json` only if Gateway method or CLI command metadata requires manifest declaration

## 9. Future Validation Plan

Future implementation validation should prove:
- Envoy-owned Gateway method is registered and callable
- method returns read-only runtime report output only
- all negative side-effect flags remain false
- CLI wrapper resolves to the same read-only integration path
- invalid modes/panels fail safely
- no OpenClaw core bundled runtime patch is required

Suggested staged validation order:
1. Gateway method registration smoke
2. Gateway method read-only response smoke
3. CLI wrapper smoke
4. parity check between Gateway and CLI outputs

## 10. Deferred Work

Deferred for later consideration only:
- generic `plugin.tools.call` protocol work
- any OpenClaw core bundled runtime patching
- maintainer outreach or GitHub issue workflow
- automated send or support-contact path
- any non-read-only expansion of this surface

## Recommended Design Decision

Selected access strategy:
- `plugin_owned_gateway_method_first`

Preferred staged plan:
1. design plugin-owned Gateway method: `umg.envoy.controlledActionRuntimeReport`
2. design plugin-owned CLI wrapper: `openclaw umg-envoy runtime-report`
3. only later, reconsider generic plugin tool protocol if still needed
