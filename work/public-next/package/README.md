# UMG Envoy Agent 0.3.0-alpha.13

UMG Envoy Agent runs Universal Modular Generation as a modular cognitive architectural runtime inside OpenClaw. This alpha adds read-only controlled-action runtime report visibility, plugin-owned access, local install verification artifacts, user-facing examples, demo/preview packets, and a TypeScript UI render-model for inspecting active routes, safety evidence, blocked capabilities, and next safe steps.

This release does not enable action execution, approval grants, write actions, bridge actions, direct_source, or automatic response takeover.

## Current alpha.13 feature summary

alpha.13 includes:
- bounded read-only orchestration
- active sleeve session state
- sleeve graph richness
- native route provenance cleanup
- clean native graph fixture/runtime integration
- controlled-action runtime report integration
- read-only controlled-action runtime report tool surface
- plugin-owned runtime report access surface
- local install verification artifacts
- user-facing examples
- demo packet and presentation handoff
- visual UI wireframe
- TypeScript UI render-model
- UI component demo render and preview packet
- packaged `fixtures/native-sleeves`
- packaged `schemas`

It also preserves the broader Alpha6/Alpha7/Alpha8 runtime surfaces, including:
- runtime tool request classifier
- execution gate plan
- approval checkpoint create/resume
- approved allowlisted read-only execution
- end-to-end approved read-only execution chain
- active sleeve / IR Matrix / envelope inspector

## alpha.13 proof caveat

Direct live CLI invocation proof for the plugin-owned controlled-action runtime report surface remains unavailable from the current OpenClaw CLI surface.

Accepted proof chain includes:
- source implementation verification
- local install verification
- deterministic demo/preview packet chain
- TypeScript UI render-model validation
- package build and validation coverage

## alpha.13 safety posture

alpha.13 preserves strict safety boundaries:
- approved only where approval lanes already existed historically
- allowlisted only
- read-only controlled-action runtime report visibility
- no broad autonomous execution
- no trigger evaluation as execution authority
- no external MOLT block file loading
- no full library scan
- no unbounded recursive traversal
- no UMG-Block-Library mutation
- no restart / publish / package execution in this feature chain
- no automatic response takeover
- direct_source remains disabled

## Controlled-action runtime report surfaces

### Read-only runtime report tools / access

- `umg_envoy_controlled_action_runtime_report`
- `umg_envoy_controlled_action_runtime_report_access`

### Existing runtime control / visibility tools

- `umg_envoy_runtime_tool_request_classify`
- `umg_envoy_runtime_execution_gate_plan`
- `umg_envoy_runtime_approval_checkpoint_create`
- `umg_envoy_runtime_approval_checkpoint_resume`
- `umg_envoy_runtime_execute_approved_allowlisted`
- `umg_envoy_runtime_execution_chain_e2e_approved_read_only`
- `umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect`
- `umg_envoy_runtime_bounded_read_only_orchestrate`
- `umg_envoy_sleeve_session_select`
- `umg_envoy_sleeve_session_current`
- `umg_envoy_sleeve_session_clear`
- `umg_envoy_sleeve_session_inspect`
- `umg_envoy_runtime_sleeve_graph_richness_inspect`

## What alpha.13 does

- inspects controlled-action runtime safety state through a read-only report surface
- shows active route, safety evidence, blocked capabilities, and next safe steps
- preserves non-execution / non-approval / non-recording posture in report and UI model outputs
- exposes plugin-owned access for runtime report inspection
- provides deterministic demo/preview artifacts for human and agent review
- provides a TypeScript UI render-model without requiring React/TSX

## What alpha.13 does not do

- prove live CLI invocation of the plugin-owned report surface
- implement a generic OpenClaw `plugin.tools.call` protocol
- mount a live OpenClaw UI
- enable action execution
- enable approval-gated writes
- enable bridge actions
- enable direct_source
- enable automatic response takeover

## Docs

- Public alpha.13 alignment notes: `docs/ALPHA9-VERSION-PACKAGE-PUBLICATION-ALIGNMENT.md`
- Release readiness: `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-RELEASE-READINESS.md`
- UI preview packet: `docs/ALPHA9-CONTROLLED-ACTION-RUNTIME-REPORT-PLUGIN-OWNED-ACCESS-UI-COMPONENT-PREVIEW-PACKET.md`
- Release ledger: `../RELEASE_LEDGER.md`

## Install

- next source/package target: `umg-envoy-agent@0.3.0-alpha.13`

## Build and test

- `npm run validate:alpha-current`
- `npm run smoke`
- `npm run pack:dry`

## Entrypoint

- `dist/plugin-entry.js`
