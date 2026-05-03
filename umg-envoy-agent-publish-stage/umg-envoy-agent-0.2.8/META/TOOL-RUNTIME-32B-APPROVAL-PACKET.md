# TOOL-RUNTIME-32B — v0.2.10 Approval Packet

## Candidate identity
- package: `umg-envoy-agent`
- version: `0.2.10`
- branch: `fix/v0.2.10-packaging-hygiene`
- local commit: `d373678`
- approval-gate commit: `f8b7a74`
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
Remote provenance verification was attempted for branch `fix/v0.2.10-packaging-hygiene` in `NeoMagnetar/umg-envoy-agent` and failed: the branch is not present on `origin`, and the candidate commits are not remotely reachable at this time.

Verified local-only commits:
- packaging candidate commit: `d373678b5cd3f5c6d83c9c7c11668e148c2bda2d` (`d373678`) — Prepare clean v0.2.10 packaging candidate
- approval-gate commit: `f8b7a74d25a3816e686adaa13cabff73a2fbc48f` (`f8b7a74`) — Add TOOL-RUNTIME-32B approval gate

Remote verification results during TOOL-RUNTIME-32C:
- `git ls-remote origin fix/v0.2.10-packaging-hygiene` returned no matching ref
- GitHub branch API returned `404 Branch not found`
- GitHub commit API returned `422 No commit found` for both candidate commit shas

That means source provenance is not yet satisfied for publish. A later publish phase must first push the branch (or otherwise establish remote reachability), then verify the exact commit URL before any upload attempt.

## Final rule
Use the tarball as the publish source of truth, not the working folder.
