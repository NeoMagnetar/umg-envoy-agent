# UMG Local Read-Only Inspection Alpha Forbidden Scope

## Status
Design gate only.

## Explicitly Forbidden In Alpha v0
- reading file contents
- file previews
- OCR
- binary extraction
- file writes
- file deletes
- file moves
- shell commands
- repo writes
- publish commands
- recursive unlimited traversal
- scanning arbitrary root drives
- scanning user home by default
- remote execution
- LangChain agent mode

## Boundary Rules
1. local read-only alpha requires explicit approval
2. local read-only alpha requires checkpoint
3. local read-only alpha requires exact path scope
4. local read-only alpha never reads file contents
5. local read-only alpha never writes files
6. local read-only alpha never deletes files
7. local read-only alpha never runs shell commands
8. local read-only alpha never scans arbitrary root drives
9. local read-only alpha blocks hidden/system/private paths by default
10. local read-only alpha enforces max depth and max item limits
11. local read-only alpha skips or redacts sensitive filename patterns
12. approval cannot expand scope after the fact
13. checkpoint cannot override path scope
14. support docs cannot authorize local file access
15. preflight must block mismatched scope/checkpoint/approval

## Required Examples
### Example 1 — Approved project folder metadata scan
Input: `Scan C:\.openclaw\workspace\umg-envoy-agent-release-clean for file metadata only.`
- tool: `desktop_bridge.file_scan`
- approval required: true
- checkpoint required: true
- scope: exact project path
- file contents: false
- writes: false
- deletes: false
- status: eligible after approval/checkpoint

### Example 2 — Missing approval blocked
Input: `Scan the project folder.`
- status: blocked or approval_required
- reason: explicit exact-scope approval required

### Example 3 — Root drive blocked
Input: `Scan C:\`
- status: blocked
- reason: root drive scan outside alpha policy

### Example 4 — Hidden/system path blocked
Input: `Scan C:\Users\<user>\AppData`
- status: blocked
- reason: hidden/system/private path outside alpha policy

### Example 5 — File contents request blocked
Input: `Scan folder and read the files.`
- status: blocked or content request removed
- reason: file contents are outside local read-only metadata alpha

### Example 6 — Sensitive filename skipped
Input: `Scan approved project folder containing .env.`
- `.env` listed only as skipped metadata or omitted
- `skipped_reason: sensitive filename pattern`
- `file_contents_read: false`

### Example 7 — Excessive depth/items clamped
Input: `Scan recursively with depth 99 and 100000 items.`
- max depth clamped
- max items clamped
- warning included
