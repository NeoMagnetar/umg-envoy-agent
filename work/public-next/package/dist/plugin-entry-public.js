import fs from "node:fs";
import { Type } from "@sinclair/typebox";
import { parseUMGPath } from "./umg-path-parser.js";
import { renderUMGPath } from "./umg-path-renderer.js";
import { validateUMGPath } from "./umg-path-validator.js";
import { buildPublicPath } from "./public-path-builder.js";
import { inspectRealLibraryPublicCuratedSleeve, resolveRealLibraryPublicCurated } from "./real-library-resolver.js";
import { getCurrentSleeveStatus, getSleeveTree, inspectNeoStack, inspectNeoBlock, inspectMoltBlock, getRuntimeIrPath, getRuntimeIrMatrixFull, renderResponseEnvelopeDraft } from "./umg-graph-resolver.js";
function effectiveConfig(config) {
    return {
        allowRuntimeWrites: false,
        contentMode: "bundled-public",
        compilerMode: "public-readonly",
        debug: false,
        defaultSleeveId: "public-basic-envoy",
        ...config
    };
}
function packageRootFromModule(metaUrl) {
    const moduleDir = new URL(".", metaUrl).pathname.replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
    const candidateA = new URL("../", metaUrl).pathname.replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
    const candidateB = new URL("../../", metaUrl).pathname.replace(/^\/[A-Za-z]:/, (m) => m.slice(1));
    if (fs.existsSync(`${candidateA}public-content`) || fs.existsSync(`${candidateA}\\public-content`))
        return candidateA;
    return candidateB;
}
function publicContentRoot(metaUrl = import.meta.url) {
    const root = packageRootFromModule(metaUrl).replace(/[\\/]$/, "");
    return `${root}/public-content`.replace(/\//g, "\\");
}
function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
function listJsonFiles(dir) {
    return fs.readdirSync(dir)
        .filter((name) => name.endsWith(".json"))
        .sort()
        .map((name) => `${dir}\\${name}`);
}
function loadBlocks(root) {
    return listJsonFiles(`${root}\\blocks`).map((file) => readJson(file));
}
function loadSleeves(root) {
    return listJsonFiles(`${root}\\sleeves`).map((file) => readJson(file));
}
function loadSleeveById(root, sleeveId) {
    return loadSleeves(root).find((sleeve) => sleeve.sleeve_id === sleeveId);
}
function loadBlockMap(root) {
    return new Map(loadBlocks(root).map((block) => [block.block_id, block]));
}
function summarizeBlockLibraries(root) {
    const blocks = loadBlocks(root);
    const byKind = {};
    for (const block of blocks) {
        byKind[block.kind] = (byKind[block.kind] ?? 0) + 1;
    }
    return {
        totalBlocks: blocks.length,
        byKind,
        blockIds: blocks.map((block) => block.block_id)
    };
}
function validateRuntimeOutput(input) {
    const errors = [];
    const warnings = [];
    const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
    if (!isRecord(input)) {
        return { ok: false, valid: false, errors: ["runtime output must be an object"], warnings: [] };
    }
    for (const key of ["runtimespec_id", "sleeve_id", "snap_id", "primary_shell_block_id"]) {
        if (typeof input[key] !== "string" || input[key].trim() === "") {
            errors.push(`missing required field: ${key}`);
        }
    }
    for (const key of ["active_blocks", "prompt_parts", "constraints", "tool_requests", "errors", "warnings"]) {
        if (!Array.isArray(input[key])) {
            errors.push(`${key} must be an array`);
        }
    }
    for (const key of ["strategy", "context", "values", "format"]) {
        if (!isRecord(input[key])) {
            errors.push(`${key} must be an object`);
        }
    }
    if (Array.isArray(input.active_blocks) && input.active_blocks.some((entry) => typeof entry !== "string")) {
        errors.push("active block list is valid only when all entries are strings");
    }
    if (Array.isArray(input.prompt_parts)) {
        for (const part of input.prompt_parts) {
            if (!isRecord(part)) {
                errors.push("prompt_parts entries must be objects");
                break;
            }
            if (typeof part.block_id !== "string" || typeof part.kind !== "string" || typeof part.text !== "string") {
                errors.push("prompt_parts entries must include block_id, kind, and text");
                break;
            }
            if (typeof part.authority !== "number") {
                errors.push("prompt_parts entries must include numeric authority");
                break;
            }
        }
    }
    if (typeof input.primary_shell_block_id === "string" && Array.isArray(input.active_blocks) && !input.active_blocks.includes(input.primary_shell_block_id)) {
        warnings.push("primary shell exists but is not present in active_blocks");
    }
    return {
        ok: errors.length === 0,
        valid: errors.length === 0,
        errors,
        warnings
    };
}
const KIND_ORDER = {
    primary: 0,
    directive: 1,
    instruction: 2,
    subject: 3,
    philosophy: 4,
    blueprint: 5,
    trigger: 6
};
function compileSleeveReadonly(sleeveId, _config, metaUrl = import.meta.url) {
    const root = publicContentRoot(metaUrl);
    const sleeve = loadSleeveById(root, sleeveId);
    if (!sleeve) {
        throw new Error(`Unknown sleeve: ${sleeveId}`);
    }
    const blockMap = loadBlockMap(root);
    const enabledRefs = sleeve.block_refs.filter((ref) => ref.enabled !== false);
    const activeBlocks = enabledRefs.map((ref) => ref.block_id);
    const promptParts = enabledRefs
        .map((ref) => blockMap.get(ref.block_id))
        .filter((block) => block !== undefined && block.enabled !== false)
        .sort((a, b) => a.authority - b.authority || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.block_id.localeCompare(b.block_id))
        .map((block) => ({
        block_id: block.block_id,
        kind: block.kind,
        authority: block.authority,
        text: block.text
    }));
    const errors = enabledRefs.filter((ref) => !blockMap.has(ref.block_id)).map((ref) => `missing block reference: ${ref.block_id}`);
    const warnings = sleeve.block_refs.filter((ref) => ref.enabled === false).map((ref) => `disabled block skipped: ${ref.block_id}`);
    const runtimeSpec = {
        runtimespec_id: `runtime-${sleeve.sleeve_id}`,
        sleeve_id: sleeve.sleeve_id,
        snap_id: sleeve.snap_id ?? "default",
        primary_shell_block_id: sleeve.primary_shell_block_id,
        active_blocks: activeBlocks,
        prompt_parts: promptParts,
        strategy: sleeve.strategy ?? {},
        constraints: sleeve.constraints ?? [],
        context: sleeve.context ?? {},
        values: sleeve.values ?? {},
        format: sleeve.format ?? {},
        tool_requests: sleeve.tool_requests ?? [],
        errors,
        warnings
    };
    const validation = validateRuntimeOutput(runtimeSpec);
    runtimeSpec.errors.push(...validation.errors.filter((entry) => !runtimeSpec.errors.includes(entry)));
    runtimeSpec.warnings.push(...validation.warnings.filter((entry) => !runtimeSpec.warnings.includes(entry)));
    return {
        ok: runtimeSpec.errors.length === 0,
        sleeveId: sleeve.sleeve_id,
        runtimeSpec
    };
}
function runPublicSmoke(metaUrl = import.meta.url) {
    const root = publicContentRoot(metaUrl);
    const blocks = loadBlocks(root);
    const sleeves = loadSleeves(root);
    const compile = compileSleeveReadonly("public-basic-envoy", undefined, metaUrl);
    const validExample = validateRuntimeOutput(readJson(`${root}\\examples\\valid-runtime-output.json`));
    const invalidExample = validateRuntimeOutput(readJson(`${root}\\examples\\invalid-runtime-output.json`));
    const errors = [];
    if (!fs.existsSync(root))
        errors.push("public-content root missing");
    if (!fs.existsSync(`${root}\\blocks`))
        errors.push("blocks folder missing");
    if (!fs.existsSync(`${root}\\sleeves`))
        errors.push("sleeves folder missing");
    if (blocks.length < 7)
        errors.push("expected at least 7 sample blocks");
    if (sleeves.length < 2)
        errors.push("expected at least 2 sample sleeves");
    if (!compile.ok)
        errors.push(...compile.runtimeSpec.errors);
    if (!validExample.valid)
        errors.push(...validExample.errors);
    if (invalidExample.valid)
        errors.push("invalid runtime output unexpectedly validated");
    return {
        ok: errors.length === 0,
        plugin: "umg-envoy-agent",
        version: "0.3.0-alpha.8",
        compilerAdapter: "not-shipped-publicly",
        contentMode: "bundled-public",
        sampleSleeves: sleeves.length,
        sampleBlocks: blocks.length,
        runtimeValidation: validExample.valid && !invalidExample.valid ? "passed" : "failed",
        errors
    };
}
function statusPayload(config) {
    const cfg = effectiveConfig(config);
    const root = publicContentRoot(import.meta.url);
    const sleeves = loadSleeves(root);
    const libraries = summarizeBlockLibraries(root);
    return {
        ok: true,
        plugin: "umg-envoy-agent",
        version: "0.3.0-alpha.8",
        publicEntrypoint: "dist/plugin-entry-public.js",
        contentMode: cfg.contentMode,
        compilerMode: cfg.compilerMode,
        allowRuntimeWrites: false,
        sampleSleeves: sleeves.length,
        sampleBlocks: libraries.totalBlocks,
        supportedTools: [
            "umg_envoy_status",
            "umg_envoy_library_status",
            "umg_envoy_library_search",
            "umg_envoy_runtime_spec_dry_run",
            "umg_envoy_runtime_visibility_header",
            "umg_envoy_runtime_molt_map",
            "umg_envoy_runtime_dashboard",
            "umg_envoy_runtime_ir_matrix",
            "umg_envoy_runtime_inspect",
            "umg_envoy_local_readonly_plan",
            "umg_envoy_local_readonly_scan",
            "umg_envoy_alpha_demo",
            "umg_envoy_sleeve_list",
            "umg_envoy_sleeve_inspect",
            "umg_envoy_sleeve_demo",
            "umg_envoy_real_library_status",
            "umg_envoy_real_sleeve_list",
            "umg_envoy_real_sleeve_inspect"
        ]
    };
}
function realLibraryStatus() {
    return resolveRealLibraryPublicCurated({
        libraryRoot: "C:\\.openclaw\\workspace\\UMG-Block-Library",
        mode: "public_curated"
    });
}
function realSleeveList() {
    const result = realLibraryStatus();
    return {
        ok: result.ok,
        mode: result.mode,
        libraryRoot: result.libraryRoot,
        entrypoint: result.entrypoint,
        catalogLoaded: result.catalogLoaded,
        sleeveCount: result.sleeveCount,
        loadableSleeveCount: result.loadableSleeveCount,
        rejectedSleeveCount: result.rejectedSleeveCount,
        unloadableSleeveCount: result.unloadableSleeveCount,
        sleeves: result.sleeves,
        warnings: result.warnings,
        errors: result.errors,
        trace: result.trace
    };
}
function realSleeveInspect(sleeveId, libraryRoot, shallowLoadTargetRef) {
    return inspectRealLibraryPublicCuratedSleeve({
        sleeveId,
        libraryRoot,
        mode: "public_curated",
        shallowLoadTargetRef
    });
}
function currentSleeveStatus(sleeveId, libraryRoot) {
    return getCurrentSleeveStatus({ sleeveId, libraryRoot });
}
function sleeveTree(sleeveId, depth, libraryRoot) {
    return getSleeveTree({ sleeveId, depth, libraryRoot });
}
function neostackInspect(sleeveId, neostackId, includeNeoBlocks, libraryRoot) {
    return inspectNeoStack({ sleeveId, neostackId, includeNeoBlocks, libraryRoot });
}
function neoblockInspect(neoblockId, sleeveId, includeMoltBlocks, libraryRoot) {
    return inspectNeoBlock({ neoblockId, sleeveId, includeMoltBlocks, libraryRoot });
}
function moltblockInspect(moltBlockId, sleeveId, neoblockId, libraryRoot) {
    return inspectMoltBlock({ moltBlockId, sleeveId, neoblockId, libraryRoot });
}
function runtimeIrPath(sleeveId, includeDormant, includeExcludedLanes, libraryRoot) {
    return getRuntimeIrPath({ sleeveId, includeDormant, includeExcludedLanes, libraryRoot });
}
function runtimeIrMatrixFull(sleeveId, includeDormant, includeExcludedLanes, includeEdges, includeNlProjection, libraryRoot) {
    return getRuntimeIrMatrixFull({ sleeveId, includeDormant, includeExcludedLanes, includeEdges, includeNlProjection, libraryRoot });
}
function responseEnvelopeDraft(sleeveId, trigger, directive, instruction, subject, primary, philosophy, blueprint, formalResponseContent, includeIrMatrix, includeMetadata, libraryRoot) {
    return renderResponseEnvelopeDraft({
        sleeveId,
        trigger,
        directive,
        instruction,
        subject,
        primary,
        philosophy,
        blueprint,
        formalResponseContent,
        includeIrMatrix,
        includeMetadata,
        libraryRoot
    });
}
function searchBlocks(query, metaUrl = import.meta.url) {
    const q = query.trim().toLowerCase();
    const blocks = loadBlocks(publicContentRoot(metaUrl));
    const matches = blocks.filter((block) => {
        const hay = [block.block_id, block.title, block.kind, block.text, ...(block.tags ?? [])].join(" \n").toLowerCase();
        return q.length === 0 || hay.includes(q);
    });
    return {
        ok: true,
        query,
        count: matches.length,
        results: matches.slice(0, 25).map((block) => ({
            block_id: block.block_id,
            kind: block.kind,
            title: block.title,
            authority: block.authority,
            tags: block.tags ?? []
        }))
    };
}
function runtimeInspect(sleeveId, config) {
    const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
    return {
        ok: compiled.ok,
        sleeveId: compiled.sleeveId,
        activeBlocks: compiled.runtimeSpec.active_blocks,
        promptParts: compiled.runtimeSpec.prompt_parts.map((part) => ({
            block_id: part.block_id,
            kind: part.kind,
            authority: part.authority
        })),
        warnings: compiled.runtimeSpec.warnings,
        errors: compiled.runtimeSpec.errors
    };
}
function runtimeVisibilityHeader(sleeveId, config) {
    const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
    return {
        ok: compiled.ok,
        sleeveId: compiled.sleeveId,
        header: [
            `UMG Envoy public visibility header`,
            `sleeve: ${compiled.sleeveId}`,
            `primary shell: ${compiled.runtimeSpec.primary_shell_block_id}`,
            `active blocks: ${compiled.runtimeSpec.active_blocks.length}`,
            `prompt parts: ${compiled.runtimeSpec.prompt_parts.length}`
        ].join("\n")
    };
}
function runtimeMoltMap(sleeveId, config) {
    const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
    return {
        ok: compiled.ok,
        sleeveId: compiled.sleeveId,
        moltMap: compiled.runtimeSpec.prompt_parts.map((part, index) => ({
            order: index + 1,
            block_id: part.block_id,
            kind: part.kind,
            authority: part.authority
        }))
    };
}
function runtimeDashboard(config) {
    const root = publicContentRoot(import.meta.url);
    const sleeves = loadSleeves(root);
    const library = summarizeBlockLibraries(root);
    const defaultSleeveId = effectiveConfig(config).defaultSleeveId ?? "public-basic-envoy";
    const compiled = compileSleeveReadonly(defaultSleeveId, config, import.meta.url);
    return {
        ok: compiled.ok,
        defaultSleeveId,
        sleeveCount: sleeves.length,
        blockCount: library.totalBlocks,
        blockKinds: library.byKind,
        activeBlockCount: compiled.runtimeSpec.active_blocks.length,
        promptPartCount: compiled.runtimeSpec.prompt_parts.length,
        warnings: compiled.runtimeSpec.warnings,
        errors: compiled.runtimeSpec.errors
    };
}
function runtimeIrMatrix(config) {
    const root = publicContentRoot(import.meta.url);
    const sleeves = loadSleeves(root);
    const blocks = loadBlocks(root);
    return {
        ok: true,
        compilerAdapter: "not-shipped-publicly",
        contentMode: effectiveConfig(config).contentMode,
        compilerMode: effectiveConfig(config).compilerMode,
        sampleSleeves: sleeves.length,
        sampleBlocks: blocks.length,
        blockKinds: Array.from(new Set(blocks.map((block) => block.kind))).sort(),
        failClosed: true
    };
}
function localReadonlyPlan(message, sleeveId) {
    const doc = buildPublicPath(message, sleeveId ?? "public-basic-envoy");
    const issues = validateUMGPath(doc);
    return {
        ok: issues.every((issue) => issue.severity !== "error"),
        mode: "readonly-plan",
        sleeveId: doc.sleeveId,
        issues,
        rendered: renderUMGPath(doc)
    };
}
function localReadonlyScan(query) {
    const root = publicContentRoot(import.meta.url);
    const sleeves = loadSleeves(root);
    const library = summarizeBlockLibraries(root);
    const q = (query ?? "").trim().toLowerCase();
    const sleeveHits = sleeves.filter((sleeve) => q.length === 0 || `${sleeve.sleeve_id} ${sleeve.title}`.toLowerCase().includes(q));
    return {
        ok: true,
        query: query ?? "",
        sleeveHits: sleeveHits.map((sleeve) => ({ sleeve_id: sleeve.sleeve_id, title: sleeve.title })),
        blockSummary: library
    };
}
function alphaDemo(message, sleeveId) {
    const selectedSleeve = sleeveId ?? "public-basic-envoy";
    const plan = localReadonlyPlan(message ?? "Give me a concise public demo", selectedSleeve);
    const inspect = runtimeInspect(selectedSleeve);
    return {
        ok: plan.ok && inspect.ok,
        sleeveId: selectedSleeve,
        plan,
        inspect,
        note: "alpha demo stays in readonly public-safe mode"
    };
}
function sleeveList() {
    const root = publicContentRoot(import.meta.url);
    return {
        ok: true,
        sleeves: loadSleeves(root).map((sleeve) => ({
            sleeve_id: sleeve.sleeve_id,
            title: sleeve.title,
            primary_shell_block_id: sleeve.primary_shell_block_id,
            block_count: sleeve.block_refs.length
        }))
    };
}
function sleeveInspect(sleeveId, config) {
    const root = publicContentRoot(import.meta.url);
    const sleeve = loadSleeveById(root, sleeveId);
    if (!sleeve) {
        return { ok: false, error: `Unknown sleeve: ${sleeveId}` };
    }
    const compiled = compileSleeveReadonly(sleeveId, config, import.meta.url);
    return {
        ok: compiled.ok,
        sleeve,
        runtime: compiled.runtimeSpec
    };
}
function sleeveDemo(sleeveId, message) {
    const chosen = sleeveId ?? "public-basic-envoy";
    return {
        ok: true,
        sleeveId: chosen,
        previewPath: renderUMGPath(buildPublicPath(message ?? "demo", chosen)),
        runtime: compileSleeveReadonly(chosen, undefined, import.meta.url).runtimeSpec
    };
}
function registerCliBridge(api, config) {
    if (typeof api?.registerCli !== "function") {
        return;
    }
    api.registerCli(({ program }) => {
        const root = program.command("umg-envoy").description("UMG Envoy Agent minimized public alpha.6 utilities");
        root.command("status").action(async () => console.log(JSON.stringify(statusPayload(config), null, 2)));
        root.command("library-status").action(async () => console.log(JSON.stringify({ ok: true, ...summarizeBlockLibraries(publicContentRoot(import.meta.url)) }, null, 2)));
        root.command("library-search").requiredOption("--query <text>").action(async (opts) => console.log(JSON.stringify(searchBlocks(opts.query), null, 2)));
        root.command("runtime-spec-dry-run").option("--sleeve <id>").requiredOption("--message <text>").action(async (opts) => console.log(JSON.stringify(localReadonlyPlan(opts.message, opts.sleeve), null, 2)));
        root.command("runtime-visibility-header").option("--sleeve <id>").action(async (opts) => console.log(JSON.stringify(runtimeVisibilityHeader(opts.sleeve ?? effectiveConfig(config).defaultSleeveId, config), null, 2)));
        root.command("runtime-molt-map").option("--sleeve <id>").action(async (opts) => console.log(JSON.stringify(runtimeMoltMap(opts.sleeve ?? effectiveConfig(config).defaultSleeveId, config), null, 2)));
        root.command("runtime-dashboard").action(async () => console.log(JSON.stringify(runtimeDashboard(config), null, 2)));
        root.command("runtime-ir-matrix").action(async () => console.log(JSON.stringify(runtimeIrMatrix(config), null, 2)));
        root.command("runtime-inspect").option("--sleeve <id>").action(async (opts) => console.log(JSON.stringify(runtimeInspect(opts.sleeve ?? effectiveConfig(config).defaultSleeveId, config), null, 2)));
        root.command("local-readonly-plan").requiredOption("--message <text>").option("--sleeve <id>").action(async (opts) => console.log(JSON.stringify(localReadonlyPlan(opts.message, opts.sleeve), null, 2)));
        root.command("local-readonly-scan").option("--query <text>").action(async (opts) => console.log(JSON.stringify(localReadonlyScan(opts.query), null, 2)));
        root.command("alpha-demo").option("--message <text>").option("--sleeve <id>").action(async (opts) => console.log(JSON.stringify(alphaDemo(opts.message, opts.sleeve), null, 2)));
        root.command("sleeve-list").action(async () => console.log(JSON.stringify(sleeveList(), null, 2)));
        root.command("sleeve-inspect").requiredOption("--sleeve <id>").action(async (opts) => console.log(JSON.stringify(sleeveInspect(opts.sleeve, config), null, 2)));
        root.command("sleeve-demo").option("--sleeve <id>").option("--message <text>").action(async (opts) => console.log(JSON.stringify(sleeveDemo(opts.sleeve, opts.message), null, 2)));
        root.command("real-library-status").action(async () => console.log(JSON.stringify(realLibraryStatus(), null, 2)));
        root.command("real-sleeve-list").action(async () => console.log(JSON.stringify(realSleeveList(), null, 2)));
        root.command("real-sleeve-inspect").requiredOption("--sleeve <id>").option("--library-root <path>").option("--shallow-load-target-ref <ref>").action(async (opts) => console.log(JSON.stringify(realSleeveInspect(opts.sleeve, opts.libraryRoot, opts.shallowLoadTargetRef), null, 2)));
        root.command("current-sleeve-status").option("--sleeve <id>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(currentSleeveStatus(opts.sleeve, opts.libraryRoot), null, 2)));
        root.command("sleeve-tree").option("--sleeve <id>").option("--depth <n>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(sleeveTree(opts.sleeve, opts.depth ? Number(opts.depth) : undefined, opts.libraryRoot), null, 2)));
        root.command("neostack-inspect").option("--sleeve <id>").option("--neostack <id>").option("--include-neoblocks <bool>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(neostackInspect(opts.sleeve, opts.neostack, opts.includeNeoblocks ? opts.includeNeoblocks !== 'false' : undefined, opts.libraryRoot), null, 2)));
        root.command("neoblock-inspect").option("--neoblock <id>").option("--sleeve <id>").option("--include-moltblocks <bool>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(neoblockInspect(opts.neoblock, opts.sleeve, opts.includeMoltblocks ? opts.includeMoltblocks !== 'false' : undefined, opts.libraryRoot), null, 2)));
        root.command("moltblock-inspect").option("--moltblock <id>").option("--sleeve <id>").option("--neoblock <id>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(moltblockInspect(opts.moltblock, opts.sleeve, opts.neoblock, opts.libraryRoot), null, 2)));
        root.command("runtime-ir-path").option("--sleeve <id>").option("--include-dormant <bool>").option("--include-excluded-lanes <bool>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(runtimeIrPath(opts.sleeve, opts.includeDormant ? opts.includeDormant !== 'false' : undefined, opts.includeExcludedLanes ? opts.includeExcludedLanes !== 'false' : undefined, opts.libraryRoot), null, 2)));
        root.command("runtime-ir-matrix-full").option("--sleeve <id>").option("--include-dormant <bool>").option("--include-excluded-lanes <bool>").option("--include-edges <bool>").option("--include-nl-projection <bool>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(runtimeIrMatrixFull(opts.sleeve, opts.includeDormant ? opts.includeDormant !== 'false' : undefined, opts.includeExcludedLanes ? opts.includeExcludedLanes !== 'false' : undefined, opts.includeEdges ? opts.includeEdges !== 'false' : undefined, opts.includeNlProjection ? opts.includeNlProjection !== 'false' : undefined, opts.libraryRoot), null, 2)));
        root.command("response-envelope-draft").option("--sleeve <id>").option("--trigger <text>").option("--directive <text>").option("--instruction <text>").option("--subject <text>").option("--primary <text>").option("--philosophy <text>").option("--blueprint <text>").option("--formal-response-content <text>").option("--include-ir-matrix <bool>").option("--include-metadata <bool>").option("--library-root <path>").action(async (opts) => console.log(JSON.stringify(responseEnvelopeDraft(opts.sleeve, opts.trigger, opts.directive, opts.instruction, opts.subject, opts.primary, opts.philosophy, opts.blueprint, opts.formalResponseContent, opts.includeIrMatrix ? opts.includeIrMatrix !== 'false' : undefined, opts.includeMetadata ? opts.includeMetadata !== 'false' : undefined, opts.libraryRoot), null, 2)));
        root.command("parse-path").requiredOption("--file <path>").action(async (opts) => console.log(JSON.stringify(parseUMGPath(fs.readFileSync(opts.file, "utf8")), null, 2)));
        root.command("validate-path").requiredOption("--file <path>").action(async (opts) => { const issues = validateUMGPath(parseUMGPath(fs.readFileSync(opts.file, "utf8"))); console.log(JSON.stringify({ ok: issues.every((issue) => issue.severity !== "error"), issues }, null, 2)); });
        root.command("render-path").requiredOption("--file <path>").action(async (opts) => { const raw = fs.readFileSync(opts.file, "utf8"); const parsed = opts.file.toLowerCase().endsWith(".json") ? JSON.parse(raw) : parseUMGPath(raw); console.log(renderUMGPath(parsed)); });
        root.command("build-path").requiredOption("--message <text>").option("--sleeve <id>").action(async (opts) => console.log(renderUMGPath(buildPublicPath(opts.message, opts.sleeve ?? effectiveConfig(config).defaultSleeveId))));
    }, { commands: ["umg-envoy"] });
}
const entry = {
    id: "umg-envoy-agent",
    name: "UMG Envoy Agent",
    description: "Minimized public alpha.6 UMG Envoy Agent for OpenClaw",
    register(api, config) {
        registerCliBridge(api, config);
        api.registerTool({ name: "umg_envoy_status", description: "Report public alpha.6 status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(statusPayload(config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_library_status", description: "Summarize bundled public block library status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify({ ok: true, ...summarizeBlockLibraries(publicContentRoot(import.meta.url)) }, null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_library_search", description: "Search bundled public block content.", parameters: Type.Object({ query: Type.String() }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(searchBlocks(input.query), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_spec_dry_run", description: "Build a readonly RuntimeSpec-style plan without execution.", parameters: Type.Object({ message: Type.String(), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(localReadonlyPlan(input.message, input.sleeveId), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_visibility_header", description: "Return a concise visibility header for the selected public sleeve runtime.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(runtimeVisibilityHeader(input.sleeveId ?? effectiveConfig(config).defaultSleeveId, config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_molt_map", description: "Return readonly ordering and public molt-style mapping for the selected sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(runtimeMoltMap(input.sleeveId ?? effectiveConfig(config).defaultSleeveId, config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_dashboard", description: "Report readonly public runtime dashboard stats.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(runtimeDashboard(config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_ir_matrix", description: "Report public readonly IR matrix status.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(runtimeIrMatrix(config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_inspect", description: "Inspect readonly RuntimeSpec-like output for a public sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(runtimeInspect(input.sleeveId ?? effectiveConfig(config).defaultSleeveId, config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_local_readonly_plan", description: "Create a local readonly plan from a message.", parameters: Type.Object({ message: Type.String(), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(localReadonlyPlan(input.message, input.sleeveId), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_local_readonly_scan", description: "Scan bundled public content without writes or execution.", parameters: Type.Object({ query: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(localReadonlyScan(input.query), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_alpha_demo", description: "Run the public alpha demo in readonly mode.", parameters: Type.Object({ message: Type.Optional(Type.String()), sleeveId: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(alphaDemo(input.message, input.sleeveId), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_sleeve_list", description: "List bundled public sleeves.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(sleeveList(), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_sleeve_inspect", description: "Inspect a bundled public sleeve and its readonly runtime.", parameters: Type.Object({ sleeveId: Type.String() }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(sleeveInspect(input.sleeveId, config), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_sleeve_demo", description: "Show a sleeve-scoped public readonly demo payload.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), message: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(sleeveDemo(input.sleeveId, input.message), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_real_library_status", description: "Load the real public-curated sleeve catalog from the selected UMG Block Library root in readonly mode.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(realLibraryStatus(), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_real_sleeve_list", description: "Return safe curated sleeve summaries from the real UMG Block Library in readonly mode.", parameters: Type.Object({}, { additionalProperties: false }), async execute() { return { content: [{ type: "text", text: JSON.stringify(realSleeveList(), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_real_sleeve_inspect", description: "Inspect one safe loadable public-curated sleeve from the real UMG Block Library in readonly mode.", parameters: Type.Object({ sleeveId: Type.String(), libraryRoot: Type.Optional(Type.String()), shallowLoadTargetRef: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(realSleeveInspect(input.sleeveId, input.libraryRoot, input.shallowLoadTargetRef), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_current_sleeve_status", description: "Return the current/inferred public_curated sleeve graph status in a compact read-only form.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(currentSleeveStatus(input.sleeveId, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_sleeve_tree", description: "Return a depth-limited read-only tree for a public_curated sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), depth: Type.Optional(Type.Number()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(sleeveTree(input.sleeveId, input.depth, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_neostack_inspect", description: "Inspect one declared NeoStack inside a selected sleeve.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), neostackId: Type.Optional(Type.String()), includeNeoBlocks: Type.Optional(Type.Boolean()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(neostackInspect(input.sleeveId, input.neostackId, input.includeNeoBlocks, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_neoblock_inspect", description: "Inspect one NeoBlock reference from the active/current public_curated graph.", parameters: Type.Object({ neoblockId: Type.Optional(Type.String()), sleeveId: Type.Optional(Type.String()), includeMoltBlocks: Type.Optional(Type.Boolean()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(neoblockInspect(input.neoblockId, input.sleeveId, input.includeMoltBlocks, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_moltblock_inspect", description: "Inspect one shallow-visible MOLT block from the active/current public_curated graph.", parameters: Type.Object({ moltBlockId: Type.Optional(Type.String()), sleeveId: Type.Optional(Type.String()), neoblockId: Type.Optional(Type.String()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(moltblockInspect(input.moltBlockId, input.sleeveId, input.neoblockId, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_ir_path", description: "Return the current read-only UMG runtime path from the visible graph.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), includeDormant: Type.Optional(Type.Boolean()), includeExcludedLanes: Type.Optional(Type.Boolean()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(runtimeIrPath(input.sleeveId, input.includeDormant, input.includeExcludedLanes, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_runtime_ir_matrix_full", description: "Return the current visible UMG graph as a read-only IR matrix with nodes, edges, states, route path, dormant refs, excluded lanes, and NL projection.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), includeDormant: Type.Optional(Type.Boolean()), includeExcludedLanes: Type.Optional(Type.Boolean()), includeEdges: Type.Optional(Type.Boolean()), includeNlProjection: Type.Optional(Type.Boolean()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(runtimeIrMatrixFull(input.sleeveId, input.includeDormant, input.includeExcludedLanes, input.includeEdges, input.includeNlProjection, input.libraryRoot), null, 2) }] }; } }, { optional: true });
        api.registerTool({ name: "umg_envoy_response_envelope_draft", description: "Return a draft UMG-style response envelope using the current visible graph, runtime IR matrix, and supplied MOLT map fields.", parameters: Type.Object({ sleeveId: Type.Optional(Type.String()), trigger: Type.Optional(Type.String()), directive: Type.Optional(Type.String()), instruction: Type.Optional(Type.String()), subject: Type.Optional(Type.String()), primary: Type.Optional(Type.String()), philosophy: Type.Optional(Type.String()), blueprint: Type.Optional(Type.String()), formalResponseContent: Type.Optional(Type.String()), includeIrMatrix: Type.Optional(Type.Boolean()), includeMetadata: Type.Optional(Type.Boolean()), libraryRoot: Type.Optional(Type.String()) }, { additionalProperties: false }), async execute(input) { return { content: [{ type: "text", text: JSON.stringify(responseEnvelopeDraft(input.sleeveId, input.trigger, input.directive, input.instruction, input.subject, input.primary, input.philosophy, input.blueprint, input.formalResponseContent, input.includeIrMatrix, input.includeMetadata, input.libraryRoot), null, 2) }] }; } }, { optional: true });
    }
};
if (process.argv.includes("--smoke")) {
    console.log(JSON.stringify(runPublicSmoke(import.meta.url), null, 2));
}
export default entry;
