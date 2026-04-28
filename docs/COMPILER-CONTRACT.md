# Compiler Contract

The public compiler adapter loads bundled JSON blocks and sleeves, resolves sleeve block references, removes disabled block refs, orders active blocks by authority, emits RuntimeSpec-like output, and validates the emitted shape.

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
