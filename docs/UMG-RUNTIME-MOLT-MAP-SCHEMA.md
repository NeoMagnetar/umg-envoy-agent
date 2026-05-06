# UMG Runtime MOLT Map v0 Schema

## Proposed v0 shape

```json
{
  "molt_map_id": "molt_map_...",
  "runtime_spec_id": "runtime_spec_...",
  "source": "RuntimeSpecV0",
  "created_at": "2026-05-05T00:00:00.000Z",
  "mode": "dry_run",
  "fields": {
    "Trigger": {
      "value": "User requested a governed LangChain workflow.",
      "source": "runtime_input",
      "artifact_ids": [],
      "confidence": "high"
    },
    "Directive": {
      "value": "Use governed LangChain bridge path without executing tools.",
      "source": "selected_neostack",
      "artifact_ids": ["NS.UMG.LANGCHAIN_BRIDGE.v0.1"],
      "confidence": "medium"
    },
    "Instruction": {
      "value": "Execution remains dry-run; approval required for langchain.agent_mode.",
      "source": "governance",
      "artifact_ids": [],
      "confidence": "high"
    },
    "Subject": {
      "value": "LangChain bridge workflow under UMG/OpenClaw governance.",
      "source": "runtime_input_and_selection",
      "artifact_ids": ["NS.UMG.LANGCHAIN_BRIDGE.v0.1"],
      "confidence": "medium"
    },
    "Primary": {
      "value": "Compile a read-only RuntimeSpec for the requested workflow.",
      "source": "runtime_input",
      "artifact_ids": [],
      "confidence": "high"
    },
    "Philosophy": {
      "value": "Preserve user control, traceability, and governed execution boundaries.",
      "source": "governance_default",
      "artifact_ids": [],
      "confidence": "medium"
    },
    "Blueprint": {
      "value": "Runtime visibility header / structured dry-run output.",
      "source": "visibility_layer",
      "artifact_ids": [],
      "confidence": "medium"
    }
  },
  "warnings": [],
  "trace_id": "trace_...",
  "matrix_id": "matrix_...",
  "matrix_available": false
}
```

## Field source types

- runtime_input
- selected_sleeve
- selected_neostack
- selected_neoblock
- selected_molt_block
- governance
- governance_default
- visibility_layer
- runtime_input_and_selection
- derived_default
- n/a

## Confidence values

- high
- medium
- low
- n/a

## Hard rule

The MOLT Map is derived from RuntimeSpec and selected artifact metadata only.
It must never present itself as hidden chain-of-thought.
