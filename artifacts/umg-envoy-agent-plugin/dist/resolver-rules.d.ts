import type { ResolvedPaths } from "./types.js";
export type ResolverRuleSet = {
    persistentStacks: Array<{
        stackId: string;
        persistentBlockIds: string[];
        alwaysActiveBlockIds: string[];
    }>;
    cueGroups: Array<{
        cueGroupId: string;
        kind: "playful" | "analytical" | "formal" | "direct" | "expansive" | "list" | "narrative";
        phrases: string[];
        weight?: number;
    }>;
    modulationRules: Array<{
        ruleId: string;
        family: "persona" | "posture" | "format";
        cueKind: "playful" | "analytical" | "formal" | "direct" | "expansive" | "list" | "narrative";
        activateBlockId: string;
        suppressBlockIds: string[];
        compatibilityMode: "competing";
        priority: number;
    }>;
};
export declare function loadResolverRuleSet(paths: ResolvedPaths): ResolverRuleSet;
