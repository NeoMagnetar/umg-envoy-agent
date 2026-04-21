import fs from "node:fs";
import path from "node:path";
const TRIGGER_ID_PREFIX = "umg.trigger.";
const TRIGGER_ID_PATTERN = /^umg\.trigger\.[a-z0-9_.]+$/;
function normalizeText(value) {
    return typeof value === "string" ? value.toLowerCase().trim() : "";
}
function toStringArray(value) {
    if (!Array.isArray(value))
        return [];
    return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function validateTriggerId(id) {
    if (!id)
        return "missing id";
    if (!id.startsWith(TRIGGER_ID_PREFIX))
        return `id must start with ${TRIGGER_ID_PREFIX}`;
    if (!TRIGGER_ID_PATTERN.test(id))
        return "id must use lowercase dotted format with letters, digits, underscore, and dot only";
    return null;
}
function parseTriggerBlock(filePath) {
    try {
        const raw = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw);
        if (!isRecord(parsed))
            return { block: null, invalidReason: "manifest is not an object" };
        const schema = normalizeText(parsed["$schema"]);
        const kind = normalizeText(parsed["kind"]);
        if (schema !== "umg.trigger-block.v1" && kind !== "trigger_block") {
            return { block: null, invalidReason: "not a trigger block manifest" };
        }
        const id = typeof parsed.id === "string" ? parsed.id.trim() : "";
        const idValidationError = validateTriggerId(id);
        if (idValidationError) {
            return { block: null, invalidReason: idValidationError };
        }
        const name = typeof parsed.name === "string" ? parsed.name.trim() : undefined;
        const enabled = parsed.enabled !== false;
        const priority = typeof parsed.priority === "number" && Number.isFinite(parsed.priority) ? parsed.priority : 0;
        const scope = parsed.scope === "reply" ? "reply" : "reply";
        const matchRaw = isRecord(parsed.match) ? parsed.match : {};
        const matchMode = matchRaw.mode === "exact" ? "exact" : "includes";
        const phrases = toStringArray(matchRaw.phrases).map((phrase) => normalizeText(phrase));
        if (phrases.length === 0) {
            return { block: null, invalidReason: "manifest must declare at least one trigger phrase" };
        }
        const behaviorRaw = isRecord(parsed.behavior) ? parsed.behavior : null;
        if (!behaviorRaw) {
            return { block: null, invalidReason: "manifest is missing behavior" };
        }
        const behaviorKind = normalizeText(behaviorRaw.kind);
        let behavior = null;
        if (behaviorKind === "exact_response") {
            const content = typeof behaviorRaw.content === "string" ? behaviorRaw.content : "";
            if (!content) {
                return { block: null, invalidReason: "exact_response behavior requires content" };
            }
            behavior = {
                kind: "exact_response",
                content
            };
        }
        else if (behaviorKind === "system_prompt") {
            const prependSystemContext = typeof behaviorRaw.prependSystemContext === "string"
                ? behaviorRaw.prependSystemContext
                : "";
            if (!prependSystemContext) {
                return { block: null, invalidReason: "system_prompt behavior requires prependSystemContext" };
            }
            behavior = {
                kind: "system_prompt",
                prependSystemContext
            };
        }
        if (!behavior) {
            return { block: null, invalidReason: `unsupported behavior kind: ${behaviorKind || "<empty>"}` };
        }
        return {
            block: {
                id,
                name,
                enabled,
                priority,
                scope,
                match: {
                    mode: matchMode,
                    phrases
                },
                behavior,
                sourcePath: filePath
            }
        };
    }
    catch (error) {
        return {
            block: null,
            invalidReason: error instanceof Error ? error.message : "failed to parse trigger manifest"
        };
    }
}
function collectJsonFiles(rootDir) {
    if (!fs.existsSync(rootDir))
        return [];
    const out = [];
    const stack = [rootDir];
    while (stack.length > 0) {
        const current = stack.pop();
        if (!current)
            continue;
        let entries = [];
        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        }
        catch {
            continue;
        }
        for (const entry of entries) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(fullPath);
                continue;
            }
            if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) {
                out.push(fullPath);
            }
        }
    }
    return out.sort((a, b) => a.localeCompare(b));
}
export function loadTriggerCatalog(paths) {
    const triggerRoots = [
        path.join(paths.resleeverBlocksDir, "triggers"),
        path.join(paths.resleeverBlocksDir, "manifests", "triggers")
    ];
    const parsedBlocks = [];
    const invalidManifests = [];
    const duplicateMap = new Map();
    for (const root of triggerRoots) {
        for (const filePath of collectJsonFiles(root)) {
            const parsed = parseTriggerBlock(filePath);
            if (!parsed.block) {
                invalidManifests.push({
                    sourcePath: filePath,
                    reason: parsed.invalidReason ?? "invalid trigger manifest"
                });
                continue;
            }
            parsedBlocks.push(parsed.block);
            duplicateMap.set(parsed.block.id, [...(duplicateMap.get(parsed.block.id) ?? []), parsed.block.sourcePath]);
        }
    }
    const duplicateIdCollisions = Array.from(duplicateMap.entries())
        .filter(([, sourcePaths]) => sourcePaths.length > 1)
        .map(([id, sourcePaths]) => ({ id, sourcePaths: [...sourcePaths].sort((a, b) => a.localeCompare(b)) }))
        .sort((a, b) => a.id.localeCompare(b.id));
    const collidingIds = new Set(duplicateIdCollisions.map((entry) => entry.id));
    const blocks = parsedBlocks
        .filter((block) => block.enabled)
        .filter((block) => !collidingIds.has(block.id))
        .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
    return {
        blocks,
        diagnostics: {
            loadedTriggerIds: blocks.map((block) => block.id),
            invalidManifests,
            duplicateIdCollisions
        }
    };
}
export function loadTriggerBlocks(paths) {
    return loadTriggerCatalog(paths).blocks;
}
function matchesPhrase(text, phrase, mode) {
    if (!text || !phrase)
        return false;
    if (mode === "exact") {
        return text === phrase;
    }
    return text.includes(phrase);
}
export function resolveTriggerBehaviorFromUserText(text, triggerBlocks) {
    const normalized = normalizeText(text);
    if (!normalized)
        return null;
    for (const block of triggerBlocks) {
        const matched = block.match.phrases.some((phrase) => matchesPhrase(normalized, phrase, block.match.mode));
        if (!matched)
            continue;
        if (block.behavior.kind === "exact_response") {
            return {
                triggerId: block.id,
                priority: block.priority,
                kind: "exact_response",
                content: block.behavior.content
            };
        }
        return {
            triggerId: block.id,
            priority: block.priority,
            kind: "system_prompt",
            prependSystemContext: block.behavior.prependSystemContext
        };
    }
    return null;
}
export function extractLatestUserText(messages) {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const msg = messages[i];
        if (msg?.role === "user" && typeof msg.content === "string") {
            return msg.content;
        }
    }
    return "";
}
