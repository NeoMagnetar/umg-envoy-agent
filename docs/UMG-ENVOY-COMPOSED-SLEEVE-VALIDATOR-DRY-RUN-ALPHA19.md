# UMG Envoy Composed Sleeve Validator Dry Run - Alpha19

## 1. Verdict

COMPOSED_SLEEVE_VALIDATOR_DRY_RUN_ALPHA19_SOURCE_READY

Alpha19 adds a source-level dry-run validator for composed sleeve previews. The validator audits the Alpha18 composer output before any later lane is allowed to write, export, execute, publish, install, or mutate generated sleeve data.

## 2. Repo State

| Item | Value |
|---|---|
| Repo path | `C:\.openclaw\workspace\umg-envoy-agent-release-clean` |
| Branch | `main` |
| Starting HEAD | `d7b1ad007bfd85c012abff50e8f63e3a76d7923a` |
| Ending HEAD | `d7b1ad007bfd85c012abff50e8f63e3a76d7923a` |
| Committed | no |
| Pushed | no |
| Installed extension mutated | no |
| Publication changed | no |
| ClawHub changed | no |
| Version changed | no |

Pre-existing Alpha15 diagnostic/docs leftovers remain untouched.

## 3. Files Changed For Alpha19

- `src/compiler/composed-sleeve-validator-dry-run.ts`
- `src/compiler/composed-sleeve-validator-dry-run.test.ts`
- `src/types.ts`
- `src/plugin-entry.ts`
- `src/tool-capability-registry-seed.ts`
- `src/tool-capability-registry-seed.test.ts`
- `src/tool-manifest-alignment.test.ts`
- `src/low-risk-direct-execution-adapter.test.ts`
- `src/low-risk-direct-runtime-tool-surface.test.ts`
- `openclaw.plugin.json`
- `README.md`
- `docs/TOOL-SURFACE.md`
- `docs/UMG-ENVOY-COMPOSED-SLEEVE-VALIDATOR-DRY-RUN-ALPHA19.md`
- generated `dist/` outputs for the Alpha19 source and updated tests

## 4. New Surface

| Item | Value |
|---|---|
| New tool | `umg_envoy_validate_composed_sleeve_dry_run` |
| New CLI | `openclaw umg-envoy -- validate-composed-sleeve --intent <intent>` |
| Expected manifest tool count | 22 |
| Observed manifest tool count | 22 |

The validator is dry-run only. It is not included in the low-risk direct execution allowlist.

## 5. Commands Run

| Command | Result |
|---|---|
| `git branch --show-current` | pass: `main` |
| `git rev-parse HEAD` | pass: `d7b1ad007bfd85c012abff50e8f63e3a76d7923a` |
| `git status --short` | pass: Alpha19 changes visible; unrelated Alpha15 leftovers still present |
| `npm run check` | pass |
| `npm run build` | pass |
| `npm pack --dry-run` | pass |
| `node dist/compiler/composed-sleeve-validator-dry-run.test.js` | pass: 21 passed, 0 failed |
| `node dist/compiler/sleeve-composer-dry-run.test.js` | pass: 14 passed, 0 failed |
| `node dist/compiler/cognitive-registry.test.js` | pass: 20 passed, 0 failed |
| `node dist/tool-capability-registry-seed.test.js` | pass: 20 passed, 0 failed |
| `node dist/tool-manifest-alignment.test.js` | pass: 28 passed, 0 failed |
| `node dist/low-risk-direct-execution-adapter.test.js` | pass: 30 passed, 0 failed |
| `node dist/low-risk-direct-runtime-tool-surface.test.js` | pass: 21 passed, 0 failed |
| `node -e "const m=require('./openclaw.plugin.json'); const tools=m.tools||[]; console.log(JSON.stringify({tool_count:tools.length, has_validator:tools.includes('umg_envoy_validate_composed_sleeve_dry_run'), tools}, null, 2));"` | pass: `tool_count=22`, `has_validator=true` |

## 6. Composer Integration Proof

The validator uses the Alpha18 dry-run sleeve composer when no injected composition is supplied. The regression suite confirms:

- sleeve explanation intent composes and validates against `NS.SLEEVE_EXPLAINER`
- code generation intent composes and validates against `NS.PUBLIC_CODER_RUNTIME`
- public post/generation intent composes and validates against `NS.SAFE_GENERATION_PLANNER`
- Alpha18 composer tests still pass
- Alpha17 registry tests still pass

## 7. Validation And Audit Proof

The validator checks:

- selected NeoStack is present
- selected NeoStack resolves
- proposed sleeve id is present
- sleeve outline is present
- all referenced NeoBlocks resolve
- all referenced MOLT blocks resolve
- selection trace is present
- composition trace is present
- validation trace is present
- non-executing boundary is preserved
- writes remain disabled
- execution, mutation, and publication remain disallowed

The result includes source attribution:

- `composer_tool: umg_envoy_compose_sleeve_dry_run`
- `validator_tool: umg_envoy_validate_composed_sleeve_dry_run`

## 8. Fail-Closed Proof

The validator test suite confirms fail-closed behavior for:

- unresolved NeoStack path
- unresolved NeoBlock path
- unresolved MOLT path
- empty intent
- unsupported intent
- deterministic repeated input equivalence

Failure results return `ok=false`, `validation_status=invalid_dry_run`, validation errors, validation trace evidence, and safety flags that keep execution, mutation, and publication disabled.

## 9. Safety Boundary

Confirmed:

- no generated sleeve execution
- no generated sleeve writes
- no registry writes
- no installed extension mutation
- no ClawHub update
- no publication
- no version bump
- no external compiler bridge execution
- validator excluded from low-risk direct execution

## 10. Next Step

Operator-approved Alpha19 live install validation after source review.
