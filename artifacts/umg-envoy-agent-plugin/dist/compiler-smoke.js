import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { buildActivationTraceView, buildRuntimeActivationPayload, deriveCompilerV0TriggerState } from "./activation-runtime.js";
async function loadCompilerCompileSleeve(paths) {
    const compilerModuleUrl = pathToFileURL(path.join(paths.compilerV0Root, "dist", "index.js")).href;
    const compilerModule = await import(compilerModuleUrl);
    if (typeof compilerModule.compileSleeve !== "function") {
        throw new Error(`compileSleeve export not found in compiler module: ${compilerModuleUrl}`);
    }
    return compilerModule.compileSleeve;
}
function loadSampleSleevePayload(paths) {
    const sampleSleevePath = path.join(paths.pluginRoot, "validation", "compiler-smoke-umg-trigger-sample.json");
    const raw = fs.readFileSync(sampleSleevePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed?.sleeve) {
        throw new Error(`Sample sleeve payload missing sleeve field: ${sampleSleevePath}`);
    }
    return {
        sampleSleevePath,
        sleeve: parsed.sleeve
    };
}
export async function runCompilerSmokeTest(params) {
    const { sampleSleevePath, sleeve } = loadSampleSleevePayload(params.paths);
    const compileSleeve = await loadCompilerCompileSleeve(params.paths);
    const activationTrace = buildActivationTraceView({
        paths: params.paths,
        messages: [{ role: "user", content: params.message }],
        sleeveId: params.sleeveId,
        provenance: ["tool:umg_envoy_compiler_smoke_test"],
        notes: ["phase-c compiler smoke test lane"]
    });
    const runtimeActivationPayload = buildRuntimeActivationPayload({
        paths: params.paths,
        latestUserText: params.message,
        sleeveId: params.sleeveId,
        provenance: ["tool:umg_envoy_compiler_smoke_test"],
        notes: ["phase-c compiler smoke test lane"]
    });
    const compilerV0TriggerState = deriveCompilerV0TriggerState(runtimeActivationPayload, activationTrace.diagnostics.loadedTriggerIds);
    const compileResult = compileSleeve(sleeve, compilerV0TriggerState);
    return {
        sampleSleevePath,
        sampleSleeveId: typeof sleeve?.id === "string" ? sleeve.id : "<unknown>",
        inputMessage: params.message,
        activationTrace,
        runtimeActivationPayload,
        compilerV0TriggerState,
        compileResult,
        summary: {
            matchedTriggerIds: Array.isArray(compileResult?.runtime?.matchedTriggerIds) ? compileResult.runtime.matchedTriggerIds : [],
            activeStackIds: Array.isArray(compileResult?.runtime?.activeStackIds) ? compileResult.runtime.activeStackIds : [],
            neoBlockIds: Array.isArray(compileResult?.runtime?.neoBlocks)
                ? compileResult.runtime.neoBlocks.map((entry) => entry?.id).filter((id) => typeof id === "string")
                : [],
            hasErrors: Boolean(compileResult?.hasErrors),
            traceEventCount: Array.isArray(compileResult?.trace?.events) ? compileResult.trace.events.length : 0
        }
    };
}
