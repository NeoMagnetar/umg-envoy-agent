# UMG Envoy MOLT / NeoBlock / NeoStack Registry - Alpha17

## 1. Purpose

This lane adds the first public-safe cognitive registry layer to UMG Envoy Agent. It introduces bundled read-only registry data for MOLT blocks, NeoBlocks, and NeoStacks, plus a deterministic dry-run planner that selects candidate registry items for a user intent.

This is a visibility and planning layer only. It does not generate sleeves, save sleeves, merge sleeves, enable writes, call hidden LLM planners, or run the external compiler bridge.

## 2. Files Changed

- `public-content/cognitive-registry.json`
- `src/compiler/cognitive-registry.ts`
- `src/compiler/cognitive-registry.test.ts`
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
- generated `dist/` outputs

## 3. Registry Content

Bundled public registry path:

```text
public-content/cognitive-registry.json
```

Registry counts:

| Kind | Count |
|---|---:|
| MOLT blocks | 8 |
| NeoBlocks | 4 |
| NeoStacks | 3 |

Public MOLT block ids:

- `MOLT.OBSERVE_INTENT`
- `MOLT.SELECT_RELEVANT_BLOCKS`
- `MOLT.APPLY_GOVERNANCE_FILTER`
- `MOLT.COMPOSE_PROMPT_PARTS`
- `MOLT.TRACE_SELECTION`
- `MOLT.EXPLAIN_RUNTIME`
- `MOLT.CHECK_TOOL_INTENT`
- `MOLT.EMIT_NON_EXECUTING_SPEC`

Public NeoBlock ids:

- `NB.RUNTIME_VISIBILITY`
- `NB.GOVERNANCE_GUARD`
- `NB.PROMPT_COMPOSER`
- `NB.TOOL_INTENT_INSPECTOR`

Public NeoStack ids:

- `NS.SLEEVE_EXPLAINER`
- `NS.PUBLIC_CODER_RUNTIME`
- `NS.SAFE_GENERATION_PLANNER`

All bundled registry entries are read-only and no-write.

## 4. Tool / CLI Surface

New manifest-declared tools:

- `umg_envoy_cognitive_registry_query`
- `umg_envoy_plan_neostack`

New CLI commands:

```powershell
openclaw umg-envoy -- registry-query --kind <kind>
openclaw umg-envoy -- plan-neostack --intent <intent>
```

Supported registry kinds:

- `all`
- `molt`
- `neoblock`
- `neostack`

## 5. Output Contracts

`umg_envoy_cognitive_registry_query` returns bundled registry counts and registry item arrays for the requested kind. Invalid kinds return `ok: false` and a clear unsupported-kind error.

`umg_envoy_plan_neostack` returns a deterministic dry-run plan with:

- selected NeoStack candidate
- selected NeoBlocks
- selected MOLT blocks
- rejected candidates
- selection trace
- aggregate governance
- `non_executing: true`
- warnings and errors arrays

Planning uses deterministic tag scoring only. It does not use hidden LLM calls or runtime execution.

## 6. Planning Proof

| Intent | Expected selection |
|---|---|
| `explain a sleeve and show block usage` | `NS.SLEEVE_EXPLAINER` |
| `safe public code generation` | `NS.PUBLIC_CODER_RUNTIME` |
| `draft a public post` | `NS.SAFE_GENERATION_PLANNER` |

Each plan includes `selection_trace`, selected NeoBlock candidates, selected MOLT block candidates, aggregate no-write governance, and `non_executing: true`.

## 7. Governance Boundary

- no writes enabled
- no sleeve generation
- no sleeve save/write
- no sleeve merge writes
- no hidden LLM planning
- no private NeoUO content
- no private local paths required
- no external compiler bridge execution
- no publication
- no ClawHub update
- no version bump
- no installed extension mutation in this source/package lane

## 8. Validation

| Gate | Result |
|---|---|
| `npm run check` | pass |
| `npm run build` | pass |
| `npm pack --dry-run` | pass |
| `node dist/compiler/cognitive-registry.test.js` | pass |

## 9. Verdict

`MOLT_NEOBLOCK_NEOSTACK_REGISTRY_ALPHA17_PASSED`

## 10. Next Step

Operator-approved live install validation. If that passes, commit/push. After that, begin dry-run unique sleeve composer.
