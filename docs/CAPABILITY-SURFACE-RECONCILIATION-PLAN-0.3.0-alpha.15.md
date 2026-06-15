# Capability Surface Reconciliation Plan — 0.3.0-alpha.15

## Purpose

This is a docs-only reconciliation plan for the `umg-envoy-agent` `0.3.0-alpha.15` repo lane.

Truth anchor:
- `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`

This plan does **not** change source, manifest, package metadata, versioning, publication state, or live OpenClaw validation status.

## Reviewer outcome target

After the recommended doc edits, a fresh reviewer should be able to distinguish all of the following without ambiguity:

1. manifest-declared live tools
2. source-registered but manifest-ambiguous tools
3. staged or deferred tools
4. deprecated or historical names
5. gated or blocked governance tools
6. unresolved documentation truth gaps

## Current truth basis

### Authoritative declared public tool surface

Per `openclaw.plugin.json`, the current manifest-declared tool ids are:

- `umg_envoy_status`
- `umg_envoy_compiler_smoke_test`
- `umg_envoy_list_sleeves`
- `umg_envoy_list_block_libraries`
- `umg_envoy_compile_sleeve`
- `umg_envoy_validate_runtime_output`
- `umg_envoy_compare_sleeves`
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`
- `umg_envoy_build_path`
- `umg_envoy_matrix_status`
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`
- `umg_envoy_action_gate_runtime_report_view`
- `umg_envoy_low_risk_direct_tool_run`

### Tool-surface truth already documented

Per `docs/TOOL-SURFACE.md`:

- manifest-declared tools are the authoritative declared public surface
- `umg_envoy_load_sleeve` is source-registered / internal-only / non-manifest-aligned during the current lane
- multiple staged/deferred names exist in docs/planning language but are not current public manifest tools
- several historical or alternate tool names should not be treated as current declared public surface

### Release-truth constraints already recorded

Per `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`:

- README currently overclaims some live/staged capabilities relative to what is proven
- `PUBLIC-VARIANT-OVERVIEW.md` is stale
- `load_sleeve` is registered in source but absent from the manifest
- no live OpenClaw host/CLI readiness claim is proven here

## Reconciliation model

The docs should use five explicit categories.

### 1. Manifest-declared live tools

Definition:
Tools listed in `openclaw.plugin.json` and safe to describe as the repo’s currently declared public tool surface.

Recommended wording standard:
- say "manifest-declared public tool surface"
- avoid saying "fully live on any host"
- avoid implying live host validation unless separately proven

Recommended README handling:
- add a dedicated section named `Current manifest-declared tool surface`
- link to `docs/TOOL-SURFACE.md`
- either list all tool ids directly or summarize them by capability families with an explicit note that exact ids live in `openclaw.plugin.json` and `docs/TOOL-SURFACE.md`

Recommended PUBLIC-VARIANT-OVERVIEW handling:
- replace milestone-only stale text with a short alpha.15 summary
- state that the public package declares a bounded manifest tool surface for inspection, validation, comparison, path utilities, runtime reporting, and gated bridge/matrix-related surfaces

### 2. Source-registered but manifest-ambiguous tools

Definition:
Tools that may exist in source registration paths but are not currently declared in `openclaw.plugin.json`.

Primary example:
- `umg_envoy_load_sleeve`

Required truth:
- do not describe this as part of the manifest-declared public surface
- do not describe this as part of the first low-risk direct runner
- do describe it as unresolved / source-present but manifest-absent

Recommended README handling:
- in the direct-runner section, keep `umg_envoy_load_sleeve` in the explicit exclusions list
- add a short note such as:
  - "`umg_envoy_load_sleeve` is discussed in source-policy and technical-surface context, but it is not currently declared in `openclaw.plugin.json` and should not be presented as part of the current public manifest surface."

Recommended PUBLIC-VARIANT-OVERVIEW handling:
- add one sentence explicitly calling out `umg_envoy_load_sleeve` as source-registered but not manifest-declared in alpha.15

### 3. Staged / deferred tools

Definition:
Names that appear in planning or capability-language docs but are not current manifest-declared tool ids.

Current staged/deferred names already captured in `docs/TOOL-SURFACE.md`:
- `umg_envoy_library_status`
- `umg_envoy_library_search`
- `umg_envoy_runtime_spec_dry_run`
- `umg_envoy_runtime_visibility_header`
- `umg_envoy_runtime_molt_map`
- `umg_envoy_runtime_dashboard`
- `umg_envoy_runtime_ir_matrix`
- `umg_envoy_runtime_inspect`
- `umg_envoy_local_readonly_plan`
- `umg_envoy_local_readonly_scan`
- `umg_envoy_alpha_demo`
- `umg_envoy_sleeve_inspect`
- `umg_envoy_sleeve_demo`

Required truth:
- do not present these as active public tool ids
- do present them as staged/deferred naming surfaces only

Recommended README handling:
- tighten broad capability bullets like `Runtime Display`, `MOLT Map`, `IR Matrix`, and `operational sleeve list / inspect / demo`
- replace them with language that says these are capability themes or staged surfaces, not a guarantee of current manifest-declared tool ids
- add a sentence pointing readers to `docs/TOOL-SURFACE.md` for exact status

Recommended PUBLIC-VARIANT-OVERVIEW handling:
- include a compact note that some older/staged capability names remain in historical docs but are not the alpha.15 manifest-declared tool set

### 4. Deprecated / historical tool names

Definition:
Older, alternate, or renamed labels that should not be mistaken for current public tool ids.

Known names from `docs/TOOL-SURFACE.md`:
- `umg_envoy_runtime_spec_compile`
- `umg_envoy_trace_inspect`
- `umg_envoy_runtime_display`

Required truth:
- do not remove history from technical docs unless doing a separate cleanup lane
- do mark them clearly as historical / non-current

Recommended README handling:
- avoid using historical names as if they are current tools
- if any remain, add `(historical naming, not current manifest tool id)` on first mention or remove the mention in favor of capability language

Recommended PUBLIC-VARIANT-OVERVIEW handling:
- no detailed list needed
- one line is enough: historical names may appear in older notes, but exact current ids are the manifest-aligned ones in `docs/TOOL-SURFACE.md`

### 5. Gated / blocked governance tools

Definition:
Manifest-declared tools that exist but are governance-gated, config-gated, policy-gated, or otherwise should not be casually described as broadly enabled runtime powers.

Primary examples:
- `umg_envoy_compile_ir_bridge`
- `umg_envoy_emit_relation_matrix`

Also relevant:
- `umg_envoy_compile_sleeve`
- `umg_envoy_build_path`
- `umg_envoy_low_risk_direct_tool_run` should be described narrowly, not as arbitrary execution

Required truth:
- these are part of the manifest-declared surface
- but some are blocked, gated, temp-only, or policy-lane constrained
- they should not be described as unrestricted execution or open-ended authority

Recommended README handling:
- add a subsection named `Gated manifest-declared tools`
- describe compiler bridge and relation matrix emit as declared but governance/config-gated surfaces
- explicitly say they are not evidence of unrestricted runtime execution
- keep the direct-runner section narrow and six-tool-limited

Recommended PUBLIC-VARIANT-OVERVIEW handling:
- say the package includes manifest-declared gated bridge/matrix-related surfaces whose use remains policy/config constrained

## Exact doc-edit recommendations

## A. README.md

### A1. Add a new section after `What it does`

Suggested heading:
- `## Current surface status at 0.3.0-alpha.15`

Suggested structure:
- `Manifest-declared public tools`
- `Source-present but not manifest-declared`
- `Staged or historical names`
- `Governance-gated declared tools`
- `Truth boundary`

Suggested content outline:

#### Manifest-declared public tools
State that `openclaw.plugin.json` is the authoritative declared public surface for this repo line, then point to `docs/TOOL-SURFACE.md` for the exact list.

#### Source-present but not manifest-declared
Call out `umg_envoy_load_sleeve` explicitly as source-registered / discussed internally but not currently declared in the manifest.

#### Staged or historical names
State that some docs use capability shorthand or older names and that those should not be read as current public tool ids.

#### Governance-gated declared tools
Call out compiler bridge and relation-matrix emit as manifest-declared but gated/config-constrained.

#### Truth boundary
State that repo docs do not prove live host CLI readiness or publication status.

### A2. Tighten `Current Capability Boundary`

Problem:
The current bullets read like a mix of capabilities, demo themes, and possible tool surfaces, which blurs live vs staged vs historical.

Recommended change:
- keep the section
- relabel the current `Allowed alpha capabilities` list to `Capability themes and bounded surface areas`
- add one sentence before the list:
  - "The list below is capability-oriented shorthand, not a guarantee that each label corresponds to a current manifest-declared public tool id."

### A3. Tighten `Current bounded direct runner`

Recommended additions:
- add one sentence near the top:
  - "This adapter is narrower than the full manifest-declared surface and should not be read as a generic execution path."
- keep `umg_envoy_load_sleeve` in exclusions
- add one explicit sentence stating it is also not manifest-declared in alpha.15

### A4. Add a closing pointer near `For exact declared public tool ids...`

Recommended wording:
- "For exact current tool-id status, use `openclaw.plugin.json`, `docs/TOOL-SURFACE.md`, and `docs/RELEASE-TRUTH-0.3.0-alpha.15.md` together."

## B. PUBLIC-VARIANT-OVERVIEW.md

### B1. Replace the current stale milestone text entirely

Current problem:
- the file still centers `v0.2.2` and `v0.2.3`
- it does not reflect alpha.15 truth
- it does not help reviewers separate live vs staged vs gated vs unresolved

Recommended replacement shape:

#### Title
- `# Public Variant Overview`

#### Opening paragraph
State that alpha.15 is a bounded public package lane for runtime-facing inspection and governed projection surfaces, with exact declared tool ids defined by `openclaw.plugin.json`.

#### Add a compact status table or bullets with these headings
- `Manifest-declared public tools`
- `Source-present but not manifest-declared`
- `Staged / deferred names`
- `Historical names`
- `Governance-gated declared tools`
- `Not proven here`

#### Required overview truths
- `umg_envoy_load_sleeve` is source-present but not manifest-declared
- compiler bridge and relation matrix emit are declared but gated
- historical/staged names are not the current manifest surface
- live host readiness and publication status are not proven here

### B2. Keep it short

This file should become a reviewer-facing summary, not a second full README.

Recommended target:
- 20 to 40 lines
- one link outward to `docs/TOOL-SURFACE.md`
- one link outward to `docs/RELEASE-TRUTH-0.3.0-alpha.15.md`

## Recommended classification table for use in both docs

| Category | How to describe it | Example |
|---|---|---|
| Manifest-declared live tools | current declared public surface for this repo line | `umg_envoy_status` |
| Source-registered but manifest-ambiguous | present in source discussion/registration but not declared public in manifest | `umg_envoy_load_sleeve` |
| Staged/deferred tools | planning or capability labels, not current manifest ids | `umg_envoy_runtime_dashboard` |
| Deprecated/historical names | older or alternate names, not current manifest ids | `umg_envoy_runtime_display` |
| Gated/blocked governance tools | declared tools with policy/config gating and bounded use | `umg_envoy_compile_ir_bridge` |

## Narrow next step

Apply docs-only edits to:
- `README.md`
- `PUBLIC-VARIANT-OVERVIEW.md`

Do not change:
- `openclaw.plugin.json`
- `package.json`
- source files
- versioning
- publication state

## Bottom line

The reconciliation target is not to shrink the package story.
It is to make the package story truthful.

The docs should say, plainly:
- what is currently manifest-declared
- what exists only in source/policy discussion
- what is staged or historical
- what is governance-gated
- what remains unresolved and unproven in alpha.15
