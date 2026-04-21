import type { PluginConfig } from "./types.js";
import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";
export interface CompilerAdapterIssue extends ValidationIssue {
}
export interface CompilerAdapterResult {
    ok: boolean;
    issues: CompilerAdapterIssue[];
    compilerInput: {
        sleeve: any;
        triggerState: {
            activeTriggerIds: string[];
        };
    } | null;
    trace: {
        plannerSummary: {
            sleeveId: string;
            stackIds: string[];
            blockIds: string[];
            moltIds: string[];
            winnerPath: string[];
            triggerIds: string[];
        };
        adapterSummary: {
            stackIds: string[];
            blockIds: string[];
            activeTriggerIds: string[];
            provenance: string[];
        };
    };
    compileResult?: unknown;
}
export declare function adaptPlannerToCompilerInput(doc: UMGPathDocument): CompilerAdapterResult;
export declare function compilePlannerWithAdapter(doc: UMGPathDocument, config?: PluginConfig): Promise<CompilerAdapterResult>;
