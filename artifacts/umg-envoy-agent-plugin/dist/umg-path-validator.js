function push(issues, severity, code, message, path) {
    issues.push({ severity, code, message, path });
}
function collectDeclaredIds(doc) {
    const ids = new Set();
    ids.add(doc.sleeveId);
    for (const stackId of doc.loadedStacks)
        ids.add(stackId);
    for (const stack of doc.stacks) {
        ids.add(stack.id);
        for (const block of stack.blocks) {
            ids.add(block.id);
            for (const molt of block.molts)
                ids.add(molt.id);
        }
    }
    for (const trigger of doc.triggers)
        ids.add(trigger);
    for (const gate of doc.gates)
        ids.add(gate.id);
    return ids;
}
function validateBundles(doc, issues, ids) {
    for (const [index, bundle] of doc.bundles.entries()) {
        if (bundle.members.length < 2) {
            push(issues, "error", "BND_TOO_SMALL", "Bundle must contain at least two members", `bundles[${index}]`);
        }
        for (const member of bundle.members) {
            if (!ids.has(member)) {
                push(issues, "warning", "BND_UNKNOWN_MEMBER", `Bundle member not declared elsewhere: ${member}`, `bundles[${index}]`);
            }
        }
    }
}
function validateMerges(doc, issues, ids) {
    for (const [index, merge] of doc.merges.entries()) {
        if (merge.sources.length < 2) {
            push(issues, "error", "MRG_TOO_SMALL", "Merge must contain at least two source ids", `merges[${index}]`);
        }
        for (const source of merge.sources) {
            if (!ids.has(source)) {
                push(issues, "warning", "MRG_UNKNOWN_SOURCE", `Merge source not declared elsewhere: ${source}`, `merges[${index}]`);
            }
        }
    }
}
export function validateUMGPath(doc) {
    const issues = [];
    if (!doc.use)
        push(issues, "error", "MISSING_USE", "USE is required", "use");
    if (!doc.aim)
        push(issues, "error", "MISSING_AIM", "AIM is required", "aim");
    if (!doc.sleeveId)
        push(issues, "error", "MISSING_SLEEVE", "SLV is required", "sleeveId");
    if (!doc.compiler.stages.length)
        push(issues, "error", "MISSING_COMPILER_STAGES", "CMP stages are required", "compiler");
    const stackIds = new Set();
    const blockIds = new Set();
    const moltIds = new Set();
    for (const [stackIndex, stack] of doc.stacks.entries()) {
        if (stackIds.has(stack.id)) {
            push(issues, "error", "DUP_STACK_ID", `Duplicate stack id: ${stack.id}`, `stacks[${stackIndex}]`);
        }
        stackIds.add(stack.id);
        if (!doc.loadedStacks.includes(stack.id)) {
            push(issues, "warning", "STACK_NOT_LOADED", `Stack declared but not present in LOAD: ${stack.id}`, `stacks[${stackIndex}]`);
        }
        for (const [blockIndex, block] of stack.blocks.entries()) {
            if (blockIds.has(block.id)) {
                push(issues, "error", "DUP_BLOCK_ID", `Duplicate block id: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
            }
            blockIds.add(block.id);
            if (block.molts.length === 0) {
                push(issues, "warning", "EMPTY_BLOCK", `NeoBlock has no MOLT members: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
            }
            const blockRoles = new Set();
            for (const [moltIndex, molt] of block.molts.entries()) {
                if (moltIds.has(molt.id)) {
                    push(issues, "warning", "DUP_MOLT_ID", `Duplicate MOLT id referenced: ${molt.id}`, `stacks[${stackIndex}].blocks[${blockIndex}].molts[${moltIndex}]`);
                }
                moltIds.add(molt.id);
                blockRoles.add(molt.role);
            }
            if (blockRoles.size === 0) {
                push(issues, "warning", "BLOCK_HAS_NO_ROLES", `Block has no usable roles: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
            }
        }
    }
    const ids = collectDeclaredIds(doc);
    for (const [index, relation] of doc.relationships.entries()) {
        if (relation.members.length < 2) {
            push(issues, "error", "REL_TOO_SMALL", `Relationship ${relation.kind} must reference at least two members`, `relationships[${index}]`);
        }
        for (const member of relation.members) {
            if (!ids.has(member)) {
                push(issues, "warning", "REL_UNKNOWN_MEMBER", `Relationship member not declared elsewhere: ${member}`, `relationships[${index}]`);
            }
        }
    }
    validateBundles(doc, issues, ids);
    validateMerges(doc, issues, ids);
    for (const [index, winner] of doc.winners.entries()) {
        if (winner.key !== "chain" && !ids.has(winner.value)) {
            push(issues, "warning", "WIN_UNKNOWN_TARGET", `Winner target not declared elsewhere: ${winner.value}`, `winners[${index}]`);
        }
    }
    if (!doc.loadedStacks.length) {
        push(issues, "warning", "EMPTY_LOAD", "LOAD is empty");
    }
    if (!doc.triggers.length) {
        push(issues, "warning", "NO_TRIGGERS", "TRG is empty");
    }
    return issues;
}
