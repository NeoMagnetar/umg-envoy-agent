# UMG Local Read-Only Inspection Alpha Foundation

## Status
Design gate only.

This phase defines the first local read-only inspection alpha.

Target tool:
- `desktop_bridge.file_scan`

This does **not** mean broad local computer access.
It means a scoped, approval-required, checkpoint-required, metadata-only file inventory operation.

## Purpose
The goal is to eventually answer:

> What files and folders exist under this explicitly approved path scope?

without:
- reading file contents
- writing files
- deleting files
- running shell commands
- executing arbitrary desktop actions

## Intended Classification
Recommended classification:
- `status: requires_approval`
- `risk_level: medium`
- `execution_mode: approval_required`
- `approval_required: true`
- `checkpoint_required: true`
- `governance_policy: local_readonly_scope_required`

Why medium risk:
- filenames can reveal sensitive information
- folder structure can reveal project, personal, or credential context
- timestamps and extensions can still leak private operational details

## Core Rule
The local read-only alpha may inspect metadata only.

Allowed metadata:
- file or folder name
- relative path from approved root
- item type
- extension
- size in bytes
- modified time
- created time if available
- depth
- child count if cheap and safe
- skipped reason

Disallowed:
- file contents
- previews
- binary blobs
- OCR
- secrets
- environment values
- unrestricted config dumps
- arbitrary recursive raw output

## Dashboard / Matrix / Drill-Down Relationship
Future dashboard should show:
- tool name
- approval/checkpoint requirement
- approved scope in redacted form
- recursion, max depth, max items
- file contents: no
- writes: no
- deletes: no
- external calls: no
- execution statement

Future matrix should model:
- file scan tool node
- scope policy node
- checkpoint policy node
- payload policy node
- blocked scope node
- no read/write/delete/shell edges in this design pass

Future drill-down should answer:
- approved scope
- skipped items or patterns
- blocked reason
- payload policy

## Design Boundary
This pass does not implement file scanning.

> No tools executed.
