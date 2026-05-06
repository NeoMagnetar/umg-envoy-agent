import crypto from "node:crypto";
export function runtimeSpecId() {
    return `runtime_spec_${crypto.randomUUID().replace(/-/g, "")}`;
}
export function traceId() {
    return `trace_${crypto.randomUUID().replace(/-/g, "")}`;
}
export function matrixId() {
    return `matrix_${crypto.randomUUID().replace(/-/g, "")}`;
}
export function event(event, reason, artifact) {
    return {
        event,
        artifact_id: artifact?.id,
        reason,
        provenance: artifact ? {
            source_kind: artifact.source.source_kind,
            discovery_method: artifact.source.discovery_method,
            generated_from_lane: artifact.generated_from_lane,
            path: artifact.source.path
        } : undefined
    };
}
