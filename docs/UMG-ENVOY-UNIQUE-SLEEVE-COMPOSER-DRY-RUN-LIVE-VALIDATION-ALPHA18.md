# UMG Envoy Unique Sleeve Composer Dry Run Live Validation - Alpha18

## 1. Purpose

Validate the installed local OpenClaw extension for the Alpha18 dry-run unique sleeve composer:

```text
umg_envoy_compose_sleeve_dry_run
openclaw umg-envoy -- compose-sleeve --intent <intent>
```

This lane did not publish, run ClawHub update, bump the version, start Alpha19, execute generated sleeves, enable writes, or mutate unrelated alpha15 diagnostics.

## 2. Branch / HEAD / Status

| Item | Observed |
|---|---|
| Branch | `main` |
| Starting HEAD | `e3d03f4940f841d8e573699ece03e86eb45b11fe` |
| Ending HEAD before commit | `e3d03f4940f841d8e573699ece03e86eb45b11fe` |
| Working tree | Alpha18 source/docs/dist changes plus pre-existing unrelated alpha15 docs/diagnostics |

Preflight commands:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
```

Alpha18 files were separable from the pre-existing unrelated dirty files. The unrelated alpha15 diagnostics and older docs were left untouched.

## 3. Source Gates

| Command | Result |
|---|---|
| `npm run check` | pass |
| `npm run build` | pass |
| `npm pack --dry-run` | pass |
| `node dist/compiler/sleeve-composer-dry-run.test.js` | pass, 14 assertions |
| `node dist/compiler/cognitive-registry.test.js` | pass, 20 assertions |

Package artifact:

```text
C:\.openclaw\workspace\umg-envoy-agent-release-clean\umg-envoy-agent-0.3.0-alpha.15.tgz
```

`npm pack` also passed and produced the local tarball used for install validation.

## 4. Install Evidence

Installed extension path:

```text
C:\Users\Magne\.openclaw\extensions\umg-envoy-agent
```

Backup path:

```text
C:\.openclaw\workspace\installed-extension-backups\umg-envoy-agent-before-alpha18-sleeve-composer-20260615-145656
```

Install command:

```powershell
openclaw plugins install C:\.openclaw\workspace\umg-envoy-agent-release-clean\umg-envoy-agent-0.3.0-alpha.15.tgz
```

Install result:

```text
EXIT_CODE=0
Installed plugin: umg-envoy-agent
Restart the gateway to load plugins.
```

Gateway status after restart/reload:

```text
Gateway version: 2026.6.6
Runtime: running
Connectivity probe: ok
Capability: admin-capable
```

Known host warnings remained present:

- shared SQLite state has conflicting plugin install metadata for `umg-envoy-agent`
- unrelated `uo-server-code-plugin` package warning
- unrelated `openclaw-desktop-bridge` package export warning

These warnings did not block install or Alpha18 live command execution.

## 5. Installed Surface

Installed package version:

```json
{
  "name": "umg-envoy-agent",
  "version": "0.3.0-alpha.15"
}
```

Installed manifest surface:

```json
{
  "tool_count": 21,
  "has_compose": true,
  "has_registry": true,
  "has_plan": true,
  "has_explain": true,
  "has_matrix": true
}
```

CLI surface includes:

```text
compose-sleeve
registry-query
plan-neostack
explain-sleeve
matrix-status
```

## 6. Live Commands

Full command logs are under:

```text
C:\.openclaw\workspace\docs\05_PHASE2_IMPLEMENTATION\ALPHA18_LIVE_VALIDATION
```

Commands run:

```powershell
openclaw umg-envoy -- compose-sleeve --intent "explain a sleeve and show block usage"
openclaw umg-envoy -- compose-sleeve --intent "safe public code generation"
openclaw umg-envoy -- compose-sleeve --intent "draft a public post"
openclaw umg-envoy -- registry-query --kind molt
openclaw umg-envoy -- registry-query --kind neoblock
openclaw umg-envoy -- registry-query --kind neostack
openclaw umg-envoy -- plan-neostack --intent "explain a sleeve and show block usage"
openclaw umg-envoy -- plan-neostack --intent "safe public code generation"
openclaw umg-envoy -- plan-neostack --intent "draft a public post"
```

All nine commands returned:

```text
EXIT_CODE=0
```

## 7. Parsed Live Output

Parsed validation summary:

```json
{
  "compose": {
    "sleeve": {
      "selected": "NS.SLEEVE_EXPLAINER",
      "ok": true,
      "proposed": "dry-run.ns-sleeve-explainer.explain-a-sleeve-and-show-block-usage",
      "neoblocks": 2,
      "molts": 5,
      "selection_trace": 3,
      "composition_trace": 6,
      "non_executing": true,
      "writes_enabled": false
    },
    "code": {
      "selected": "NS.PUBLIC_CODER_RUNTIME",
      "ok": true,
      "proposed": "dry-run.ns-public-coder-runtime.safe-public-code-generation",
      "neoblocks": 3,
      "molts": 8,
      "selection_trace": 3,
      "composition_trace": 6,
      "non_executing": true,
      "writes_enabled": false
    },
    "post": {
      "selected": "NS.SAFE_GENERATION_PLANNER",
      "ok": true,
      "proposed": "dry-run.ns-safe-generation-planner.draft-a-public-post",
      "neoblocks": 3,
      "molts": 8,
      "selection_trace": 3,
      "composition_trace": 6,
      "non_executing": true,
      "writes_enabled": false
    }
  },
  "registry": {
    "moltOk": true,
    "neoblockOk": true,
    "neostackOk": true,
    "counts": {
      "molt_blocks": 8,
      "neoblocks": 4,
      "neostacks": 3
    }
  },
  "planner": {
    "sleeve": "NS.SLEEVE_EXPLAINER",
    "code": "NS.PUBLIC_CODER_RUNTIME",
    "post": "NS.SAFE_GENERATION_PLANNER",
    "ok": true
  },
  "allPassed": true
}
```

## 8. Validation Matrix

| Check | Result |
|---|---|
| manifest expected tool count 21 | pass |
| manifest observed tool count 21 | pass |
| `umg_envoy_compose_sleeve_dry_run` visible | pass |
| `umg_envoy_cognitive_registry_query` visible | pass |
| `umg_envoy_plan_neostack` visible | pass |
| Alpha16 explain-sleeve surface visible | pass |
| Alpha16 matrix preview/status surface visible | pass |
| compose sleeve explanation intent selects `NS.SLEEVE_EXPLAINER` | pass |
| compose code generation intent selects `NS.PUBLIC_CODER_RUNTIME` | pass |
| compose public post intent selects `NS.SAFE_GENERATION_PLANNER` | pass |
| composed results include proposed sleeve identifiers | pass |
| composed results include resolved MOLT refs | pass |
| composed results include resolved NeoBlock refs | pass |
| composed results include sleeve outline | pass |
| composed results include selection trace | pass |
| composed results include composition trace | pass |
| composed results remain non-executing | pass |
| composed results keep writes disabled | pass |
| Alpha17 registry query still works for `molt` | pass |
| Alpha17 registry query still works for `neoblock` | pass |
| Alpha17 registry query still works for `neostack` | pass |
| Alpha17 plan-neostack still works for all three intents | pass |

Safe live unresolved-reference testing was not run because the live CLI only loads the packaged bundled registry and the lane forbids registry mutation. The unresolved-reference fail-closed path was covered in the source test suite.

## 9. Boundaries Preserved

- no ClawHub publish/update
- no package version bump
- no release tag
- no Alpha19 work
- no generated sleeve execution
- no saved sleeve output
- no registry writes
- no external compiler bridge execution
- no writes enabled
- unrelated alpha15 diagnostics left untouched
- installed extension mutated only for operator-approved live validation

## 10. Verdict

`UNIQUE_SLEEVE_COMPOSER_DRY_RUN_ALPHA18_LIVE_VALIDATED_READY_TO_COMMIT`
