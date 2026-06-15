# `umg_envoy_load_sleeve` Surface Decision Record — 0.3.0-alpha.15

## 1. Scope

This decision record covers only the `umg_envoy_load_sleeve` surface ambiguity.

## 2. Current Evidence

| Question | Finding | Evidence |
|---|---|---|
| In manifest? | No. `openclaw.plugin.json` declares 16 tool ids and does not include `umg_envoy_load_sleeve`. | `openclaw.plugin.json` `tools` array lists 16 ids ending with `umg_envoy_low_risk_direct_tool_run`; no `umg_envoy_load_sleeve` entry appears. |
| Registered in source? | Yes. It is registered in `src/plugin-entry.ts` as both a CLI command (`load-sleeve`) and an optional tool (`umg_envoy_load_sleeve`). | `src/plugin-entry.ts`: `root.command("load-sleeve") ...`; `api.registerTool({ name: "umg_envoy_load_sleeve" ... }, { optional: true })`. |
| Optional/internal/read-only? | Yes. Source and registry evidence classify it as optional, read-only, compiler-non-invoking, and currently internal/non-manifest-aligned. | `src/plugin-entry.ts` description: "Read-only sleeve loader ... without invoking the compiler" and registration option `{ optional: true }`; `src/tool-capability-registry-seed.ts` notes: "currently registered in plugin-entry but not declared in openclaw.plugin.json", "internal-only / blocked-public policy during current manifest alignment lane". |
| In low-risk direct runner allowlist? | No. | `src/low-risk-direct-execution-adapter.ts` `LOW_RISK_DIRECT_TOOL_IDS` contains exactly six ids and does not include `umg_envoy_load_sleeve`. |
| Excluded from low-risk direct runner? | Yes. | `src/low-risk-direct-execution-adapter.ts`: explicit branch `if (request.toolId === "umg_envoy_load_sleeve")` returns blocked with `load_sleeve_excluded`; `README.md` and `docs/TOOL-SURFACE.md` also state exclusion from the first low-risk direct adapter set. |
| Present in capability registry seed? | Yes. | `src/tool-capability-registry-seed.ts` includes a `toolId: "umg_envoy_load_sleeve"` entry with `allowedRiskClass: "read_only"`, `directExecutionAllowed: false`, and notes marking it non-manifest and excluded from first low-risk direct adapter set. |
| Current docs classification? | Source-present but not manifest-declared; internal/non-manifest-aligned during current lane. | `docs/TOOL-SURFACE.md`: `Internal-Only / Non-Manifest-Aligned During Current Policy Lane`; `README.md`: "source-present ... but it is not manifest-declared in alpha.15"; `PUBLIC-VARIANT-OVERVIEW.md`: same classification; `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`: "load_sleeve is registered in source but absent from the manifest." |

## 3. Decision Options

### Option A — Add to manifest later

Meaning:
Make `umg_envoy_load_sleeve` a declared public manifest tool in a later implementation lane.

Benefits:
- resolves the current source/manifest mismatch
- makes declared public surface and source registration align
- reduces reviewer confusion about whether the tool is host-visible

Risks:
- changes the manifest-declared public surface count from 16 to 17
- may create a broader public-surface claim before host semantics and intended support policy are proven
- would require tightened public documentation and likely additional governance tests for manifest/public-surface alignment
- may require explicit policy language confirming that read-only sleeve/artifact preview is allowed as a public host-visible surface

Required later changes:
- `openclaw.plugin.json` tool list update
- docs updates in `README.md`, `PUBLIC-VARIANT-OVERVIEW.md`, and `docs/TOOL-SURFACE.md`
- likely manifest-alignment / governance test updates
- decision on whether low-risk direct runner exclusion remains or changes

Low-risk direct boundary impact:
- does not automatically require adding it to the low-risk direct runner
- but public-manifest addition would increase pressure to explain why it remains excluded from direct execution

### Option B — Remove source registration later

Meaning:
Remove source registration in a later implementation lane if the tool is not intended to be public or host-visible.

Benefits:
- removes the ambiguity entirely
- keeps manifest-declared public surface and source-visible registration aligned at 16 tools
- simplifies docs and reviewer understanding
- avoids accidental host exposure if source registration alone can surface tools

Risks:
- could remove a useful internal read-only sleeve/artifact preview surface
- may break any internal/source-policy assumptions that currently rely on `load-sleeve` CLI or tool registration
- would require checking whether any local workflows, tests, or validation notes depend on this registration path

Dependency concern:
- source files reviewed here show direct registration and capability-seed support, but they do not prove whether other internal workflows depend on it
- a later implementation lane would need a narrow dependency review before removal

### Option C — Keep internal/optional/non-manifest

Meaning:
Keep the current alpha.15 stance: source-present, optional/internal, not manifest-declared.

Benefits:
- preserves the existing read-only preview capability in source
- avoids immediate manifest expansion
- matches current docs wording already established in README, overview, and tool-surface docs
- keeps low-risk direct runner boundary unchanged

Risks:
- leaves an unresolved source/manifest mismatch in place
- depends on unproven OpenClaw host semantics: if source registration alone can expose a tool despite manifest absence, docs-only classification may be insufficient
- may continue to confuse reviewers unless the decision remains actively documented

Docs requirement if retained:
- continue stating that `umg_envoy_load_sleeve` is source-present but not manifest-declared
- continue stating that it is excluded from the first low-risk direct runner
- continue avoiding any claim that it is part of the current declared public surface

## 4. Host-Semantics Dependency

Yes. OpenClaw host behavior is required to determine whether source registration alone can expose `umg_envoy_load_sleeve` despite manifest absence.

Current repo evidence proves source registration, capability-seed presence, and docs classification. It does **not** prove whether a host will surface the tool when the manifest omits it. That unresolved host-semantic question is the key blocker to making a stronger release-surface claim.

## 5. Recommendation

DEFER_PENDING_OPENCLAW_HOST_SEMANTICS

Reason:
Current source evidence clearly shows that `umg_envoy_load_sleeve` is real, optional, read-only, seeded in capability policy, and intentionally excluded from the first low-risk direct runner. However, the reviewed repo evidence does not prove whether manifest absence is sufficient to keep the tool non-host-visible in practice. Until host semantics are confirmed, Option C remains the best descriptive alpha.15 stance, but the implementation decision should remain formally deferred.

## 6. What Not To Change Yet

No source, manifest, package metadata, version, or publication changes were made in this lane.

Specifically, this lane did **not**:
- edit source files
- edit `openclaw.plugin.json`
- edit `package.json`
- change versioning
- publish or claim publication
- claim live OpenClaw CLI or host readiness
- run live runtime validation

## Host-Semantics Closeout

Static OpenClaw source evidence now supports `MANIFEST_ALLOWLIST`.

`umg_envoy_load_sleeve` remains:
- source-present
- manifest-absent
- excluded from the low-risk direct runner
- not part of the alpha.15 manifest-declared public surface

Because OpenClaw host semantics compare runtime-registered tools against manifest-declared names and skip undeclared tools, the alpha.15 documentation classification is safe to keep.

Key OpenClaw evidence:
- `src/plugins/registry.ts:610-636` normalizes manifest `contracts.tools` into `declaredNames`, then rejects undeclared registration names with `plugin must declare contracts.tools for: ...`
- `src/plugins/tool-contracts.ts:3-24` defines `findUndeclaredPluginToolNames(...)` by comparing runtime names against the manifest-derived declared-name set
- `src/plugins/tools.ts:1293-1307` emits `plugin tool is undeclared (...)` and skips the tool instead of exposing it
- `src/plugins/tools.ts:252-263` shows `optional` as tool optionality/allowlist behavior, not a bypass for manifest declaration

Final recommendation:
`SAFE_TO_KEEP_DOC_CLASSIFICATION`

No source, manifest, package, version, publication, or runtime changes were made.

## 7. Next Lane

Lane E — Governance Execution Contract doc, or Lane F — CI/gate automation plan.
