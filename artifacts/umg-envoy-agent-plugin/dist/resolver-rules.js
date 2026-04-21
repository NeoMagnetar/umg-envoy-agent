import fs from "node:fs";
function normalizeCueKind(value) {
    return value === "playful" || value === "analytical" || value === "formal" || value === "direct" || value === "expansive" || value === "list" || value === "narrative"
        ? value
        : "analytical";
}
function normalizeFamily(value) {
    return value === "persona" || value === "posture" || value === "format" ? value : "persona";
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function toStringArray(value) {
    if (!Array.isArray(value))
        return [];
    return value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}
export function loadResolverRuleSet(paths) {
    const raw = fs.readFileSync(paths.resolverRulesPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!isRecord(parsed)) {
        throw new Error(`Resolver rule file is not an object: ${paths.resolverRulesPath}`);
    }
    const persistentStacks = Array.isArray(parsed.persistentStacks) ? parsed.persistentStacks : [];
    const cueGroups = Array.isArray(parsed.cueGroups) ? parsed.cueGroups : [];
    const modulationRules = Array.isArray(parsed.modulationRules) ? parsed.modulationRules : [];
    return {
        persistentStacks: persistentStacks
            .filter(isRecord)
            .map((entry) => ({
            stackId: typeof entry.stackId === "string" ? entry.stackId : "",
            persistentBlockIds: toStringArray(entry.persistentBlockIds),
            alwaysActiveBlockIds: toStringArray(entry.alwaysActiveBlockIds)
        }))
            .filter((entry) => entry.stackId && entry.persistentBlockIds.length > 0),
        cueGroups: cueGroups
            .filter(isRecord)
            .map((entry) => ({
            cueGroupId: typeof entry.cueGroupId === "string" ? entry.cueGroupId : "",
            kind: normalizeCueKind(entry.kind),
            phrases: toStringArray(entry.phrases),
            weight: typeof entry.weight === "number" && Number.isFinite(entry.weight) ? entry.weight : 1
        }))
            .filter((entry) => entry.cueGroupId && entry.phrases.length > 0),
        modulationRules: modulationRules
            .filter(isRecord)
            .map((entry) => ({
            ruleId: typeof entry.ruleId === "string" ? entry.ruleId : "",
            family: normalizeFamily(entry.family),
            cueKind: normalizeCueKind(entry.cueKind),
            activateBlockId: typeof entry.activateBlockId === "string" ? entry.activateBlockId : "",
            suppressBlockIds: toStringArray(entry.suppressBlockIds),
            compatibilityMode: entry.compatibilityMode === "competing" ? "competing" : "competing",
            priority: typeof entry.priority === "number" && Number.isFinite(entry.priority) ? entry.priority : 0
        }))
            .filter((entry) => entry.ruleId && entry.activateBlockId && entry.suppressBlockIds.length > 0)
    };
}
