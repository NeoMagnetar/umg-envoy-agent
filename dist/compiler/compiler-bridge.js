import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveSleeveArtifacts } from "./artifact-resolver.js";
import { buildCanonicalIr } from "./canonical-ir-builder.js";
import { runCompilerProcess } from "./compiler-process.js";
import { loadSleeveFile } from "./sleeve-loader.js";
import { validateSleeveStructure } from "./sleeve-schema-validator.js";
function stripBom(raw) {
    return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
}
function readJson(filePath) {
    return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}
function summarizeLoadedSleeve(result) {
    return result;
}
function tempRootFromRequest(request) {
    if (request.outputDir) {
        return path.resolve(request.outputDir);
    }
    if (request.compilerTempRoot) {
        return path.resolve(request.compilerTempRoot);
    }
    return path.join(os.tmpdir(), "umg-envoy-agent", "compiler-bridge");
}
export async function runCompilerBridge(request) {
    if (!request.allowCompilerBridge) {
        return {
            ok: false,
            sleevePath: path.resolve(request.sleevePath),
            libraryRoot: path.resolve(request.libraryRoot),
            warnings: [],
            errors: ["compiler bridge is disabled unless allowCompilerBridge is true"],
            boundary: {
                compilerInvoked: false,
                relationMatrixEmitted: false,
                umgBlockLibraryModified: false,
                compilerRepoModified: false
            }
        };
    }
    const loaded = loadSleeveFile({ sleevePath: request.sleevePath, libraryRoot: request.libraryRoot });
    if (!loaded.ok || !loaded.loadedSleeve) {
        return {
            ok: false,
            sleevePath: loaded.sleevePath,
            libraryRoot: path.resolve(request.libraryRoot),
            warnings: loaded.warnings,
            errors: loaded.errors,
            boundary: {
                compilerInvoked: false,
                relationMatrixEmitted: false,
                umgBlockLibraryModified: false,
                compilerRepoModified: false
            }
        };
    }
    const validation = validateSleeveStructure(loaded.loadedSleeve);
    const artifactResolution = resolveSleeveArtifacts(request.libraryRoot, loaded.loadedSleeve);
    const tempRoot = tempRootFromRequest(request);
    const runRoot = request.outputDir ? tempRoot : path.join(tempRoot, `run-${Date.now()}`);
    const inputDir = path.join(runRoot, "input");
    const outputDir = path.join(runRoot, "output");
    const canonicalIrPath = path.join(inputDir, "resolved.ir.json");
    fs.mkdirSync(inputDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
    const irBuild = buildCanonicalIr({
        ...loaded,
        validation,
        artifactResolution,
        warnings: [...loaded.warnings, ...validation.warnings, ...artifactResolution.warnings],
        errors: [...loaded.errors, ...validation.errors, ...artifactResolution.errors]
    }, request.libraryRoot, canonicalIrPath);
    if (!irBuild.ok || !irBuild.canonicalIr) {
        return {
            ok: false,
            sleevePath: loaded.sleevePath,
            libraryRoot: path.resolve(request.libraryRoot),
            validation,
            artifactResolution,
            warnings: irBuild.warnings,
            errors: irBuild.errors,
            boundary: {
                compilerInvoked: false,
                relationMatrixEmitted: false,
                umgBlockLibraryModified: false,
                compilerRepoModified: false
            }
        };
    }
    fs.writeFileSync(canonicalIrPath, `${JSON.stringify(irBuild.canonicalIr, null, 2)}\n`, "utf8");
    const invocation = await runCompilerProcess(request, canonicalIrPath, outputDir);
    const runtimeSpecPath = path.join(outputDir, "runtime-spec.json");
    const tracePath = path.join(outputDir, "trace.json");
    const diagnosticsPath = path.join(outputDir, "diagnostics.json");
    const relationMatrixPath = path.join(outputDir, "relation-matrix.umg");
    const runtimeSpec = fs.existsSync(runtimeSpecPath) ? readJson(runtimeSpecPath) : undefined;
    const trace = fs.existsSync(tracePath) ? readJson(tracePath) : undefined;
    const diagnostics = fs.existsSync(diagnosticsPath) ? readJson(diagnosticsPath) : undefined;
    const relationMatrixEmitted = fs.existsSync(relationMatrixPath);
    const loadedSleeveSummary = summarizeLoadedSleeve({
        artifactId: loaded.loadedSleeve.identity?.artifact_id ?? null,
        routeCount: Array.isArray(loaded.loadedSleeve.sleeve?.routes) ? loaded.loadedSleeve.sleeve.routes.length : 0,
        dependencyCounts: irBuild.compilerInputPreview?.dependencyCounts ?? {
            sleeves: 0,
            neostacks: 0,
            bundles: 0,
            overlays: 0,
            schemas: 0
        }
    });
    return {
        ok: invocation.ok && Boolean(runtimeSpec) && Boolean(trace) && Boolean(diagnostics) && !relationMatrixEmitted,
        sleevePath: loaded.sleevePath,
        libraryRoot: path.resolve(request.libraryRoot),
        loadedSleeveSummary,
        validation,
        artifactResolution,
        canonicalIr: irBuild.canonicalIr,
        compilerInvocation: {
            ...invocation,
            stdoutSummary: invocation.stdout.trim().slice(0, 500),
            stderrSummary: invocation.stderr.trim().slice(0, 500)
        },
        runtimeSpec,
        trace,
        diagnostics,
        outputFiles: {
            canonicalIrPath,
            runtimeSpecPath: fs.existsSync(runtimeSpecPath) ? runtimeSpecPath : null,
            tracePath: fs.existsSync(tracePath) ? tracePath : null,
            diagnosticsPath: fs.existsSync(diagnosticsPath) ? diagnosticsPath : null
        },
        warnings: [...loaded.warnings, ...validation.warnings, ...artifactResolution.warnings],
        errors: [
            ...loaded.errors,
            ...validation.errors,
            ...artifactResolution.errors,
            ...(relationMatrixEmitted ? ["relation matrix output was emitted unexpectedly"] : []),
            ...(invocation.ok ? [] : ["compiler invocation failed or produced incomplete output"])
        ],
        boundary: {
            compilerInvoked: true,
            relationMatrixEmitted,
            umgBlockLibraryModified: false,
            compilerRepoModified: false
        }
    };
}
