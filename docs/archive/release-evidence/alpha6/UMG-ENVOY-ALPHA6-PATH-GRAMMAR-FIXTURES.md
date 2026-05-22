# UMG Envoy Alpha6 Path Grammar Fixtures

## Why This Exists
The earlier alpha6 probe failures for:
- `umg_envoy_parse_path`
- `umg_envoy_validate_path`
- `umg_envoy_render_path`

were input-contract failures, not runtime/load failures.
The parser expects UMG path grammar, not freeform `TRIGGER:` / `AIM:` / `USE:` prose.

## Minimal Valid Path Fixture
```text
USE[public_compile_and_render_path]
AIM[public_safe_human_inspectable_route]
NEED[bundled_public_content,compiler_visible_output]
SLV[public-basic-envoy]
TRG[public.default]
GATE[]
LOAD[S.PUBLIC.01]

STACK[S.PUBLIC.01]
BLOCK[NB.PUBLIC.01]
MOLT[+Pprimary.sample]
ENDBLOCK
ENDSTACK

WIN[chain]=NB.PUBLIC.01>primary.sample
CMP[validate>normalize>emit]
```

## Malformed Path Fixture
```text
TRIGGER: audit alpha6 surface
AIM: preserve working recovery
USE: inspect current plugin surface
```

## Expected Valid Parse Result Summary
The valid fixture parses into:
- `use`: `public_compile_and_render_path`
- `aim`: `public_safe_human_inspectable_route`
- `need`: `bundled_public_content`, `compiler_visible_output`
- `sleeveId`: `public-basic-envoy`
- one trigger: `public.default`
- one loaded stack: `S.PUBLIC.01`
- one stack with one block and one active primary MOLT
- one winner: `chain => NB.PUBLIC.01>primary.sample`
- compiler stages: `validate > normalize > emit`

## Expected Validation Result
Valid fixture:
- `ok: true`
- `issues: []`

Malformed fixture:
- reject cleanly with `Unknown line: TRIGGER: ...`

## Expected Render Result
Rendering the valid parsed path returns the canonical UMG path text, preserving the structured grammar.

## Tool Invocation Examples
### Parse
Input:
```json
{ "source": "<valid fixture text>" }
```
Expected:
- parsed JSON object

### Validate
Input:
```json
{ "source": "<valid fixture text>" }
```
Expected:
```json
{ "ok": true, "issues": [] }
```

### Render
Input:
```json
{ "source": "<valid fixture text>" }
```
Expected:
- canonical text form of the same UMG path

### Build
Input:
```json
{ "message": "Audit current alpha6 surface", "sleeveId": "public-basic-envoy" }
```
Expected:
- generated structured UMG path text from the bundled public-safe builder

## Grammar Cheat Sheet
Recognized top-level lines include:
- `USE[...]`
- `AIM[...]`
- `NEED[...]`
- `SLV[...]`
- `TRG[...]`
- `GATE[...]`
- `LOAD[...]`
- `STACK[...]` / `ENDSTACK`
- `BLOCK[...]` / `ENDBLOCK`
- `MOLT[...]`
- `REL[...]`
- `BND[...]`
- `MRG[...]`
- `WIN[...]`
- `CMP[...]`

### MOLT syntax
`MOLT[<state><role><id>]`

State symbols:
- `+` active
- `~` latent
- `-` suppressed
- `x` off

Role symbols:
- `T D I S P H B`

Example:
- `MOLT[+Pprimary.sample]`

## Durable Interpretation
The path tools are working on alpha6.
The earlier failures happened because the probe string was not valid UMG syntax.
