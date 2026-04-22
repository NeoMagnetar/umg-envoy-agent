# SCHEMA-STATUS

## Purpose

This file records current schema maturity for NeoBlock, NeoStack, and extracted sleeve-derived library artifacts.

It does not declare a final immutable UMG schema.
It declares what is stable enough now, what is provisional, and what must be handled carefully before clone/public split work.

## De facto schema truth surfaces

### Templates
- `blocks/manifests/templates/neoblock.template.json`
- `blocks/manifests/templates/neostack.template.json`
- `blocks/manifests/templates/sleeve.template.json`
- `blocks/manifests/templates/molt-block.template.json`

### Manifests / indexes
- `blocks/library/manifests/library-index.json`
- `blocks/library/manifests/category-index.json`
- `blocks/library/manifests/admission-policy.json`

### Extracted library conventions
- `blocks/library/neoblocks/`
- `blocks/library/neostacks/`
- `blocks/library/molt-extracted/`

### Runtime structures
- public runtime structure references may be documented later in curated form
- private live runtime files and compile-output histories are intentionally excluded from this public repo

## Stable NeoBlock fields

Current stable NeoBlock fields are template-defined in `blocks/manifests/templates/neoblock.template.json`:
- `id`
- `name`
- `purpose`
- `category`
- `subcategory`
- `status`
- `version`
- `tags`
- `molt_block_ids`
- `composition_logic`
- `governing_directives`
- `examples`
- `source`
- `notes`

## Stable NeoStack fields

Current stable NeoStack fields are template-defined in `blocks/manifests/templates/neostack.template.json`:
- `id`
- `name`
- `purpose`
- `category`
- `subcategory`
- `status`
- `version`
- `tags`
- `neoblock_ids`
- `activation_logic`
- `governance`
- `examples`
- `source`
- `notes`

## Provisional / not fully frozen areas

### Extracted MOLT type vocabulary
The extracted library layer currently includes MOLT type sets beyond the baseline normalized lane, including:
- `use`
- `aim`
- `need`
- `unknown`

### Baseline vs extracted alignment
- baseline `blocks/molt/` lane is more conservative and normalized
- extracted lanes carry richer and noisier real-world artifacts
- the mapping between extracted semantics and baseline normalization is not fully frozen

### Runtime vs authoring structure
- runtime structures preserve current operational semantics
- template files preserve authoring guidance
- those two layers are aligned enough for current work but not yet frozen into one validator-backed schema system

## Inconsistent fields / schema noise

Current known inconsistency class:
- extracted entries carrying `unknown` type values

This means some extracted sleeve-derived artifacts do not map cleanly to the currently normalized vocabulary.

## Unknown extracted type policy

### Current classification
- accepted transitional artifacts
- cleanup targets before clone/public split

### Current release policy
- keep them in the private cleanup lane
- do not treat them as canonical public schema truth
- evaluate each one for keep, remap, or exclude-from-public action

## Current unknown-type entries

### 1. `slv-bank_audit-compliance-v1-0`
- Current location: `blocks/library/molt-extracted/slv-bank_audit-compliance-v1-0.json`
- Likely cause: extracted source content does not fully map to the normalized baseline type vocabulary
- Action: remap

### 2. `slv-investigative-intelligence-v1-0`
- Current location: `blocks/library/molt-extracted/slv-investigative-intelligence-v1-0.json`
- Likely cause: extracted source content includes mixed semantic segments beyond current normalized mapping
- Action: remap

### 3. `slv-journalism-investigative-v1-0`
- Current location: `blocks/library/molt-extracted/slv-journalism-investigative-v1-0.json`
- Likely cause: extracted source content includes partially unmapped segments
- Action: remap

### 4. `slv-nonprofit-financing-v1-0`
- Current location: `blocks/library/molt-extracted/slv-nonprofit-financing-v1-0.json`
- Likely cause: extracted source content mixes normalized and not-yet-normalized semantic roles
- Action: remap

### 5. `umg_envoy_project_launcher_complete_sleeve`
- Current location: `blocks/library/molt-extracted/umg_envoy_project_launcher_complete_sleeve.json`
- Likely cause: extracted content is currently falling entirely outside the normalized extracted type mapping
- Action: exclude from public unless remapped

### 6. `umg_skill_creator_complete_sleeve`
- Current location: `blocks/library/molt-extracted/umg_skill_creator_complete_sleeve.json`
- Likely cause: extracted content is currently falling entirely outside the normalized extracted type mapping
- Action: exclude from public unless remapped

## Good enough for first release

Good enough for first release means:
- NeoBlock and NeoStack template fields are treated as the stable authoring baseline
- runtime structures remain operational and documented
- extracted library layers may remain provisional if explicitly labeled provisional
- unknown extracted types remain private cleanup artifacts and are not presented as canonical public truth

## Must be cleaned before clone/public split

Before clone/public split work, the following should be addressed:
- decide which extracted unknown-type entries can be remapped cleanly
- exclude or quarantine entries that remain schema-noisy
- clearly separate canonical baseline lanes from derived extracted lanes
- avoid presenting extracted provisional artifacts as if they were frozen public schema truth
