import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const bundleDir = path.join(packageRoot, 'fixtures', 'runtime-bundles');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));

const expected = [
  'active-sleeve-inspection.bundle.json',
  'native-graph-inspection.bundle.json',
  'block-library-navigation.bundle.json',
  'coding-project-inspection.bundle.json',
  'read-only-ops-diagnostics.bundle.json',
];

const summaries = [];

for (const fileName of expected) {
  const fullPath = path.join(bundleDir, fileName);
  if (!fs.existsSync(fullPath)) throw new Error(`missing bundle fixture: ${fileName}`);
  const bundle = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

  if (bundle.bundleVersion !== packageJson.version) throw new Error(`${fileName}: version drift`);
  if (bundle.category !== 'read_only_runtime_bundle') throw new Error(`${fileName}: category drift`);
  if (bundle.safety.approvedOnly !== true) throw new Error(`${fileName}: approvedOnly drift`);
  if (bundle.safety.allowlistedOnly !== true) throw new Error(`${fileName}: allowlistedOnly drift`);
  if (bundle.safety.readOnlyOnly !== true) throw new Error(`${fileName}: readOnlyOnly drift`);
  if (bundle.safety.directSourceEnabled !== false) throw new Error(`${fileName}: directSourceEnabled drift`);
  if (bundle.safety.automaticResponseTakeover !== false) throw new Error(`${fileName}: automaticResponseTakeover drift`);
  if (bundle.safety.umgBlockLibraryMutation !== 'not_performed') throw new Error(`${fileName}: block-library mutation drift`);
  if (!Array.isArray(bundle.toolRequests) || bundle.toolRequests.length === 0) throw new Error(`${fileName}: toolRequests missing`);

  summaries.push({
    fileName,
    bundleId: bundle.bundleId,
    toolRequestCount: bundle.toolRequests.length,
    tools: bundle.toolRequests,
  });
}

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  bundleCount: summaries.length,
  bundles: summaries,
}, null, 2));
