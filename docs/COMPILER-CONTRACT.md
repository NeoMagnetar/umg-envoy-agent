# Compiler Contract

The public compiler adapter loads bundled JSON blocks and sleeves, resolves sleeve block references, removes disabled block refs, orders active blocks by authority, emits a dry-run RuntimeSpec projection, and validates the emitted shape. RuntimeSpec remains a non-executing artifact for downstream execution-preparation surfaces.

Trace remains an audit/provenance artifact and does not grant permission.
Low-risk direct runtime execution, where available, is ActionGate-bound and ToolCapabilityRegistry-bound; it is not compiler-authorized and is not inferred from RuntimeSpec or Trace alone.

Required RuntimeSpec fields:
- runtimespec_id
- sleeve_id
- snap_id
- primary_shell_block_id
- active_blocks
- prompt_parts
- strategy
- constraints
- context
- values
- format
- tool_requests
- errors
- warnings
