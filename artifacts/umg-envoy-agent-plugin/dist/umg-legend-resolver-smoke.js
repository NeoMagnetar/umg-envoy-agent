import { resolvePaths } from "./paths.js";
import { buildLegendResolverIndex, resolveUMGPathAgainstLegend } from "./umg-legend-resolver.js";
function makeValidDoc() {
    return {
        use: "USE.001",
        aim: "AIM.001",
        need: ["NEED.001"],
        sleeveId: "sample-basic-minimal",
        triggers: ["TRG.041"],
        gates: [{ state: "active", id: "g.message" }],
        loadedStacks: ["S.01"],
        stacks: [
            {
                id: "S.01",
                blocks: [
                    {
                        id: "N.03.01",
                        molts: [
                            { state: "active", role: "I", id: "INST.061" }
                        ]
                    }
                ]
            }
        ],
        relationships: [],
        bundles: [],
        merges: [],
        winners: [{ key: "chain", value: "N.03.01>INST.061" }],
        compiler: { stages: ["validate", "compile"] }
    };
}
function makeUnknownSleeveDoc() {
    return {
        ...makeValidDoc(),
        sleeveId: "slv-does-not-exist"
    };
}
function makeMismatchDoc() {
    return {
        ...makeValidDoc(),
        loadedStacks: ["S.99"],
        stacks: [
            {
                id: "S.99",
                blocks: [
                    {
                        id: "N.99.99",
                        molts: [
                            { state: "active", role: "I", id: "INST.DOES.NOT.EXIST" }
                        ]
                    }
                ]
            }
        ]
    };
}
export function runLegendResolverSmoke() {
    const paths = resolvePaths();
    const index = buildLegendResolverIndex(paths);
    const valid = resolveUMGPathAgainstLegend(paths, makeValidDoc());
    const unknown = resolveUMGPathAgainstLegend(paths, makeUnknownSleeveDoc());
    const mismatch = resolveUMGPathAgainstLegend(paths, makeMismatchDoc());
    return {
        summary: {
            sleeves: index.sleeveIds.size,
            stacks: index.stackIds.size,
            blocks: index.blockIds.size,
            molts: index.moltIds.size,
            libraryEntries: index.libraryEntryIds.size,
            triggers: index.triggerIds.size
        },
        valid: {
            ok: valid.ok,
            issueCodes: valid.issues.map((issue) => issue.code)
        },
        unknownSleeve: {
            ok: unknown.ok,
            issueCodes: unknown.issues.map((issue) => issue.code)
        },
        mismatch: {
            ok: mismatch.ok,
            issueCodes: mismatch.issues.map((issue) => issue.code)
        }
    };
}
