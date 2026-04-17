# COMPILER BRIDGE

## What it is

The compiler bridge is the small adapter layer inside this repo that invokes the separate `umg-compiler` repository.

It exists so that:
- runtime/homebase assets stay here
- compiler logic stays in the compiler repo
- compile and promotion paths remain explicit

## Important files
- `compiler/invoke-compiler.ps1`
- `compiler/promote-runtime.ps1`
- `compiler/compiler-paths.json`
- `compiler/README.md`

## What it does

### `invoke-compiler.ps1`
- resolves configured compiler entrypoint
- validates input path
- invokes the compiler
- writes output to runtime artifact locations
- exports trace JSON when available

### `promote-runtime.ps1`
- validates compiled output structure
- creates a backup of active runtime state
- writes new active runtime files
- records metadata for rollback and auditability

## Alignment with updated compiler direction

The bridge should expect the newer compile shape:
- top-level `runtime`
- top-level `trace`

And the newer runtime shape may include:
- `matchedTriggerIds`
- `activeStackIds`
- `use`
- `aim`
- `need`
- stack gating behavior through trigger state

The bridge should not attempt to reinterpret compiler logic beyond what is required for promotion/storage.

## Rule

Do not turn this adapter folder into a duplicate compiler implementation.
