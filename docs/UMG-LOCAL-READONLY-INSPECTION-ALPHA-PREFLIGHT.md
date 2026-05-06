# UMG Local Read-Only Inspection Alpha Preflight

## Status
Design gate only.

Before future `desktop_bridge.file_scan` execution, preflight must verify:
1. tool id is exactly `desktop_bridge.file_scan`
2. tool is classified as local read-only inspection
3. approval exists and is exact-scope
4. checkpoint exists
5. root path matches approved scope
6. recursion setting matches approved scope
7. max depth matches approved scope
8. max items matches approved scope
9. `include_file_contents` is false
10. write and delete operations are impossible
11. external calls are false
12. hidden and system path policy matches approval
13. blocked path patterns are enforced
14. result payload policy is metadata only
15. support docs are not the source of the tool claim

If any check fails:
- status: `blocked` or `preflight_failed`
- execution statement: `No local inspection performed.`

## Approval / Checkpoint Requirement
Local read-only alpha requires both:
- explicit approval
- checkpoint

This is stricter than metadata alpha because path scope is privacy-sensitive and must be replay-safe.

## Scope Change Rule
If any of these change, preflight must fail:
- root path
- recursive setting
- max depth
- max items
- hidden/system policy
- blocked path pattern set
- payload policy

## Approval / Checkpoint Relationship
Approval must be:
- exact-scope
- single-use
- tied to RuntimeSpec, handoff, checkpoint, and scope hash
- invalid if root path, depth, item count, recursion, or payload policy changes

Checkpoint snapshot should include:
- runtime_spec_hash
- tool_plan_hash
- selected_context_hash
- approval_request_hash
- local_inspection_scope_hash
- policy_version

Replay guard should block on any scope or policy mismatch.

## Design Boundary
This document specifies preflight only.
