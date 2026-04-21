import type { ResolvedPaths } from "./types.js";
import type { UMGPathDocument, ValidationIssue } from "./umg-path-types.js";
export interface LegendResolverIndex {
    sleeveIds: Set<string>;
    stackIds: Set<string>;
    blockIds: Set<string>;
    moltIds: Set<string>;
    libraryEntryIds: Set<string>;
    triggerIds: Set<string>;
}
export interface LegendResolutionSummary {
    sleevesCataloged: number;
    stackCount: number;
    blockCount: number;
    moltCount: number;
    libraryEntryCount: number;
    triggerCount: number;
}
export interface LegendResolutionResult {
    ok: boolean;
    issues: ValidationIssue[];
    summary: LegendResolutionSummary;
}
export declare function buildLegendResolverIndex(paths: ResolvedPaths): LegendResolverIndex;
export declare function summarizeLegendResolverIndex(index: LegendResolverIndex): LegendResolutionSummary;
export declare function validateUMGPathAgainstLegend(doc: UMGPathDocument, index: LegendResolverIndex): ValidationIssue[];
export declare function resolveUMGPathAgainstLegend(paths: ResolvedPaths, doc: UMGPathDocument): LegendResolutionResult;
