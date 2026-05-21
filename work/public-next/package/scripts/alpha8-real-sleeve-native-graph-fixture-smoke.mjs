#!/usr/bin/env node
// scripts/alpha8-real-sleeve-native-graph-fixture-smoke.mjs
// Standalone clean-native fixture validation smoke.
// Usage:
//   node scripts/alpha8-real-sleeve-native-graph-fixture-smoke.mjs
//   node scripts/alpha8-real-sleeve-native-graph-fixture-smoke.mjs path\to\fixture.json

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturePath =
  process.argv[2] ??
  path.resolve(__dirname, "../fixtures/native-sleeves/neomagnetar-dynamic-persona-native-v1.json");

const raw = fs.readFileSync(fixturePath, "utf8");
const sleeve = JSON.parse(raw);
const graph = sleeve.nativeGraph;

assert.ok(graph, "nativeGraph root must exist");
assert.equal(graph.schemaVersion, "umg.native_sleeve_graph.v1", "schemaVersion must match native graph schema");
assert.equal(graph.sleeveId, sleeve.sleeveId, "nativeGraph.sleeveId must match sleeve.sleeveId");
assert.equal(graph.provenance.category, "sleeve_native", "native graph root must be sleeve_native");

assert.ok(Array.isArray(graph.neoStacks) && graph.neoStacks.length >= 1, "at least one native NeoStack is required");
assert.ok(Array.isArray(graph.neoBlocks) && graph.neoBlocks.length >= 1, "native NeoBlocks are required");
assert.ok(Array.isArray(graph.moltFragments) && graph.moltFragments.length >= 7, "expected at least seven MOLT fragments");
assert.ok(Array.isArray(graph.runtimeRoutes) && graph.runtimeRoutes.length >= 1, "runtime route is required");
assert.ok(Array.isArray(graph.irRoutes) && graph.irRoutes.length >= 1, "IR route is required");
assert.ok(Array.isArray(graph.envelopeSources) && graph.envelopeSources.length >= 1, "envelope source is required");

const stackIds = new Set(graph.neoStacks.map((stack) => stack.stackId));
const blockIds = new Set(graph.neoBlocks.map((block) => block.neoBlockId));
const fragmentIds = new Set(graph.moltFragments.map((fragment) => fragment.fragmentId));
const requestIds = new Set(graph.toolRequests.map((request) => request.requestId));

for (const stack of graph.neoStacks) {
  assert.equal(stack.provenance.category, "sleeve_native", `NeoStack ${stack.stackId} must be sleeve_native`);
  assert.ok(stack.containedNeoBlockIds.length > 0, `NeoStack ${stack.stackId} must contain NeoBlocks`);
  for (const blockId of stack.containedNeoBlockIds) {
    assert.ok(blockIds.has(blockId), `NeoStack ${stack.stackId} references missing NeoBlock ${blockId}`);
  }
}

for (const block of graph.neoBlocks) {
  assert.ok(block.parentStackIds.length > 0, `NeoBlock ${block.neoBlockId} must declare stack membership`);
  for (const stackId of block.parentStackIds) {
    assert.ok(stackIds.has(stackId), `NeoBlock ${block.neoBlockId} references missing stack ${stackId}`);
  }
  assert.equal(block.provenance.category, "sleeve_native", `NeoBlock ${block.neoBlockId} must be sleeve_native`);
}

const requiredMoltTypes = ["Trigger", "Directive", "Instruction", "Subject", "Primary", "Philosophy", "Blueprint"];
const actualMoltTypes = new Set(graph.moltFragments.map((fragment) => fragment.moltType));

for (const moltType of requiredMoltTypes) {
  assert.ok(actualMoltTypes.has(moltType), `Missing MOLT type ${moltType}`);
}

for (const fragment of graph.moltFragments) {
  assert.ok(blockIds.has(fragment.sourceNeoBlockId), `MOLT fragment ${fragment.fragmentId} references missing NeoBlock`);
  assert.match(
    fragment.provenance.category,
    /^sleeve_native/,
    `MOLT fragment ${fragment.fragmentId} must be sleeve-native or sleeve-native-derived`,
  );
}

for (const request of graph.toolRequests) {
  assert.match(
    request.provenance.category,
    /^sleeve_native/,
    `Tool request ${request.requestId} must be sleeve-native or sleeve-native-derived`,
  );
  assert.notEqual(request.provenance.category, "sample_fallback", `Tool request ${request.requestId} must not be sample_fallback`);
}

for (const route of graph.runtimeRoutes) {
  assert.equal(route.sourceMode, "sleeve_native", `Runtime route ${route.routeId} must be sleeve_native`);

  for (const blockId of route.sourceNeoBlockIds) {
    assert.ok(blockIds.has(blockId), `Runtime route ${route.routeId} references missing NeoBlock ${blockId}`);
  }

  for (const fragmentId of route.sourceMoltFragmentIds) {
    assert.ok(fragmentIds.has(fragmentId), `Runtime route ${route.routeId} references missing MOLT fragment ${fragmentId}`);
  }

  for (const requestId of route.sourceToolRequestIds) {
    assert.ok(requestIds.has(requestId), `Runtime route ${route.routeId} references missing tool request ${requestId}`);
  }

  assert.match(
    route.provenance.category,
    /^sleeve_native/,
    `Runtime route ${route.routeId} must be sleeve-native-derived`,
  );
}

for (const route of graph.irRoutes) {
  assert.equal(route.routePurity, "clean_native", `IR route ${route.routeId} must be clean_native`);

  for (const node of route.nodes) {
    assert.match(node.provenance.category, /^sleeve_native/, `IR node ${node.nodeId} must be native`);
  }

  for (const edge of route.edges) {
    assert.match(edge.provenance.category, /^sleeve_native/, `IR edge ${edge.edgeId} must be native`);
  }
}

for (const envelope of graph.envelopeSources) {
  assert.match(
    envelope.envelopeSource,
    /^sleeve_native/,
    `Envelope ${envelope.envelopeId} must be sleeve-native declared or derived`,
  );
  assert.match(
    envelope.provenance.category,
    /^sleeve_native/,
    `Envelope ${envelope.envelopeId} provenance must be native`,
  );
}

const allProvenance = [
  graph.provenance,
  ...graph.neoStacks.map((entry) => entry.provenance),
  ...graph.neoBlocks.map((entry) => entry.provenance),
  ...graph.moltFragments.map((entry) => entry.provenance),
  ...graph.toolRequests.map((entry) => entry.provenance),
  ...graph.runtimeRoutes.map((entry) => entry.provenance),
  ...graph.irRoutes.flatMap((route) => [
    route.provenance,
    ...route.nodes.map((node) => node.provenance),
    ...route.edges.map((edge) => edge.provenance),
  ]),
  ...graph.envelopeSources.map((entry) => entry.provenance),
];

assert.equal(
  allProvenance.some((entry) => entry.category === "sample_fallback"),
  false,
  "clean-native fixture must not use sample_fallback provenance",
);
assert.equal(
  allProvenance.some((entry) => entry.category === "legacy_preview_residue"),
  false,
  "clean-native fixture must not use legacy_preview_residue provenance",
);
assert.equal(
  graph.safety.approvedOnly,
  true,
  "approvedOnly must remain true",
);
assert.equal(
  graph.safety.allowlistedOnly,
  true,
  "allowlistedOnly must remain true",
);
assert.equal(
  graph.safety.readOnlyOnly,
  true,
  "readOnlyOnly must remain true",
);
assert.equal(
  graph.safety.directSourceEnabled,
  false,
  "directSourceEnabled must remain false",
);
assert.equal(
  graph.safety.automaticResponseTakeover,
  false,
  "automaticResponseTakeover must remain false",
);
assert.equal(
  graph.safety.umgBlockLibraryMutation,
  "not_performed",
  "UMG-Block-Library mutation must remain not_performed",
);

console.log("native graph fixture smoke passed");
console.log(`sleeveId=${graph.sleeveId}`);
console.log("sourceMode=sleeve_native");
console.log("routePurity=clean_native");
console.log("legacyPreviewResidueDetected=false");
console.log("sampleFallbackUsed=false");
