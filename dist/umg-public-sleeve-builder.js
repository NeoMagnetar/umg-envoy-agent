function buildBaseDoc(sleeveId) {
    return {
        use: "public_safe_build_path",
        aim: "public_safe_renderable_route",
        need: ["public_safe", "bounded_surface"],
        sleeveId,
        triggers: [],
        gates: [],
        loadedStacks: ["S.MOD.01", "S.MOD.02", "S.MOD.03"],
        stacks: [
            {
                id: "S.MOD.01",
                blocks: [
                    {
                        id: "NB.MOD.01",
                        molts: [{ state: "active", role: "I", id: "INST.MOD.003" }]
                    }
                ]
            },
            {
                id: "S.MOD.02",
                blocks: [
                    {
                        id: "NB.MOD.02",
                        molts: [{ state: "active", role: "I", id: "INST.MOD.101" }]
                    }
                ]
            },
            {
                id: "S.MOD.03",
                blocks: [
                    {
                        id: "NB.MOD.03",
                        molts: [{ state: "active", role: "I", id: "INST.MOD.201" }]
                    }
                ]
            }
        ],
        relationships: [],
        bundles: [],
        merges: [],
        winners: [{ key: "chain", value: "NB.MOD.03>INST.MOD.201" }],
        compiler: { stages: ["validate", "normalize", "emit"] }
    };
}
export function buildSleeveAwarePublicPath(message, sleeveId) {
    const normalizedSleeve = (sleeveId ?? "sample-basic-minimal").trim() || "sample-basic-minimal";
    const normalizedMessage = message.toLowerCase();
    if (normalizedSleeve === "project-launcher") {
        return {
            ...buildBaseDoc(normalizedSleeve),
            loadedStacks: ["S.MOD.01", "S.MOD.02", "S.PROJ.01"],
            stacks: [
                {
                    id: "S.MOD.01",
                    blocks: [{ id: "NB.MOD.01", molts: [{ state: "active", role: "I", id: "INST.MOD.003" }] }]
                },
                {
                    id: "S.MOD.02",
                    blocks: [{ id: "NB.MOD.02", molts: [{ state: "active", role: "I", id: normalizedMessage.includes("concise") ? "INST.MOD.101" : "INST.MOD.102" }] }]
                },
                {
                    id: "S.PROJ.01",
                    blocks: [{ id: "NB.PROJ.01", molts: [{ state: "active", role: "I", id: "INST.PROJ.001" }] }]
                }
            ],
            winners: [{ key: "chain", value: "NB.PROJ.01>INST.PROJ.001" }]
        };
    }
    if (normalizedSleeve === "uo-server-developer") {
        return {
            ...buildBaseDoc(normalizedSleeve),
            loadedStacks: ["S.MOD.01", "S.MOD.02", "S.CODE.01"],
            stacks: [
                {
                    id: "S.MOD.01",
                    blocks: [{ id: "NB.MOD.01", molts: [{ state: "active", role: "I", id: "INST.MOD.003" }] }]
                },
                {
                    id: "S.MOD.02",
                    blocks: [{ id: "NB.MOD.02", molts: [{ state: "active", role: "I", id: normalizedMessage.includes("brief") ? "INST.MOD.101" : "INST.MOD.102" }] }]
                },
                {
                    id: "S.CODE.01",
                    blocks: [{ id: "NB.CODE.01", molts: [{ state: "active", role: "I", id: "INST.CODE.001" }] }]
                }
            ],
            winners: [{ key: "chain", value: "NB.CODE.01>INST.CODE.001" }]
        };
    }
    return buildBaseDoc(normalizedSleeve);
}
