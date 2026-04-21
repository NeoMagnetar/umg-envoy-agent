function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}
function inferRole(id, legend) {
    const fromLegend = legend?.blockRoleMap?.[id];
    if (fromLegend)
        return fromLegend;
    const normalized = id.toLowerCase();
    if (normalized.includes("dir") || normalized.includes("directive"))
        return "D";
    if (normalized.includes("ins") || normalized.includes("instruction"))
        return "I";
    if (normalized.includes("sub") || normalized.includes("subject"))
        return "S";
    if (normalized.includes("pri") || normalized.includes("primary"))
        return "P";
    if (normalized.includes("phi") || normalized.includes("philosophy"))
        return "H";
    if (normalized.includes("bp") || normalized.includes("blueprint") || normalized.includes("fmt"))
        return "B";
    if (normalized.includes("trigger"))
        return "T";
    return "I";
}
function stateForId(id, payload) {
    if (payload.activeForTurn.activeBlockIds.includes(id))
        return "active";
    if (payload.activeForTurn.suppressedBlockIds.includes(id))
        return "suppressed";
    if (payload.activeForTurn.latentBlockIds.includes(id))
        return "latent";
    return "off";
}
function syntheticNeoBlockId(stackId, ordinal) {
    return `#nb.auto.${stackId.replace(/[^a-zA-Z0-9_.-]+/g, "_")}.${ordinal}`;
}
function toStackMap(payload, legend) {
    const grouped = new Map();
    const all = unique([
        ...payload.activeForTurn.activeBlockIds,
        ...payload.activeForTurn.suppressedBlockIds,
        ...payload.activeForTurn.latentBlockIds,
        ...payload.detected.persistentBlockIds,
        ...payload.detected.transientBlockIds
    ]);
    for (const blockId of all) {
        const mappedStack = legend?.neoBlockToStack?.[legend?.blockToNeoBlock?.[blockId] ?? ""];
        const fallback = payload.activeForTurn.loadedStackIds[0] ?? "@stk.unknown";
        const stackId = mappedStack ?? fallback;
        const current = grouped.get(stackId) ?? [];
        current.push(blockId);
        grouped.set(stackId, current);
    }
    for (const stackId of payload.activeForTurn.loadedStackIds) {
        if (!grouped.has(stackId))
            grouped.set(stackId, []);
    }
    return grouped;
}
function buildStacks(payload, legend) {
    const stackMap = toStackMap(payload, legend);
    const stacks = [];
    for (const [stackId, blockIds] of stackMap.entries()) {
        const blockGroups = new Map();
        for (const blockId of blockIds) {
            const neoBlockId = legend?.blockToNeoBlock?.[blockId] ?? syntheticNeoBlockId(stackId, 1);
            const current = blockGroups.get(neoBlockId) ?? [];
            current.push(blockId);
            blockGroups.set(neoBlockId, current);
        }
        const blocks = [];
        for (const [neoBlockId, memberIds] of blockGroups.entries()) {
            const molts = memberIds.map((memberId) => ({
                state: stateForId(memberId, payload),
                role: inferRole(memberId, legend),
                id: memberId
            }));
            blocks.push({ id: neoBlockId, molts });
        }
        stacks.push({ id: stackId, blocks });
    }
    return stacks.sort((a, b) => a.id.localeCompare(b.id));
}
function buildWinners(trace) {
    const winners = [];
    for (const outcome of trace.compatibilityOutcomes) {
        winners.push({
            key: outcome.mode,
            value: outcome.winner
        });
    }
    return winners;
}
export function buildUMGPathDocumentFromRuntime(params) {
    const { trace, payload, options } = params;
    const compilerStages = options.compilerStages ?? ["validate", "normalize", "merge", "bundle", "govern", "compile", "emit"];
    return {
        use: options.use,
        aim: options.aim,
        need: options.need ?? [],
        sleeveId: options.sleeveId ?? payload.sleeveId ?? "slv.unknown",
        triggers: unique(payload.triggerIds),
        gates: unique(trace.detectedCues.map((cue) => cue.kind)).map((kind) => ({
            state: "active",
            id: `g.${kind}`
        })),
        loadedStacks: unique(payload.activeForTurn.loadedStackIds),
        stacks: buildStacks(payload, options.legend),
        relationships: [],
        bundles: [],
        merges: [],
        winners: buildWinners(trace),
        compiler: { stages: compilerStages }
    };
}
