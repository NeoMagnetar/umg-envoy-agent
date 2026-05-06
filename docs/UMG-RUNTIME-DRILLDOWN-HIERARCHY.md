# UMG Runtime Drill-Down Hierarchy Design

## Purpose

This document defines the conservative hierarchy model for Runtime Drill-Down Inspection v0.

The goal is to answer:
- what is inside this artifact?
- what is one level below this runtime surface?
- what declared relations exist?

The goal is not to reconstruct the entire runtime tree when the underlying artifacts do not declare one.

## One-level expansion rule

Default behavior expands one level only.

Examples:
- inspect sleeve → show NeoStacks, direct NeoBlocks, direct MOLT blocks, tool-binding intent, support docs
- inspect NeoStack → show NeoBlocks, direct MOLT blocks, tool-binding intent, governance constraints, support docs
- inspect NeoBlock → show direct MOLT blocks and MOLT role coverage
- inspect MOLT block → show metadata only

Do not automatically recurse into grandchildren unless a future deeper inspection mode is explicitly requested.

## Hierarchy sources and priority

Use these sources in order:

1. explicit artifact fields
2. manifest/index declared relations
3. RuntimeSpec selection arrays
4. Runtime IR Matrix links
5. generated registry metadata
6. fallback: no declared child relations found

## Explicit artifact fields

Preferred fields include:
- `neostacks`
- `neoblocks`
- `molt_blocks`
- `blocks`
- `members`
- `children`
- `tools`
- `tool_bindings`

If these are present, treat them as the strongest hierarchy declarations.

## Manifest/index declared relations

If the artifact or registry record preserves declared child or member references through manifest/index metadata, use those next.

Examples:
- sleeve manifest declares NeoStacks
- NeoStack manifest declares NeoBlocks
- NeoBlock metadata declares MOLT block membership

## RuntimeSpec selection arrays

If the query is runtime-centric rather than artifact-centric, RuntimeSpec arrays may provide safe one-level inspection context:
- `active_sleeve`
- `active_neostacks`
- `active_neoblocks`
- `active_molt_blocks`
- `support_artifacts`

Use these to answer:
- what is selected in this dry-run runtime?

Do not over-interpret selection arrays as full declared containment if artifact metadata does not support that claim.

## IR Matrix links

When Runtime IR Matrix exists, use it to answer structural questions like:
- where does this artifact appear?
- which matrix edges reference it?
- which governance or approval links touch it?

Useful matrix relations:
- `contains`
- `selects`
- `references`
- `requests_tool`
- `maps_to_molt_field`

But keep the semantics precise:
- matrix links show structural relation projection
- matrix links do not by themselves prove canonical artifact containment

## Generated registry metadata

Generated registry metadata may help with:
- title
- description
- kind classification
- support-only classification
- provenance
- declared fields normalized into summary metadata

Use it carefully.
Do not fabricate child lists from vague text.

## Fallback behavior

If no declared child relations are found, say:
- `No declared child relations found.`

Do not infer a fake child tree.

## Sleeve inspection design

Sleeve inspection should prefer:
- declared NeoStacks
- directly declared NeoBlocks
- directly declared MOLT blocks
- tool-binding intent
- support docs
- provenance

Possible relation outputs:
- `contains -> neostack`
- `contains -> neoblock`
- `contains -> molt_block`
- `requests_tool -> tool_binding`
- `has_support_doc -> support_artifact`

## NeoStack inspection design

NeoStack inspection should prefer:
- declared NeoBlocks
- directly declared MOLT blocks
- tool-binding intent
- governance constraints
- support docs
- provenance

Possible relation outputs:
- `contains -> neoblock`
- `contains -> molt_block`
- `requests_tool -> tool_binding`
- `requires_approval -> tool_binding`
- `references -> governance`
- `has_support_doc -> support_artifact`

## NeoBlock inspection design

NeoBlock inspection should prefer:
- declared MOLT block members
- MOLT role coverage when explicitly known
- support docs
- provenance

Possible relation outputs:
- `contains -> molt_block`
- `maps_to_molt_field -> molt_field`
- `has_support_doc -> support_artifact`

## MOLT block inspection design

MOLT block inspection should focus on direct metadata only:
- id
- molt_type
- title
- description
- domains
- capabilities
- tags
- status
- provenance
- runtime_selectable
- support_only

This level usually does not need expansion unless future designs add declared substructure.

## Tool-binding inspection design

Tool-binding inspection should answer:
- requested
- available
- blocked
- requires_approval
- governing policy
- execution statement

Possible relation outputs:
- `requests_tool`
- `requires_approval`
- `references -> governance`

Hard rule:
- always include `No tools executed.`

## Support-doc inspection design

Support-doc inspection should answer:
- what support-only documentation is attached to or explains this artifact?
- why is it support-only?
- what runtime boundary keeps it non-runtime-selectable?

Possible relation outputs:
- `supports_explanation`
- `has_support_doc`
- `references -> artifact`

Support docs remain:
- `support_only: true`
- `runtime_selectable: false`

## Provenance inspection design

Provenance inspection should answer:
- source kind
- discovery method
- generated_from_lane
- declared_by when available
- path

This should preserve resolver truth, not reinterpret it.

## Matrix-link inspection design

Matrix-link inspection should answer:
- node id
- node kind
- node state
- incoming edges
- outgoing edges

This is structural only.
Example:
- selected in dry-run RuntimeSpec
- requested tool binding
- requires approval
- referenced by matrix

Not:
- executed path
- live activation

## MOLT-map-link inspection design

MOLT-map-link inspection should answer:
- which MOLT field references this artifact?
- what field source produced that link?
- what role label applies?

Useful outputs:
- `maps_to_molt_field -> Trigger`
- `maps_to_molt_field -> Directive`
- `maps_to_molt_field -> Instruction`
- etc.

This remains declarative role linkage only.

## Example 1 — Runtime selection summary

Input:
- what is selected in this dry-run runtime?

Expected:
- runtime kind
- active sleeve
- active NeoStacks
- active NeoBlocks
- active MOLT blocks
- support artifacts
- trace id
- matrix id
- execution statement

## Example 2 — Inspect LangChain NeoStack

Input:
- what is inside `NS.UMG.LANGCHAIN_BRIDGE.v0.1`?

Expected:
- artifact summary for the NeoStack
- declared child NeoBlocks if present
- declared MOLT blocks if present
- tool-binding intent if present
- provenance
- warning if no child relations are declared
- execution statement

## Example 3 — Inspect support docs

Input:
- what docs explain this sleeve or NeoStack?

Expected:
- support docs list
- `support_only: true`
- `runtime_selectable: false`
- support/explanation relation
- execution statement

## Example 4 — Inspect matrix links

Input:
- where does this artifact appear in the matrix?

Expected:
- node id
- node kind
- node state
- incoming edges
- outgoing edges
- execution statement
