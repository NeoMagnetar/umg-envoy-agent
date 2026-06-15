# UMG Envoy Explain Sleeve Alpha16

## Purpose

Add an explicit read-only sleeve explanation surface before dynamic MOLT, NeoBlock, or NeoStack selection work. The surface explains one bundled public sleeve compilation without executing tools, enabling writes, invoking the external compiler bridge, or emitting unrestricted relation matrices.

## Files Changed

- `src/compiler/sleeve-explainer.ts`
- `src/types.ts`
- `src/plugin-entry.ts`
- `src/tool-capability-registry-seed.ts`
- `src/tool-capability-registry-seed.test.ts`
- `src/tool-manifest-alignment.test.ts`
- `src/low-risk-direct-execution-adapter.test.ts`
- `src/low-risk-direct-runtime-tool-surface.test.ts`
- `openclaw.plugin.json`
- `docs/TOOL-SURFACE.md`
- `README.md`
- `docs/UMG-ENVOY-EXPLAIN-SLEEVE-ALPHA16.md`

## Command Added

```text
openclaw umg-envoy explain-sleeve --sleeve <id>
```

Supported options:

```text
--sleeve <id>
--include-runtime-spec
--include-matrix-summary
--no-runtime-spec
```

## Tool Added

```text
umg_envoy_explain_sleeve
```

The tool accepts:

```json
{
  "sleeveId": "public-coder-envoy",
  "includeRuntimeSpec": false,
  "includeMatrixSummary": false
}
```

## Output Contract

The explainer returns:

- sleeve id, title, snap id, and primary shell block id
- content and compiler mode
- every sleeve `block_refs` entry with resolved/enabled/active state
- skipped reasons for disabled, missing, or library-disabled blocks
- active block order from the bundled adapter
- prompt parts ordered by authority
- tool requests carried by the sleeve
- strategy, constraints, context, values, and format
- warnings and errors
- RuntimeSpec boundary metadata
- optional full RuntimeSpec when requested
- matrix summary placeholder when requested

If matrix summary is requested in this lane, the response is:

```json
{
  "available": false,
  "reason": "matrix summary helper not implemented in this lane"
}
```

## Public Basic Envoy Proof

Package-level proof from the compiled helper:

- all 7 block refs are visible
- `trigger.sample` is `enabled=false`
- `trigger.sample` is `active=false`
- `trigger.sample` appears in disabled/skipped output
- active block count is 6
- `tool_requests` is empty
- warning includes `disabled block skipped: trigger.sample`
- prompt authority order is `10, 20, 30, 40, 50, 55`
- RuntimeSpec boundary is `nonExecuting=true`, `status=valid_non_executing_artifact`

## Public Coder Envoy Proof

Package-level proof from the compiled helper:

- all 7 block refs are visible
- `trigger.sample` is `enabled=true`
- `trigger.sample` is `active=true`
- active block count is 7
- `tool_requests` includes `{ "name": "inspect" }`
- warnings are empty
- prompt authority order is `10, 20, 30, 40, 50, 55, 60`
- RuntimeSpec boundary is `nonExecuting=true`, `status=valid_non_executing_artifact`

## Validation

Package gates:

- `npm run check`: pass
- `npm run build`: pass
- `npm pack --dry-run`: pass

Additional repo boundary tests:

- `npm run test:tool-capability-registry-seed`: pass
- `npm run test:tool-manifest-alignment`: pass
- `npm run test:low-risk-direct-execution-adapter`: pass
- `npm run test:low-risk-direct-runtime-tool-surface`: pass

Live OpenClaw CLI validation:

- `openclaw umg-envoy explain-sleeve --help`: install-gated; current installed command set does not include `explain-sleeve`
- `openclaw umg-envoy explain-sleeve --sleeve public-basic-envoy`: install-gated; current installed command set does not know `explain-sleeve`

## Non-Execution Boundary

The explainer reuses the existing bundled compiler adapter and reports RuntimeSpec boundary metadata. It does not execute sleeve tool requests, enable writes, invoke the external compiler bridge, emit a relation matrix, publish, mutate ClawHub, or require private local roots.

## Next Lane Recommendation

Implement a lightweight relation/IR matrix preview for a single explained sleeve, still response-only and still without external compiler bridge execution.
