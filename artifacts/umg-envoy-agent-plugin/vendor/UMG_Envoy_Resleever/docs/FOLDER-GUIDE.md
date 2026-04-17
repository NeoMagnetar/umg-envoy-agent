# FOLDER GUIDE

## Root

### `README.md`
Plain-language explanation of what this repo is, what it is not, and where to start.

### `resleever-config.json`
Main config and path contract summary for the runtime homebase.

### `AGENT_SCOPE.md`
Agent-facing scope/operating notes.

### `SKILL.md`
Skill-facing instructions for agent use.

## `blocks/`
Stored block assets and block metadata.

### `blocks/molt/`
Normalized block libraries grouped by type.

Current stored categories include:
- blueprints
- directives
- instructions
- philosophy
- primary
- subjects
- triggers

Important note:
- trigger libraries still exist here as stored asset catalogs
- runtime/compiler semantics now treat trigger primarily as gate/routing logic rather than as a peer generative section

### `blocks/manifests/`
Indexes, templates, examples, and ingest summaries.

Important files:
- `molt-library-index.json`
- `category-index.json`

### `blocks/generated/`
Generated block artifacts such as generated MOLT blocks, NeoBlocks, NeoStacks, and micro-agent artifacts.

## `browse/`
Human-readable markdown navigation layer.

### `browse/blocks/`
One markdown page per block plus indexes.

### `browse/sleeves/`
Human-readable sleeve summaries and domain maps.

### `browse/sleeves/pages/`
The easiest place to open the individual sleeve markdown files directly.

## `compiler/`
Adapter layer for the external compiler.

Important files:
- `invoke-compiler.ps1`
- `promote-runtime.ps1`
- `compiler-paths.json`
- `README.md`

This folder should not become a duplicate compiler source tree.

## `docs/`
Operator-facing and agent-facing documentation.

This folder now includes:
- system overview
- quick start
- folder guide
- agent index
- compiler bridge notes
- runtime lifecycle notes
- known caveats

## `runtime/`
Live runtime surfaces and mutation history.

### `runtime/active-sleeve.json`
Current active sleeve metadata.

### `runtime/active-stack.json`
Current active runtime spec and stack-level runtime data.

### `runtime/staging/`
Prepared/staged inputs for compile runs.

### `runtime/compile-output/`
Compiled runtime outputs.

### `runtime/traces/`
Compile traces.

### `runtime/backups/`
Backup snapshots created before promotion.

## `sleeves/`
Sleeve source files and sleeve catalogs.

### `sleeves/archive/`
Archived or sample sleeve files.

### `sleeves/generated/`
Generated sleeves created through tooling or agent-assisted flows.

### `sleeves/manifests/`
Sleeve catalog metadata.

Important file:
- `sleeves/manifests/catalog.json`
