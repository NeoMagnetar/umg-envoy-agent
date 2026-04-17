# QUICK START

## Goal

This file is the shortest practical path for inspecting, compiling, promoting, and rolling back runtime state.

## 1. Inspect current runtime
Important files:
- `runtime/active-sleeve.json`
- `runtime/active-stack.json`

These show what is currently active.

## 2. Inspect available sleeves
Primary catalog:
- `sleeves/manifests/catalog.json`

Human-readable browse layer:
- `browse/sleeves/INDEX.md`
- `browse/sleeves/pages/`

## 3. Compile through the compiler bridge
Bridge script:
- `compiler/invoke-compiler.ps1`

Compiler entrypoint:
- sibling repo `..\\umg-compiler\\compiler-v0\\dist\\cli.js`

Typical flow:
1. choose a sleeve source file from `sleeves/`
2. stage input if needed
3. invoke compile through the adapter

Output locations:
- runtime outputs -> `runtime/compile-output/`
- trace outputs -> `runtime/traces/`

## 4. Preview promotion
Before promoting, review:
- compiled runtime JSON in `runtime/compile-output/`
- trace JSON in `runtime/traces/`
- expected stack activation, matched triggers, and `use/aim/need` sections

## 5. Promote approved output
Promotion helper:
- `compiler/promote-runtime.ps1`

Promotion updates:
- `runtime/active-sleeve.json`
- `runtime/active-stack.json`

Promotion also creates a backup under:
- `runtime/backups/`

## 6. Roll back if needed
Use the most relevant folder under:
- `runtime/backups/`

Restore the backed-up active files if a promoted state needs to be reverted.

## 7. Where important artifacts go
- staged inputs -> `runtime/staging/`
- compile outputs -> `runtime/compile-output/`
- traces -> `runtime/traces/`
- active runtime -> `runtime/active-sleeve.json`, `runtime/active-stack.json`
- backups -> `runtime/backups/`

## 8. What to remember
- compiler stays external
- resleever stores and promotes runtime state
- plugin orchestrates
- backups should always exist before active runtime mutation
