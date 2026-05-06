# UMG Second Governed Execution Alpha Foundation

## Status
Design gate only.

This phase defines the second governed metadata alpha as a small expansion from one implemented plugin-native metadata target to a controlled metadata-only family.

## Existing Implemented Target
- `resolver.library_status`

## Next Eligible Targets
- `resolver.library_search`
- `tool.capability_summary`

## Candidate-Only Target
- `mcp.server_metadata`

This remains candidate-only unless design review proves it can remain metadata-only without starting servers, connecting remotely, invoking MCP tools, or exposing secrets/config values.

## Key Problem To Solve
The first alpha implementation works, but the broader dry-run model still classifies `resolver.library_status` as unknown/blockable in generic governance flow.

That is acceptable as a narrow implementation exception for the first alpha, but it is not acceptable for metadata expansion.

## Required Cleanup Before Expansion
The broader dry-run model must classify the plugin-native metadata targets as:
- `status: metadata_only`
- `risk_level: none`
- `execution_mode: metadata_only`
- `approval_required: false`
- `governance_policy: plugin_native_metadata_only`

Targets requiring that cleanup:
- `resolver.library_status`
- `resolver.library_search`
- `tool.capability_summary`

## Safety Position
Second alpha stays:
- metadata-only
- plugin-native first
- non-mutating
- no local file content return
- no secrets/env/config value return
- no external calls
- no remote execution
- no LangChain agent mode

## Dashboard / Matrix / Drill-Down Relationship
Future dashboard wording should show a dedicated second-alpha section for metadata expansion status, payload policy, and blocked/candidate-only reasons.

Future matrix relationship should remain structural only:
- metadata target node
- payload policy node
- blocked target node
- no execution edges in this design pass

Future drill-down should answer:
- why a metadata target is eligible
- what payload fields are allowed
- what limit applies
- why a blocked target remains blocked
- why `mcp.server_metadata` is candidate-only

## Design Boundary
This pass does not implement new targets.

> No tools executed.
