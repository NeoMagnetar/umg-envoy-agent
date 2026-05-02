# Publish Readiness Decision Record — v0.2.9 Candidate

## Candidate under review
- package: `umg-envoy-agent`
- candidate version: `0.2.9`
- staged artifact: `umg-envoy-agent-0.2.9.tgz`
- final local SHA-256: `016951EBB535CB93032D5BD0979A06227B5AC6DB98EC79D48EAAA40614CEC418`

## Decision status
- `ready_for_explicit_user_approval_review_only`

## Positive findings
- core scanner-sensitive process-execution public surface was removed from the staged package
- packed candidate passed `validate:public-surface`
- bridge tool exposure was removed from public manifest/tool surface
- packed `openclaw.plugin.json` version now aligns to `0.2.9`
- packed `package.json` version aligns to `0.2.9`
- packed top-level config metadata no longer references removed public bridge surfaces
- packed `dist/plugin-entry.js` no longer exposes the removed bridge identifiers in the public surface

## Remaining release gate
This candidate is ready for explicit user approval review only.
It is not automatically publish-authorized.
ClawHub has not yet re-cleared the package in this session, and no upload/publish step is authorized by this record.

## Decision
- candidate may be presented for explicit user approval review
- do not publish yet
- do not tag yet
- do not upload yet

## Boundary
This decision record does not authorize publish.
It moves the candidate out of metadata-blocked state and into approval-review state only.
