import { loadCognitiveRegistry, planNeoStack, queryCognitiveRegistry, validateCognitiveRegistry } from "./cognitive-registry.js";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${label}`);
    passed++;
  } else {
    console.log(`FAIL: ${label}`);
    failed++;
  }
}

console.log("=== Cognitive Registry Tests ===");

const registry = loadCognitiveRegistry();
const all = queryCognitiveRegistry({ kind: "all" });
const molt = queryCognitiveRegistry({ kind: "molt" });
const neoblock = queryCognitiveRegistry({ kind: "neoblock" });
const neostack = queryCognitiveRegistry({ kind: "neostack" });
const invalid = queryCognitiveRegistry({ kind: "banana" });
const validation = validateCognitiveRegistry(registry);

assert("all query returns ok true", all.ok === true);
assert("all query returns at least 8 MOLT blocks", all.counts.molt_blocks >= 8 && all.molt_blocks.length >= 8);
assert("all query returns at least 4 NeoBlocks", all.counts.neoblocks >= 4 && all.neoblocks.length >= 4);
assert("all query returns at least 3 NeoStacks", all.counts.neostacks >= 3 && all.neostacks.length >= 3);
assert("molt query returns only MOLT blocks", molt.ok === true && molt.molt_blocks.length >= 8 && molt.neoblocks.length === 0 && molt.neostacks.length === 0);
assert("neoblock query returns only NeoBlocks", neoblock.ok === true && neoblock.neoblocks.length >= 4 && neoblock.molt_blocks.length === 0 && neoblock.neostacks.length === 0);
assert("neostack query returns only NeoStacks", neostack.ok === true && neostack.neostacks.length >= 3 && neostack.molt_blocks.length === 0 && neostack.neoblocks.length === 0);
assert("invalid query returns unsupported kind error", invalid.ok === false && invalid.error === "Unsupported registry kind" && invalid.errors.includes("Unsupported registry kind"));
assert("all NeoBlock MOLT refs resolve", validation.missingMoltRefs.length === 0);
assert("all NeoStack NeoBlock refs resolve", validation.missingNeoBlockRefs.length === 0);
assert("registry governance is read-only with no writes", validation.ok === true && validation.governanceEntries.every((entry) => entry.read_only === true && entry.allows_writes === false));

const sleevePlan = planNeoStack({ intent: "explain a sleeve and show block usage" });
const codePlan = planNeoStack({ intent: "safe public code generation" });
const postPlan = planNeoStack({ intent: "draft a public post" });

assert("sleeve explanation intent selects NS.SLEEVE_EXPLAINER", sleevePlan.ok === true && sleevePlan.selected_neostack?.id === "NS.SLEEVE_EXPLAINER");
assert("safe public code generation intent selects NS.PUBLIC_CODER_RUNTIME", codePlan.ok === true && codePlan.selected_neostack?.id === "NS.PUBLIC_CODER_RUNTIME");
assert("draft public post intent selects NS.SAFE_GENERATION_PLANNER", postPlan.ok === true && postPlan.selected_neostack?.id === "NS.SAFE_GENERATION_PLANNER");
assert("sleeve plan includes selected NeoBlocks and MOLT blocks", sleevePlan.selected_neoblocks.length > 0 && sleevePlan.selected_molt_blocks.length > 0);
assert("code plan includes selected NeoBlocks and MOLT blocks", codePlan.selected_neoblocks.length > 0 && codePlan.selected_molt_blocks.length > 0);
assert("post plan includes selected NeoBlocks and MOLT blocks", postPlan.selected_neoblocks.length > 0 && postPlan.selected_molt_blocks.length > 0);
assert("plans include selection traces", sleevePlan.selection_trace.length >= 3 && codePlan.selection_trace.length >= 3 && postPlan.selection_trace.length >= 3);
assert("plans are non-executing", sleevePlan.non_executing === true && codePlan.non_executing === true && postPlan.non_executing === true);
assert("plans do not enable writes", [sleevePlan, codePlan, postPlan].every((plan) => plan.governance.read_only === true && plan.governance.allows_writes === false));

console.log(`=== Cognitive Registry Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
