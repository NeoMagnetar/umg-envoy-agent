# Compiler Contract

The public compiler adapter loads bundled JSON blocks and sleeves, resolves sleeve block references, removes disabled block refs, orders active blocks by authority, emits a dry-run RuntimeSpec projection, and validates the emitted shape. RuntimeSpec remains a non-executing artifact for downstream execution-preparation surfaces.

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
