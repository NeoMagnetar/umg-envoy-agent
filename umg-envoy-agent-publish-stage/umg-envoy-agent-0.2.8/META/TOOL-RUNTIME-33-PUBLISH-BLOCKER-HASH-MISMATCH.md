# TOOL-RUNTIME-33 — Publish Blocker: Approved Hash Mismatch

## Status
Publish aborted before upload.
No ClawHub publish command was run.

## Approved candidate from explicit approval
- package: `umg-envoy-agent`
- version: `0.2.10`
- artifact: `umg-envoy-agent-0.2.10.tgz`
- approved SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`
- source-repo: `NeoMagnetar/umg-envoy-agent`
- source-ref: `fix/v0.2.10-packaging-hygiene`
- source-commit: `1c9d2094038d73c596d4742f2ffb471ceddce003`
- source-path: `.`

## Actual artifact observed at publish time
- path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.10.tgz`
- actual SHA-256: `B8C1CE37D692DC59B175407B5FCD3C54A670F573D1AA63BB14070E37BC07B13F`

## Decision
Do not publish.
The approved hash and the current artifact hash do not match.

## Safety rationale
The explicit approval was for one exact candidate only.
A mismatched tarball is a different candidate, even if the filename is the same.

## Next allowed actions
One of the following is required before publish can proceed:
1. refreshed explicit approval for the exact observed hash `B8C1CE37D692DC59B175407B5FCD3C54A670F573D1AA63BB14070E37BC07B13F`
2. investigate why the tarball changed and restore/regenerate the exact previously approved artifact, then refresh provenance/hash gates as needed
