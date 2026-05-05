import { loadBlockLibraryConfig } from '../dist/resolver/block-library-config.js';
import { UMGResolver } from '../dist/resolver/resolver.js';
import { buildRegistry } from '../dist/resolver/indexer.js';
import { searchRegistry } from '../dist/resolver/search.js';

const args = process.argv.slice(2);
const read = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const config = loadBlockLibraryConfig();
const resolver = new UMGResolver(config, process.cwd());
const registry = buildRegistry(resolver);
const hits = searchRegistry(registry.artifacts, {
  text: read('--text'),
  kinds: read('--kind') ? [read('--kind')] : undefined,
  tags: read('--tag') ? [read('--tag')] : undefined,
  domains: read('--domain') ? [read('--domain')] : undefined,
  capabilities: read('--capability') ? [read('--capability')] : undefined,
  status: read('--status') ? [read('--status')] : undefined,
  limit: read('--limit') ? Number(read('--limit')) : 20
}, registry.support_artifacts);

console.log(JSON.stringify({
  source_mode: resolver.status().source_mode,
  counts: registry.counts,
  support_artifact_count: registry.support_artifacts.length,
  hits,
  warnings_summary: registry.warnings_summary,
  warnings: registry.warnings.slice(0, 25)
}, null, 2));
