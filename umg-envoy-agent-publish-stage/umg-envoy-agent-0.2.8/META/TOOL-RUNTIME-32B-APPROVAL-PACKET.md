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
The tarball and branch/commit state are verified locally, and remote provenance is now established for the current branch head.

Verified commit chain:
- packaging candidate commit: `d373678b5cd3f5c6d83c9c7c11668e148c2bda2d` (`d373678`) — Prepare clean v0.2.10 packaging candidate
- approval-gate commit: `f8b7a74d25a3816e686adaa13cabff73a2fbc48f` (`f8b7a74`) — Add TOOL-RUNTIME-32B approval gate
- remote provenance finalization commit: `1c9d2094038d73c596d4742f2ffb471ceddce003` (`1c9d209`) — Refresh v0.2.10 provenance approval gate

Verified remote provenance during TOOL-RUNTIME-32D:
- remote branch: `https://github.com/NeoMagnetar/umg-envoy-agent/tree/fix/v0.2.10-packaging-hygiene`
- remote commit HTML URL: `https://github.com/NeoMagnetar/umg-envoy-agent/commit/1c9d2094038d73c596d4742f2ffb471ceddce003`
- remote commit API URL: `https://api.github.com/repos/NeoMagnetar/umg-envoy-agent/commits/1c9d2094038d73c596d4742f2ffb471ceddce003`
- `git ls-remote origin fix/v0.2.10-packaging-hygiene` resolved to `1c9d2094038d73c596d4742f2ffb471ceddce003`

Important provenance interpretation:
- the tarball hash remains the source-of-truth identity for the package artifact
- the exact current remote branch HEAD is `1c9d2094038d73c596d4742f2ffb471ceddce003`
- the clean packaging candidate commit remains `d373678b5cd3f5c6d83c9c7c11668e148c2bda2d`
- any future publish command must intentionally choose which verified remote commit to cite as `--source-commit`

## Final rule
Use the tarball as the publish source of truth, not the working folder.
