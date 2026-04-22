import { extractLatestUserText, loadTriggerCatalog } from "./trigger-hooks.js";
function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}
function emptyActivationSet() {
    return {
        triggerIds: [],
        persistentBlockIds: [],
        transientBlockIds: [],
        suppressedBlockIds: [],
        expiredBlockIds: []
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
export function buildRuntimeActivationPayload(params) {
    const triggerCatalog = loadTriggerCatalog(params.paths);
    const detectedTriggerIds = collectDetectedTriggerIds(params.latestUserText, triggerCatalog.blocks);
    const detected = {
        ...emptyActivationSet(),
        triggerIds: detectedTriggerIds
    };
    const activeForTurn = {
        ...emptyActivationSet(),
        triggerIds: detectedTriggerIds
    };
    return {
        ...(params.sleeveId ? { sleeveId: params.sleeveId } : {}),
        triggerIds: detectedTriggerIds,
        detected,
        activeForTurn,
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
    const runtimeActivationPayload = buildRuntimeActivationPayload({
        paths: params.paths,
        latestUserText,
        sleeveId: params.sleeveId,
        messageId: params.messageId,
        provenance: params.provenance,
        notes: params.notes
    });
    const compilerV0TriggerState = deriveCompilerV0TriggerState(runtimeActivationPayload, triggerCatalog.diagnostics.loadedTriggerIds);
    const activeForTurnIds = runtimeActivationPayload.activeForTurn?.triggerIds ?? [];
    const unknownRuntimeTriggerIds = uniqueSorted(activeForTurnIds.filter((id) => !triggerCatalog.diagnostics.loadedTriggerIds.includes(id)));
    return {
        latestUserText,
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
