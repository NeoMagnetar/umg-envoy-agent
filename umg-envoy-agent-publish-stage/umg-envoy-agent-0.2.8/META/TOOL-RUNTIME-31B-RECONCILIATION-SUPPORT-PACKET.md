# TOOL-RUNTIME-31B — Reconciliation Support Packet

## Purpose
Use this packet if the top-level plugin list/card label remains `Suspicious` even after the package scan finishes and the lower-level evidence still shows the corrected `v0.2.9` package as benign in static analysis.

## Package identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- publish ID: `rd7ef3p11zrzjt1ba6f0ba3xy58613cg`
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`

## Why support refresh/reconciliation may be needed
Current evidence shows a layer mismatch:
- detailed static analysis panel for `v0.2.9` reports `Benign`
- summary says `No suspicious patterns detected.`
- reason codes are `None`
- corrected public-safe tool/package surface is live
- but the top-level plugin list/card may still show `Suspicious`

## Request to support
Please review and refresh/reconcile the top-level aggregate package label if it remains `Suspicious` after the scan pipeline finishes.

## Key evidence points
- prior dangerous-exec public package surface was removed in `v0.2.9`
- detailed static analysis now reports `Benign`
- public tool list no longer includes removed bridge-execution tools
- public page reflects the corrected public-safe package boundary

## Important caution
This packet should only be used if the aggregate label remains `Suspicious` after the scan is no longer pending.
While scan is still pending, the mismatch may still be normal platform lag.
