# SYSTEM OVERVIEW

## Purpose

UMG Envoy Resleever is the runtime homebase for UMG Envoy work.

It does not replace the compiler. It does not replace the plugin. It sits between authored assets and active runtime state.

## Architecture

### 1. Source assets
Source assets live in this repo:
- sleeves in `sleeves/`
- normalized block libraries in `blocks/molt/`
- manifests and indexes in `blocks/manifests/` and `sleeves/manifests/`

These are the durable authored/runtime-homebase assets.

### 2. Compiler bridge
The compiler bridge lives in `compiler/`.

Its job is to:
- locate the sibling compiler repo
- invoke the compiler entrypoint
- preserve explicit path contracts
- support promotion helpers

It is an adapter layer only.

### 3. Compiled outputs
Compiled artifacts are written to:
- `runtime/compile-output/`
- `runtime/traces/`

The updated compiler contract remains:
- top-level `runtime`
- top-level `trace`

### 4. Runtime state
The currently active runtime state lives in:
- `runtime/active-sleeve.json`
- `runtime/active-stack.json`

These files represent what is currently promoted/active, not the entire authored source library.

### 5. Promotion flow
Promotion takes a verified compiled output and makes it authoritative runtime state.

Promotion flow:
1. compile sleeve
2. review output + trace
3. create backup of current active state
4. write new active runtime files
5. record metadata for traceability

### 6. Backup flow
Before mutation, the previous active state is copied into:
- `runtime/backups/<timestamp>-<label>/`

Typical backup contents:
- prior `active-sleeve.json`
- prior `active-stack.json`
- `metadata.json`

### 7. Rollback flow
Rollback restores a prior active state from `runtime/backups/`.

This is a safety feature, not an optional convenience.

### 8. Plugin bridge
The OpenClaw plugin reads and mutates this repo as an orchestration client.

Typical plugin interactions:
- sleeve listing
- block library listing
- compile invocation
- runtime preview
- promotion
- backup listing
- rollback
- runtime inspection

## Updated compiler direction reflected here

This repo now aligns to the newer compiler direction:
- trigger is treated as routing/gate logic in runtime semantics
- stack activation is based on trigger state and matched trigger ids
- `use`, `aim`, and `need` are represented in runtime outputs and prompt sections
- merge and bundle remain separate concepts

Important note:
- historical trigger block libraries still exist as stored assets under `blocks/molt/triggers/`
- runtime activation logic should be understood through stack gating and matched trigger state, not by treating trigger as a peer generative output bucket

## Boundary rules

### Compiler responsibilities
The compiler is responsible for:
- parsing and validation
- merge/bundle handling
- selection and precedence
- runtime generation
- trace generation

### Resleever responsibilities
The resleever is responsible for:
- source asset storage
- runtime homebase organization
- compile artifact storage
- active runtime state
- promotion / backup / rollback surfaces
- path contracts and bridge scripts

### Plugin responsibilities
The plugin is responsible for:
- OpenClaw-facing tool surface
- orchestration
- operator-friendly inspection and mutation workflows

## Design rule

Keep the three layers separate:
- compiler
- runtime homebase
- plugin

That separation is part of the system design, not accidental structure.
