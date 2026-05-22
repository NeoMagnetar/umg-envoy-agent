import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectNativeSleeveGraph, assertCleanNativeGraph } from '../dist/native-graph-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const fixturePath = path.join(packageRoot, 'fixtures', 'native-sleeves', 'neomagnetar-dynamic-persona-native-v1.json');
const schemaPath = path.join(packageRoot, 'schemas', 'umg-native-sleeve-graph.schema.json');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const requiredTopLevel = ['sleeveId', 'sleeveName', 'nativeGraph'];
const requiredNativeGraph = [
  'schemaVersion',
  'sleeveId',
  'sleeveName',
  'nativeGraphId',
  'provenance',
  'neoStacks',
  'neoBlocks',
  'moltFragments',
  'toolRequests',
  'runtimeRoutes',
  'irRoutes',
  'envelopeSources',
  'safety',
];

for (const key of requiredTopLevel) {
  if (!(key in fixture)) throw new Error(`missing top-level field: ${key}`);
}

for (const key of requiredNativeGraph) {
  if (!(key in fixture.nativeGraph)) throw new Error(`missing nativeGraph field: ${key}`);
}

if (schema.$id !== 'umg.native_sleeve_graph.v1') throw new Error('schema $id drift');
if (fixture.nativeGraph.schemaVersion !== 'umg.native_sleeve_graph.v1') throw new Error('fixture schemaVersion drift');

const projection = projectNativeSleeveGraph(fixture);
const cleanProjection = assertCleanNativeGraph(fixture);

if (projection.sourceMode !== 'sleeve_native') throw new Error(`expected sleeve_native sourceMode, got ${projection.sourceMode}`);
if (projection.routePurity !== 'clean_native') throw new Error(`expected clean_native routePurity, got ${projection.routePurity}`);
if (projection.validation.sampleFallbackUsed) throw new Error('expected sampleFallbackUsed=false');
if (projection.validation.legacyPreviewResidueDetected) throw new Error('expected legacyPreviewResidueDetected=false');
if (!projection.validation.valid) throw new Error('expected native graph validation valid=true');
if (cleanProjection.nativeGraph?.sleeveId !== fixture.sleeveId) throw new Error('clean projection sleeve mismatch');

const contaminatedCategories = new Set(['sample_fallback', 'legacy_preview_residue', 'mixed_contaminated', 'unknown']);
const allProvenance = [
  fixture.nativeGraph.provenance,
  ...fixture.nativeGraph.neoStacks.map((x) => x.provenance),
  ...fixture.nativeGraph.neoBlocks.map((x) => x.provenance),
  ...fixture.nativeGraph.moltFragments.map((x) => x.provenance),
  ...fixture.nativeGraph.toolRequests.map((x) => x.provenance),
  ...fixture.nativeGraph.runtimeRoutes.map((x) => x.provenance),
  ...fixture.nativeGraph.irRoutes.map((x) => x.provenance),
  ...fixture.nativeGraph.envelopeSources.map((x) => x.provenance),
];

for (const provenance of allProvenance) {
  if (contaminatedCategories.has(provenance.category)) {
    throw new Error(`fixture contains contaminated provenance category: ${provenance.category}`);
  }
}

const output = {
  ok: true,
  packageVersion: packageJson.version,
  schemaId: schema.$id,
  sleeveId: fixture.sleeveId,
  sourceMode: projection.sourceMode,
  routePurity: projection.routePurity,
  sampleFallbackUsed: projection.validation.sampleFallbackUsed,
  legacyPreviewResidueDetected: projection.validation.legacyPreviewResidueDetected,
  neoStackCount: fixture.nativeGraph.neoStacks.length,
  neoBlockCount: fixture.nativeGraph.neoBlocks.length,
  moltFragmentCount: fixture.nativeGraph.moltFragments.length,
  toolRequestCount: fixture.nativeGraph.toolRequests.length,
  runtimeRouteCount: fixture.nativeGraph.runtimeRoutes.length,
  irRouteCount: fixture.nativeGraph.irRoutes.length,
  envelopeSourceCount: fixture.nativeGraph.envelopeSources.length,
};

console.log(JSON.stringify(output, null, 2));
