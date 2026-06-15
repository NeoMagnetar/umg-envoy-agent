# UMG Envoy Explain Sleeve Matrix Preview Alpha16

## Purpose

Extend `umg_envoy_explain_sleeve` with a lightweight relation preview for one bundled sleeve explanation. This preview connects sleeve refs, block on/off state, active/skipped runtime participation, prompt parts, tool requests, and RuntimeSpecBoundary state without invoking the external compiler bridge or the gated relation-matrix emitter.

## Files Changed

- `src/compiler/sleeve-explainer.ts`
- `src/compiler/sleeve-explainer.test.ts`
- `src/types.ts`
- `dist/compiler/sleeve-explainer.js`
- `dist/compiler/sleeve-explainer.d.ts`
- `dist/compiler/sleeve-explainer.test.js`
- `dist/compiler/sleeve-explainer.test.d.ts`
- `dist/types.d.ts`
- `docs/TOOL-SURFACE.md`
- `docs/UMG-ENVOY-EXPLAIN-SLEEVE-ALPHA16.md`
- `docs/UMG-ENVOY-EXPLAIN-SLEEVE-MATRIX-PREVIEW-ALPHA16.md`

## Output Contract

`matrix_summary` is now available for valid bundled sleeve explanations:

```json
{
  "available": true,
  "matrix_kind": "sleeve_relation_preview",
  "source": "explain_sleeve",
  "non_executing": true,
  "sleeve_id": "public-coder-envoy",
  "node_counts": {
    "sleeves": 1,
    "blocks": 7,
    "active_blocks": 7,
    "disabled_blocks": 0,
    "skipped_blocks": 0,
    "prompt_parts": 7,
    "tool_requests": 1,
    "boundaries": 1,
    "runtime_specs": 1,
    "skipped_reasons": 0
  },
  "nodes": [],
  "edges": [],
  "warnings": [],
  "errors": []
}
```

The preview uses deterministic node ids such as `sleeve:public-basic-envoy`, `block:trigger.sample`, `prompt_part:primary.sample`, `tool_request:1:inspect`, `runtime_spec`, and `boundary:runtime_spec`.

## Relationships Represented

- `sleeve -> references_block -> block`
- `block -> active_in_runtime -> runtime_spec`
- `block -> skipped_from_runtime -> runtime_spec`
- `block -> has_skipped_reason -> skipped_reason`
- `block -> emits_prompt_part -> prompt_part`
- `prompt_part -> ordered_by_authority -> runtime_spec`
- `prompt_part -> contained_in_runtime_spec -> runtime_spec`
- `runtime_spec -> guarded_by -> boundary:runtime_spec`
- `runtime_spec -> requests_tool -> tool_request`

## public-basic-envoy Proof

- matrix summary is available
- block nodes: 7
- active block count: 6
- prompt part count: 6
- tool request count: 0
- `trigger.sample` node has `enabled=false` and `active=false`
- `trigger.sample` has `skipped_from_runtime`
- `trigger.sample` has skipped reason `disabled block skipped`
- RuntimeSpecBoundary is represented by `boundary:runtime_spec`
- warning preserved: `disabled block skipped: trigger.sample`

## public-coder-envoy Proof

- matrix summary is available
- block nodes: 7
- active block count: 7
- prompt part count: 7
- tool request count: 1
- `trigger.sample` node has `enabled=true` and `active=true`
- `trigger.sample` has `active_in_runtime`
- `inspect` tool request is represented
- RuntimeSpecBoundary is represented by `boundary:runtime_spec`
- warnings are empty

## Validation

- `npm run check`: pass
- `npm run build`: pass
- `node dist/compiler/sleeve-explainer.test.js`: pass
- `npm pack --dry-run`: pass

Live OpenClaw validation is install-gated because this lane did not mutate the installed extension.

## Boundary

- no writes enabled
- no publication
- no ClawHub update
- no version bump
- no installed extension mutation
- no external compiler bridge execution
- no unrestricted relation-matrix emit
- no dynamic MOLT, NeoBlock, or NeoStack selection

## Verdict

MATRIX_PREVIEW_ALPHA16_PACKAGE_VALIDATED

## Next Step

Run package dry-run validation, then perform operator-approved live install validation before beginning MOLT/NeoBlock/NeoStack registry expansion.
