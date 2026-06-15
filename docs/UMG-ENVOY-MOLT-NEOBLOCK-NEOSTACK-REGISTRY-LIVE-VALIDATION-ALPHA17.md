# UMG Envoy MOLT / NeoBlock / NeoStack Registry Live Validation - Alpha17

## 1. Purpose

Validate the installed local OpenClaw extension for the Alpha17 bundled cognitive registry and deterministic dry-run NeoStack planner.

This lane did not publish, run ClawHub update, bump the package version, tag a release, enable writes, generate sleeves, save sleeves, or run the external compiler bridge.

## 2. Branch / HEAD / Status

| Item | Observed |
|---|---|
| Branch | `main` |
| HEAD before validation | `d04f0531492cb69d4279abf492a8d584380b4a64` |
| Working tree | Alpha17 source/docs/dist changes plus pre-existing unrelated alpha15 docs/diagnostics |

Preflight command:

```powershell
git branch --show-current
git rev-parse HEAD
git status --short
```

## 3. Source Gates

| Command | Result |
|---|---|
| `npm run check` | pass |
| `npm run build` | pass |
| `npm pack --dry-run` | pass |
| `npm pack` | pass |

Package artifact:

```text
C:\.openclaw\workspace\umg-envoy-agent-release-clean\umg-envoy-agent-0.3.0-alpha.15.tgz
```

The tarball includes:

```text
public-content/cognitive-registry.json
dist/compiler/cognitive-registry.js
dist/compiler/cognitive-registry.d.ts
```

## 4. Install Evidence

Installed extension path:

```text
C:\Users\Magne\.openclaw\extensions\umg-envoy-agent
```

Backup path:

```text
C:\.openclaw\workspace\installed-extension-backups\umg-envoy-agent-before-alpha17-registry-20260615-141706
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

Gateway status after restart/reload check:

```text
Gateway version: 2026.6.6
Runtime: running
Connectivity probe: ok
Capability: admin-capable
```

Known host warnings remained present during install and CLI invocation:

- shared SQLite state has conflicting plugin install metadata for `umg-envoy-agent`
- unrelated `uo-server-code-plugin` package warning
- unrelated `openclaw-desktop-bridge` package export warning

These warnings did not block the UMG Envoy install or Alpha17 command execution.

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
  "tool_count": 20,
  "has_cognitive_registry_query": true,
  "has_plan_neostack": true,
  "has_explain_sleeve": true,
  "has_matrix_status": true
}
```

CLI command surface:

```text
registry-query
plan-neostack
explain-sleeve
matrix-status
```

`openclaw umg-envoy -- explain-sleeve --help` returned the expected Alpha16 explain-sleeve options:

```text
--include-matrix-summary
--include-runtime-spec
--no-runtime-spec
--sleeve <id>
```

## 6. Live Commands

Full command logs are under:

```text
C:\.openclaw\workspace\docs\05_PHASE2_IMPLEMENTATION\ALPHA17_LIVE_VALIDATION
```

Commands run:

```powershell
openclaw umg-envoy -- registry-query --kind molt
openclaw umg-envoy -- registry-query --kind neoblock
openclaw umg-envoy -- registry-query --kind neostack
openclaw umg-envoy -- plan-neostack --intent "explain a sleeve and show block usage"
openclaw umg-envoy -- plan-neostack --intent "safe public code generation"
openclaw umg-envoy -- plan-neostack --intent "draft a public post"
```

All six commands returned:

```text
EXIT_CODE=0
```

## 7. Parsed Live Output

Parsed validation summary:

```json
{
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
  "plans": {
    "sleeve": "NS.SLEEVE_EXPLAINER",
    "code": "NS.PUBLIC_CODER_RUNTIME",
    "post": "NS.SAFE_GENERATION_PLANNER",
    "traceLengths": [3, 3, 3],
    "nonExecuting": [true, true, true],
    "writes": [false, false, false],
    "ok": true
  },
  "allPassed": true
}
```

## 8. Validation Matrix

| Check | Result |
|---|---|
| manifest observed tool count is 20 | pass |
| `umg_envoy_cognitive_registry_query` visible | pass |
| `umg_envoy_plan_neostack` visible | pass |
| `umg_envoy_explain_sleeve` still visible | pass |
| Alpha16 matrix surface still visible | pass |
| registry query `molt` works | pass |
| registry query `neoblock` works | pass |
| registry query `neostack` works | pass |
| sleeve explanation intent selects `NS.SLEEVE_EXPLAINER` | pass |
| code generation intent selects `NS.PUBLIC_CODER_RUNTIME` | pass |
| public post/generation intent selects `NS.SAFE_GENERATION_PLANNER` | pass |
| selection trace appears | pass |
| `non_executing` remains true | pass |
| writes remain disabled | pass |
| no Alpha17 runtime errors | pass |

## 9. Boundaries Preserved

- no ClawHub publish/update
- no package version bump
- no release tag
- no new feature implementation
- no unique sleeve composer work
- no writes enabled
- no sleeve generation or saved sleeve output
- no external compiler bridge execution
- no private NeoUO content or paths required

## 10. Verdict

`MOLT_NEOBLOCK_NEOSTACK_REGISTRY_ALPHA17_LIVE_VALIDATED_READY_TO_COMMIT`
