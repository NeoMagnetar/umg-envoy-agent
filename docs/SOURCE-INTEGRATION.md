# Source Integration — Stage 2

## Purpose
Document how UMG Envoy Agent integrates the UMG doctrine, compiler, and resleever runtime surfaces.

## Integrated sources

### 1. Doctrine anchor
Bundled into:
- `spec/ANALYTICAL_REPORT_ON_UMG_REVAMP_WORKSPACE.md`

Source repo during authoring:
- `umg-revamp-workspace`

Role in plugin:
- human-readable doctrinal reference
- unified analysis anchor for future README/tool help text
- not treated as executable runtime logic

### 2. Canonical compiler
Vendored under:
- `vendor/umg-compiler/`

Most important subpath:
- `vendor/umg-compiler/compiler-v0/`

Role in plugin:
- authoritative compilation engine
- produces RuntimeSpec + Trace
- should be used directly rather than replaced by a fake local reimplementation

### 3. Resleever runtime homebase
Vendored under:
- `vendor/UMG_Envoy_Resleever/`

Most important subpaths:
- `blocks/`
- `sleeves/`
- `runtime/`
- `compiler/`
- `docs/`

Role in plugin:
- sleeve storage
- block and manifest storage
- runtime state
- promotion and compile-adapter workflow reference

## Bundled defaults vs external override paths

The plugin is designed to support both:

### Bundled default mode
Use the vendored copies inside the plugin package when no override path is supplied.

This is important for:
- portability
- packaging
- a testable first working version

### External override mode
Allow the operator to point the plugin at real working checkouts using config:
- `compilerRoot`
- `resleeverRoot`

This matters because live UMG work may continue in external repos after the plugin is installed.

## Integration rule
The plugin should always prefer explicit configured paths first, then fall back to bundled vendor paths.

Resolution order:
1. explicit configured override path
2. plugin bundled vendor path
3. fail with a clear operational error

## Important design boundary
The plugin should not silently mutate doctrine files.

Runtime-affecting operations should be limited to the resleever/runtime side and gated by explicit config where possible.

## Stage 2 outcome
After Stage 2, the plugin package contains the source material needed for:
- compiler invocation
- sleeve and block inspection
- resleeve/runtime promotion orchestration
- future packaging without hard external repo dependency
