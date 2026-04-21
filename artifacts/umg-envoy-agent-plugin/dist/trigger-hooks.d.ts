import type { ResolvedPaths } from "./types.js";
export type TriggerBehaviorKind = "exact_response" | "system_prompt";
export type TriggerBlockScope = "reply";
export type TriggerBlockMatchMode = "includes" | "exact";
export type TriggerBlockBehavior = {
    kind: "exact_response";
    content: string;
} | {
    kind: "system_prompt";
    prependSystemContext: string;
};
export type TriggerBlock = {
    id: string;
    name?: string;
    enabled: boolean;
    priority: number;
    scope: TriggerBlockScope;
    match: {
        mode: TriggerBlockMatchMode;
        phrases: string[];
    };
    behavior: TriggerBlockBehavior;
    sourcePath: string;
};
export type TriggerDiagnostics = {
    loadedTriggerIds: string[];
    invalidManifests: Array<{
        sourcePath: string;
        reason: string;
    }>;
    duplicateIdCollisions: Array<{
        id: string;
        sourcePaths: string[];
    }>;
};
export type TriggerCatalog = {
    blocks: TriggerBlock[];
    diagnostics: TriggerDiagnostics;
};
export type ResolvedTriggerBehavior = ({
    triggerId: string;
    priority: number;
} & TriggerBlockBehavior) | null;
export declare function loadTriggerCatalog(paths: ResolvedPaths): TriggerCatalog;
export declare function loadTriggerBlocks(paths: ResolvedPaths): TriggerBlock[];
export declare function resolveTriggerBehaviorFromUserText(text: string, triggerBlocks: TriggerBlock[]): ResolvedTriggerBehavior;
export declare function extractLatestUserText(messages: Array<{
    role?: unknown;
    content?: unknown;
}>): string;
