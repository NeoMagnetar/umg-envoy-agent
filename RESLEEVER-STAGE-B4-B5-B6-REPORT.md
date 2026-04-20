# Resleever Plugin — Stage B4 / B5 / B6 Report

Generated: 2026-04-20
Plugin:
- `umg-envoy-agent`
- `C:\.openclaw\workspace\artifacts\umg-envoy-agent-plugin`

## Scope
This report covers:
- Stage B4 — core runtime / compile / promotion pipeline
- Stage B5 — tool-surface validation
- Stage B6 — safety and write-boundary validation

## Test setup
Config was updated so that:
- `umg-envoy-agent` = enabled
- `umg-envoy-agent.config.allowRuntimeWrites = true`
- `umg-envoy-agent-public-block-library` = disabled

This ensured testing ran against the canonical internal Resleever lane.

## B4 — Core runtime / compile / promotion pipeline

### Path resolution against real Resleever lane
Result: PASS

Observed via `openclaw umg-envoy status`:
- doctrine anchor points into internal plugin spec path
- compiler root points to `vendor\umg-compiler\compiler-v0`
- resleever root points to `vendor\UMG_Envoy_Resleever`
- plugin is operating on the canonical internal lane

### `list-sleeves`
Result: PASS

Observed:
- sleeve catalog resolves from internal Resleever tree
- entries are readable and source paths resolve correctly

### `read-active-runtime`
Result: PASS

Observed:
- active sleeve metadata reads successfully
- active runtime / runtimeSpec reads successfully
- active stack reads successfully

### `list-block-libraries`
Result: PASS

Observed:
- category index loads from internal Resleever lane
- library index loads successfully
- internal block-library data is readable

### `compare-sleeves`
Result: PASS

Observed:
- `stage5-sleeve` vs `neomagnetar-dynamic-persona-v1` comparison worked
- differences in mode / bpMode / stacks were reported correctly

### `compile-sleeve` — valid sample
Command:
- `openclaw umg-envoy compile-sleeve --sleeve sample-basic-minimal`

Result: PASS

Observed:
- compiler invocation succeeds
- runtime output file created
- trace file created
- runtime summary returned
- output validates successfully

### `compile-sleeve` — invalid authored sleeve
Command:
- `openclaw umg-envoy compile-sleeve --sleeve stage5-sleeve`

Initial result before patch:
- FAIL with misleading message:
  - `Compiled runtime failed validation: Missing runtime object.`

Fix applied:
- patched `src\runtime.ts` so compile failures with `hasErrors=true` and missing runtime surface a compiler-facing error instead of a fake runtime-shape error

Post-fix result:
- FAIL HONESTLY
- now reports:
  - `Compiler reported an invalid sleeve payload for 'stage5-sleeve': Sleeve requires id, blocks[], stacks[].`

Interpretation:
- canonical plugin compile path now reports real sleeve-input errors clearly
- this is the correct behavior

### `preview-promotion`
Result: PASS

Observed:
- non-mutating preview works
- preview clearly shows current active runtime vs candidate runtime
- change list is intelligible

### `promote-runtime`
Result: PASS VIA CLI OVERRIDE

Observed:
- with explicit `--allow-runtime-writes`, promotion succeeds
- active runtime files are updated
- new backup directory is created
- validation returns OK

Returned data included:
- active sleeve path
- active stack path
- promotedAt
- backupDir
- validation result

### `rollback-runtime`
Result: PASS VIA CLI OVERRIDE

Observed:
- rollback succeeds from generated backup directory
- active runtime files are restored
- CLI returns restored paths and timestamp

## B4 conclusion
Core runtime pipeline is working on the canonical internal lane with one caveat:
- persisted config does not yet unlock mutation paths consistently without the explicit CLI override flag

Otherwise:
- read/list/compare/compile/preview/promote/rollback all work in the internal lane

---

## B5 — Tool-surface validation

### CLI smoke matrix
- status: PASS
- list-sleeves: PASS
- read-active-runtime: PASS
- list-block-libraries: PASS
- compare-sleeves: PASS
- compile-sleeve (valid sample): PASS
- compile-sleeve (invalid authored sleeve): PASS with honest failure message
- preview-promotion: PASS
- promote-runtime: PASS with `--allow-runtime-writes`
- list-runtime-backups: PASS
- rollback-runtime: PASS with `--allow-runtime-writes`

### Tool-surface notes
- the CLI surfaces are useful and operational
- outputs are rich enough to inspect runtime state and mutation effects
- compile failure handling is now honest and actionable

### Remaining issue affecting tool/command consistency
There is still a config-consumption inconsistency:
- persisted `allowRuntimeWrites: true` is visible via status/config
- but mutation commands still require explicit CLI override flag to proceed reliably

This does not block the underlying mutation machinery; it does block “no-hacks” completion of the write gate path

---

## B6 — Safety and write-boundary validation

### `allowRuntimeWrites` behavior
Observed:
- plugin config contains `allowRuntimeWrites: true`
- CLI mutation succeeds when `--allow-runtime-writes` is passed
- without the override, mutation still hits the disabled-write branch

Interpretation:
- write gate exists and works
- persisted config propagation for mutation commands is still inconsistent

### Preview is non-mutating
Result: PASS

Observed:
- preview does not alter active runtime files
- preview only reports candidate/changes

### Backup creation before mutation
Result: PASS

Observed:
- successful promotion created a new backup directory:
  - `runtime\backups\2026-04-20T16-13-45-408Z-sample-basic-minimal-sample-basic-minimal`
- backup path returned by CLI
- backup list includes prior historical backups and the newly created one

### Rollback works
Result: PASS

Observed:
- rollback restored active runtime files from backup
- CLI returned restored paths successfully

### Failure-mode safety
Result: PASS WITH NOTE

Observed:
- invalid sleeve compile does not mutate runtime
- preview does not mutate runtime
- mutation requires explicit gate path
- runtime corruption was not observed during failures

### Safety conclusion
Write semantics are mostly sound and bounded:
- preview is safe
- promotion creates backups
- rollback works
- failed compile paths do not silently corrupt active runtime

Remaining caveat:
- persisted config should unlock mutation without requiring CLI override; until fixed, this remains a configuration propagation bug rather than a mutation safety bug

---

## Final status summary

### Strongly working now
- canonical plugin enabled on the real Resleever lane
- path resolution
- list/read/compare surfaces
- valid compile path
- honest invalid compile diagnostics
- promotion with backup creation
- rollback restoration

### Remaining issue
- persisted `allowRuntimeWrites` is not yet consistently honored by mutation command execution without explicit `--allow-runtime-writes`

## Overall judgment
The canonical Resleever plugin is now substantially functional.

It is much closer to a real first working internal version than the public derivative ever was.
The main remaining blocker is a narrower config-propagation bug on mutation command gating, not a failure of the core runtime pipeline itself.
