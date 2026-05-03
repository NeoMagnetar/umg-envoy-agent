# TOOL-RUNTIME-32B — No-Publish Hold

## Current state
The clean `v0.2.10` candidate is staged, validated, inspected, and consumer-audited.

## Hold remains active
Do not publish yet.

## Why hold remains
- no explicit user approval has been given for `v0.2.10`
- explicit user approval for `v0.2.10` has still not been given, even though remote branch and commit provenance are now established for `fix/v0.2.10-packaging-hygiene`
- ClawPack publish should use the verified tarball identity, not the working folder state

## Current tarball source of truth
- artifact: `umg-envoy-agent-0.2.10.tgz`
- path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.10.tgz`
- SHA-256: `C8B15CD9738A90D845094D5C03D326B6AC6B4B98D4C852B4A47A2D9B0953D661`

## Rule
No publish until approval and provenance verification are both complete.
