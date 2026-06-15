import { compileSleeveById } from "./compiler-adapter.js";
import { loadBlockMap, loadSleeveById, publicContentRoot } from "./content-loader.js";
const PREVIEW_LIMIT = 96;
function effectiveConfig(config) {
    return {
        allowRuntimeWrites: false,
        contentMode: "bundled-public",
        compilerMode: "bundled-adapter",
        debug: false,
        ...config
    };
}
function previewText(block) {
    if (!block)
        return null;
    const text = block.text.replace(/\s+/g, " ").trim();
    return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT - 3)}...` : text;
}
function skippedReason(refEnabled, block) {
    if (!refEnabled)
        return "disabled block skipped";
    if (!block)
        return "missing block reference";
    if (block.enabled === false)
        return "block disabled in library";
    return null;
}
function unavailableMatrixSummary(reason) {
    return {
        available: false,
        reason,
        warnings: [],
        errors: []
    };
}
function runtimeBoundaryNonExecuting(boundary) {
    return boundary.nonExecuting === true;
}
function toolRequestName(request, index) {
    const candidate = request.name;
    return typeof candidate === "string" && candidate.trim().length > 0 ? candidate : `tool_request_${index + 1}`;
}
function buildMatrixSummary(input) {
    const nodes = [];
    const edges = [];
    const sleeveNodeId = `sleeve:${input.sleeveId}`;
    const runtimeSpecNodeId = "runtime_spec";
    const boundaryNodeId = "boundary:runtime_spec";
    const promptPartSet = new Set(input.promptParts.map((part) => part.block_id));
    const skippedReasonByBlock = new Map(input.skippedBlocks.map((entry) => [entry.block_id, entry.reason]));
    nodes.push({
        id: sleeveNodeId,
        type: "sleeve",
        label: input.sleeveId,
        sleeve_id: input.sleeveId
    });
    nodes.push({
        id: runtimeSpecNodeId,
        type: "runtime_spec",
        label: `runtime:${input.sleeveId}`,
        sleeve_id: input.sleeveId,
        non_executing: true
    });
    nodes.push({
        id: boundaryNodeId,
        type: "boundary",
        label: "RuntimeSpecBoundary",
        non_executing: runtimeBoundaryNonExecuting(input.runtimeSpecBoundary),
        status: input.runtimeSpecBoundary.status
    });
    edges.push({
        from: runtimeSpecNodeId,
        to: boundaryNodeId,
        type: "guarded_by"
    });
    for (const ref of input.blockRefs) {
        const blockNodeId = `block:${ref.block_id}`;
        nodes.push({
            id: blockNodeId,
            type: "block",
            label: ref.block_id,
            block_id: ref.block_id,
            kind: ref.kind,
            authority: ref.authority,
            enabled: ref.enabled,
            active: ref.active
        });
        edges.push({
            from: sleeveNodeId,
            to: blockNodeId,
            type: "references_block"
        });
        if (ref.active) {
            edges.push({
                from: blockNodeId,
                to: runtimeSpecNodeId,
                type: "active_in_runtime"
            });
        }
        else {
            edges.push({
                from: blockNodeId,
                to: runtimeSpecNodeId,
                type: "skipped_from_runtime",
                reason: ref.skipped_reason ?? "not active in runtime"
            });
        }
        const skippedReason = skippedReasonByBlock.get(ref.block_id);
        if (skippedReason) {
            const reasonNodeId = `skipped_reason:${ref.block_id}`;
            nodes.push({
                id: reasonNodeId,
                type: "skipped_reason",
                label: skippedReason,
                block_id: ref.block_id,
                reason: skippedReason
            });
            edges.push({
                from: blockNodeId,
                to: reasonNodeId,
                type: "has_skipped_reason",
                reason: skippedReason
            });
        }
        if (promptPartSet.has(ref.block_id)) {
            edges.push({
                from: blockNodeId,
                to: `prompt_part:${ref.block_id}`,
                type: "emits_prompt_part"
            });
        }
    }
    input.promptParts.forEach((part, index) => {
        const promptPartNodeId = `prompt_part:${part.block_id}`;
        nodes.push({
            id: promptPartNodeId,
            type: "prompt_part",
            label: part.block_id,
            block_id: part.block_id,
            kind: part.kind,
            authority: part.authority,
            order: index + 1
        });
        edges.push({
            from: promptPartNodeId,
            to: runtimeSpecNodeId,
            type: "contained_in_runtime_spec",
            order: index + 1
        });
        edges.push({
            from: promptPartNodeId,
            to: runtimeSpecNodeId,
            type: "ordered_by_authority",
            order: index + 1
        });
    });
    input.toolRequests.forEach((request, index) => {
        const name = toolRequestName(request, index);
        const toolRequestNodeId = `tool_request:${index + 1}:${name}`;
        nodes.push({
            id: toolRequestNodeId,
            type: "tool_request",
            label: name,
            name,
            order: index + 1
        });
        edges.push({
            from: runtimeSpecNodeId,
            to: toolRequestNodeId,
            type: "requests_tool",
            order: index + 1
        });
    });
    return {
        available: true,
        matrix_kind: "sleeve_relation_preview",
        source: "explain_sleeve",
        non_executing: true,
        sleeve_id: input.sleeveId,
        node_counts: {
            sleeves: 1,
            blocks: input.blockRefs.length,
            active_blocks: input.activeBlocks.length,
            disabled_blocks: input.blockRefs.filter((ref) => !ref.enabled).length,
            skipped_blocks: input.skippedBlocks.length,
            prompt_parts: input.promptParts.length,
            tool_requests: input.toolRequests.length,
            boundaries: 1,
            runtime_specs: 1,
            skipped_reasons: input.skippedBlocks.length
        },
        nodes,
        edges,
        warnings: input.warnings,
        errors: input.errors
    };
}
function invalidSleeveResult(input) {
    return {
        ok: false,
        sleeve_id: input.sleeveId,
        title: null,
        snap_id: null,
        primary_shell_block_id: null,
        content_mode: input.config.contentMode,
        compiler_mode: input.config.compilerMode,
        block_refs: [],
        active_blocks: [],
        disabled_blocks: [],
        missing_blocks: [],
        skipped_blocks: [],
        prompt_parts: [],
        tool_requests: [],
        strategy: {},
        constraints: [],
        context: {},
        values: {},
        format: {},
        warnings: [],
        errors: [input.error],
        runtime_spec_boundary: {
            nonExecuting: true,
            status: "valid_non_executing_artifact"
        },
        matrix_summary: unavailableMatrixSummary("cannot build matrix preview for unknown sleeve")
    };
}
export function explainSleeveById(input) {
    const cfg = effectiveConfig(input.config);
    const root = publicContentRoot(input.metaUrl ?? import.meta.url);
    const sleeve = loadSleeveById(root, input.sleeveId);
    if (!sleeve) {
        return invalidSleeveResult({
            sleeveId: input.sleeveId,
            config: cfg,
            error: `Unknown sleeve: ${input.sleeveId}`
        });
    }
    const blockMap = loadBlockMap(root);
    const compiled = compileSleeveById(sleeve.sleeve_id, input.config, input.metaUrl ?? import.meta.url);
    const activeSet = new Set(compiled.runtimeSpec.active_blocks);
    const blockRefs = sleeve.block_refs.map((ref) => {
        const block = blockMap.get(ref.block_id);
        const enabled = ref.enabled !== false;
        const reason = skippedReason(enabled, block);
        return {
            block_id: ref.block_id,
            enabled,
            resolved: Boolean(block),
            active: activeSet.has(ref.block_id) && enabled && Boolean(block) && block?.enabled !== false,
            kind: block?.kind ?? null,
            authority: block?.authority ?? null,
            skipped_reason: reason,
            text_preview: previewText(block)
        };
    });
    const disabledBlocks = blockRefs.filter((ref) => !ref.enabled).map((ref) => ref.block_id);
    const missingBlocks = blockRefs.filter((ref) => !ref.resolved).map((ref) => ref.block_id);
    const skippedBlocks = blockRefs
        .filter((ref) => ref.skipped_reason !== null)
        .map((ref) => ({ block_id: ref.block_id, reason: ref.skipped_reason }));
    const result = {
        ok: compiled.ok,
        sleeve_id: sleeve.sleeve_id,
        title: sleeve.title,
        snap_id: sleeve.snap_id ?? "default",
        primary_shell_block_id: sleeve.primary_shell_block_id,
        content_mode: cfg.contentMode,
        compiler_mode: cfg.compilerMode,
        block_refs: blockRefs,
        active_blocks: compiled.runtimeSpec.active_blocks,
        disabled_blocks: disabledBlocks,
        missing_blocks: missingBlocks,
        skipped_blocks: skippedBlocks,
        prompt_parts: compiled.runtimeSpec.prompt_parts,
        tool_requests: sleeve.tool_requests ?? [],
        strategy: sleeve.strategy ?? {},
        constraints: sleeve.constraints ?? [],
        context: sleeve.context ?? {},
        values: sleeve.values ?? {},
        format: sleeve.format ?? {},
        warnings: compiled.runtimeSpec.warnings,
        errors: compiled.runtimeSpec.errors,
        runtime_spec_boundary: compiled.runtimeSpecBoundary ?? {
            nonExecuting: true,
            status: "valid_non_executing_artifact"
        },
        matrix_summary: unavailableMatrixSummary("matrix preview not initialized")
    };
    result.matrix_summary = buildMatrixSummary({
        sleeveId: sleeve.sleeve_id,
        blockRefs,
        activeBlocks: compiled.runtimeSpec.active_blocks,
        promptParts: compiled.runtimeSpec.prompt_parts,
        toolRequests: sleeve.tool_requests ?? [],
        skippedBlocks,
        runtimeSpecBoundary: result.runtime_spec_boundary,
        warnings: result.warnings,
        errors: result.errors
    });
    if (input.includeRuntimeSpec === true) {
        result.runtime_spec = compiled.runtimeSpec;
    }
    return result;
}
