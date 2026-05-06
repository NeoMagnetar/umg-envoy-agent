# UMG Second Governed Execution Alpha Payload Policy

## Status
Design gate only.

## Shared Metadata Payload Policy
```ts
export interface MetadataAlphaPayloadPolicyV0 {
 payload_type: "metadata";
 max_items?: number;
 hard_max_items?: number;
 contains_file_content: false;
 contains_sensitive_data: false;
 contains_secret_values: false;
 contains_environment_values: false;
 redaction_required: boolean;
 support_docs_full_text_allowed: false;
}
```

## Defaults
- `payload_type: metadata`
- `max_items: 10`
- `hard_max_items: 25`
- `contains_file_content: false`
- `contains_sensitive_data: false`
- `contains_secret_values: false`
- `contains_environment_values: false`
- `support_docs_full_text_allowed: false`

## Redaction Policy
Redaction remains available for metadata targets even when the default target is low risk.

Examples where redaction may still apply:
- internal-only provenance path fragments
- sensitive host naming conventions
- metadata fields that could leak future secret locations

## Support-Doc Rule
Support docs may contribute explanation context, but metadata alpha v2 must not:
- return full support doc text
- treat support docs as executable targets
- convert support docs into runtime artifacts

## Payload Size Rule
Metadata alpha v2 must keep payloads small and bounded.

Recommended defaults:
- search default limit: 10
- search hard max: 25
- capability summary should return concise structured rows, not raw adapter dumps

## Design Boundary
This phase defines payload rules only.
