# INSTALL

## Package
OpenClaw UMG Envoy Agent (`openclaw-umg-envoy-agent`)

Package root after extraction or local checkout:
- `umg-envoy-agent-plugin/`

## Requirements
- Node.js `>=22`
- OpenClaw runtime compatible with plugin API `1`

## Included in the packaged release
Expected important contents:
- `package.json`
- `openclaw.plugin.json`
- `README.md`
- `dist/`
- `docs/`
- `spec/`
- selected vendored `umg-compiler` assets
- selected vendored `UMG_Envoy_Resleever` assets

## Install path options

### Option 1: use the package as extracted
Extract the release zip and keep the package folder intact.

### Option 2: use the workspace package root directly
Validated package root:
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

## Build
If the package already contains `dist/`, this step may be unnecessary.

From the package root:

```bash
npm install
npm run build
```

## Initial config guidance
Recommended cautious initial posture:
- use bundled defaults first
- leave `compilerRoot` and `resleeverRoot` unset unless you want live overrides
- keep `allowRuntimeWrites` disabled initially

## First validation sequence
1. `umg_envoy_status`
2. `umg_envoy_list_sleeves`
3. `umg_envoy_read_active_runtime`
4. `umg_envoy_list_block_libraries`
5. `umg_envoy_compile_sleeve`
6. `umg_envoy_validate_runtime_output`
7. `umg_envoy_preview_promotion`

Only after that, if desired:
8. enable runtime writes
9. `umg_envoy_promote_runtime`
10. `umg_envoy_list_runtime_backups`
11. `umg_envoy_rollback_runtime`

## Path shorthand docs
The package now also includes planner-path shorthand docs/examples:
- `docs/PATH-SHORTHAND.md`
- `docs/PATH-SHORTHAND-EXAMPLE.umgpath`

Useful CLI commands:
- `openclaw umg-envoy parse-path --file <path>`
- `openclaw umg-envoy validate-path --file <path>`
- `openclaw umg-envoy render-path --file <path>`
- `openclaw umg-envoy build-path --message "..." --sleeve <id>`

## Validation evidence
See:
- `validation/STAGE5-VALIDATION-REPORT.md`
- `validation/host-plugin-inspect.json`
