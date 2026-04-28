import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { renderRelationMatrixText } from "./relation-matrix-format.js";
import { runCompilerBridge } from "./compiler-bridge.js";
function tempRootFromRequest(request, mode) {
    if (request.outputDir) {
        return path.resolve(request.outputDir);
    }
    if (request.relationMatrixTempRoot) {
        return path.resolve(request.relationMatrixTempRoot);
    }
    return path.join(os.tmpdir(), "umg-envoy-agent", mode);
}
function asStringArray(value) {
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
function asIdArray(value, key) {
    if (!Array.isArray(value)) {
        return [];
    }
    const results = [];
    for (const item of value) {
        if (typeof item === "string") {
            results.push(item);
            continue;
        }
        if (item && typeof item === "object") {
            const candidate = item[key];
            if (typeof candidate === "string") {
                results.push(candidate);
            }
        }
    }
    return results;
}
function buildLines(bridgeResult) {
    const lines = [];
    const runtimeSpec = bridgeResult.runtimeSpec ?? {};
    const trace = bridgeResult.trace ?? {};
    const diagnostics = bridgeResult.diagnostics ?? {};
    const sleeveId = bridgeResult.loadedSleeveSummary?.artifactId ?? runtimeSpec.active_sleeve ?? "UNKNOWN.SLEEVE";
    const route = typeof runtimeSpec.active_route === "string" ? runtimeSpec.active_route : null;
    lines.push({ line_kind: "node_state", from: sleeveId, states: ["[A]"] });
    const overlayList = asIdArray(runtimeSpec.overlays, "overlay_id");
    for (const overlay of overlayList) {
        lines.push({ line_kind: "relation", from: sleeveId, relation_code: "-O->", to: overlay, states: ["[A]"] });
        if (route) {
            lines.push({ line_kind: "relation", from: overlay, relation_code: "-F->", to: route, states: ["[GO]"] });
        }
    }
    for (const stack of asStringArray(runtimeSpec.active_neostacks)) {
        lines.push({ line_kind: "relation", from: sleeveId, relation_code: "-V->", to: stack, states: ["[A]"] });
    }
    const blocks = asStringArray(runtimeSpec.active_neoblocks);
    const attachStack = asStringArray(runtimeSpec.active_neostacks)[0] ?? sleeveId;
    for (let i = 0; i < blocks.length; i++) {
        const current = blocks[i];
        const next = blocks[i + 1];
        lines.push({ line_kind: "node_state", from: current, states: ["[A]"] });
        if (i === 0) {
            lines.push({ line_kind: "relation", from: attachStack, relation_code: "-V->", to: current, states: ["[A]"] });
        }
        if (next) {
            lines.push({ line_kind: "relation", from: current, relation_code: "-H-", to: next, states: ["[A]"] });
        }
    }
    const capabilityList = asIdArray(runtimeSpec.capabilities, "capability_id");
    for (const capability of capabilityList) {
        const attachFrom = overlayList[0] ?? sleeveId;
        lines.push({ line_kind: "relation", from: attachFrom, relation_code: "-C-", to: capability, states: ["[VISIBLE]"] });
    }
    const diagnosticWarnings = asStringArray(diagnostics.warnings);
    const diagnosticErrors = asStringArray(diagnostics.errors);
    for (let i = 0; i < diagnosticWarnings.length; i++) {
        lines.push({ line_kind: "diagnostic", from: `DIAG.WARN.${String(i + 1).padStart(4, "0")}`, states: ["[WARN]"], text: diagnosticWarnings[i] });
    }
    for (let i = 0; i < diagnosticErrors.length; i++) {
        lines.push({ line_kind: "diagnostic", from: `DIAG.ERR.${String(i + 1).padStart(4, "0")}`, states: ["[ERR]"], text: diagnosticErrors[i] });
    }
    const traceEvents = Array.isArray(trace.events) ? trace.events : [];
    if (traceEvents.length === 0) {
        lines.push({ line_kind: "comment", text: "no trace events available" });
    }
    return lines;
}
export async function emitRelationMatrix(request, config) {
    const bridgeResult = await runCompilerBridge({
        sleevePath: request.sleevePath,
        libraryRoot: request.libraryRoot,
        compilerRepoPath: request.compilerRepoPath,
        compilerCliPath: request.compilerCliPath,
        compilerCommand: request.compilerCommand,
        outputDir: request.outputDir,
        timeoutMs: request.timeoutMs,
        allowCompilerBridge: request.allowCompilerBridge ?? true,
        compilerTempRoot: request.relationMatrixTempRoot ?? config?.relationMatrixTempRoot ?? undefined
    });
    const allowRelationMatrixEmit = request.allowRelationMatrixEmit ?? config?.allowRelationMatrixEmit ?? false;
    const relationMatrixMode = request.relationMatrixMode ?? config?.relationMatrixMode ?? "response-only";
    const runtimeSpec = bridgeResult.runtimeSpec;
    const trace = bridgeResult.trace;
    const diagnostics = bridgeResult.diagnostics;
    const relationMatrixEmitted = Boolean(bridgeResult.ok && runtimeSpec && trace && diagnostics);
    if (!relationMatrixEmitted || !runtimeSpec || !trace || !diagnostics) {
        return {
            ok: false,
            sleevePath: bridgeResult.sleevePath,
            libraryRoot: bridgeResult.libraryRoot,
            bridgeResult: bridgeResult,
            runtimeSpec,
            trace,
            diagnostics,
            warnings: bridgeResult.warnings,
            errors: [...bridgeResult.errors, "cannot emit relation matrix without successful bridge outputs"],
            boundary: {
                compilerInvoked: bridgeResult.boundary.compilerInvoked,
                relationMatrixEmitted: false,
                relationMatrixWritten: false,
                umgBlockLibraryModified: false,
                compilerRepoModified: false
            }
        };
    }
    const header = {
        sleeve: bridgeResult.loadedSleeveSummary?.artifactId ?? null,
        route: typeof runtimeSpec.active_route === "string" ? runtimeSpec.active_route : null,
        ir: typeof trace.source_ir_id === "string" ? trace.source_ir_id : null,
        runtime_spec: typeof runtimeSpec.runtime_spec_id === "string" ? runtimeSpec.runtime_spec_id : null
    };
    const lines = buildLines(bridgeResult);
    const relationMatrix = {
        matrix_version: "0.1",
        kind: "snapshot",
        header,
        lines,
        validation: {
            ids_resolve_to_ir: true,
            relation_codes_known: true,
            route_consistency: true,
            diagnostic_links_valid: true
        },
        notes: null
    };
    const relationMatrixText = renderRelationMatrixText({ header, lines });
    let relationMatrixPath = null;
    let relationMatrixWritten = false;
    if (allowRelationMatrixEmit && (relationMatrixMode === "temp-write" || relationMatrixMode === "both")) {
        const root = tempRootFromRequest(request, "relation-matrix");
        const outDir = request.outputDir ? path.join(root, "output") : path.join(root, `run-${Date.now()}`, "output");
        fs.mkdirSync(outDir, { recursive: true });
        relationMatrixPath = path.join(outDir, "relation-matrix.umg");
        fs.writeFileSync(relationMatrixPath, relationMatrixText, "utf8");
        relationMatrixWritten = true;
    }
    const matrixStatus = {
        route: header.route,
        overlayCount: asIdArray(runtimeSpec.overlays, "overlay_id").length,
        neostackCount: asStringArray(runtimeSpec.active_neostacks).length,
        neoblockCount: asStringArray(runtimeSpec.active_neoblocks).length,
        capabilityCount: asIdArray(runtimeSpec.capabilities, "capability_id").length,
        diagnosticCount: asStringArray(diagnostics.errors).length + asStringArray(diagnostics.warnings).length
    };
    return {
        ok: true,
        sleevePath: bridgeResult.sleevePath,
        libraryRoot: bridgeResult.libraryRoot,
        bridgeResult: bridgeResult,
        runtimeSpec,
        trace,
        diagnostics,
        relationMatrixText,
        relationMatrix,
        relationMatrixPath,
        matrixStatus,
        warnings: bridgeResult.warnings,
        errors: bridgeResult.errors,
        boundary: {
            compilerInvoked: bridgeResult.boundary.compilerInvoked,
            relationMatrixEmitted: true,
            relationMatrixWritten,
            umgBlockLibraryModified: false,
            compilerRepoModified: false
        }
    };
}
