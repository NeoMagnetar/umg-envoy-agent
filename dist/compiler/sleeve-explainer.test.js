import { explainSleeveById } from "./sleeve-explainer.js";
let passed = 0;
let failed = 0;
function assert(label, condition) {
    if (condition) {
        console.log(`PASS: ${label}`);
        passed++;
    }
    else {
        console.log(`FAIL: ${label}`);
        failed++;
    }
}
function edgeExists(result, input) {
    return result.matrix_summary.edges?.some((edge) => edge.type === input.type &&
        (input.from === undefined || edge.from === input.from) &&
        (input.to === undefined || edge.to === input.to)) === true;
}
function nodeExists(result, input) {
    return result.matrix_summary.nodes?.some((node) => (input.id === undefined || node.id === input.id) &&
        (input.type === undefined || node.type === input.type) &&
        (input.name === undefined || node.name === input.name)) === true;
}
console.log("=== Sleeve Explainer Matrix Preview Tests ===");
const basic = explainSleeveById({ sleeveId: "public-basic-envoy" });
const basicTrigger = basic.matrix_summary.nodes?.find((node) => node.id === "block:trigger.sample");
assert("basic explanation remains ok", basic.ok === true);
assert("basic matrix preview is available", basic.matrix_summary.available === true);
assert("basic matrix kind is sleeve_relation_preview", basic.matrix_summary.matrix_kind === "sleeve_relation_preview");
assert("basic matrix is non-executing", basic.matrix_summary.non_executing === true);
assert("basic has one sleeve node", basic.matrix_summary.node_counts?.sleeves === 1);
assert("basic has seven block nodes", basic.matrix_summary.node_counts?.blocks === 7);
assert("basic active block count remains six", basic.matrix_summary.node_counts?.active_blocks === 6 && basic.active_blocks.length === 6);
assert("basic prompt part count remains six", basic.matrix_summary.node_counts?.prompt_parts === 6 && basic.prompt_parts.length === 6);
assert("basic has no tool request nodes", basic.matrix_summary.node_counts?.tool_requests === 0);
assert("basic RuntimeSpecBoundary is represented", nodeExists(basic, { id: "boundary:runtime_spec", type: "boundary" }) && edgeExists(basic, { from: "runtime_spec", to: "boundary:runtime_spec", type: "guarded_by" }));
assert("basic trigger block appears disabled and inactive", basicTrigger?.enabled === false && basicTrigger.active === false);
assert("basic trigger has skipped relationship", edgeExists(basic, { from: "block:trigger.sample", to: "runtime_spec", type: "skipped_from_runtime" }));
assert("basic trigger has skipped reason node", nodeExists(basic, { id: "skipped_reason:trigger.sample", type: "skipped_reason" }) && edgeExists(basic, { from: "block:trigger.sample", to: "skipped_reason:trigger.sample", type: "has_skipped_reason" }));
assert("basic warning is preserved in matrix", basic.matrix_summary.warnings?.includes("disabled block skipped: trigger.sample") === true);
const coder = explainSleeveById({ sleeveId: "public-coder-envoy" });
const coderTrigger = coder.matrix_summary.nodes?.find((node) => node.id === "block:trigger.sample");
assert("coder explanation remains ok", coder.ok === true);
assert("coder matrix preview is available", coder.matrix_summary.available === true);
assert("coder matrix is non-executing", coder.matrix_summary.non_executing === true);
assert("coder has one sleeve node", coder.matrix_summary.node_counts?.sleeves === 1);
assert("coder has seven block nodes", coder.matrix_summary.node_counts?.blocks === 7);
assert("coder active block count remains seven", coder.matrix_summary.node_counts?.active_blocks === 7 && coder.active_blocks.length === 7);
assert("coder prompt part count remains seven", coder.matrix_summary.node_counts?.prompt_parts === 7 && coder.prompt_parts.length === 7);
assert("coder has one tool request node", coder.matrix_summary.node_counts?.tool_requests === 1);
assert("coder trigger block appears enabled and active", coderTrigger?.enabled === true && coderTrigger.active === true);
assert("coder trigger has active relationship", edgeExists(coder, { from: "block:trigger.sample", to: "runtime_spec", type: "active_in_runtime" }));
assert("coder inspect tool request is represented", nodeExists(coder, { type: "tool_request", name: "inspect" }) && edgeExists(coder, { from: "runtime_spec", type: "requests_tool" }));
assert("coder RuntimeSpecBoundary is represented", nodeExists(coder, { id: "boundary:runtime_spec", type: "boundary" }) && edgeExists(coder, { from: "runtime_spec", to: "boundary:runtime_spec", type: "guarded_by" }));
assert("coder warnings remain empty", coder.matrix_summary.warnings?.length === 0 && coder.warnings.length === 0);
console.log(`=== Sleeve Explainer Matrix Preview Tests Complete: ${passed} passed, ${failed} failed ===`);
if (failed > 0)
    process.exit(1);
