import { buildPlannerFromRuntimeMessage } from "./umg-runtime-planner.js";
import { compilePlannerWithAdapter } from "./umg-compiler-adapter.js";
const CASES = [
    { id: "trigger-heavy", message: "please create a custom item and new weapon, then test the setup", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "neutral-no-trigger", message: "please analyze this system and give me a concise bullet list", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "competing-directive", message: "be direct but also expansive and explain the reasoning clearly", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "competing-format", message: "give me a concise bullet list but also a flowing narrative summary", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "persona-modulation", message: "be analytical but still a little playful in tone", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "posture-modulation", message: "be direct and concrete with the answer", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "mixed-modulation", message: "be analytical, direct, and give me a concise bullet list", sleeveId: "sample-basic-minimal", expectCompileOk: true },
    { id: "intentional-bad-case", message: "", sleeveId: "missing-sleeve-does-not-resolve", expectCompileOk: false }
];
export async function runCompilerAdapterMatrix() {
    const cases = [];
    for (const testCase of CASES) {
        const planner = buildPlannerFromRuntimeMessage({
            message: testCase.message,
            sleeveId: testCase.sleeveId,
            provenance: [`compiler-adapter-matrix:${testCase.id}`],
            notes: [`stage-8 compiler adapter matrix case: ${testCase.id}`]
        });
        const adapted = planner.structural.ok && planner.semantic.ok
            ? await compilePlannerWithAdapter(planner.doc)
            : {
                ok: false,
                issues: [{ severity: "error", code: "ADAPTER_BLOCKED_BY_PLANNER_VALIDATION", message: "Planner doc did not pass structural/semantic validation." }],
                compilerInput: null,
                trace: {
                    plannerSummary: {
                        sleeveId: planner.doc.sleeveId,
                        stackIds: planner.doc.stacks.map((stack) => stack.id),
                        blockIds: planner.doc.stacks.flatMap((stack) => stack.blocks.map((block) => block.id)),
                        moltIds: planner.doc.stacks.flatMap((stack) => stack.blocks.flatMap((block) => block.molts.map((molt) => molt.id))),
                        winnerPath: planner.doc.winners.map((winner) => `${winner.key}=${winner.value}`),
                        triggerIds: [...planner.doc.triggers]
                    },
                    adapterSummary: {
                        stackIds: [],
                        blockIds: [],
                        activeTriggerIds: [],
                        provenance: ["planner-adapter", "blocked-by-planner-validation"]
                    }
                },
                compileResult: null
            };
        const compileOk = adapted.ok && !adapted.issues.some((issue) => issue.severity === "error");
        cases.push({
            id: testCase.id,
            message: testCase.message,
            triggerState: planner.plannerTrace.triggerState,
            planner: {
                structural: planner.structural,
                semantic: planner.semantic,
                issueCodes: planner.issues.map((issue) => issue.code),
                winnerPath: planner.doc.winners
            },
            adapter: {
                ok: adapted.ok,
                issueCodes: adapted.issues.map((issue) => issue.code),
                trace: adapted.trace,
                compileAccepted: compileOk,
                compileHasErrors: Boolean(adapted.compileResult?.hasErrors)
            },
            expectedCompileOk: testCase.expectCompileOk,
            expectationMet: testCase.expectCompileOk === compileOk
        });
    }
    return {
        summary: {
            total: cases.length,
            expectationMet: cases.filter((item) => item.expectationMet).length,
            failedExpectations: cases.filter((item) => !item.expectationMet).map((item) => item.id)
        },
        cases
    };
}
