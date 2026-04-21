import { buildPlannerFromRuntimeMessage } from "./umg-runtime-planner.js";
const CASES = [
    {
        id: "trigger-heavy",
        label: "Trigger-heavy request",
        message: "please create a custom item and new weapon, then test the setup",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "neutral-no-trigger",
        label: "Neutral / no-trigger request",
        message: "please analyze this system and give me a concise bullet list",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "competing-directive",
        label: "Competing directive-style request",
        message: "be direct but also expansive and explain the reasoning clearly",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "competing-format",
        label: "Competing format request",
        message: "give me a concise bullet list but also a flowing narrative summary",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "persona-modulation",
        label: "Persona modulation request",
        message: "be analytical but still a little playful in tone",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "posture-modulation",
        label: "Posture modulation request",
        message: "be direct and concrete with the answer",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "mixed-modulation",
        label: "Mixed modulation request",
        message: "be analytical, direct, and give me a concise bullet list",
        sleeveId: "sample-basic-minimal",
        expectSemanticOk: true
    },
    {
        id: "intentional-bad-case",
        label: "Intentional bad case",
        message: "",
        sleeveId: "missing-sleeve-does-not-resolve",
        expectSemanticOk: false
    }
];
export function runRuntimeSmokeMatrix() {
    const cases = CASES.map((testCase) => {
        const result = buildPlannerFromRuntimeMessage({
            message: testCase.message,
            sleeveId: testCase.sleeveId,
            provenance: [`smoke-matrix:${testCase.id}`],
            notes: [`stage-7 runtime smoke matrix case: ${testCase.label}`]
        });
        return {
            id: testCase.id,
            label: testCase.label,
            message: testCase.message,
            triggerState: result.plannerTrace.triggerState,
            plannerDoc: {
                sleeveId: result.doc.sleeveId,
                triggers: result.doc.triggers,
                loadedStacks: result.doc.loadedStacks,
                winnerPath: result.doc.winners.map((winner) => `${winner.key}=${winner.value}`),
                need: result.doc.need,
                stackCount: result.doc.stacks.length
            },
            structural: result.structural,
            semantic: result.semantic,
            issueCodes: result.issues.map((issue) => issue.code),
            bridgeProvenance: {
                alignedStacks: result.plannerTrace.alignedStacks,
                alignedBlocks: result.plannerTrace.alignedBlocks,
                manyToOneWarnings: result.plannerTrace.manyToOneWarnings,
                sourceSummary: result.alignmentTrace.map((entry) => `${entry.kind}:${entry.source}:${entry.targetKind}:${entry.mode}`)
            },
            winnerPath: result.doc.winners,
            expectedSemanticOk: testCase.expectSemanticOk ?? true,
            expectationMet: (testCase.expectSemanticOk ?? true) === result.semantic.ok
        };
    });
    return {
        summary: {
            total: cases.length,
            semanticOk: cases.filter((item) => item.semantic.ok).length,
            expectationMet: cases.filter((item) => item.expectationMet).length,
            failedExpectations: cases.filter((item) => !item.expectationMet).map((item) => item.id)
        },
        cases
    };
}
