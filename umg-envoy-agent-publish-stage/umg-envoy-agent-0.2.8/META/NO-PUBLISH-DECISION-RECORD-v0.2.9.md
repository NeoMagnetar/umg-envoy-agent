# No-Publish Decision Record — v0.2.9 Candidate

## Decision
Do not publish the current staged `v0.2.9` candidate yet.

## Reason
The core dangerous-exec public surface appears corrected, but the packed candidate still contains stale metadata and description inconsistencies that would make a publish approval review sloppy and potentially misleading.

## Specifically
- `openclaw.plugin.json` still says `0.2.8`
- packed top-level config metadata still mentions removed public surfaces
- packed `dist/plugin-entry.js` still reports `0.2.8`
- packed description language still overstates the corrected public package boundary

## What is good
- public bridge/process-execution surface appears removed from the packed candidate
- local packed artifact exists
- local SHA-256 was recorded
- validation passed with `PUBLIC_SURFACE_OK`

## What must happen before approval review
- metadata consistency cleanup
- re-pack candidate
- re-review packed contents
- re-run public-surface validation

## Boundary reminder
This record does not authorize publish.
It preserves the rule that explicit approval is still required even after the candidate is corrected.
