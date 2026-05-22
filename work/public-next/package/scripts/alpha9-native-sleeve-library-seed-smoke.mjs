import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projectNativeSleeveGraph, assertCleanNativeGraph } from '../dist/native-graph-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const fixturesDir = path.join(packageRoot, 'fixtures', 'native-sleeves');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));

const expectedFiles = [
  'neomagnetar-dynamic-persona-native-v1.json',
  'umg-runtime-inspector-native-v1.json',
  'umg-block-library-navigator-native-v1.json',
  'umg-coding-assistant-native-v1.json',
  'umg-read-only-ops-native-v1.json',
];

const summaries = [];

for (const fileName of expectedFiles) {
  const fullPath = path.join(fixturesDir, fileName);
  if (!fs.existsSync(fullPath)) throw new Error(`missing fixture: ${fileName}`);

  const fixture = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const projection = projectNativeSleeveGraph(fixture);
  assertCleanNativeGraph(fixture);

  if (projection.sourceMode !== 'sleeve_native') throw new Error(`${fileName}: sourceMode drift`);
  if (projection.routePurity !== 'clean_native') throw new Error(`${fileName}: routePurity drift`);
  if (projection.validation.sampleFallbackUsed) throw new Error(`${fileName}: sampleFallbackUsed drift`);
  if (projection.validation.legacyPreviewResidueDetected) throw new Error(`${fileName}: legacyPreviewResidueDetected drift`);

  summaries.push({
    fileName,
    sleeveId: fixture.sleeveId,
    sourceMode: projection.sourceMode,
    routePurity: projection.routePurity,
    neoStackCount: fixture.nativeGraph.neoStacks.length,
    neoBlockCount: fixture.nativeGraph.neoBlocks.length,
    moltFragmentCount: fixture.nativeGraph.moltFragments.length,
    toolRequestCount: fixture.nativeGraph.toolRequests.length,
    runtimeRouteCount: fixture.nativeGraph.runtimeRoutes.length,
    irRouteCount: fixture.nativeGraph.irRoutes.length,
    envelopeSourceCount: fixture.nativeGraph.envelopeSources.length,
  });
}

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  fixtureCount: summaries.length,
  sleeves: summaries,
}, null, 2));
