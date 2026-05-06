# UMG Second Governed Execution Alpha Preflight

## Status
Design gate only.

Before future metadata alpha execution, preflight must verify:
1. `tool_id` is in metadata alpha allowlist
2. `tool_id` is not blocklisted
3. requested target matches the handoff tool plan
4. tool classification is `metadata_only`
5. `risk_level` is `none`
6. `approval_required` is `false`
7. `checkpoint_required` is `false`
8. payload policy is `metadata`
9. payload has size limit
10. payload excludes file contents
11. payload excludes secrets/config/env values
12. support docs are not treated as runtime/executable artifacts
13. `external_calls_performed` remains `false`
14. `write_performed` remains `false`
15. `delete_performed` remains `false`

If any required check fails:
- status: `blocked` or `preflight_failed`
- execution statement: `No tools executed.`

## Expansion Rule
Classification cleanup must happen before metadata expansion implementation begins.

That means v2 implementation order should be:
1. cleanup generic classification for plugin-native metadata targets
2. implement `resolver.library_search`
3. implement `tool.capability_summary`

## Candidate-Only Rule
`mcp.server_metadata` must not move into implementation in the same pass unless explicit follow-up review proves it stays metadata-only without server start, remote connection, or tool invocation.
