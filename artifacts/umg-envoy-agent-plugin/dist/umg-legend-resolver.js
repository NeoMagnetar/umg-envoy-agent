import fs from "node:fs";
import path from "node:path";
import { readJsonFile } from "./fs-utils.js";
function push(issues, severity, code, message, path) {
    issues.push({ severity, code, message, path });
}
function readJsonIfExists(filePath) {
    if (!fs.existsSync(filePath))
        return null;
    return readJsonFile(filePath);
}
function walkJsonFiles(root) {
    if (!fs.existsSync(root))
        return [];
    const out = [];
    const stack = [root];
    while (stack.length) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(full);
            }
            else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
                out.push(full);
            }
        }
    }
    return out;
}
function collectStringIds(value, sink) {
    if (Array.isArray(value)) {
        for (const item of value)
            collectStringIds(item, sink);
        return;
    }
    if (!value || typeof value !== "object")
        return;
    const record = value;
    for (const [key, child] of Object.entries(record)) {
        if (["id", "block_id", "trigger_id", "stack_id", "molt_id", "value", "key"].includes(key) && typeof child === "string" && child.trim()) {
            sink.add(child.trim());
        }
        collectStringIds(child, sink);
    }
}
function registerId(ids, sourceClassById, sourcePathById, id, sourceClass, sourcePath) {
    ids.add(id);
    const existing = sourceClassById[id];
    const precedence = {
        catalog_backed: 3,
        generated_recovery: 2,
        discovered_fallback: 1
    };
    if (!existing || precedence[sourceClass] >= precedence[existing]) {
        sourceClassById[id] = sourceClass;
        sourcePathById[id] = sourcePath;
    }
}
function loadSleeveIds(paths) {
    const ids = new Set();
    const sourceClassById = {};
    const sourcePathById = {};
    const catalog = readJsonIfExists(paths.sleeveCatalogPath);
    for (const sleeve of catalog?.sleeves ?? []) {
        if (sleeve.id)
            registerId(ids, sourceClassById, sourcePathById, sleeve.id, "catalog_backed", paths.sleeveCatalogPath);
    }
    for (const filePath of walkJsonFiles(paths.resleeverSleevesDir)) {
        const json = readJsonIfExists(filePath);
        const directId = json?.sleeve?.id ?? json?.id ?? json?.sleeve_id;
        if (typeof directId === "string" && directId.trim()) {
            registerId(ids, sourceClassById, sourcePathById, directId.trim(), "discovered_fallback", filePath);
        }
    }
    return { ids, sourceClassById, sourcePathById };
}
function loadStackIds(paths, sourceClassById, sourcePathById) {
    const ids = new Set();
    const catalogFiles = [
        ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "neostacks")),
        ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "library", "neostacks"))
    ];
    const generatedFiles = walkJsonFiles(path.join(paths.resleeverBlocksDir, "generated", "neostacks"));
    for (const filePath of catalogFiles) {
        const json = readJsonIfExists(filePath);
        const stacks = Array.isArray(json?.stacks) ? json.stacks : [];
        for (const stack of stacks) {
            if (typeof stack?.id === "string" && stack.id.trim())
                registerId(ids, sourceClassById, sourcePathById, stack.id.trim(), "catalog_backed", filePath);
        }
    }
    for (const filePath of generatedFiles) {
        const json = readJsonIfExists(filePath);
        const directId = json?.id;
        if (typeof directId === "string" && directId.trim())
            registerId(ids, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
    }
    return ids;
}
function loadBlockIds(paths, sourceClassById, sourcePathById) {
    const ids = new Set();
    const catalogFiles = [
        ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "neoblocks")),
        ...walkJsonFiles(path.join(paths.resleeverBlocksDir, "library", "neoblocks"))
    ];
    const generatedFiles = walkJsonFiles(path.join(paths.resleeverBlocksDir, "generated", "neoblocks"));
    for (const filePath of catalogFiles) {
        const json = readJsonIfExists(filePath);
        const neoblocks = Array.isArray(json?.neoblocks) ? json.neoblocks : [];
        for (const block of neoblocks) {
            if (typeof block?.id === "string" && block.id.trim())
                registerId(ids, sourceClassById, sourcePathById, block.id.trim(), "catalog_backed", filePath);
        }
    }
    for (const filePath of generatedFiles) {
        const json = readJsonIfExists(filePath);
        const directId = json?.id;
        if (typeof directId === "string" && directId.trim())
            registerId(ids, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
    }
    return ids;
}
function loadMoltAndLibraryIds(paths, sourceClassById, sourcePathById) {
    const moltIds = new Set();
    const libraryEntryIds = new Set();
    const triggerIds = new Set();
    for (const filePath of walkJsonFiles(path.join(paths.resleeverBlocksDir, "molt"))) {
        const json = readJsonIfExists(filePath);
        const collected = new Set();
        collectStringIds(json, collected);
        for (const id of collected) {
            registerId(libraryEntryIds, sourceClassById, sourcePathById, id, "discovered_fallback", filePath);
            if (/^(TRG|trigger)/i.test(id))
                registerId(triggerIds, sourceClassById, sourcePathById, id, "discovered_fallback", filePath);
            if (/^(DIR|INST|PRIM|PHI|BP|SUB|USE|AIM|NEED|block\.)/i.test(id))
                registerId(moltIds, sourceClassById, sourcePathById, id, "discovered_fallback", filePath);
        }
    }
    for (const filePath of walkJsonFiles(path.join(paths.resleeverBlocksDir, "generated", "molt"))) {
        const json = readJsonIfExists(filePath);
        const directId = json?.id;
        if (typeof directId === "string" && directId.trim()) {
            registerId(moltIds, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
            registerId(libraryEntryIds, sourceClassById, sourcePathById, directId.trim(), "generated_recovery", filePath);
        }
    }
    return { moltIds, libraryEntryIds, triggerIds };
}
export function buildLegendResolverIndex(paths) {
    const sleeve = loadSleeveIds(paths);
    const sourceClassById = { ...sleeve.sourceClassById };
    const sourcePathById = { ...sleeve.sourcePathById };
    const stackIds = loadStackIds(paths, sourceClassById, sourcePathById);
    const blockIds = loadBlockIds(paths, sourceClassById, sourcePathById);
    const { moltIds, libraryEntryIds, triggerIds } = loadMoltAndLibraryIds(paths, sourceClassById, sourcePathById);
    return {
        sleeveIds: sleeve.ids,
        stackIds,
        blockIds,
        moltIds,
        libraryEntryIds,
        triggerIds,
        sourceClassById,
        sourcePathById
    };
}
export function summarizeLegendResolverIndex(index) {
    return {
        sleevesCataloged: index.sleeveIds.size,
        stackCount: index.stackIds.size,
        blockCount: index.blockIds.size,
        moltCount: index.moltIds.size,
        libraryEntryCount: index.libraryEntryIds.size,
        triggerCount: index.triggerIds.size
    };
}
export function validateUMGPathAgainstLegend(doc, index) {
    const issues = [];
    if (!index.sleeveIds.has(doc.sleeveId)) {
        push(issues, "error", "LEGEND_UNKNOWN_SLEEVE", `Sleeve id does not resolve in legend: ${doc.sleeveId}`, "sleeveId");
    }
    for (const [indexPos, stackId] of doc.loadedStacks.entries()) {
        if (!index.stackIds.has(stackId)) {
            push(issues, "error", "LEGEND_UNKNOWN_STACK", `Loaded stack id does not resolve in legend: ${stackId}`, `loadedStacks[${indexPos}]`);
        }
    }
    for (const [stackIndex, stack] of doc.stacks.entries()) {
        if (!index.stackIds.has(stack.id)) {
            push(issues, "error", "LEGEND_UNKNOWN_STACK", `Declared stack id does not resolve in legend: ${stack.id}`, `stacks[${stackIndex}]`);
        }
        for (const [blockIndex, block] of stack.blocks.entries()) {
            if (!index.blockIds.has(block.id)) {
                push(issues, "error", "LEGEND_UNKNOWN_BLOCK", `Declared block id does not resolve in legend: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
            }
            for (const [moltIndex, molt] of block.molts.entries()) {
                if (!index.moltIds.has(molt.id) && !index.libraryEntryIds.has(molt.id)) {
                    push(issues, "error", "LEGEND_UNKNOWN_MOLT", `Declared MOLT id does not resolve in legend/library: ${molt.id}`, `stacks[${stackIndex}].blocks[${blockIndex}].molts[${moltIndex}]`);
                }
            }
        }
    }
    for (const [triggerIndex, triggerId] of doc.triggers.entries()) {
        if (!index.triggerIds.has(triggerId) && !index.libraryEntryIds.has(triggerId)) {
            push(issues, "error", "LEGEND_UNKNOWN_TRIGGER", `Trigger id does not resolve in legend/library: ${triggerId}`, `triggers[${triggerIndex}]`);
        }
    }
    return issues;
}
export function resolveUMGPathAgainstLegend(paths, doc) {
    const index = buildLegendResolverIndex(paths);
    const issues = validateUMGPathAgainstLegend(doc, index);
    const summary = summarizeLegendResolverIndex(index);
    return {
        ok: !issues.some((issue) => issue.severity === "error"),
        issues,
        summary
    };
}
