import { loadBlockMap, loadSleeveById, publicContentRoot } from "./content-loader.js";
import { validateRuntimeOutput } from "./runtime-validator.js";
const KIND_ORDER = {
    primary: 0,
    directive: 1,
    instruction: 2,
    subject: 3,
    philosophy: 4,
    blueprint: 5,
    trigger: 6
};
function effectiveConfig(config) {
    return {
        allowRuntimeWrites: false,
        contentMode: "bundled-public",
        compilerMode: "bundled-adapter",
        debug: false,
        ...config
    };
}
function resolveSleeve(metaUrl, sleeveId) {
    const root = publicContentRoot(metaUrl);
    const sleeve = loadSleeveById(root, sleeveId);
    if (!sleeve) {
        throw new Error(`Unknown sleeve: ${sleeveId}`);
    }
    return { root, sleeve };
}
export function compileSleeveById(sleeveId, config, metaUrl = import.meta.url) {
    void effectiveConfig(config);
    const { root, sleeve } = resolveSleeve(metaUrl, sleeveId);
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
