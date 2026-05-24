# Alpha9 Controlled Action Runtime Report Plugin-Owned Access Implementation Plan

## 1. Current Baseline

- design commit: `1f5968c5382bd8502f331ef501d29ad4f7112108`
- selected strategy: `plugin_owned_gateway_method_first`
- target plugin: `umg-envoy-agent`
- target tool/report: `umg_envoy_controlled_action_runtime_report`
- current blocker: generic OpenClaw plugin-tool call protocol not proven

The controlled-action runtime report plugin-owned access implementation plan does not implement a Gateway method, implement a CLI command, call plugin tools, grant approval, record live decisions, execute actions, write files, transmit data, publish packages, or mutate runtime state. It defines a future local implementation path only.

## 2. Recommended Implementation Order

### Stage 1
Implement Envoy-owned Gateway method:
- `umg.envoy.controlledActionRuntimeReport`

### Stage 2
Verify method through `openclaw gateway call` if available.

### Stage 3
Add plugin-owned CLI wrapper only if Gateway method works.

### Stage 4
Create user-facing examples.

## 3. Future Gateway Method Contract

Method:
- `umg.envoy.controlledActionRuntimeReport`

Request shape:

```json
{
  "id": "req-001",
  "method": "umg.envoy.controlledActionRuntimeReport",
  "params": {
    "reportMode": "ascii_only",
    "panel": null,
    "includeAscii": true,
    "includeNavigation": false,
    "includeStructuredReport": false
  }
}
```

Response shape:

```json
{
  "id": "req-001",
  "ok": true,
  "result": {
    "toolName": "umg_envoy_controlled_action_runtime_report",
    "toolMode": "read_only_report_preview",
    "runtimeReportOnly": true,
    "asciiReport": "...",
    "executionPerformed": false,
    "approvalGranted": false,
    "recordingPerformed": false,
    "liveDecisionRecorded": false,
    "fileWritten": false,
    "externalTransmissionPerformed": false,
    "packagePublished": false
  }
}
```

## 4. Supported Modes

The future method should support:
- `summary`
- `full`
- `ascii_only`
- `structured_only`
- `navigation_only`
- `panel`

Supported panels:
- `overview`
- `active_route`
- `safety_evidence_chain`
- `blocked_capabilities`
- `readiness`
- `audit_and_review`
- `recording_metadata`
- `hard_boundaries`
- `next_safe_step`

## 5. Future Files to Modify

For the future implementation lane, proposed allowed files:
- `src/plugin-entry.ts`
- `src/controlled-action-runtime-report-tool-surface.ts`
- `src/controlled-action-runtime-report-integration.ts`
- `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-IMPLEMENTATION.md`
- `scripts/alpha9-controlled-action-runtime-report-plugin-owned-access-implementation-smoke.mjs`
- `dist/plugin-entry.js`
- `dist/plugin-entry.d.ts`
- `openclaw.plugin.json` only if method metadata must be declared

If a separate helper is needed:
- `src/controlled-action-runtime-report-plugin-owned-access.ts`
- `dist/controlled-action-runtime-report-plugin-owned-access.js`
- `dist/controlled-action-runtime-report-plugin-owned-access.d.ts`

## 6. Future Validation Requirements

The implementation lane must prove:
- Gateway method is registered or exposed as Envoy-owned read-only method
- `summary` mode works
- `full` mode works
- `ascii_only` mode works
- `structured_only` mode works
- `navigation_only` mode works
- `panel` mode works for every supported panel
- invalid panel returns safe validation error
- missing input returns safe incomplete/report-preview metadata
- `executionPerformed=false`
- `approvalGranted=false`
- `recordingPerformed=false`
- `liveDecisionRecorded=false`
- `fileWritten=false`
- `externalTransmissionPerformed=false`
- `packagePublished=false`

## 7. Future Installed Runtime Verification

Local install/reload verification after implementation should be:
1. build source
2. back up installed files first
3. promote only required dist files to `C:\Users\Magne\.openclaw\extensions\umg-envoy-agent`
4. restart OpenClaw gateway
5. call Envoy-owned Gateway method
6. verify read-only outputs

## 8. Deferred Work

Explicitly deferred:
- generic `plugin.tools.call` protocol
- OpenClaw core runtime patching
- action-capable tool invocation
- approval protocol
- live recording
- write actions
- bridge actions
- package publish
- ClawHub publish

## Read-Only Guarantees

Future implementation must preserve:
- no execution
- no approval
- no live recording
- no live decision recording
- no file writes from the runtime report surface
- no external transmission
- no package publish
- no bridge actions
- no direct_source
- no automatic takeover

## Recommended Next Lane

- `ALPHA9_CONTROLLED_ACTION_RUNTIME_REPORT_PLUGIN_OWNED_ACCESS_IMPLEMENTATION_SOURCE`
