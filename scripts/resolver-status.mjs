import { loadBlockLibraryConfig } from '../dist/resolver/block-library-config.js';
import { UMGResolver } from '../dist/resolver/resolver.js';
import { buildRegistry } from '../dist/resolver/indexer.js';

const config = loadBlockLibraryConfig();
const resolver = new UMGResolver(config, process.cwd());
const registry = buildRegistry(resolver);
const status = resolver.status();

console.log(JSON.stringify({
  source_mode: status.source_mode,
  configured_sources: status.configured_sources,
  existing_sources: status.existing_sources,
  missing_sources: status.missing_sources,
  artifact_counts_by_kind: registry.counts.by_kind,
  artifact_counts_by_source_kind: registry.counts.by_source_kind,
  artifact_counts_by_status: registry.counts.by_status,
  artifact_counts_by_discovery_method: registry.counts.by_discovery_method,
  canonical_count: registry.counts.canonical_count,
  non_canonical_count: registry.counts.non_canonical_count,
  sample_count: registry.counts.sample_count,
  human_support_count: registry.counts.human_support_count,
  duplicate_count: registry.counts.duplicate_count,
  warning_count: registry.counts.warning_count,
  support_artifact_count: registry.support_artifacts.length,
  duplicate_report: registry.duplicate_report.slice(0, 25),
  warnings_summary: registry.warnings_summary,
  core_ai_provenance: registry.core_ai_provenance,
  warnings: registry.warnings.slice(0, 25)
}, null, 2));
