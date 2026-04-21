import type { ActivationTraceView, RuntimeActivationPayload } from "./activation-runtime.js";
import type { BuilderOptions, UMGPathDocument } from "./umg-path-types.js";
export declare function buildUMGPathDocumentFromRuntime(params: {
    trace: ActivationTraceView;
    payload: RuntimeActivationPayload;
    options: BuilderOptions;
}): UMGPathDocument;
