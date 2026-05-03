# TOOL-RUNTIME-32B — v0.2.10 Approval Packet

## Candidate identity
- package: `umg-envoy-agent`
- version: `0.2.10`
- branch: `fix/v0.2.10-packaging-hygiene`
- local commit: `10bc077`
- artifact: `umg-envoy-agent-0.2.10.tgz`
- artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.10.tgz`
- SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`

## Confirmed package facts
- strict package allowlist in place
- defensive `.npmignore` in place
- `validate:public-surface` passed with `PUBLIC_SURFACE_OK`
- packed artifact contains no `META/`
- packed artifact contains no `_inspect_*`
- packed artifact contains no embedded `.tgz` archives
- packed artifact contains no temp consumer audit folders
- packed artifact contains no removed compiler bridge runner files
- consumer install audit passed
- forbidden-surface search returned `NO_MATCHES`
- no bridge tools reintroduced
- no Desktop Bridge changes
- no PhaseBridge changes
- no runtime behavior changes

## Current release posture
This candidate is prepared for explicit approval review only.
It is not publish-authorized in this phase.

## Provenance note
The tarball and branch/commit state are verified locally.
However, the current branch commit has not yet been verified as reachable in the remote `NeoMagnetar/umg-envoy-agent` repo during this phase.
That means a later publish phase should verify or push provenance before upload, just as was done for `v0.2.9`.

## Final rule
Use the tarball as the publish source of truth, not the working folder.
