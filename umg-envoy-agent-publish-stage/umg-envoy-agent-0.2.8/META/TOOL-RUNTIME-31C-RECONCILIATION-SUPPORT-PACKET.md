# TOOL-RUNTIME-31C — Reconciliation Support Packet

## Purpose
Use this packet if ClawHub support needs a concise explanation of the remaining mismatch.

## Summary statement
`umg-envoy-agent@0.2.9` resolved the original `suspicious.dangerous_exec` static-analysis issue. The remaining issue is aggregate/reputation label reconciliation, not package-code failure.

## Package identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- publish ID: `rd7ef3p11zrzjt1ba6f0ba3xy58613cg`
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`
- source ref: `fix/public-envoy-surface-v0.2.9`

## Resolved code/package issue
The previously flagged public package surface that triggered `suspicious.dangerous_exec` in the old `v0.2.8` line was corrected in `v0.2.9`.

Detailed static-analysis evidence for `v0.2.9` now shows:
- verdict: `Benign`
- summary: `No suspicious patterns detected.`
- reason codes: `None`

## Published package surface evidence
- `v0.2.9` is live on ClawHub
- public page shows corrected bundled-adapter/public-safe boundary wording
- removed bridge-execution public tools are absent from visible public tool list

## Remaining mismatch
The remaining issue is not package-code failure.
It is that aggregate/reputation layers may still show unresolved states such as:
- VirusTotal stale
- ClawScan Review
- overall scan pending
- possibly an aggregate `Suspicious` top-level label from a card/list view

## Requested support action
Please review and reconcile the aggregate/top-level package label once the remaining scan/reputation layers settle, so the top-level package status reflects the now-benign static-analysis result for `v0.2.9`.

## Boundary
This packet is for support/reconciliation only.
It is not a request to mutate package code.
