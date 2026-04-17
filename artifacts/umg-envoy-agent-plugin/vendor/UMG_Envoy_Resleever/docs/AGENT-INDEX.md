# AGENT INDEX

## Purpose

This file is a short path/index reference for AI systems and operators.

## Critical docs
- `README.md`
- `docs/SYSTEM-OVERVIEW.md`
- `docs/QUICK-START.md`
- `docs/FOLDER-GUIDE.md`
- `docs/COMPILER-BRIDGE.md`
- `docs/RUNTIME-LIFECYCLE.md`
- `docs/KNOWN-CAVEATS.md`

## Main config file
- `resleever-config.json`

## Compiler bridge
- bridge folder: `compiler/`
- wrapper script: `compiler/invoke-compiler.ps1`
- promotion script: `compiler/promote-runtime.ps1`
- path contract: `compiler/compiler-paths.json`
- bridge readme: `compiler/README.md`

## Runtime files
- runtime root: `runtime/`
- active sleeve file: `runtime/active-sleeve.json`
- active stack file: `runtime/active-stack.json`
- staging root: `runtime/staging/`
- compile output root: `runtime/compile-output/`
- trace root: `runtime/traces/`
- backup root: `runtime/backups/`

## Sleeve locations
- sleeve root: `sleeves/`
- archive sleeves: `sleeves/archive/`
- generated sleeves: `sleeves/generated/`
- sleeve catalog: `sleeves/manifests/catalog.json`

## Block locations
- block root: `blocks/`
- normalized MOLT libraries: `blocks/molt/`
- block manifests: `blocks/manifests/`
- generated block artifacts: `blocks/generated/`

## Human-readable browse layer
- browse root: `browse/`
- block browser: `browse/blocks/INDEX.md`
- sleeve browser: `browse/sleeves/INDEX.md`
- direct sleeve pages: `browse/sleeves/pages/`

## Current alignment notes
- compiler remains external
- trigger should be understood as routing/gate logic in runtime semantics
- `use`, `aim`, and `need` are expected in newer runtime outputs and prompt sections
- merge and bundle are separate
- top-level compile result remains `runtime` + `trace`

## Important caveat
Historical stored asset layout still includes `blocks/molt/triggers/`. That library exists as stored content, but active runtime interpretation should follow stack gating and matched trigger behavior from the updated compiler direction.
