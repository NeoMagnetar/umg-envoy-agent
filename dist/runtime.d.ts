import type { ActiveSleeveState, ActiveStackState, CompilerInvocationResult, PromotionPreview, RuntimeValidationResult, SleeveCatalog, SleeveCatalogEntry } from "./models.js";
import type { PluginConfig, ResolvedPaths } from "./types.js";
export declare function readSleeveCatalog(paths: ResolvedPaths): SleeveCatalog;
export declare function listSleeves(paths: ResolvedPaths): Array<SleeveCatalogEntry & {
    resolvedSourcePath: string | null;
}>;
export declare function resolveSleeveSourcePath(paths: ResolvedPaths, sleeveId: string): string;
export declare function readActiveSleeve(paths: ResolvedPaths): ActiveSleeveState;
export declare function readActiveStack(paths: ResolvedPaths): ActiveStackState;
export declare function compareSleeves(paths: ResolvedPaths, leftSleeveId: string, rightSleeveId: string): Record<string, unknown>;
export declare function summarizeActiveRuntime(paths: ResolvedPaths): Record<string, unknown>;
export declare function validateCompiledRuntime(compiled: any): RuntimeValidationResult;
export declare function compileSleeveById(paths: ResolvedPaths, sleeveId: string, options?: {
    pretty?: boolean;
}): Promise<CompilerInvocationResult>;
export declare function previewPromotion(paths: ResolvedPaths, compiledOutputPath: string, sleeveId: string, promotionLabel?: string): PromotionPreview;
export declare function promoteCompiledRuntime(paths: ResolvedPaths, config: PluginConfig, compiledOutputPath: string, sleeveId: string, promotionLabel?: string): {
    activeSleevePath: string;
    activeStackPath: string;
    promotedAt: string;
    backupDir: string;
    validation: RuntimeValidationResult;
};
