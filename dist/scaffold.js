import fs from "node:fs";
import path from "node:path";
export function scaffoldMicroAgentBlock(paths, config, params) {
    if (!config.allowRuntimeWrites) {
        throw new Error("Runtime writes are disabled. Enable allowRuntimeWrites in plugin config before scaffold operations that create files.");
    }
    const folder = params.targetFolder
        ? path.resolve(params.targetFolder)
        : path.join(paths.resleeverBlocksDir, "generated", "micro-agents");
    fs.mkdirSync(folder, { recursive: true });
    const payload = {
        id: params.id,
        title: params.title,
        category: "micro-agent",
        role: params.role,
        summary: params.summary,
        createdBy: "umg-envoy-agent-plugin",
        createdAt: new Date().toISOString(),
        executionIntent: {
            kind: "micro-task-agent",
            notes: [
                "This scaffold is a first-pass generated UMG micro-agent block.",
                "Downstream refinement should decide whether it becomes a MOLT block, NeoBlock, or NeoStack-linked artifact."
            ]
        }
    };
    const outputPath = path.join(folder, `${params.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
    return { outputPath };
}
