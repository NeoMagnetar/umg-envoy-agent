import path from "node:path";
export function classifyApprovedGeneratedIndexLane(filePath) {
    const normalized = filePath.replaceAll("\\", "/").toLowerCase();
    if (normalized.includes("/human/"))
        return null;
    if (normalized.includes("/node_modules/") || normalized.includes("/dist/") || normalized.includes("release-blocker") || normalized.includes("comparison-validated") || normalized.includes("/docs/"))
        return null;
    if (normalized.includes("/ai/molt-blocks/"))
        return "ai_molt_blocks";
    if (normalized.includes("/ai/neoblocks/"))
        return "ai_neoblocks";
    if (normalized.includes("/ai/neostacks/"))
        return "ai_neostacks";
    if (normalized.includes("/ai/sleeves/"))
        return "ai_sleeves";
    if (normalized.includes("/ai/capabilities/"))
        return "ai_capabilities";
    if (normalized.includes("/ai/schemas/"))
        return "ai_schemas";
    if (normalized.includes("/ai/manifests/"))
        return "ai_manifests";
    if (normalized.includes("/sleeves/manifests/"))
        return "package_sleeve_manifests";
    if (normalized.includes("/sleeves/"))
        return "package_sleeves";
    return null;
}
export function generatedSourceKind(lane) {
    if (lane === "package_sleeves")
        return "package_lane";
    if (lane === "package_sleeve_manifests" || lane === "ai_schemas" || lane === "ai_manifests")
        return "schema_or_manifest";
    return "ai_machine";
}
export function generatedCanonicalStatus(lane) {
    if (lane === "package_sleeves" || lane === "package_sleeve_manifests")
        return "unknown";
    return "canonical";
}
export function normalizeGeneratedPath(filePath) {
    return path.resolve(filePath);
}
