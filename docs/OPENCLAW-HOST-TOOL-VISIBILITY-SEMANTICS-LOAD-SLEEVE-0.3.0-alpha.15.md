# OpenClaw Host Tool Visibility Semantics — `umg_envoy_load_sleeve` — 0.3.0-alpha.15

## 1. Scope

This report determines whether source registration alone can expose `umg_envoy_load_sleeve` when absent from `openclaw.plugin.json`.

## 2. Envoy-Side Evidence

| Question | Finding | Evidence |
|---|---|---|
| In manifest? | No. | `openclaw.plugin.json` tool list contains 16 manifest tool ids and does not include `umg_envoy_load_sleeve`. Diagnostic capture: `docs/05_PHASE2_IMPLEMENTATION/OPENCLAW_HOST_TOOL_VISIBILITY_SEMANTICS_FOR_LOAD_SLEEVE/envoy_manifest_tools.txt`. |
| Registered in source? | Yes. | `src/plugin-entry.ts` contains `root.command("load-sleeve")` and registers `name: "umg_envoy_load_sleeve"`. Diagnostic capture: `envoy_load_sleeve_hits.txt` shows `src/plugin-entry.ts:235` and `src/plugin-entry.ts:330`. |
| Optional/internal/read-only? | Yes. | `src/plugin-entry.ts` registers the tool with an optional registration path and describes it as a read-only sleeve loader without invoking the compiler. `src/tool-capability-registry-seed.ts:277` includes a conservative `read_only` capability entry. |
| Excluded from low-risk runner? | Yes. | `src/low-risk-direct-execution-adapter.ts:142-143` blocks `umg_envoy_load_sleeve` with `load_sleeve_excluded`. |
| Current docs classification? | Source-present but not manifest-declared. | `README.md:43`, `PUBLIC-VARIANT-OVERVIEW.md:11`, `docs/TOOL-SURFACE.md:69`, and `docs/RELEASE-TRUTH-0.3.0-alpha.15.md:74` all classify it as source-present / non-manifest / non-public for alpha.15. |

## 3. OpenClaw Source Reviewed

| Source Path | Available? | Used? | Notes |
|---|---:|---:|---|
| `C:\.openclaw\workspace\work\openclaw-core-source` | yes | yes | Preferred source path selected. |
| `C:\.openclaw\workspace\work\openclaw-core-patched-help-only-scratch` | yes | no | Not needed after preferred source was available. |
| `C:\.openclaw\workspace\work\openclaw-core-upstream-archive-baseline` | yes | no | Not needed after preferred source was available. |

## 4. Host Tool Visibility Model

- `MANIFEST_ALLOWLIST`

## 5. Evidence

### A. Runtime extension registration alone does collect tools

OpenClaw’s extension loader accepts `registerTool()` calls and stores them on the extension object:

- `src/agents/sessions/extensions/loader.ts:227-233`
  - `registerTool(tool: ToolDefinition): void { ... extension.tools.set(tool.name, { definition: tool, sourceInfo: extension.sourceInfo }); runtime.refreshTools(); }`

This proves source registration is real, but not yet that every registered tool becomes host-visible.

### B. Active tool visibility is driven from the session/tool registry, not raw extension source alone

- `src/agents/sessions/agent-session.ts:863-869`
  - `getAllTools()` returns `Array.from(this.toolDefinitions.values())`
- `src/agents/sessions/agent-session.ts:876-889`
  - `setActiveToolsByName()` enables only tools already present in the registry and ignores unknown tool names

This means host-visible tools come from the built runtime tool registry.

### C. OpenClaw plugin tool resolution checks manifest-declared names

There are two relevant host-side checkpoints.

Registration-time checkpoint:

- `src/plugins/registry.ts:610-636`
  - `const declaredNames = normalizePluginToolContractNames(record.contracts);`
  - if no declared names exist, registration is rejected with `plugin must declare contracts.tools before registering agent tools`
  - proposed registration names are compared against manifest-derived declared names with `findUndeclaredPluginToolNames(...)`
  - undeclared names are rejected with `plugin must declare contracts.tools for: ...`

Materialization-time checkpoint:

- `src/plugins/tools.ts:1289-1307`
  - tool instances are compared against `entry.declaredNames`
  - undeclared names are detected with `findUndeclaredPluginToolNames(...)`
  - if undeclared names exist, OpenClaw emits `plugin tool is undeclared (...)` and `continue`s instead of exposing the tool

Exact behavior:

```ts
const undeclared = entry.declaredNames
  ? findUndeclaredPluginToolNames({ declaredNames: entry.declaredNames, toolNames: [tool.name] })
  : [];
if (undeclared.length > 0) {
  const message = `plugin tool is undeclared (${entry.pluginId}): ${undeclared.join(", ")}`;
  ...
  continue;
}
```

This is the strongest evidence in the lane.

### D. Declared names come from manifest tool contracts

- `src/plugins/tool-contracts.ts:3-24`
  - `normalizePluginToolContractNames(...)` normalizes manifest `contracts.tools`
  - `findUndeclaredPluginToolNames(...)` compares runtime tool names against the manifest-derived declared-name set

This is the manifest-to-`declaredNames` handoff path used by the host.

### E. Optional does not mean manifest-optional absence is allowed

- `src/plugins/registry.ts:621`
  - `const optional = opts?.optional === true;`
- `src/plugins/tools.ts:252-263`
  - `isManifestToolOptional(plugin, toolName)` checks `plugin.toolMetadata?.[toolName]?.optional === true`
  - `isPluginToolOptional(...)` treats optionality as either runtime registration metadata or manifest tool metadata
- `src/plugins/tools.ts:1267-1288`
  - optional tools still pass through manifest availability filtering before final materialization
- `src/plugins/tools.ts:1327-1335`
  - optionality is stored as tool metadata only after undeclared-name checks pass

This shows `optional: true` affects optional selection/allowlist behavior, not public visibility bypass and not manifest-declaration tolerance.

### F. Optional plugin tool tests are still manifest-aware

- `src/plugins/tools.optional.test.ts:1430-1490` and nearby cases show optional tools being resolved from manifest-installed tool contracts such as `contracts.tools: ["optional_tool"]`
- the tests repeatedly model optional tools as manifest-known tools with optional metadata, not as undeclared surprise tools

### G. Manifest-unavailable tools are filtered out

- `src/plugins/tools.ts:1240-1280` filters candidate tools against manifest availability before final materialization
- `src/plugins/tools.optional.test.ts` includes cases named around `manifest-unavailable` behavior, reinforcing that manifest availability is a gating concept in host tool resolution

### H. CLI help / plugin registrar note

This lane did not run runtime validation, but source evidence from the OpenClaw core help-only patch work indicates CLI help paths use manifest/placeholder-aware plugin registration logic rather than blindly trusting every source-side runtime registration.

## 6. Meaning For `umg_envoy_load_sleeve`

Based on static OpenClaw source evidence, alpha.15 can safely describe `umg_envoy_load_sleeve` as not part of the current public host-visible tool surface because it is absent from `openclaw.plugin.json`. Envoy source registration alone is not enough: OpenClaw’s plugin tool resolution path compares produced tool names against manifest-declared names and skips undeclared tools with an explicit `plugin tool is undeclared` diagnostic. The reviewed source therefore supports a manifest-allowlist model rather than a runtime-registration-visible model.

## 7. Recommendation

- `SAFE_TO_KEEP_DOC_CLASSIFICATION`

The current alpha.15 docs may continue saying:
- `umg_envoy_load_sleeve` is source-present
- it is not manifest-declared
- it is not part of the current declared public surface
- it is excluded from the first low-risk direct runner

## 8. What Was Not Changed

No source, manifest, package metadata, version, or publication changes were made.

This lane did **not**:
- edit Envoy source
- edit OpenClaw source
- edit manifest files
- edit README / overview docs
- publish anything
- claim live runtime validation
- run live OpenClaw CLI validation

## 9. Next Lane

If desired, run one narrow non-mutating OpenClaw core evidence lane to capture the exact manifest-to-plugin-registry handoff that populates `entry.declaredNames` for plugin tools, purely to strengthen citation depth; no runtime probe is required for the current documentation claim.
