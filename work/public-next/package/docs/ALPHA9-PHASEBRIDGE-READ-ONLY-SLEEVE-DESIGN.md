# Alpha9 PhaseBridge Read-Only Sleeve Design

## Purpose

Design a PhaseBridge native sleeve that can observe PhaseBridge state safely without adding action authority.

## Design goals

The sleeve should be able to:
- observe PhaseBridge availability
- inspect PhaseBridge health / status
- inspect available read-only capability surfaces
- inspect allowed read-only routes
- inspect blocked or action-capable routes without enabling them
- connect PhaseBridge visibility to native sleeve graph structure
- connect PhaseBridge inspection to read-only runtime bundles
- preserve provenance and route-purity labels

## Hard boundaries

This design remains strictly:
- read-only only
- no PhaseBridge actions
- no file writes
- no command execution
- no bridge mutation
- no UMG-Block-Library mutation
- no direct_source
- no automatic response takeover
- no broad autonomous execution

## Proposed sleeve identity

- `sleeveId = umg-phasebridge-observer-native-v1`
- `sleeveName = UMG PhaseBridge Observer Native Sleeve`

## Observation model

The PhaseBridge observer sleeve should model PhaseBridge as an observation domain with explicit route classes.

### Route classes

#### Allowed read-only observation routes
- PhaseBridge ledger status inspection
- current step / next legal step visibility
- stop reason visibility
- work-lane summary visibility
- validation status visibility
- runner readiness / parked state visibility

#### Blocked / non-executable routes (still visible as metadata)
- resume execution
- stop execution
- relay to external target
- mutate ledger/worklog state
- action-triggering bridge execution

The sleeve may inspect and report these blocked routes, but must never elevate them into executable authority.

## Graph mapping

### NeoStack concept

Recommended stacks:
1. `phasebridge-observer-core-stack`
   - identity, trigger, directive, subject
2. `phasebridge-observer-output-stack`
   - instruction, philosophy, blueprint
3. `phasebridge-observer-policy-stack`
   - allowed-read-only routes, blocked-routes visibility, provenance rules

### NeoBlock themes

Recommended block roles:
- bridge availability trigger
- read-only PhaseBridge directive
- PhaseBridge subject definition
- observer identity block
- status/capability listing block
- blocked-route visibility block
- provenance reporting block
- envelope/report blueprint block

### MOLT fragment themes

Expected MOLT projection should emphasize:
- Trigger: observe PhaseBridge state when explicitly requested
- Directive: inspect only allowed read-only PhaseBridge surfaces
- Subject: bridge availability, health, route classes, workflow state
- Primary: observer identity
- Philosophy: explicit capability visibility without authority creep
- Blueprint: structured PhaseBridge status and route report

## Provenance model

PhaseBridge observation must not be mislabeled as sleeve-native content provenance.

Recommended provenance categories for bridge-observed surfaces:
- `sleeve_native` for the sleeve declaration itself
- `sleeve_native_derived` for runtime-projected graph structure
- `phasebridge_observed` for observed PhaseBridge status/capability state
- `phasebridge_capability_blocked` for visible but blocked action routes

Note:
- these categories are design targets and may require future schema expansion if made first-class in the native graph schema
- until then, PhaseBridge-specific provenance can be represented in design docs and route metadata rather than shipped schema changes

## Route purity model

The PhaseBridge observer sleeve can still be `clean_native` if:
- the sleeve graph itself is native and explicit
- PhaseBridge observation is treated as observed external state, not fallback contamination
- no sample fallback or legacy preview residue is introduced
- action-capable routes remain blocked and non-executable

That means:
- `sourceMode = sleeve_native`
- `routePurity = clean_native`
can still hold for the sleeve graph itself

while the observed PhaseBridge state is represented as external observation content, not graph contamination.

## Bundle alignment

Recommended bundle relationships:
- **active-sleeve-inspection**
  - for active sleeve/session context
- **native-graph-inspection**
  - for graph/provenance/route-purity reporting
- **read-only-ops-diagnostics**
  - for operational state framing

A future PhaseBridge-specific read-only bundle may later be added, but this lane does not require it yet.

## Capability visibility model

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

A PhaseBridge observer report should ideally include:
- bridge availability
- bridge health/status
- visible read-only PhaseBridge capabilities
- visible blocked/action capabilities
- current workflow/ledger visibility state
- active safety posture
- provenance/route-purity summary
- explicit statement that no actions were executed

## Why this lane matters

This mirrors the Desktop Bridge pattern and keeps the path clean:
- native sleeve
- read-only bundle
- bridge status visibility
- later controlled action gates

It avoids collapsing workflow interpretation into workflow execution.

## Suggested next step after this lane

- `ALPHA9_CONTROLLED_ACTION_GATE_DESIGN_SOURCE`
