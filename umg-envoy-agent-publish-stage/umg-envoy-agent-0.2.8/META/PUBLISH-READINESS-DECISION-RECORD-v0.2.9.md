# Publish Readiness Decision Record — v0.2.9 Candidate

## Candidate under review
- package: `umg-envoy-agent`
- candidate version: `0.2.9`
- staged artifact: `umg-envoy-agent-0.2.9.tgz`
- local SHA-256: `C2F00379783FEB5525E4309207E8A6F538A766004B591C5DF7F4D59A11370645`

## Decision status
- `not_publish_ready_yet`

## Why publish readiness is not yet granted

### Positive findings
- core scanner-sensitive process-execution public surface was removed from the staged package
- packed candidate passed `validate:public-surface`
- bridge tool exposure was removed from public manifest/tool surface

### Blocking findings
- packed `openclaw.plugin.json` still reports version `0.2.8`
- packed top-level plugin metadata still references removed public surfaces (`compilerBridge`, `relationMatrix`)
- packed `dist/plugin-entry.js` still reports status/plugin version `0.2.8`
- packed exported plugin description still overstates the corrected public package boundary

## No-publish decision
Do not publish this candidate yet.
The current staged artifact is a successful surface-correction candidate but still requires metadata consistency cleanup before it can be presented for explicit publish approval review.

## Required follow-up before approval review
- align packed plugin manifest version with `0.2.9`
- align packed plugin-entry/status version strings with `0.2.9`
- remove stale top-level public config metadata that references removed bridge surfaces
- narrow stale descriptive language so public docs/manifest/entrypoint match actual shipped surface
- re-pack and re-review the corrected candidate

## Boundary
This decision record does not authorize publish.
It preserves the rule that Step 9 remains prohibited until explicit approval is given later.
