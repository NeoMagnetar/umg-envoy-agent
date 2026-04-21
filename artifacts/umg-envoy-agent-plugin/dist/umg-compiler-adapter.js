import path from "node:path";
import { pathToFileURL } from "node:url";
import { resolvePaths } from "./paths.js";
function push(issues, severity, code, message, path) {
    issues.push({ severity, code, message, path });
}
function collectPlannerIds(doc) {
    const stackIds = doc.stacks.map((stack) => stack.id);
    const blockIds = doc.stacks.flatMap((stack) => stack.blocks.map((block) => block.id));
    const moltIds = doc.stacks.flatMap((stack) => stack.blocks.flatMap((block) => block.molts.map((molt) => molt.id)));
    return { stackIds, blockIds, moltIds };
}
async function loadCompileSleeve(paths) {
    const compilerModuleUrl = pathToFileURL(path.join(paths.compilerV0Root, "dist", "index.js")).href;
    const compilerModule = await import(compilerModuleUrl);
    if (typeof compilerModule.compileSleeve !== "function") {
        throw new Error(`compileSleeve export not found in compiler module: ${compilerModuleUrl}`);
    }
    return compilerModule.compileSleeve;
}
function mapRoleToMoltType(role) {
    if (role === "D")
        return "directive";
    if (role === "P")
        return "primary";
    if (role === "S")
        return "subject";
    if (role === "H")
        return "philosophy";
    if (role === "B")
        return "blueprint";
    return "instruction";
}
export function adaptPlannerToCompilerInput(doc) {
    const issues = [];
    const plannerIds = collectPlannerIds(doc);
    if (doc.bundles.length > 0) {
        push(issues, "error", "ADAPTER_UNSUPPORTED_BUNDLES", "Planner bundles are not yet representable in current compiler-v0 adapter", "bundles");
    }
    if (doc.merges.length > 0) {
        push(issues, "error", "ADAPTER_UNSUPPORTED_MERGES", "Planner merges are not yet representable in current compiler-v0 adapter", "merges");
    }
    const blocks = doc.stacks.flatMap((stack) => stack.blocks.flatMap((block) => block.molts.map((molt, index) => ({
        id: `${block.id}::${molt.id}`,
        moltType: mapRoleToMoltType(molt.role),
        content: `${molt.state.toUpperCase()} ${molt.id}`,
        priorityOrder: index + 1,
        plannerSource: {
            stackId: stack.id,
            blockId: block.id,
            moltId: molt.id,
            state: molt.state,
            role: molt.role
        }
    }))));
    const stacks = doc.stacks.map((stack) => ({
        id: stack.id,
        name: stack.id,
        domainKey: stack.id,
        gate: {
            triggerIdsAny: doc.triggers
        },
        blockIds: stack.blocks.flatMap((block) => block.molts.map((molt) => `${block.id}::${molt.id}`)),
        plannerSource: {
            stackId: stack.id,
            blockIds: stack.blocks.map((block) => block.id)
        }
    }));
    const triggers = doc.triggers.map((id) => ({ id, name: id }));
    const triggerState = { activeTriggerIds: [...doc.triggers] };
    const sleeve = {
        id: `planner_adapted__${doc.sleeveId}`,
        name: `Planner Adapted ${doc.sleeveId}`,
        version: "v0-planner-adapter",
        blocks,
        stacks,
        triggers,
        plannerMeta: {
            sourceSleeveId: doc.sleeveId,
            winnerPath: doc.winners,
            compilerStages: doc.compiler.stages,
            provenance: ["planner-adapter", "compiler-v0-compatible"]
        }
    };
    return {
        ok: !issues.some((issue) => issue.severity === "error"),
        issues,
        compilerInput: issues.some((issue) => issue.severity === "error")
            ? null
            : { sleeve, triggerState },
        trace: {
            plannerSummary: {
                sleeveId: doc.sleeveId,
                stackIds: plannerIds.stackIds,
                blockIds: plannerIds.blockIds,
                moltIds: plannerIds.moltIds,
                winnerPath: doc.winners.map((winner) => `${winner.key}=${winner.value}`),
                triggerIds: [...doc.triggers]
            },
            adapterSummary: {
                stackIds: stacks.map((stack) => stack.id),
                blockIds: blocks.map((block) => block.id),
                activeTriggerIds: triggerState.activeTriggerIds,
                provenance: ["planner-adapter", "compiler-v0-compatible"]
            }
        }
    };
}
export async function compilePlannerWithAdapter(doc, config) {
    const paths = resolvePaths(config ?? {});
    const adapted = adaptPlannerToCompilerInput(doc);
    if (!adapted.ok || !adapted.compilerInput) {
        return adapted;
    }
    const compileSleeve = await loadCompileSleeve(paths);
    try {
        const compileResult = compileSleeve(adapted.compilerInput.sleeve, adapted.compilerInput.triggerState);
        return {
            ...adapted,
            compileResult
        };
    }
    catch (error) {
        return {
            ...adapted,
            ok: false,
            issues: [
                ...adapted.issues,
                {
                    severity: "error",
                    code: "ADAPTER_COMPILE_FAILED",
                    message: error instanceof Error ? error.message : String(error)
                }
            ]
        };
    }
}
