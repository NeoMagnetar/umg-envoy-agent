# Tool Surface

## Purpose
This document records the first working tool surface exposed by the UMG Envoy Agent plugin.

## Registered tools

### `umg_envoy_status`
Returns:
- current build/integration stage
- resolved doctrine anchor path
- resolved compiler root
- resolved resleever root
- whether runtime writes are enabled

Use when:
- validating installation
- debugging plugin path resolution
- confirming bundled vs override path behavior

### `umg_envoy_list_sleeves`
Reads the resleever sleeve catalog and returns:
- sleeve ids
- sleeve names/status when present
- resolved source file paths

Use when:
- discovering available sleeve artifacts
- selecting a sleeve for compilation or promotion

### `umg_envoy_read_active_runtime`
Reads current active runtime files and returns a summarized view of:
- active sleeve state
- active stack state

Use when:
- checking what the current runtime believes is active
- validating promotion effects

### `umg_envoy_compare_sleeves`
Compares two sleeves and returns:
- left sleeve summary
- right sleeve summary
- mode differences
- bpMode differences
- stack membership deltas

Use when:
- deciding whether a candidate sleeve is materially different before compile
- evaluating resleeve decisions before preview/promotion

### `umg_envoy_list_block_libraries`
Reads block/manifold indexes and returns:
- category index
- MOLT library index

Use when:
- discovering bundled block families
- auditing available library surfaces before block/scaffold work

### `umg_envoy_compile_sleeve`
Compiles a sleeve by id through the canonical vendored or overridden compiler.

Inputs:
- `sleeveId`
- optional `pretty`

Effects:
- ensures the compiler is built when needed
- writes runtime JSON output into the resleever runtime `compile-output/` area
- returns the runtime output path and result payload

### `umg_envoy_validate_runtime_output`
Validates a compiled runtime JSON before promotion or downstream use.

Inputs:
- `compiledOutputPath`

Returns:
- validation result with `ok`, `errors`, and `warnings`

### `umg_envoy_preview_promotion`
Previews a runtime promotion without mutating active runtime files.

Inputs:
- `compiledOutputPath`
- `sleeveId`
- optional `promotionLabel`

Returns:
- current active sleeve summary
- candidate promotion summary
- expected field-level changes

### `umg_envoy_promote_runtime`
Promotes a compiled runtime output into active resleever state.

Inputs:
- `compiledOutputPath`
- `sleeveId`
- optional `promotionLabel`

Safety:
- blocked unless `allowRuntimeWrites` is enabled in plugin config
- validates compiled runtime before mutation
- creates a backup snapshot before writing active runtime files

Effects:
- writes `active-sleeve.json`
- writes `active-stack.json`
- creates a timestamped backup folder under `runtime/backups/`

### `umg_envoy_list_runtime_backups`
Lists backup snapshots created before promotions.

Returns:
- backup directory path
- metadata path
- whether metadata is present

### `umg_envoy_rollback_runtime`
Restores active runtime files from a previous backup snapshot.

Inputs:
- `backupDir`

Safety:
- blocked unless `allowRuntimeWrites` is enabled in plugin config

Effects:
- restores `active-sleeve.json`
- restores `active-stack.json`
- writes a rollback record into the backup directory

### `umg_envoy_create_molt_block`
Creates a structured MOLT block artifact.

### `umg_envoy_create_neoblock`
Creates a structured NeoBlock artifact.

### `umg_envoy_create_neostack`
Creates a structured NeoStack artifact.

### `umg_envoy_create_sleeve`
Creates a structured Sleeve artifact.

### `umg_envoy_validate_artifact`
Validates a candidate artifact payload as one of:
- `molt-block`
- `neoblock`
- `neostack`
- `sleeve`

Returns:
- `ok`
- `errors`
- `warnings`

### `umg_envoy_scaffold_micro_agent`
Creates a first-pass micro-agent artifact in the resleever block tree.

Inputs:
- `id`
- `title`
- `role`
- `summary`
- optional `targetFolder`

Safety:
- blocked unless `allowRuntimeWrites` is enabled in plugin config

Effects:
- writes a generated JSON scaffold for later refinement into stronger UMG structures

## Path shorthand / planner-path CLI surface
The plugin also exposes a compact planner-path shorthand through the `umg-envoy` CLI.

Commands:
- `parse-path`
- `validate-path`
- `render-path`
- `build-path`

Use when:
- converting shorthand path text into JSON
- validating planner-path documents
- rendering JSON back into shorthand text
- building a live runtime-derived planner path from a message

See:
- `docs/PATH-SHORTHAND.md`
- `docs/PATH-SHORTHAND-EXAMPLE.umgpath`

## Design notes
- Runtime-write tools are intentionally optional and gated.
- Inspect/read tools are the safest first-pass surface and should remain stable.
- The compile and promotion tools are intended to make the plugin operational for real UMG agent usage without pretending the plugin replaces the canonical compiler or the resleever runtime model.
