# TOOL-RUNTIME-29 — Explicit Publish Approval Packet

## Purpose

This packet assembles the final approval gate for the corrected public `umg-envoy-agent` `v0.2.9` candidate.
It exists so the user can approve or decline a later publish/upload phase with full knowledge of the current candidate state.

This phase does not publish automatically.

## Candidate identity
- package: `umg-envoy-agent`
- version: `0.2.9`
- branch: `fix/public-envoy-surface-v0.2.9`
- staged artifact: `umg-envoy-agent-0.2.9.tgz`
- local artifact path: `C:\.openclaw\workspace\umg-envoy-agent-publish-stage\umg-envoy-agent-0.2.8\umg-envoy-agent-0.2.9.tgz`
- final local SHA-256: `389417497433B3A71B09BFD528ACCE3A453CEE98488DDD1D7A74CB7A7A78AEBC`

## Candidate facts confirmed
- `package.json` version = `0.2.9`
- `openclaw.plugin.json` version = `0.2.9`
- packed top-level config keys no longer include `compilerBridge` or `relationMatrix`
- packed public `dist` search found no matches for:
  - `node:child_process`
  - `spawn(`
  - `umg_envoy_compile_ir_bridge`
  - `compile-ir-bridge`
  - `umg_envoy_emit_relation_matrix`
  - `emit-relation-matrix`
- `npm run validate:public-surface` passed
- output included `PUBLIC_SURFACE_OK`

## Current approval posture
- candidate is ready for explicit user approval review only
- candidate is not publish-authorized
- candidate is not uploaded
- candidate is not ClawHub-cleared
- no-publish hold remains active until explicit user approval is given

## What approval would mean
If the user later gives explicit approval, the next phase may:
- run the intentional publish/upload command(s)
- capture upload output
- capture post-upload ClawHub evidence
- capture post-upload scan/reputation results

Approval would **not** mean:
- automatic ClawHub clearance
- automatic publish success
- automatic release trust without post-upload review

## What declining approval would mean
If the user declines approval now:
- keep the staged candidate only
- keep no-publish hold active
- preserve branch and documentation state
- do not upload or tag

## Current recommendation
The candidate appears suitable to present for explicit approval review.
If approval is not given, stop here.
