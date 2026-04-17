# Setup and Operation

## Plugin type
UMG Envoy Agent is a **native OpenClaw tool plugin**.

It is not a skill-only package and it is not a simple bundle wrapper.

## Package root
Current working/package root:
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

## Installation options

### Local path install
This package has already been validated through a local-path install/load flow from:
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

### Packaged release install
If installing from a packaged zip:
1. extract the zip
2. keep the package folder structure intact
3. ensure `dist/` is present after extraction
4. install/load it as an OpenClaw plugin from the extracted package folder

## Runtime modes

### Bundled default mode
Default behavior uses the vendored sources inside the plugin package:
- vendored compiler
- vendored resleever runtime/homebase
- bundled doctrine anchor

This is the safest first-pass setup because it avoids requiring live external repo checkouts just to test the plugin.

### External override mode
Operator can override the bundled paths using plugin config:
- `compilerRoot`
- `resleeverRoot`

Use override mode when:
- working from live external repos
- you want newer compiler/runtime repo state without repackaging the plugin

## Build requirements
- Node.js `>=22`
- OpenClaw runtime compatible with plugin API `1`

## Build behavior
From the plugin root:

```bash
npm install
npm run build
```

The packaged release is expected to already include `dist/`, so rebuilding should not be mandatory for a normal install.

### Compiler build behavior during tool execution
The plugin currently ensures the vendored or overridden compiler is built when compile operations are called. If compiler dist artifacts are missing, it may attempt:
- `npm install`
- `npm run build`

inside the resolved compiler root.

## Config fields

### `workspaceRoot`
Optional logical workspace root for plugin-local operations.

### `compilerRoot`
Optional override path to the real `umg-compiler` repo or directly to the `compiler-v0` root.

### `resleeverRoot`
Optional override path to the real `UMG_Envoy_Resleever` repo.

### `allowRuntimeWrites`
Controls whether write/mutate operations are permitted.

Recommended behavior:
- `false` for inspection-only or cautious first install
- `true` only when you want the plugin to modify active runtime state or create generated artifacts

### `defaultSleeveId`
Optional convenience default for higher-level flows.

## Recommended first config posture
For first install / first inspection:
- use bundled defaults unless you specifically need live repo overrides
- set or keep `allowRuntimeWrites` to `false`

Turn on runtime writes only when you intentionally want to test:
- runtime promotion
- rollback flows
- generated artifact creation
- micro-agent scaffolding

## Resleever path hygiene
The vendored resleever includes some historical machine-specific paths in sample/runtime-adjacent files. The plugin does not treat those stale absolute paths as live truth. It resolves active paths from the current package roots or configured override roots.

## Runtime-write safety
The following operations require `allowRuntimeWrites = true`:
- runtime promotion
- rollback runtime
- generated artifact creation
- micro-agent scaffold generation

This is intentional.

## Recommended validation flow

### Safe order
1. call `umg_envoy_status`
2. call `umg_envoy_list_sleeves`
3. call `umg_envoy_read_active_runtime`
4. call `umg_envoy_list_block_libraries`
5. call `umg_envoy_compile_sleeve` on a known sleeve id
6. call `umg_envoy_validate_runtime_output`
7. call `umg_envoy_preview_promotion`

### Mutation order
Only after the safe order passes and only with runtime writes enabled:
1. call `umg_envoy_promote_runtime`
2. call `umg_envoy_list_runtime_backups`
3. call `umg_envoy_rollback_runtime`
4. call artifact-generation tools as needed

## Validated release position
The Stage 5 validation pass confirmed:
- plugin install success
- plugin load success
- tool registration success
- compile execution success
- promotion success with backup creation
- rollback success
- artifact generation success

Primary validation record:
- `validation/STAGE5-VALIDATION-REPORT.md`
