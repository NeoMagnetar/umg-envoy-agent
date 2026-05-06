import type { RuntimeSpecSelectionEvent } from "./types.js";
import type { NormalizedArtifact } from "../resolver/block-library-config.js";
export declare function runtimeSpecId(): string;
export declare function traceId(): string;
export declare function matrixId(): string;
export declare function event(event: RuntimeSpecSelectionEvent["event"], reason: string, artifact?: NormalizedArtifact): RuntimeSpecSelectionEvent;
