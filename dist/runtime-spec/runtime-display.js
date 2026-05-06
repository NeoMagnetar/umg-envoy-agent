import { stableHash } from "./approval-checkpoint-contract.js";
export function buildUMGRuntimeDisplayContract(input) {
    const { dashboard } = input;
    const mode = input.mode ?? "compact";
    const symbolic = dashboard.ir_matrix ? `nodes:${dashboard.ir_matrix.nodes.length} edges:${dashboard.ir_matrix.edges.length}` : undefined;
    return {
        display_id: `runtime_display_${stableHash({ mode, runtime_spec_id: dashboard.header.runtime_spec_id, trace_id: dashboard.header.trace_id, execution: dashboard.execution_statement })}`,
        spec_version: "UMG_RUNTIME_DISPLAY.v0.1",
        mode,
        header: {
            agent: "OpenClaw UMG Envoy",
            runtime_mode: dashboard.header.runtime_mode,
            runtime_spec_id: dashboard.header.runtime_spec_id,
            trace_id: dashboard.header.trace_id,
            matrix_id: dashboard.ir_matrix?.matrix_id,
            execution_statement: dashboard.execution_statement
        },
        active_runtime: {
            selected_sleeve: dashboard.governed_handoff?.selected_context.active_sleeve ?? null,
            selected_neostacks: dashboard.header.active_neostacks ?? [],
            selected_neoblocks: dashboard.header.active_neoblocks ?? [],
            selected_molt_blocks: dashboard.header.active_molt_blocks ?? [],
            support_docs_runtime_selected: false
        },
        molt_map: dashboard.molt_map ? {
            Trigger: dashboard.molt_map.fields.Trigger?.value ?? "",
            Directive: dashboard.molt_map.fields.Directive?.value ?? "",
            Instruction: dashboard.molt_map.fields.Instruction?.value ?? "",
            Subject: dashboard.molt_map.fields.Subject?.value ?? "",
            Primary: dashboard.molt_map.fields.Primary?.value ?? "",
            Philosophy: dashboard.molt_map.fields.Philosophy?.value ?? "",
            Blueprint: dashboard.molt_map.fields.Blueprint?.value ?? ""
        } : undefined,
        ir_matrix: dashboard.ir_matrix ? {
            available: true,
            symbolic: mode === "debug" ? dashboard.ir_matrix.symbolic : symbolic,
            node_count: dashboard.ir_matrix.nodes.length,
            edge_count: dashboard.ir_matrix.edges.length
        } : { available: false },
        governance: {
            approval_required: Boolean(dashboard.governed_handoff?.approval.approval_required),
            checkpoint_required: Boolean(dashboard.governed_handoff?.checkpoint.checkpoint_required),
            blocked: Boolean(dashboard.governed_handoff?.blocking.blocked),
            tool_execution_added: false
        },
        execution_boundary: {
            file_contents_read: false,
            write_performed: false,
            delete_performed: false,
            shell_command_executed: false,
            external_calls_performed: Boolean(dashboard.governed_alpha?.execution_boundary.external_calls_performed),
            statement: dashboard.execution_statement
        },
        warnings: collectWarnings(dashboard)
    };
}
export function renderUMGRuntimeDisplay(display) {
    const sections = [
        [
            "```nl",
            "Runtime Header:",
            `Agent: ${display.header.agent}`,
            `Mode: ${display.header.runtime_mode}`,
            ...(display.header.runtime_spec_id ? [`RuntimeSpec: ${display.header.runtime_spec_id}`] : []),
            ...(display.header.trace_id ? [`Trace: ${display.header.trace_id}`] : []),
            ...(display.header.matrix_id ? [`Matrix: ${display.header.matrix_id}`] : []),
            `Execution: ${display.header.execution_statement}`,
            "```"
        ].join("\n"),
        [
            "```nl",
            "Active Runtime:",
            `Selected Sleeve: ${display.active_runtime.selected_sleeve ?? "none"}`,
            `Selected NeoStack: ${display.active_runtime.selected_neostacks.join(", ") || "none"}`,
            `Selected NeoBlocks: ${display.active_runtime.selected_neoblocks.join(", ") || "none"}`,
            `Selected MOLT Blocks: ${display.active_runtime.selected_molt_blocks.join(", ") || "none"}`,
            `Support Docs Runtime-Selected: ${display.active_runtime.support_docs_runtime_selected}`,
            "```"
        ].join("\n")
    ];
    if (display.molt_map) {
        sections.push([
            "```nl",
            "MOLT Map:",
            `Trigger: ${display.molt_map.Trigger}`,
            `Directive: ${display.molt_map.Directive}`,
            `Instruction: ${display.molt_map.Instruction}`,
            `Subject: ${display.molt_map.Subject}`,
            `Primary: ${display.molt_map.Primary}`,
            `Philosophy: ${display.molt_map.Philosophy}`,
            `Blueprint: ${display.molt_map.Blueprint}`,
            "```"
        ].join("\n"));
    }
    sections.push([
        "```nl",
        "IR Matrix:",
        `Available: ${display.ir_matrix?.available ?? false}`,
        ...(typeof display.ir_matrix?.node_count === "number" ? [`Nodes: ${display.ir_matrix.node_count}`] : []),
        ...(typeof display.ir_matrix?.edge_count === "number" ? [`Edges: ${display.ir_matrix.edge_count}`] : []),
        ...(display.ir_matrix?.symbolic ? [`Symbolic: ${display.ir_matrix.symbolic}`] : ["Symbolic: unavailable"]),
        "```"
    ].join("\n"));
    sections.push([
        "```nl",
        "Execution / Safety:",
        `File Contents Read: ${display.execution_boundary.file_contents_read}`,
        `Writes: ${display.execution_boundary.write_performed}`,
        `Deletes: ${display.execution_boundary.delete_performed}`,
        `Shell: ${display.execution_boundary.shell_command_executed}`,
        `Remote MCP: false`,
        `LangChain Agent Mode: false`,
        `Approval Required: ${display.governance.approval_required}`,
        `Checkpoint Required: ${display.governance.checkpoint_required}`,
        `SpecVersion: ${display.spec_version}`,
        "```"
    ].join("\n"));
    if (display.warnings.length > 0 && display.mode !== "compact") {
        sections.push(["```nl", "Warnings:", ...display.warnings.map((warning) => `- ${warning}`), "```"].join("\n"));
    }
    return sections.join("\n\n");
}
function collectWarnings(dashboard) {
    const warnings = new Set();
    for (const warning of dashboard.governed_handoff?.warnings ?? [])
        warnings.add(warning);
    for (const warning of dashboard.preflight?.warnings ?? [])
        warnings.add(warning);
    for (const warning of dashboard.governed_alpha?.warnings ?? [])
        warnings.add(warning);
    for (const warning of dashboard.local_readonly_inspection?.warnings ?? [])
        warnings.add(warning);
    return [...warnings];
}
