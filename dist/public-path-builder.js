export function buildPublicPath(message, sleeveId = "public-basic-envoy") {
    const concise = /concise|brief|short/.test(message.toLowerCase());
    return {
        use: "public_compile_and_render_path",
        aim: "public_safe_human_inspectable_route",
        need: ["bundled_public_content", "compiler_visible_output"],
        sleeveId,
        triggers: concise ? ["public.concise"] : ["public.default"],
        gates: [],
        loadedStacks: ["S.PUBLIC.01", "S.PUBLIC.02"],
        stacks: [
            {
                id: "S.PUBLIC.01",
                blocks: [
                    { id: "NB.PUBLIC.01", molts: [{ state: "active", role: "P", id: "primary.sample" }] }
                ]
            },
            {
                id: "S.PUBLIC.02",
                blocks: [
                    { id: "NB.PUBLIC.02", molts: [{ state: "active", role: concise ? "D" : "I", id: concise ? "directive.sample" : "instruction.sample" }] }
                ]
            }
        ],
        relationships: [],
        bundles: [],
        merges: [],
        winners: [{ key: "chain", value: `NB.PUBLIC.02>${concise ? "directive.sample" : "instruction.sample"}` }],
        compiler: { stages: ["validate", "normalize", "emit"] }
    };
}
