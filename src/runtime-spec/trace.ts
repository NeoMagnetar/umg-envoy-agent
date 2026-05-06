import crypto from "node:crypto";
import type { RuntimeSpecSelectionEvent } from "./types.js";
import type { NormalizedArtifact } from "../resolver/block-library-config.js";

export function runtimeSpecId(): string {
  return `runtime_spec_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function traceId(): string {
  return `trace_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function matrixId(): string {
  return `matrix_${crypto.randomUUID().replace(/-/g, "")}`;
}

export function event(event: RuntimeSpecSelectionEvent["event"], reason: string, artifact?: NormalizedArtifact): RuntimeSpecSelectionEvent {
  return {
    event,
    artifact_id: artifact?.id,
    reason,
    provenance: artifact ? {
      source_kind: artifact.source.source_kind,
      discovery_method: artifact.source.discovery_method,
      generated_from_lane: (artifact as unknown as Record<string, unknown>).generated_from_lane as string | undefined,
      path: artifact.source.path
    } : undefined
  };
}
