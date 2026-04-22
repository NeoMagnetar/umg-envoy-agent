# MOLT-LANE-DOCTRINE

## Purpose

This file freezes the current lane doctrine for MOLT-related storage in the live resleever.

It does not define the final future library architecture.
It defines the current working truth for cleanup and clone-readiness.

## Runtime rule first

The live runtime does not directly operate from MOLT library lanes after promotion.

Direct runtime truth lives in:
- `runtime/active-sleeve.json`
- `runtime/active-stack.json`
- related compile outputs and traces under `runtime/`

MOLT lanes are authored, extracted, promoted, or mirrored library surfaces.
They are not the final promoted runtime state.

## Lane 1 - Baseline normalized MOLT

### Path
- `blocks/molt/`

### Purpose
- baseline normalized MOLT block libraries
- stable authored block inventory by MOLT category

### Status
- canonical baseline lane

### Runtime used directly?
- no, not after promotion
- may be used as authored/reference input surfaces before compile/integration workflows

### Public split survival
- yes

### Safe for first-release public exposure
- yes, with normal review

### Notes
- current stored categories include:
  - blueprints
  - directives
  - instructions
  - philosophy
  - primary
  - subjects
  - triggers
- this lane does not currently normalize `use`, `aim`, and `need` as first-class baseline library folders

## Lane 2 - Extracted sleeve-derived MOLT

### Path
- `blocks/library/molt-extracted/`

### Purpose
- extracted MOLT artifacts derived from admitted sleeve/library content
- structured intake/reference layer for sleeve-derived material

### Status
- derived
- provisional

### Runtime used directly?
- no direct runtime use is assumed after promotion

### Public split survival
- maybe
- only if clearly labeled derived/provisional and cleaned

### Safe for first-release public exposure
- not as canonical truth in current form

### Notes
- this lane currently includes entries carrying `unknown` type values in some extracted artifacts
- this lane is useful for curation, intake review, and structured inspection
- this lane is not the current canonical baseline MOLT library

## Lane 3 - Promoted sleeve-derived MOLT

### Path
- `blocks/molt-promoted/`

### Purpose
- promoted top-level sleeve-derived MOLT stores
- convenient sleeve-derived MOLT packaging surface

### Status
- derived
- provisional

### Runtime used directly?
- no direct runtime use is assumed after promotion into runtime active JSON

### Public split survival
- maybe
- depends on later curation and clone/public split doctrine

### Safe for first-release public exposure
- not as canonical truth in current form

### Notes
- this lane should not be confused with `runtime/active-*` files
- this lane is not currently the single source-of-truth for runtime

## Trigger doctrine

### Trigger storage doctrine
- stored trigger block assets still exist under `blocks/molt/triggers/`
- these stored trigger assets remain valid historical/baseline storage content

### Trigger compiler doctrine
- compiler-facing trigger semantics are now treated primarily as matching/routing/gating input
- bridge/runtime contract expects trigger-driven matching behavior such as `matchedTriggerIds` and stack activation effects

### Trigger runtime doctrine
- runtime should be understood through:
  - matched trigger ids
  - gate-trigger behavior
  - stack activation/routing behavior
- runtime should not be modeled as if trigger were simply a peer generative output bucket equal to all older historical library assumptions

### Practical doctrine summary
- stored trigger assets remain in baseline libraries
- active semantics have shifted toward routing/gating
- both truths currently coexist and must be documented explicitly

## use / aim / need policy

### Current live truth
- `use`, `aim`, and `need` are expected in newer runtime outputs
- they are present in some extracted sleeve-derived library artifacts
- they are not yet normalized as baseline `blocks/molt/` categories

### Current policy
- accepted as current runtime/extracted semantics
- not yet frozen as baseline normalized MOLT library lanes
- should be treated as supported current semantics with incomplete baseline-library normalization

## Clone/public split note

For current clone-planning purposes:
- `blocks/molt/` is the closest thing to canonical baseline MOLT truth
- `blocks/library/molt-extracted/` is a derived/provisional intake layer
- `blocks/molt-promoted/` is a derived/provisional sleeve-derived packaging layer
- runtime truth still lives under `runtime/`, not inside these library lanes
