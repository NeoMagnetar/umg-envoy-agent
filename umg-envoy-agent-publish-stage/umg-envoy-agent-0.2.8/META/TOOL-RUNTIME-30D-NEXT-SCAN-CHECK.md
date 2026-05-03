# TOOL-RUNTIME-30D — Next Scan Check

## Current state
- publish succeeded
- ClawHub package latest version is `0.2.9`
- scan status is still `pending`

## What to do next
Run a later read-only check with:
- `clawhub package inspect umg-envoy-agent`

Capture when available:
- scan verdict
- any review/clear/reject language
- updated package metadata if it changed

## Rule
Do not claim the prior scanner issue is cleared until the pending scan becomes a final visible verdict.
