import { extractLatestUserText, loadTriggerCatalog } from "./trigger-hooks.js";
import { loadResolverRuleSet } from "./resolver-rules.js";
function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
function emptyActivationSet() {
    return {
        triggerIds: [],
        persistentBlockIds: [],
        transientBlockIds: [],
        suppressedBlockIds: [],
        expiredBlockIds: [],
        latentBlockIds: [],
        activeBlockIds: [],
        loadedStackIds: []
    };
}
function collectDetectedTriggerIds(text, triggerBlocks) {
    const normalized = text.toLowerCase().trim();
    if (!normalized)
        return [];
    const matched = [];
    for (const block of triggerBlocks) {
        const isMatch = block.match.phrases.some((phrase) => {
            if (block.match.mode === "exact") {
                return normalized === phrase;
            }
            return normalized.includes(phrase);
        });
        if (isMatch) {
            matched.push(block.id);
        }
    }
    return uniqueSorted(matched);
}
function detectCues(text, ruleSet) {
    const normalized = text.toLowerCase();
    const out = [];
    for (const cueGroup of ruleSet.cueGroups) {
        for (const phrase of cueGroup.phrases) {
            if (normalized.includes(phrase)) {
                out.push({
                    cueId: `${cueGroup.cueGroupId}.${phrase.replace(/[^a-z0-9]+/g, "_")}`,
                    cueGroupId: cueGroup.cueGroupId,
                    kind: cueGroup.kind,
                    matchedText: phrase,
                    weight: cueGroup.weight ?? 1
                });
            }
        }
    }
    return out;
}
function resolveRuntimeState(params) {
    const ruleSet = loadResolverRuleSet(params.paths);
    const detectedTriggerIds = collectDetectedTriggerIds(params.latestUserText, params.triggerBlocks);
    const detectedCues = detectCues(params.latestUserText, ruleSet);
    const resolverDecisions = [];
    const compatibilityOutcomes = [];
    const stateTransitions = [];
    const cueScores = {
        playful: detectedCues.filter((cue) => cue.kind === "playful").reduce((sum, cue) => sum + cue.weight, 0),
        analytical: detectedCues.filter((cue) => cue.kind === "analytical").reduce((sum, cue) => sum + cue.weight, 0),
        formal: detectedCues.filter((cue) => cue.kind === "formal").reduce((sum, cue) => sum + cue.weight, 0),
        direct: detectedCues.filter((cue) => cue.kind === "direct").reduce((sum, cue) => sum + cue.weight, 0),
        expansive: detectedCues.filter((cue) => cue.kind === "expansive").reduce((sum, cue) => sum + cue.weight, 0),
        list: detectedCues.filter((cue) => cue.kind === "list").reduce((sum, cue) => sum + cue.weight, 0),
        narrative: detectedCues.filter((cue) => cue.kind === "narrative").reduce((sum, cue) => sum + cue.weight, 0)
    };
    const loadedStackIds = ruleSet.persistentStacks.map((stack) => stack.stackId);
    const persistentBlockIds = uniqueSorted(ruleSet.persistentStacks.flatMap((stack) => stack.persistentBlockIds));
    const activeBlockIds = uniqueSorted(ruleSet.persistentStacks.flatMap((stack) => stack.alwaysActiveBlockIds));
    const latentBlockIds = persistentBlockIds.filter((id) => !activeBlockIds.includes(id));
    const suppressedBlockIds = [];
    const loadedPersistentState = {
        stacks: ruleSet.persistentStacks.map((stack) => ({
            stackId: stack.stackId,
            sourceType: "persistentStack",
            sourceId: stack.stackId,
            sourcePath: params.paths.resolverRulesPath,
            persistentBlockIds: [...stack.persistentBlockIds],
            alwaysActiveBlockIds: [...stack.alwaysActiveBlockIds]
        }))
    };
    for (const stack of ruleSet.persistentStacks) {
        resolverDecisions.push({
            kind: "activation",
            targetId: stack.stackId,
            reason: "Loaded persistent stack from authored resolver rule file.",
            sourceType: "persistentStack",
            sourceId: stack.stackId,
            sourcePath: params.paths.resolverRulesPath
        });
        for (const alwaysActiveId of stack.alwaysActiveBlockIds) {
            resolverDecisions.push({
                kind: "activation",
                targetId: alwaysActiveId,
                reason: "Always-active block from authored persistent stack remains active for the turn.",
                sourceType: "alwaysActiveBlock",
                sourceId: stack.stackId,
                sourcePath: params.paths.resolverRulesPath
            });
        }
    }
    const winningRulesByFamily = new Map();
    for (const family of ["persona", "posture", "format"]) {
        const familyWinner = ruleSet.modulationRules
            .filter((rule) => rule.family === family)
            .filter((rule) => cueScores[rule.cueKind] > 0)
            .sort((a, b) => {
            const scoreDiff = cueScores[b.cueKind] - cueScores[a.cueKind];
            if (scoreDiff !== 0)
                return scoreDiff;
            return b.priority - a.priority;
        })[0];
        if (familyWinner) {
            winningRulesByFamily.set(family, familyWinner);
        }
    }
    for (const winningRule of winningRulesByFamily.values()) {
        activeBlockIds.push(winningRule.activateBlockId);
        for (const suppressId of winningRule.suppressBlockIds) {
            suppressedBlockIds.push(suppressId);
        }
        resolverDecisions.push({
            kind: "activation",
            targetId: winningRule.activateBlockId,
            reason: `${winningRule.family} modulation selected by authored rule ${winningRule.ruleId}.`,
            sourceType: "modulationRule",
            sourceId: winningRule.ruleId,
            sourcePath: params.paths.resolverRulesPath,
            ruleId: winningRule.ruleId
        });
        for (const suppressId of winningRule.suppressBlockIds) {
            resolverDecisions.push({
                kind: "suppression",
                targetId: suppressId,
                reason: `Competing block suppressed by authored rule ${winningRule.ruleId}.`,
                sourceType: "modulationRule",
                sourceId: winningRule.ruleId,
                sourcePath: params.paths.resolverRulesPath,
                ruleId: winningRule.ruleId
            });
            stateTransitions.push({
                targetId: suppressId,
                from: "latent",
                to: "suppressed",
                reason: `Suppressed by authored modulation rule ${winningRule.ruleId}.`,
                sourceRuleId: winningRule.ruleId,
                sourcePath: params.paths.resolverRulesPath
            });
        }
        resolverDecisions.push({
            kind: "compatibility",
            targetId: `${winningRule.activateBlockId} > ${winningRule.suppressBlockIds.join("+")}`,
            reason: `Compatibility mode ${winningRule.compatibilityMode} resolved this family by authored rule priority.`,
            sourceType: "modulationRule",
            sourceId: winningRule.ruleId,
            sourcePath: params.paths.resolverRulesPath,
            ruleId: winningRule.ruleId
        });
        compatibilityOutcomes.push({
            mode: winningRule.compatibilityMode,
            participants: uniqueSorted([winningRule.activateBlockId, ...winningRule.suppressBlockIds]),
            winner: winningRule.activateBlockId,
            losers: uniqueSorted(winningRule.suppressBlockIds),
            sourceRuleId: winningRule.ruleId,
            sourcePath: params.paths.resolverRulesPath
        });
        stateTransitions.push({
            targetId: winningRule.activateBlockId,
            from: "latent",
            to: "activeForTurn",
            reason: `Activated by authored modulation rule ${winningRule.ruleId}.`,
            sourceRuleId: winningRule.ruleId,
            sourcePath: params.paths.resolverRulesPath
        });
    }
    const filteredLatent = latentBlockIds.filter((id) => !activeBlockIds.includes(id) && !suppressedBlockIds.includes(id));
    const detected = {
        ...emptyActivationSet(),
        triggerIds: detectedTriggerIds,
        persistentBlockIds: uniqueSorted(persistentBlockIds),
        latentBlockIds: uniqueSorted(latentBlockIds),
        loadedStackIds: uniqueSorted(loadedStackIds)
    };
    const activeForTurn = {
        ...emptyActivationSet(),
        triggerIds: detectedTriggerIds,
        persistentBlockIds: uniqueSorted(persistentBlockIds),
        suppressedBlockIds: uniqueSorted(suppressedBlockIds),
        activeBlockIds: uniqueSorted(activeBlockIds),
        latentBlockIds: uniqueSorted(filteredLatent),
        loadedStackIds: uniqueSorted(loadedStackIds)
    };
    return {
        ruleSource: {
            path: params.paths.resolverRulesPath,
            schema: "umg.resolver-rules.v1",
            kind: "resolver_rule_set"
        },
        detectedCues,
        resolverDecisions,
        loadedPersistentState,
        compatibilityOutcomes,
        stateTransitions,
        detected,
        activeForTurn
    };
}
export function buildRuntimeActivationPayload(params) {
    const triggerCatalog = loadTriggerCatalog(params.paths);
    const resolved = resolveRuntimeState({
        paths: params.paths,
        latestUserText: params.latestUserText,
        triggerBlocks: triggerCatalog.blocks
    });
    return {
        ...(params.sleeveId ? { sleeveId: params.sleeveId } : {}),
        triggerIds: resolved.activeForTurn.triggerIds,
        detected: resolved.detected,
        activeForTurn: resolved.activeForTurn,
        runtimeContext: {
            source: "latest-user-message",
            messageId: params.messageId ?? null,
            provenance: uniqueSorted(params.provenance ?? []),
            notes: params.notes ?? []
        }
    };
}
export function deriveCompilerV0TriggerState(payload, knownTriggerIds) {
    const candidateTriggerIds = uniqueSorted(payload.activeForTurn?.triggerIds?.length ? payload.activeForTurn.triggerIds : payload.triggerIds);
    const known = new Set((knownTriggerIds ?? []).filter(Boolean));
    const activeTriggerIds = known.size > 0
        ? candidateTriggerIds.filter((id) => known.has(id))
        : candidateTriggerIds;
    return {
        activeTriggerIds
    };
}
export function buildActivationTraceView(params) {
    const latestUserText = extractLatestUserText(Array.isArray(params.messages) ? params.messages : []);
    const triggerCatalog = loadTriggerCatalog(params.paths);
    const resolved = resolveRuntimeState({
        paths: params.paths,
        latestUserText,
        triggerBlocks: triggerCatalog.blocks
    });
    const runtimeActivationPayload = {
        ...(params.sleeveId ? { sleeveId: params.sleeveId } : {}),
        triggerIds: resolved.activeForTurn.triggerIds,
        detected: resolved.detected,
        activeForTurn: resolved.activeForTurn,
        runtimeContext: {
            source: "latest-user-message",
            messageId: params.messageId ?? null,
            provenance: uniqueSorted(params.provenance ?? []),
            notes: params.notes ?? []
        }
    };
    const compilerV0TriggerState = deriveCompilerV0TriggerState(runtimeActivationPayload, triggerCatalog.diagnostics.loadedTriggerIds);
    const activeForTurnIds = runtimeActivationPayload.activeForTurn?.triggerIds ?? [];
    const unknownRuntimeTriggerIds = uniqueSorted(activeForTurnIds.filter((id) => !triggerCatalog.diagnostics.loadedTriggerIds.includes(id)));
    return {
        latestUserText,
        resolverRuleSource: resolved.ruleSource,
        detectedCues: resolved.detectedCues,
        resolverDecisions: resolved.resolverDecisions,
        loadedPersistentState: resolved.loadedPersistentState,
        compatibilityOutcomes: resolved.compatibilityOutcomes,
        stateTransitions: resolved.stateTransitions,
        triggerBlocks: triggerCatalog.blocks.map((block) => ({
            id: block.id,
            priority: block.priority,
            sourcePath: block.sourcePath,
            phrases: [...block.match.phrases],
            matchMode: block.match.mode,
            behaviorKind: block.behavior.kind
        })),
        diagnostics: {
            ...triggerCatalog.diagnostics,
            unknownRuntimeTriggerIds
        },
        detectedCandidates: runtimeActivationPayload.detected,
        runtimeActivationPayload,
        compilerV0TriggerState
    };
}
