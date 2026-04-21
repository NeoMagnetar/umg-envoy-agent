import { buildActivationTraceView, buildRuntimeActivationPayload } from "./activation-runtime.js";
import { resolvePaths } from "./paths.js";
import { resolveUMGPathAgainstLegend } from "./umg-legend-resolver.js";
import { summarizeValidationIssues, validateUMGPath } from "./umg-path-validator.js";
import { alignRuntimeId, collectManyToOneMappings, loadRuntimeLegendAlignment } from "./umg-runtime-legend-alignment.js";
function summarizeIssues(issues) {
    return summarizeValidationIssues(issues);
}
function inferRole(id) {
    const normalized = id.toLowerCase();
    if (normalized.startsWith("dir"))
        return "D";
    if (normalized.startsWith("inst"))
        return "I";
    if (normalized.startsWith("trg"))
        return "T";
    if (normalized.startsWith("aim"))
        return "S";
    if (normalized.startsWith("need"))
        return "S";
    if (normalized.startsWith("use"))
        return "S";
    if (normalized.startsWith("prim"))
        return "P";
    if (normalized.startsWith("phi"))
        return "H";
    if (normalized.startsWith("bp"))
        return "B";
    return "I";
}
function stateForEmittedId(id, payload) {
    if (payload.activeForTurn.activeBlockIds.includes(id))
        return "active";
    if (payload.activeForTurn.suppressedBlockIds.includes(id))
        return "suppressed";
    if (payload.activeForTurn.latentBlockIds.includes(id))
        return "latent";
    return "off";
}
function dedupeAlignment(entries) {
    const seen = new Set();
    const out = [];
    for (const entry of entries) {
        const key = `${entry.kind}:${entry.emittedId}:${entry.resolvedId}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        out.push(entry);
    }
    return out;
}
function buildAlignedPlannerDoc(payload, input, alignmentTrace) {
    const stackEntries = dedupeAlignment(alignmentTrace.filter((item) => item.kind === "stack"));
    const blockEntries = dedupeAlignment(alignmentTrace.filter((item) => item.kind === "block"));
    const moltEntries = dedupeAlignment(alignmentTrace.filter((item) => item.kind === "molt"));
    const blockByResolved = new Map();
    for (const entry of blockEntries) {
        const current = blockByResolved.get(entry.resolvedId) ?? [];
        current.push(entry);
        blockByResolved.set(entry.resolvedId, current);
    }
    const moltByEmitted = new Map();
    for (const entry of moltEntries) {
        if (!moltByEmitted.has(entry.emittedId)) {
            moltByEmitted.set(entry.emittedId, entry);
        }
    }
    const stacks = [];
    for (const stackEntry of stackEntries) {
        const relevantBlocks = blockEntries.filter((entry) => {
            if (stackEntry.resolvedId === "S.MOD.01")
                return entry.emittedId.startsWith("block.persona.");
            if (stackEntry.resolvedId === "S.MOD.02")
                return entry.emittedId.startsWith("block.posture.");
            if (stackEntry.resolvedId === "S.MOD.03")
                return entry.emittedId.startsWith("block.format.");
            return false;
        });
        const blocks = [];
        const seenBlocks = new Set();
        for (const blockEntry of relevantBlocks) {
            if (seenBlocks.has(blockEntry.resolvedId))
                continue;
            seenBlocks.add(blockEntry.resolvedId);
            const contributing = blockByResolved.get(blockEntry.resolvedId) ?? [blockEntry];
            const molts = [];
            for (const contributor of contributing) {
                const molt = moltByEmitted.get(contributor.emittedId);
                if (!molt)
                    continue;
                if (molts.some((item) => item.id === molt.resolvedId))
                    continue;
                molts.push({
                    state: stateForEmittedId(contributor.emittedId, payload),
                    role: inferRole(molt.resolvedId),
                    id: molt.resolvedId
                });
            }
            if (molts.length > 0) {
                blocks.push({ id: blockEntry.resolvedId, molts });
            }
        }
        if (blocks.length > 0) {
            stacks.push({ id: stackEntry.resolvedId, blocks });
        }
    }
    const triggerState = payload.triggerIds.length > 0
        ? "matched"
        : input.message.trim().length > 0
            ? "neutral"
            : "omitted";
    const winnerBlock = blockEntries.find((entry) => entry.intent === "canon_candidate") ?? blockEntries[0];
    const winnerMolt = winnerBlock ? moltByEmitted.get(winnerBlock.emittedId) : undefined;
    return {
        use: input.use ?? "build_live_runtime_path",
        aim: input.aim ?? "deterministic_runtime_planner_route",
        need: [
            ...(input.need ?? ["structural_validity", "semantic_resolution", "traceable_handoff"]),
            `trigger_state:${triggerState}`
        ],
        sleeveId: input.sleeveId ?? payload.sleeveId ?? "sample-basic-minimal",
        triggers: [...payload.triggerIds],
        gates: [],
        loadedStacks: stackEntries.map((item) => item.resolvedId),
        stacks,
        relationships: [],
        bundles: [],
        merges: [],
        winners: winnerBlock && winnerMolt
            ? [{ key: "chain", value: `${winnerBlock.resolvedId}>${winnerMolt.resolvedId}` }]
            : [],
        compiler: { stages: ["validate", "normalize", "merge", "bundle", "govern", "compile", "emit"] }
    };
}
export function buildPlannerFromRuntimeContext(params) {
    const { paths, input } = params;
    const trace = buildActivationTraceView({
        paths,
        messages: [{ role: "user", content: input.message }],
        sleeveId: input.sleeveId,
        messageId: input.messageId ?? null,
        provenance: input.provenance ?? ["runtime-planner"],
        notes: input.notes ?? ["stage-4 deterministic runtime planner build"]
    });
    const payload = buildRuntimeActivationPayload({
        paths,
        latestUserText: input.message,
        sleeveId: input.sleeveId,
        messageId: input.messageId ?? null,
        provenance: input.provenance ?? ["runtime-planner"],
        notes: input.notes ?? ["stage-4 deterministic runtime planner build"]
    });
    const alignment = loadRuntimeLegendAlignment(paths);
    const alignmentTrace = [
        ...payload.activeForTurn.loadedStackIds.map((id) => alignRuntimeId("stack", id, alignment)),
        ...payload.activeForTurn.activeBlockIds.map((id) => alignRuntimeId("block", id, alignment)),
        ...payload.activeForTurn.latentBlockIds.map((id) => alignRuntimeId("block", id, alignment)),
        ...payload.activeForTurn.suppressedBlockIds.map((id) => alignRuntimeId("block", id, alignment)),
        ...payload.activeForTurn.activeBlockIds.map((id) => alignRuntimeId("molt", id, alignment)),
        ...payload.activeForTurn.latentBlockIds.map((id) => alignRuntimeId("molt", id, alignment)),
        ...payload.activeForTurn.suppressedBlockIds.map((id) => alignRuntimeId("molt", id, alignment))
    ];
    const doc = buildAlignedPlannerDoc(payload, input, alignmentTrace);
    const structuralIssues = validateUMGPath(doc);
    const semanticResult = resolveUMGPathAgainstLegend(paths, doc);
    const issues = [...structuralIssues, ...semanticResult.issues];
    const manyToOneWarnings = collectManyToOneMappings(alignmentTrace)
        .map((item) => `${item.kind}:${item.emittedId}->${item.resolvedId} mode=${item.mode} targetKind=${item.targetKind} intent=${item.intent} sources=${item.cardinality.emittedSourceCount}`);
    const triggerState = payload.triggerIds.length > 0
        ? "matched"
        : input.message.trim().length > 0
            ? "neutral"
            : "omitted";
    return {
        doc,
        trace,
        payload,
        issues,
        alignmentTrace,
        structural: summarizeIssues(structuralIssues),
        semantic: summarizeIssues(semanticResult.issues),
        plannerTrace: {
            sourceMessage: input.message,
            resolvedSleeveId: doc.sleeveId,
            loadedStacks: [...payload.activeForTurn.loadedStackIds],
            activeBlocks: [...payload.activeForTurn.activeBlockIds],
            latentBlocks: [...payload.activeForTurn.latentBlockIds],
            suppressedBlocks: [...payload.activeForTurn.suppressedBlockIds],
            triggerIds: [...payload.triggerIds],
            cueKinds: trace.detectedCues.map((cue) => cue.kind),
            winnerKeys: doc.winners.map((winner) => winner.key),
            alignedStacks: alignmentTrace.filter((item) => item.kind === "stack").map((item) => `${item.emittedId}->${item.resolvedId}[${item.status}|${item.mode}|${item.targetKind}|${item.intent}]`),
            alignedBlocks: alignmentTrace.filter((item) => item.kind === "block").map((item) => `${item.emittedId}->${item.resolvedId}[${item.status}|${item.mode}|${item.targetKind}|${item.intent}]`),
            manyToOneWarnings,
            triggerState
        }
    };
}
export function buildPlannerFromRuntimeMessage(input, config) {
    const paths = resolvePaths(config ?? {});
    return buildPlannerFromRuntimeContext({ paths, input });
}
