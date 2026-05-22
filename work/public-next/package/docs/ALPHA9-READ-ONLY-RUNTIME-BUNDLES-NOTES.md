# Alpha9 Read-Only Runtime Bundles Notes

## Purpose

Read-only runtime bundles package recurring safe workflows so native sleeves can compose useful capabilities without expanding execution authority.

## Hard boundaries

All bundles in this phase must preserve:
- approved only
- allowlisted only
- read-only only
- no direct_source
- no automatic response takeover
- no UMG-Block-Library mutation
- no broad autonomous execution

## Bundle categories

### active-sleeve-inspection
- inspect active sleeve session state
- inspect active RuntimeSpec / IR Matrix / envelope projection
- inspect provenance and route purity

### native-graph-inspection
- inspect sleeve-native graph richness
- inspect clean-native eligibility
- inspect diagnostics surfaces such as runtimeCodeIdentity and nativeFixtureResolution

### block-library-navigation
- inspect manifest index
- inspect manifest entries
- inspect NeoBlocks
- inspect visible MOLT fragments

### coding-project-inspection
- inspect runtime/project status
- inspect validation posture
- support structured implementation planning without writes

### read-only-ops-diagnostics
- inspect status
- inspect active sleeve session
- inspect bounded orchestration state

## Composition rule

Bundles remain declarative.
A bundle listing a tool does not itself grant new authority.
The containing sleeve and runtime gate still enforce approved/allowlisted/read-only execution.
