# TOOL-RUNTIME-30F — Escalation Packet Draft

## Purpose
Prepare a clean support/escalation packet in case the ClawHub scan remains pending longer than expected.

## Package identity
- package: `umg-envoy-agent`
- latest version: `0.2.9`
- publish ID: `rd7ef3p11zrzjt1ba6f0ba3xy58613cg`
- source repo: `NeoMagnetar/umg-envoy-agent`
- source commit: `d92d984ebabd66d010a1c9f6a3065084082bbf24`
- source ref: `fix/public-envoy-surface-v0.2.9`

## Why escalation may be needed
- publish succeeded
- provenance linked successfully
- corrected public-safe tool list is visible
- public page shows the corrected `v0.2.9` package content
- scan status still remains `pending`

## Key support points
- this package replaced a prior public artifact that had a dangerous-exec review issue tied to a shipped process-execution bridge surface
- the corrected `0.2.9` public artifact removed those public bridge/process-execution surfaces
- published public tool list no longer shows `umg_envoy_compile_ir_bridge`
- published public tool list no longer shows `umg_envoy_emit_relation_matrix`
- current public package page text reflects the corrected public-safe boundary
- final scan verdict is still pending despite successful publish and visible updated package data

## Requested support outcome
- confirm whether the pending scan is still processing normally or stalled
- provide the final scan verdict when available
- confirm whether any further package action is needed from the publisher

## Boundary
This draft does not itself send escalation.
It is prepared evidence only.
