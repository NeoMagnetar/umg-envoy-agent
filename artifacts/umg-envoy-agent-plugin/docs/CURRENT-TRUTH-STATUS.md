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

## What remains imperfect
- persisted `allowRuntimeWrites` is visible in status/effective config, but mutation commands may still require `--allow-runtime-writes` to proceed reliably
- this is a config-propagation issue, not a broken mutation implementation

## Operational guidance
For now, when testing promotion/rollback directly from CLI:
- pass `--allow-runtime-writes`

Use a valid sleeve such as:
- `sample-basic-minimal`

Avoid treating `stage5-sleeve` as a success-path smoke target; it is useful as a failure-path validation target because compiler-v0 rejects it.
