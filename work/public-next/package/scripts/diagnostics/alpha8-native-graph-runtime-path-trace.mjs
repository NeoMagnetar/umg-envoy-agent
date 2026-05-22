import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectRuntimeSleeveGraphRichness, clearRuntimeSleeveSession } from '../../dist/block-library-resolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..', '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const version = packageJson.version;
const entrypoint = 'dist/plugin-entry.js';
const sleeveIds = ['neomagnetar-dynamic-persona-v1', 'legacy-sample-contaminated-sleeve'];

clearRuntimeSleeveSession({ clearReason: 'path-trace-start', includePreviousState: false, includeTrace: false });

for (const sleeveId of sleeveIds) {
  const result = inspectRuntimeSleeveGraphRichness(version, entrypoint, undefined, {
    sleeveId,
    includeNeoStacks: true,
    includeNeoBlocks: true,
    includeMoltFragments: true,
    includeToolRequests: true,
    includeRuntimeSpec: true,
    includeIrMatrix: true,
    includeEnvelope: true,
    includeDiagnostics: true,
    includeTrace: true
  });

  console.log(JSON.stringify({
    version,
    sleeveId,
    topLevel: {
      sourceMode: result.sourceMode ?? null,
      routePurity: result.routePurity ?? null,
      sampleFallbackUsed: result.sampleFallbackUsed ?? null,
      legacyPreviewResidueDetected: result.legacyPreviewResidueDetected ?? null,
      graphStatus: result.graphStatus ?? null,
      graphCompleteness: result.graphCompleteness ?? null
    },
    neoStackSummary: result.neoStackSummary ?? null,
    neoBlockSummary: result.neoBlockSummary ?? null,
    moltFragmentSummary: result.moltFragmentSummary ?? null,
    toolRequestSummary: result.toolRequestSummary ?? null,
    runtimeSpecSummary: result.runtimeSpecSummary ?? null,
    irMatrixSummary: result.irMatrixSummary ?? null,
    envelopeSummary: result.envelopeSummary ?? null,
    diagnostics: result.diagnostics ?? null
  }, null, 2));
}

clearRuntimeSleeveSession({ clearReason: 'path-trace-end', includePreviousState: false, includeTrace: false });
