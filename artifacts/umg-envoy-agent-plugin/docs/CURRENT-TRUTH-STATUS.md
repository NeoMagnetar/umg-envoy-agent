# Current Truth Status — Canonical Resleever Plugin

Generated: 2026-04-20
Plugin:
- `umg-envoy-agent`

## Canonical identity
This is the canonical internal / Resleever-connected UMG Envoy plugin.

It is not the public Block Library distribution package.

## What is proven
- builds successfully
- loads in OpenClaw
- resolves default paths into bundled `UMG_Envoy_Resleever`
- supports list/read/compare flows
- compiles a valid sample sleeve successfully
- reports invalid sleeve payloads honestly
- supports preview
- supports promotion with backup creation
- supports rollback

## Current caveats
- some authored sleeves are still invalid compiler-v0 inputs and should be treated as failure-path validation targets rather than success-path smoke targets

## Operational guidance
Promotion/rollback now work through persisted config when `allowRuntimeWrites: true` is set.
The explicit CLI override remains available if you want an extra-visible local guardrail during manual testing:
- `--allow-runtime-writes`

Use a valid sleeve such as:
- `sample-basic-minimal`

Avoid treating `stage5-sleeve` as a success-path smoke target; it is useful as a failure-path validation target because compiler-v0 rejects it.
