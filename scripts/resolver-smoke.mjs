import { loadBlockLibraryConfig } from '../dist/resolver/block-library-config.js';
import { UMGResolver } from '../dist/resolver/resolver.js';
import { buildRegistry } from '../dist/resolver/indexer.js';
import { searchRegistry } from '../dist/resolver/search.js';

const config = loadBlockLibraryConfig();
const resolver = new UMGResolver(config, process.cwd());
const registry = buildRegistry(resolver);
const hits = searchRegistry(registry.artifacts, { text: 'langchain bridge', kinds: ['neostack'], limit: 3 });

console.log(JSON.stringify({
  ok: true,
  source_mode: resolver.status().source_mode,
  total_artifacts: registry.artifacts.length,
  support_artifact_count: registry.support_artifacts.length,
  canonical_count: registry.counts.canonical_count,
  human_support_count: registry.counts.human_support_count,
  discovery: registry.counts.by_discovery_method,
  core_ai_provenance: registry.core_ai_provenance,
  first_hit: hits.runtime_results?.[0] ?? null,
  duplicate_count: registry.counts.duplicate_count,
  warning_count: registry.counts.warning_count
}, null, 2));
