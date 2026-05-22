# Alpha9 Desktop Bridge Read-Only Sleeve Design

## Purpose

Design a Desktop Bridge native sleeve that can observe local/desktop bridge state safely without adding action authority.

## Design goals

The sleeve should be able to:
- observe Desktop Bridge availability
- inspect bridge health / status
- inspect available bridge tools / capabilities
- inspect allowed read-only routes
- inspect blocked or action-capable routes without enabling them
- connect bridge visibility to native sleeve graph structure
- connect bridge inspection to read-only runtime bundles
- preserve provenance and route-purity labels

## Hard boundaries

This design remains strictly:
- read-only only
- no desktop actions
- no file writes
- no command execution
- no bridge mutation
- no UMG-Block-Library mutation
- no direct_source
- no automatic response takeover
- no broad autonomous execution

## Proposed sleeve identity

- `sleeveId = umg-desktop-bridge-observer-native-v1`
- `sleeveName = UMG Desktop Bridge Observer Native Sleeve`

## Observation model

The desktop bridge observer sleeve should model the desktop bridge as an observation domain with explicit route classes.

### Route classes

#### Allowed read-only bridge observation routes
- desktop window listing
- focus state inspection metadata
- screenshot availability/status inspection
- OCR availability/status inspection
- bridge capability listing
- bridge health/status inspection

#### Blocked / non-executable routes (still visible as metadata)
- click actions
- text typing actions
- key press actions
- file mutation through desktop workflows
- arbitrary command execution

The sleeve may inspect and report these blocked routes, but must never elevate them into executable authority.

## Graph mapping

### NeoStack concept

Recommended stacks:
1. `desktop-bridge-observer-core-stack`
   - identity, trigger, directive, subject
2. `desktop-bridge-observer-output-stack`
   - instruction, philosophy, blueprint
3. `desktop-bridge-observer-policy-stack`
   - allowed-read-only routes, blocked-routes visibility, provenance rules

### NeoBlock themes

Recommended block roles:
- bridge availability trigger
- read-only bridge directive
- desktop bridge subject definition
- observer identity block
- bridge capability listing block
- blocked-route visibility block
- provenance reporting block
- envelope/report blueprint block

### MOLT fragment themes

Expected MOLT projection should emphasize:
- Trigger: observe desktop bridge state when explicitly requested
- Directive: inspect only allowed read-only bridge surfaces
- Subject: bridge availability, health, capabilities, route classes
- Primary: observer identity
- Philosophy: explicit capability visibility without authority creep
- Blueprint: structured bridge status and route report

## Provenance model

Desktop Bridge observation must not be mislabeled as sleeve-native content provenance.

Recommended provenance categories for bridge-observed surfaces:
- `sleeve_native` for the sleeve declaration itself
- `sleeve_native_derived` for runtime-projected graph structure
- `bridge_observed` for observed desktop bridge status/capability state
- `bridge_capability_blocked` for visible but blocked action routes

Note:
- these categories are design targets and may require future schema expansion if made first-class in the native graph schema
- until then, bridge-specific provenance can be represented in design docs and route metadata rather than shipped schema changes

## Route purity model

The Desktop Bridge observer sleeve can still be `clean_native` if:
- the sleeve graph itself is native and explicit
- bridge observation is treated as observed external state, not fallback contamination
- no sample fallback or legacy preview residue is introduced
- action-capable routes remain blocked and non-executable

That means:
- `sourceMode = sleeve_native`
- `routePurity = clean_native`
can still hold for the sleeve graph itself

while the observed bridge state is represented as external observation content, not graph contamination.

## Bundle alignment

Recommended bundle relationships:
- **active-sleeve-inspection**
  - for active sleeve/session context
- **native-graph-inspection**
  - for graph/provenance/route-purity reporting
- **read-only-ops-diagnostics**
  - for operational state framing

A future desktop-specific read-only bundle may later be added, but this lane does not require it yet.

## Tool/capability visibility model

The sleeve should conceptually expose/report:
- bridge available = yes/no
- bridge health = healthy/degraded/unavailable
- read-only capability set
- blocked capability set
- observation route list
- action route list (blocked)
- provenance summary
- route purity summary

## Output contract expectation

A Desktop Bridge observer report should ideally include:
- bridge availability
- bridge health/status
- visible read-only bridge capabilities
- visible blocked/action capabilities
- active safety posture
- provenance/route-purity summary
- explicit statement that no actions were executed

## Why this lane matters

This is the first bridge-facing sleeve design that keeps the path clean:
- native sleeve
- read-only bundle
- bridge status visibility
- later controlled action gates

It avoids the classic mistake of jumping straight from observation to automation.

## Suggested next step after this lane

- `ALPHA9_PHASEBRIDGE_READ_ONLY_SLEEVE_DESIGN_SOURCE`
