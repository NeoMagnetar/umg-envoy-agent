# TOOL-RUNTIME-29D — Approval Gate Refresh / Final Candidate Identity Sync

## Summary

TOOL-RUNTIME-29D refreshes the approval gate artifacts so they reference the current polished `v0.2.9` candidate identity produced after TOOL-RUNTIME-29C.

## Current final candidate identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- artifact: `umg-envoy-agent-0.2.9.tgz`
- branch: `fix/public-envoy-surface-v0.2.9`
- current final local SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Stale candidate identity
A prior pre-polish candidate hash existed before the final docs/package-content hygiene refresh. That older identity is historical only and must not be used for approval or publish wording.

## Refresh actions completed
- re-verified current local SHA-256
- updated explicit approval packet to the refreshed hash
- updated publish command checklist to the refreshed hash
- updated awaiting-approval stop-state to the refreshed hash
- updated no-publish hold note to call out the refreshed approval identity
- updated abort/rollback checklist to guard against accidental use of the stale hash

## Current posture
- candidate remains approval-review ready
- no-publish hold remains active
- no upload/publish command is authorized in this phase
- ClawHub clearance is not claimed

## Recommended next action
If a future explicit approval is requested, it must reference:
- package: `umg-envoy-agent`
- version: `0.2.9`
- artifact: `umg-envoy-agent-0.2.9.tgz`
- SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`
- branch: `fix/public-envoy-surface-v0.2.9`

## Boundary preserved
This phase did not publish, upload, tag, widen scope, or reintroduce public bridge exposure.
