export function buildRuntimeIRMatrix(input) {
    const { spec, dashboard } = input;
    const molt_map = input.molt_map ?? dashboard?.molt_map;
    const nodes = [];
    const edges = [];
    const warningSet = new Set(spec.trace.warnings);
    const pushNode = (node) => {
        if (!nodes.some((existing) => existing.id === node.id)) {
            nodes.push(node);
        }
    };
    const pushEdge = (edge) => {
        if (!edges.some((existing) => existing.from === edge.from && existing.to === edge.to && existing.relation === edge.relation && existing.state === edge.state && existing.reason === edge.reason)) {
            edges.push(edge);
        }
    };
    const rootId = spec.runtime_spec_id;
    pushNode({
        id: rootId,
        kind: "runtime_spec",
        label: "RuntimeSpec",
        state: "active",
        metadata: {
            runtime_kind: spec.runtime_kind,
            source_mode: spec.source_mode,
            status: spec.status,
            execution_mode: spec.governance.execution_mode,
            created_at: spec.created_at,
            execution_statement: dashboard?.execution_statement ?? "No tools executed."
        }
    });
    if (molt_map) {
        pushNode({
            id: molt_map.molt_map_id,
            kind: "molt_map",
            label: "Runtime MOLT Map",
            state: "active",
            metadata: {
                source: molt_map.source,
                mode: molt_map.mode
            }
        });
        pushEdge({
            from: rootId,
            to: molt_map.molt_map_id,
            relation: "references",
            state: "active",
            reason: "RuntimeSpec references Runtime MOLT Map projection."
        });
    }
    if (spec.selection.active_sleeve) {
        pushNode({
            id: spec.selection.active_sleeve,
            kind: "sleeve",
            label: spec.selection.active_sleeve,
            state: "selected",
            artifact_id: spec.selection.active_sleeve,
            metadata: provenanceForArtifact(spec, spec.selection.active_sleeve)
        });
        pushEdge({
            from: rootId,
            to: spec.selection.active_sleeve,
            relation: "selects",
            state: "active",
            reason: "Dry-run selected sleeve met conservative threshold."
        });
    }
    else {
        for (const candidate of spec.selection.candidate_sleeves ?? []) {
            pushNode({
                id: candidate.sleeve_id,
                kind: "sleeve",
                label: candidate.sleeve_id,
                state: "available",
                artifact_id: candidate.sleeve_id,
                metadata: {
                    ...candidate.provenance,
                    confidence: candidate.confidence,
                    score: candidate.score,
                    reasons: candidate.reasons,
                    warnings: candidate.warnings,
                    candidate: true
                }
            });
            pushEdge({
                from: rootId,
                to: candidate.sleeve_id,
                relation: "references",
                state: "available",
                reason: "Candidate sleeve found, but conservative threshold was not met."
            });
        }
        if (spec.runtime_kind === "assembled_runtime") {
            const placeholderId = "placeholder.active_sleeve.none";
            pushNode({
                id: placeholderId,
                kind: "matrix_placeholder",
                label: "active_sleeve:none",
                state: "placeholder",
                metadata: {
                    runtime_kind: spec.runtime_kind
                }
            });
            pushEdge({
                from: rootId,
                to: placeholderId,
                relation: "references",
                state: "placeholder",
                reason: "No matching sleeve found; assembled runtime remains dry-run only."
            });
        }
    }
    for (const neostack of spec.selection.active_neostacks) {
        pushNode({
            id: neostack,
            kind: "neostack",
            label: neostack,
            state: "selected",
            artifact_id: neostack,
            metadata: provenanceForArtifact(spec, neostack)
        });
        pushEdge({
            from: rootId,
            to: neostack,
            relation: "selects",
            state: "active",
            reason: "Selected active NeoStack in dry-run RuntimeSpec."
        });
    }
    for (const neoblock of spec.selection.active_neoblocks) {
        pushNode({
            id: neoblock,
            kind: "neoblock",
            label: neoblock,
            state: "selected",
            artifact_id: neoblock,
            metadata: provenanceForArtifact(spec, neoblock)
        });
        pushEdge({
            from: rootId,
            to: neoblock,
            relation: "selects",
            state: "active",
            reason: "Selected active NeoBlock in dry-run RuntimeSpec."
        });
    }
    for (const moltBlock of spec.selection.active_molt_blocks) {
        pushNode({
            id: moltBlock,
            kind: "molt_block",
            label: moltBlock,
            state: "selected",
            artifact_id: moltBlock,
            metadata: provenanceForArtifact(spec, moltBlock)
        });
        pushEdge({
            from: rootId,
            to: moltBlock,
            relation: "selects",
            state: "active",
            reason: "Selected active MOLT block in dry-run RuntimeSpec."
        });
    }
    const governanceId = "governance.governed_execution_plane";
    pushNode({
        id: governanceId,
        kind: "governance",
        label: "governed_execution_plane",
        state: "active",
        metadata: {
            approval_required: spec.governance.approval_required,
            mcp_policy: spec.governance.mcp_policy,
            langchain_policy: spec.governance.langchain_policy,
            execution_mode: spec.governance.execution_mode
        }
    });
    pushEdge({
        from: rootId,
        to: governanceId,
        relation: "governed_by",
        state: "active",
        reason: "RuntimeSpec remains governed by dry-run execution policy."
    });
    for (const instruction of spec.constraints.instructions) {
        const constraintId = `constraint.instruction.${slugify(instruction)}`;
        pushNode({
            id: constraintId,
            kind: "constraint",
            label: instruction,
            state: "active",
            metadata: {
                constraint_type: "instruction"
            }
        });
        pushEdge({
            from: constraintId,
            to: rootId,
            relation: "constrains",
            state: "active",
            reason: "RuntimeSpec is constrained by declared instruction."
        });
    }
    for (const rule of spec.constraints.protected_rules) {
        const constraintId = `constraint.protected_rule.${slugify(rule)}`;
        pushNode({
            id: constraintId,
            kind: "constraint",
            label: rule,
            state: "active",
            metadata: {
                constraint_type: "protected_rule"
            }
        });
        pushEdge({
            from: constraintId,
            to: rootId,
            relation: "constrains",
            state: "active",
            reason: "Protected rule constrains runtime structure."
        });
        pushEdge({
            from: constraintId,
            to: governanceId,
            relation: "references",
            state: "active",
            reason: "Protected rule is represented under governance authority."
        });
    }
    for (const blockedArtifact of spec.constraints.blocked_artifacts) {
        const blockedId = `constraint.blocked_artifact.${slugify(blockedArtifact)}`;
        pushNode({
            id: blockedId,
            kind: "constraint",
            label: blockedArtifact,
            state: "blocked",
            metadata: {
                constraint_type: "blocked_artifact"
            }
        });
        pushEdge({
            from: blockedId,
            to: rootId,
            relation: "blocked_by",
            state: "blocked",
            reason: "Artifact remains blocked by runtime constraints."
        });
    }
    const addToolBinding = (tool, state, relationState, reason) => {
        const nodeId = `tool.${tool}`;
        const binding = spec.tool_bindings.bindings?.find((entry) => entry.tool_id === tool);
        pushNode({
            id: nodeId,
            kind: "tool_binding",
            label: tool,
            state,
            metadata: {
                binding_scope: binding?.status === "metadata_only" ? "metadata_only" : binding?.status === "mock_only" ? "mock_only" : "requested_tool_binding",
                risk_level: binding?.risk_level,
                execution_mode: binding?.execution_mode,
                approval_required: binding?.approval_required,
                governance_policy: binding?.governance_policy,
                blocked_reason: binding?.blocked_reason
            }
        });
        pushEdge({
            from: rootId,
            to: nodeId,
            relation: "requests_tool",
            state: relationState,
            reason
        });
        pushEdge({
            from: nodeId,
            to: governanceId,
            relation: "governed_by",
            state: state === "blocked" ? "blocked" : "active",
            reason: "Tool-binding intent remains governed by policy."
        });
        return nodeId;
    };
    for (const tool of spec.tool_bindings.available) {
        addToolBinding(tool, "available", "available", "Requested tool binding is available in dry-run projection.");
    }
    for (const tool of spec.tool_bindings.metadata_only ?? []) {
        addToolBinding(tool, "available", "available", "Requested tool binding is metadata-only in dry-run projection.");
    }
    for (const tool of spec.tool_bindings.mock_only ?? []) {
        addToolBinding(tool, "available", "available", "Requested tool binding is mock-only in dry-run projection.");
    }
    for (const tool of spec.tool_bindings.requires_approval) {
        const nodeId = addToolBinding(tool, "requires_approval", "requires_approval", "Requested tool binding requires approval in dry-run projection.");
        pushEdge({
            from: nodeId,
            to: governanceId,
            relation: "requires_approval",
            state: "requires_approval",
            reason: "Requested tool binding is approval-gated by governance."
        });
    }
    for (const tool of spec.tool_bindings.blocked) {
        const nodeId = addToolBinding(tool, "blocked", "blocked", "Requested tool binding is blocked by governance in dry-run projection.");
        pushEdge({
            from: nodeId,
            to: governanceId,
            relation: "blocked_by",
            state: "blocked",
            reason: "Requested tool binding is blocked by governance."
        });
    }
    if (spec.governance.approval_required) {
        const approvalRequestNodeId = "approval.request.pending";
        const checkpointPolicyNodeId = "checkpoint.policy.required_before_execution";
        const resumeGuardNodeId = "resume.guard.requires_checkpoint";
        pushNode({
            id: approvalRequestNodeId,
            kind: "approval_request",
            label: "approval_request",
            state: "requires_approval",
            metadata: {
                status: "pending",
                execution_statement: "No tools executed."
            }
        });
        pushNode({
            id: checkpointPolicyNodeId,
            kind: "checkpoint_policy",
            label: "checkpoint_policy",
            state: "requires_approval",
            metadata: {
                status: "required_before_execution",
                execution_statement: "No tools executed."
            }
        });
        pushNode({
            id: resumeGuardNodeId,
            kind: "resume_guard",
            label: "resume_guard",
            state: "requires_approval",
            metadata: {
                status: "requires_checkpoint",
                execution_statement: "No tools executed."
            }
        });
        pushEdge({
            from: rootId,
            to: approvalRequestNodeId,
            relation: "references",
            state: "requires_approval",
            reason: "Governed handoff would require explicit approval request before future execution."
        });
        pushEdge({
            from: rootId,
            to: checkpointPolicyNodeId,
            relation: "constrains",
            state: "requires_approval",
            reason: "Checkpoint would be required before future approved execution."
        });
        pushEdge({
            from: rootId,
            to: resumeGuardNodeId,
            relation: "constrains",
            state: "requires_approval",
            reason: "Resume would require checkpoint and revalidation."
        });
        const approvalNodeId = "constraint.approval_required";
        pushNode({
            id: approvalNodeId,
            kind: "constraint",
            label: "approval_required",
            state: "requires_approval",
            metadata: {
                required_approvals: spec.constraints.required_approvals
            }
        });
        pushEdge({
            from: rootId,
            to: approvalNodeId,
            relation: "constrains",
            state: "requires_approval",
            reason: "RuntimeSpec carries approval-gated intent in dry-run mode."
        });
        pushEdge({
            from: approvalNodeId,
            to: governanceId,
            relation: "requires_approval",
            state: "requires_approval",
            reason: "Approval gating remains governed and non-executing."
        });
    }
    if (spec.selection.support_artifacts.length > 0) {
        const supportConstraintId = "constraint.support_docs_non_runtime_selectable";
        pushNode({
            id: supportConstraintId,
            kind: "constraint",
            label: "support_docs_non_runtime_selectable",
            state: "blocked",
            metadata: {
                constraint_type: "support_only"
            }
        });
        for (const supportArtifact of spec.selection.support_artifacts) {
            const nodeId = `support.${supportArtifact}`;
            pushNode({
                id: nodeId,
                kind: "support_artifact",
                label: supportArtifact,
                state: "support_only",
                artifact_id: supportArtifact,
                metadata: {
                    support_only: true
                }
            });
            pushEdge({
                from: nodeId,
                to: rootId,
                relation: "supports_explanation",
                state: "support_only",
                reason: "Support artifact is attached for explanation/context only."
            });
            pushEdge({
                from: nodeId,
                to: supportConstraintId,
                relation: "blocked_by",
                state: "blocked",
                reason: "Support artifact remains non-runtime-selectable."
            });
        }
        pushEdge({
            from: supportConstraintId,
            to: governanceId,
            relation: "governed_by",
            state: "active",
            reason: "Support-only boundary remains governed by runtime policy."
        });
    }
    for (const warning of spec.trace.warnings) {
        const warningId = `warning.${slugify(warning)}`;
        pushNode({
            id: warningId,
            kind: "warning",
            label: warning,
            state: "warning"
        });
        pushEdge({
            from: rootId,
            to: warningId,
            relation: "has_warning",
            state: "warning",
            reason: "Runtime warning is attached to this dry-run projection."
        });
    }
    const traceId = spec.trace.trace_id;
    pushNode({
        id: traceId,
        kind: "trace_event",
        label: traceId,
        state: "available",
        metadata: {
            event_count: spec.trace.selection_events.length
        }
    });
    pushEdge({
        from: rootId,
        to: traceId,
        relation: "emits_trace",
        state: "available",
        reason: "RuntimeSpec emits trace visibility for this projection."
    });
    if (molt_map) {
        for (const [fieldName, fieldValue] of Object.entries(molt_map.fields)) {
            const fieldNodeId = `molt_field.${fieldName}`;
            pushNode({
                id: fieldNodeId,
                kind: "molt_block",
                label: fieldName,
                state: fieldValue.value === "n/a" ? "placeholder" : "available",
                metadata: {
                    value: fieldValue.value,
                    source: fieldValue.source,
                    confidence: fieldValue.confidence,
                    notes: fieldValue.notes ?? []
                }
            });
            pushEdge({
                from: molt_map.molt_map_id,
                to: fieldNodeId,
                relation: "contains",
                state: fieldValue.value === "n/a" ? "placeholder" : "available",
                reason: "Runtime MOLT Map contains this cognitive-role field projection."
            });
            const mappedTargets = fieldValue.artifact_ids.length > 0
                ? fieldValue.artifact_ids
                : defaultTargetsForField(fieldName, rootId, governanceId, spec);
            for (const target of mappedTargets) {
                if (nodes.some((node) => node.id === target)) {
                    pushEdge({
                        from: fieldNodeId,
                        to: target,
                        relation: "maps_to_molt_field",
                        state: fieldValue.value === "n/a" ? "placeholder" : "available",
                        reason: `Runtime structure maps to MOLT field ${fieldName}.`
                    });
                }
            }
        }
    }
    const matrix = {
        matrix_id: spec.matrix.matrix_id,
        runtime_spec_id: spec.runtime_spec_id,
        molt_map_id: molt_map?.molt_map_id,
        source: "RuntimeSpecV0",
        mode: "dry_run",
        created_at: spec.created_at,
        matrix_available: true,
        nodes,
        edges,
        warnings: [...warningSet],
        trace_id: spec.trace.trace_id
    };
    matrix.symbolic = renderRuntimeIRMatrix(matrix);
    return matrix;
}
export function renderRuntimeIRMatrix(matrix) {
    const lines = [];
    const root = matrix.nodes.find((node) => node.kind === "runtime_spec" && node.id === matrix.runtime_spec_id)
        ?? matrix.nodes.find((node) => node.kind === "runtime_spec");
    if (!root) {
        return "? runtime_spec missing ?";
    }
    lines.push(`${symbolForKind(root.kind)} ${root.id} ${symbolForState(root.state)}`);
    const emitted = new Set();
    const outgoing = matrix.edges.filter((edge) => edge.from === root.id);
    for (const edge of outgoing) {
        const target = matrix.nodes.find((node) => node.id === edge.to);
        if (!target)
            continue;
        emitted.add(target.id);
        lines.push(renderEdgeLine(target, edge));
        const childEdges = matrix.edges.filter((child) => child.from === target.id);
        for (const childEdge of childEdges) {
            const childTarget = matrix.nodes.find((node) => node.id === childEdge.to);
            if (!childTarget)
                continue;
            emitted.add(childTarget.id);
            lines.push(renderEdgeLine(childTarget, childEdge, 1));
        }
    }
    for (const node of matrix.nodes) {
        if (node.id === root.id || emitted.has(node.id))
            continue;
        const incoming = matrix.edges.find((edge) => edge.to === node.id);
        if (!incoming) {
            lines.push(`${symbolForKind(node.kind)} ${node.id} ${symbolForState(node.state)}`);
        }
    }
    return lines.join("\n");
}
function renderEdgeLine(node, edge, depth = 0) {
    const indent = depth === 0 ? " " : "  ";
    const annotation = annotationForNode(node, edge);
    return `${indent}→ ${symbolForKind(node.kind)} ${node.label} ${symbolForState(node.state)}${annotation ? ` ${annotation}` : ""}`;
}
function annotationForNode(node, edge) {
    if (node.kind === "tool_binding" && node.state === "requires_approval")
        return "requires_approval";
    if (node.kind === "tool_binding" && node.metadata?.binding_scope === "metadata_only")
        return "metadata_only";
    if (node.kind === "tool_binding" && node.metadata?.binding_scope === "mock_only")
        return "mock_only";
    if (node.kind === "support_artifact" && node.state === "support_only")
        return "support_only";
    if (node.kind === "governance") {
        const mcp = typeof node.metadata?.mcp_policy === "string" ? `mcp_policy:${node.metadata.mcp_policy}` : undefined;
        const langchain = typeof node.metadata?.langchain_policy === "string" ? `langchain_policy:${node.metadata.langchain_policy}` : undefined;
        return [mcp, langchain].filter(Boolean).join(" ") || undefined;
    }
    if (edge.relation === "blocked_by")
        return "blocked";
    return undefined;
}
function symbolForKind(kind) {
    switch (kind) {
        case "runtime_spec":
        case "sleeve":
            return "◆";
        case "neostack":
            return "▣";
        case "neoblock":
            return "◇";
        case "molt_block":
            return "■";
        case "tool_binding":
            return "🔧";
        case "governance":
            return "⚖";
        case "constraint":
            return "⛓";
        case "support_artifact":
            return "📘";
        case "warning":
            return "!";
        case "trace_event":
            return "⚑";
        case "molt_map":
            return "◌";
        case "matrix_placeholder":
            return "?";
        case "approval_request":
            return "⛓";
        case "checkpoint_policy":
            return "⛓";
        case "resume_guard":
            return "⛓";
        default:
            return "?";
    }
}
function symbolForState(state) {
    switch (state) {
        case "active":
        case "selected":
            return "●";
        case "available":
            return "○";
        case "blocked":
            return "⊘";
        case "support_only":
            return "~";
        case "warning":
            return "!";
        case "placeholder":
        case "unavailable":
            return "?";
        case "requires_approval":
            return "!";
        default:
            return "?";
    }
}
function provenanceForArtifact(spec, artifactId) {
    const event = spec.trace.selection_events.find((entry) => entry.artifact_id === artifactId && entry.provenance);
    return event?.provenance ?? {};
}
function slugify(input) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || "value";
}
function defaultTargetsForField(fieldName, rootId, governanceId, spec) {
    switch (fieldName) {
        case "Directive":
            return spec.selection.active_neostacks[0]
                ? [spec.selection.active_neostacks[0]]
                : spec.selection.active_sleeve
                    ? [spec.selection.active_sleeve]
                    : [rootId];
        case "Instruction":
            return [governanceId];
        case "Blueprint":
            return [rootId];
        case "Subject":
        case "Primary":
        case "Trigger":
        case "Philosophy":
        default:
            return [rootId];
    }
}
