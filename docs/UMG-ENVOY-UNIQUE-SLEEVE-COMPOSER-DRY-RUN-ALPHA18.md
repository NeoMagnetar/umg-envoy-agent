# UMG Envoy Unique Sleeve Composer Dry Run - Alpha18

## 1. Purpose

Alpha18 adds a source-only dry-run unique sleeve composer. The composer accepts an intent string, reuses the Alpha17 bundled cognitive registry and NeoStack planning layer, resolves the selected NeoStack, resolves all enabled NeoBlocks and MOLT blocks, and returns a deterministic proposed sleeve preview with traceability.

This lane is preview-only. It does not execute generated sleeves, save sleeves, merge sleeves, mutate registry data, enable writes, invoke the external compiler bridge, publish to ClawHub, bump the version, or mutate the installed OpenClaw extension.

## 2. Baseline

| Item | Value |
|---|---|
| Repo | `C:\.openclaw\workspace\umg-envoy-agent-release-clean` |
| Branch | `main` |
| Starting HEAD | `e3d03f4940f841d8e573699ece03e86eb45b11fe` |
| Ending HEAD | unchanged / source-ready working tree |
| Previous verdict | `MOLT_NEOBLOCK_NEOSTACK_REGISTRY_ALPHA17_LIVE_VALIDATED_COMMITTED_AND_PUSHED` |

Pre-existing unrelated worktree leftovers were left untouched:

- `PUBLIC-VARIANT-OVERVIEW.md`
- `docs/GOVERNANCE-EXECUTION-CONTRACT-0.3.0-alpha.15.md`
- `docs/LOAD-SLEEVE-SURFACE-DECISION-0.3.0-alpha.15.md`
- `docs/OPENCLAW-HOST-TOOL-VISIBILITY-SEMANTICS-LOAD-SLEEVE-0.3.0-alpha.15.md`
- untracked alpha14/alpha15 diagnostic folders and logs

## 3. Files Changed

Source and tests:

- `src/compiler/sleeve-composer-dry-run.ts`
- `src/compiler/sleeve-composer-dry-run.test.ts`
- `src/compiler/cognitive-registry.ts`
- `src/types.ts`
- `src/plugin-entry.ts`
- `src/tool-capability-registry-seed.ts`
- `src/tool-capability-registry-seed.test.ts`
- `src/tool-manifest-alignment.test.ts`
- `src/low-risk-direct-execution-adapter.test.ts`
- `src/low-risk-direct-runtime-tool-surface.test.ts`

Manifest and docs:

- `openclaw.plugin.json`
- `README.md`
- `docs/TOOL-SURFACE.md`
- `docs/UMG-ENVOY-UNIQUE-SLEEVE-COMPOSER-DRY-RUN-ALPHA18.md`

Generated build output:

- `dist/compiler/sleeve-composer-dry-run.js`
- `dist/compiler/sleeve-composer-dry-run.d.ts`
- `dist/compiler/sleeve-composer-dry-run.test.js`
- `dist/compiler/sleeve-composer-dry-run.test.d.ts`
- related updated `dist/` outputs for plugin entry, types, registry, capability seed, and guard tests

## 4. Tool / CLI Surface

New tool:

```text
umg_envoy_compose_sleeve_dry_run
```

New CLI:

```powershell
openclaw umg-envoy -- compose-sleeve --intent <intent>
```

Manifest tool count:

```text
expected: 21
observed: 21
```

## 5. Output Contract

The composer returns:

- `selected_neostack`
- `proposed_sleeve_id`
- `sleeve_id`
- `intent`
- `resolved_molt_blocks`
- `resolved_neoblocks`
- `sleeve_outline`
- `selection_trace`
- `composition_trace`
- `non_executing: true`
- `writes_enabled: false`
- `warnings`
- `errors`

Failure behavior:

- unresolved NeoStack refs fail closed
- unresolved NeoBlock refs fail closed
- unresolved MOLT refs fail closed
- failure output remains `non_executing: true`
- failure output keeps `writes_enabled: false`

## 6. Composition Proof

| Intent | Selected NeoStack | Result |
|---|---|---|
| `explain a sleeve and show block usage` | `NS.SLEEVE_EXPLAINER` | pass |
| `safe public code generation` | `NS.PUBLIC_CODER_RUNTIME` | pass |
| `draft a public post` | `NS.SAFE_GENERATION_PLANNER` | pass |

Observed dry-run sample:

```json
[
  {
    "intent": "explain a sleeve and show block usage",
    "ok": true,
    "selected": "NS.SLEEVE_EXPLAINER",
    "neoblocks": 2,
    "molts": 5,
    "trace": 6,
    "selection_trace": 3,
    "non_executing": true,
    "writes_enabled": false
  },
  {
    "intent": "safe public code generation",
    "ok": true,
    "selected": "NS.PUBLIC_CODER_RUNTIME",
    "neoblocks": 3,
    "molts": 8,
    "trace": 6,
    "selection_trace": 3,
    "non_executing": true,
    "writes_enabled": false
  },
  {
    "intent": "draft a public post",
    "ok": true,
    "selected": "NS.SAFE_GENERATION_PLANNER",
    "neoblocks": 3,
    "molts": 8,
    "trace": 6,
    "selection_trace": 3,
    "non_executing": true,
    "writes_enabled": false
  }
]
```

## 7. Commands Run

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
npm run check
npm run build
node dist/compiler/sleeve-composer-dry-run.test.js
node dist/compiler/cognitive-registry.test.js
node dist/tool-capability-registry-seed.test.js
node dist/tool-manifest-alignment.test.js
node dist/low-risk-direct-execution-adapter.test.js
node dist/low-risk-direct-runtime-tool-surface.test.js
npm pack --dry-run
node -e "const m=require('./openclaw.plugin.json'); const tools=m.tools||[]; console.log(JSON.stringify({tool_count:tools.length, has_compose_sleeve_dry_run:tools.includes('umg_envoy_compose_sleeve_dry_run')}, null, 2));"
```

## 8. Gate Results

| Gate | Result |
|---|---|
| `npm run check` | pass |
| `npm run build` | pass |
| `npm pack --dry-run` | pass |
| `node dist/compiler/sleeve-composer-dry-run.test.js` | pass, 14 assertions |
| `node dist/compiler/cognitive-registry.test.js` | pass, 20 assertions |
| `node dist/tool-capability-registry-seed.test.js` | pass, 19 assertions |
| `node dist/tool-manifest-alignment.test.js` | pass, 24 assertions |
| `node dist/low-risk-direct-execution-adapter.test.js` | pass, 28 assertions |
| `node dist/low-risk-direct-runtime-tool-surface.test.js` | pass, 20 assertions |

## 9. Safety Boundary

- no installed extension mutation
- no ClawHub publication/update
- no version bump
- no release tag
- no generated sleeve execution
- no saved sleeve output
- no registry writes
- no private NeoUO content
- no private local paths required
- no external compiler bridge execution
- direct runner unchanged at six static safe tools
- `umg_envoy_compose_sleeve_dry_run` is dry-run-only and excluded from low-risk direct execution

## 10. Verdict

`UNIQUE_SLEEVE_COMPOSER_DRY_RUN_ALPHA18_SOURCE_READY`
