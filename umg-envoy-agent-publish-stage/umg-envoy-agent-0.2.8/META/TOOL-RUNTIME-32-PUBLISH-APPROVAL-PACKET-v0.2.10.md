# TOOL-RUNTIME-32 — Publish Approval Packet v0.2.10

## Candidate identity
- package: `umg-envoy-agent`
- version: `0.2.10`
- branch: `fix/v0.2.10-packaging-hygiene`
- artifact: `umg-envoy-agent-0.2.10.tgz`
- local SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`

## Why this release exists
This candidate preserves the corrected public-safe code surface from `v0.2.9` but removes accidental audit/build byproducts from the packed public artifact.

## Positive findings
- public-surface validation passed
- packed artifact no longer includes audit/build byproduct folders or extra tarballs
- consumer install audit succeeded
- forbidden-surface search still returned `NO_MATCHES`
- no public bridge tools were reintroduced

## Boundary
This packet does not authorize publish.
It prepares a clean `v0.2.10` candidate for later explicit review only.
