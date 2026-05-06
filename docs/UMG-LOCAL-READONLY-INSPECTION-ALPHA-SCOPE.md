# UMG Local Read-Only Inspection Alpha Scope

## Status
Design gate only.

## Scope Object
```ts
export interface LocalReadOnlyInspectionScopeV0 {
 root_path: string;
 allowed: boolean;
 recursive: boolean;
 max_depth: number;
 max_items: number;
 include_hidden: boolean;
 include_system_paths: boolean;
 include_file_contents: false;
 allowed_extensions?: string[];
 blocked_extensions?: string[];
 blocked_path_patterns: string[];
 reason: string;
}
```

## Defaults
Recommended defaults:
- `recursive: false`
- `max_depth: 2`
- `max_items: 100`
- `include_hidden: false`
- `include_system_paths: false`
- `include_file_contents: false` always

## Clamp Rules
Recommended hard clamps:
- max depth clamp: 5
- max items clamp: 500

If requested values exceed policy:
- clamp values
- report warning
- require the clamped values to be reflected in approval and checkpoint scope hash

## Default Blocked Paths
Blocked by default unless explicitly approved in a later policy layer:
- `C:\`
- `C:\Windows`
- `C:\Program Files`
- `C:\Program Files (x86)`
- `C:\Users\<user>\AppData`
- `C:\Users\<user>\\.ssh`
- `C:\Users\<user>\\.aws`
- `C:\Users\<user>\\.config`
- `C:\Users\<user>\\.openai`
- `node_modules`
- `.git` internals
- credential stores
- browser profile folders

## Allowed-by-Approval Pattern
Only explicitly scoped project/workspace paths should be eligible, for example:
- `C:\.openclaw\workspace\umg-envoy-agent-release-clean`

Approval must bind to the exact root path, not a vague parent class.

## Scope Policy Summary
- root path must be explicit
- recursion is opt-in
- depth and item counts must be bounded
- hidden and system paths are off by default
- file contents are never part of alpha v0
