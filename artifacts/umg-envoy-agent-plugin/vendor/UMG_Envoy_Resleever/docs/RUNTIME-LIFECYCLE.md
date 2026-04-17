# RUNTIME LIFECYCLE

## Overview

This file describes the lifecycle from authored sleeve to active runtime state.

## 1. Source state
A sleeve exists under `sleeves/` and block assets exist under `blocks/`.

## 2. Staging
A compile input may be staged under:
- `runtime/staging/`

## 3. Compile
The compiler bridge invokes the sibling compiler.

Outputs land in:
- `runtime/compile-output/`
- `runtime/traces/`

## 4. Review
Before promotion, inspect:
- runtime output
- trace output
- active stack selection
- matched trigger behavior
- `use/aim/need` sections where relevant

## 5. Promotion
Promotion updates:
- `runtime/active-sleeve.json`
- `runtime/active-stack.json`

## 6. Backup
Before active runtime mutation, prior state is copied into:
- `runtime/backups/<timestamp>-<label>/`

## 7. Rollback
Rollback restores an earlier active state from the backup folder.

## 8. Active runtime interpretation
The active runtime files represent the currently promoted runtime state.

In newer compiler-aligned outputs, this may include:
- matched trigger ids
- active stack ids
- stack-gated neoBlocks
- prompt sections including `use`, `aim`, and `need`

## Safety rule

Promotion without backup should not be treated as acceptable normal operation.
