# UMG Local Read-Only Inspection Alpha Payload

## Status
Design gate only.

## Result Shape
The local read-only alpha should eventually report:
- exact scope object
- metadata-only payload policy
- bounded summary
- bounded file metadata item list
- execution boundary proving no contents were read and no mutations occurred

## File Metadata Shape
```ts
export interface LocalReadOnlyFileMetadataV0 {
 name: string;
 relative_path: string;
 item_type: "file" | "directory";
 extension?: string;
 size_bytes?: number;
 modified_at?: string;
 created_at?: string;
 depth: number;
 child_count?: number;
 skipped?: boolean;
 skipped_reason?: string;
}
```

## Payload Policy
- payload type: `read_only_file_metadata`
- contains file contents: false
- contains sensitive data: possible from filenames, so redaction policy must exist
- redaction applied: policy-dependent
- max items: bounded and explicit
- max depth: bounded and explicit

## Path Display Rule
Prefer:
- relative paths from approved root

Instead of:
- raw absolute path output

If absolute path is needed for UI context, use redacted form such as:
- `C:\...\workspace\project`

## Truncation Rule
If the scan hits item limit:
- set `truncated: true`
- include skipped or truncated warning
- do not silently continue beyond approved bounds

## Design Boundary
No file contents are returned in this phase.
