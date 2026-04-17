# UMG Envoy Resleever

UMG Envoy Resleever is the **runtime homebase** for the UMG Envoy lane.

It stores sleeves, block libraries, runtime state, manifests, promotion backups, and the adapter scripts that call the separate `umg-compiler` repository.

It is meant to be understandable to both humans and automation.

## What this repo is

This repo is:
- the runtime/homebase layer
- the storage surface for sleeves and normalized block libraries
- the place where active runtime state lives
- the place where compile outputs, traces, promotions, and backups are organized
- the bridge point that invokes the compiler from a sibling repo

## What this repo is not

This repo is **not**:
- the compiler source repo
- a second compiler implementation
- the plugin itself
- the place where compiler semantics should be reinvented

The intended separation is:
- `umg-compiler` = compiler/toolchain
- `UMG_Envoy_Resleever` = runtime homebase
- `umg-envoy-agent-plugin` = OpenClaw plugin/orchestration layer

That separation should stay intact.

## Relationship to the compiler

The compiler remains external and authoritative for compile behavior.

This repo:
- stages inputs
- invokes the compiler through wrapper scripts
- stores compile outputs and traces
- promotes approved outputs into active runtime state
- keeps backups for rollback

This repo should align to the compiler contract, but it should not duplicate or replace compiler logic.

## Relationship to the plugin

The plugin uses this repo as a runtime homebase.

The plugin may:
- read sleeve catalogs
- read block libraries
- trigger compile operations
- preview promotion changes
- promote runtime outputs
- inspect active runtime state
- list and restore backups

The plugin is the OpenClaw-facing orchestration layer. This repo is the underlying storage/runtime layer.

## Current compiler-aligned direction

Current alignment targets in this repo are:
- trigger treated as routing/gate logic rather than a normal generative MOLT bucket in runtime semantics
- `use`, `aim`, and `need` preserved in runtime outputs and prompt sections
- merge and bundle kept distinct
- compile result shape remains top-level `runtime` + top-level `trace`

Some historical trigger-library content still exists under `blocks/molt/triggers/` as a stored asset catalog, but runtime activation now follows the updated compiler direction through stack gating and matched trigger state.

## Start here

If you are new to the repo, start with:
- `docs/QUICK-START.md`
- `docs/SYSTEM-OVERVIEW.md`
- `docs/FOLDER-GUIDE.md`
- `docs/AGENT-INDEX.md`

If you want human-readable browsing of blocks and sleeves:
- `browse/README.md`
- `browse/START-HERE.md`

## Main folders

- `blocks/` - normalized block libraries, manifests, templates, and generated block artifacts
- `browse/` - human-readable markdown browse layer for blocks and sleeves
- `compiler/` - adapter scripts and compiler path contract; not compiler source
- `docs/` - architecture, workflow, and operator/agent documentation
- `runtime/` - active runtime state, compile outputs, traces, staging files, and backups
- `sleeves/` - sleeve source files plus sleeve catalog metadata

## Runtime lifecycle in one view

1. choose or author a sleeve in `sleeves/`
2. stage/compile through the adapter in `compiler/`
3. review output in `runtime/compile-output/` and `runtime/traces/`
4. preview/prompt-check as needed
5. promote approved output into:
   - `runtime/active-sleeve.json`
   - `runtime/active-stack.json`
6. rely on `runtime/backups/` for rollback safety

## Important safety rule

Do not remove or bypass:
- backup creation
- promotion safeguards
- rollback surfaces
- explicit compile/promotion paths

This repo should become clearer and easier to use, not more implicit or fragile.
