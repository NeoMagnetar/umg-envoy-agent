# PATH-SHORTHAND

## Purpose
This guide documents the compact UMG path shorthand now supported by the plugin's planner-layer path utilities.

The shorthand is meant to give operators and developers a smaller, human-readable command surface for:
- inspecting planner routes
- parsing a path file into JSON
- validating a shorthand path document
- rendering JSON back into shorthand text
- building a shorthand document from live message/runtime activation

## Core line syntax
A shorthand path document is line-oriented.

Main headers:
- `USE[...]`
- `AIM[...]`
- `NEED[...]`
- `SLV[...]`
- `TRG[...]`
- `GATE[...]`
- `LOAD[...]`
- `CMP[...]`

Planner structure:
- `STACK[...]`
- `BLOCK[...]`
- `MOLT[...]`
- `ENDBLOCK`
- `ENDSTACK`

Optional relationship layers:
- `REL[...]`
- `BND[...]`
- `MRG[...]`
- `WIN[...]`

Canonical relationship markers for the frozen v0.2 contract:
- `PAR` = parallel
- `SEQ` = sequence
- `NEST` = nested
- `OVR` = overlay

`CHN` may still appear in transitional code paths, but it is compatibility-only rather than part of the canonical frozen syntax.

## State symbols
`MOLT[...]` lines use a state symbol before the role code.

State symbols:
- `+` = active
- `~` = latent
- `-` = suppressed
- `x` = hard-off

Winner is a planner declaration expressed through `WIN[...]`, not a fifth `MOLT` state symbol.

Example:
- `MOLT[+Iblock.answer.direct]`
- `MOLT[~Hblock.philosophy.restraint]`
- `MOLT[-Dblock.guard.no_overclaim]`

## Role codes
Supported MOLT role codes:
- `T` = trigger-oriented node
- `D` = directive
- `I` = instruction
- `S` = subject
- `P` = primary
- `H` = philosophy
- `B` = blueprint / format layer

## Example shorthand document
```text
USE[build_live_runtime_path]
AIM[human_inspectable_planner_route]
NEED[validated_route,planner_visibility,compiler_handoff_ready]
SLV[sample-basic-minimal]
TRG[TRG.041-code-generation,TRG.044-documentation]
GATE[+g.message,-g.conflict]
LOAD[@stk.operator,@stk.documentation]

STACK[@stk.operator]
BLOCK[#nb.answer]
MOLT[+Iblock.answer.direct]
MOLT[+Dblock.release_guard]
ENDBLOCK
ENDSTACK

STACK[@stk.documentation]
BLOCK[#nb.docs]
MOLT[+Bblock.format.concise]
MOLT[~Hblock.clarity.first]
ENDBLOCK
ENDSTACK

REL[SEQ]{#nb.answer>#nb.docs}
WIN[chain]=#nb.answer>#nb.docs
CMP[validate>normalize>merge>bundle>govern>compile>emit]
```

## CLI commands
All commands run from the `umg-envoy` CLI root.

### Parse a shorthand file
```bash
openclaw umg-envoy parse-path --file path-example.umgpath
```
Returns parsed JSON.

### Validate a shorthand file
```bash
openclaw umg-envoy validate-path --file path-example.umgpath
```
Returns:
- `ok`
- `issues[]`

Validation checks include:
- required `USE`, `AIM`, `SLV`, and `CMP`
- duplicate stack/block ids
- underspecified relationships/bundles/merges
- unknown references
- empty load/trigger conditions

### Render JSON or shorthand-normalize a file
```bash
openclaw umg-envoy render-path --file path-example.umgpath
```
If the input file is JSON, it renders shorthand.
If the input file is shorthand, it normalizes and re-renders it.

### Build a shorthand path from a live message
```bash
openclaw umg-envoy build-path --message "draft the release notes and check the package docs" --sleeve sample-basic-minimal
```
This builds a planner-layer shorthand route from the live activation trace/runtime payload.

## Intended use
Use shorthand when you want:
- a compact planner snapshot
- a diff-friendly path representation
- a reviewable handoff between runtime activation and compiler reasoning
- a small human-facing surface in docs/examples

Use raw JSON when you want:
- programmatic manipulation
- schema-level tooling
- larger payload transport

## Notes
- `WIN[chain]=...` may point at a rendered chain string rather than a single declared id.
- `REL`, `BND`, `MRG`, and `WIN` are optional layers.
- `build-path` is especially useful for docs/examples because it exposes the runtime-derived planner route in a readable form.