import path from 'node:path';
import { loadBlockLibraryConfig } from '../dist/resolver/block-library-config.js';
import { buildRegistry } from '../dist/resolver/indexer.js';
import { UMGResolver } from '../dist/resolver/resolver.js';
import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';
import { inspectRuntimeDrilldown } from '../dist/runtime-spec/drilldown.js';

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const config = loadBlockLibraryConfig();
const resolver = new UMGResolver(config, path.resolve(process.cwd()));
const registry = buildRegistry(resolver);
const registryArtifacts = [...registry.artifacts, ...registry.support_artifacts];

const langchainSpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.',
  requested_tools: ['langchain_bridge', 'langchain.agent_mode']
});
const docsSpec = compileRuntimeSpecDryRun({
  user_task: 'Explain how this sleeve works.'
});
const emptySpec = compileRuntimeSpecDryRun({
  user_task: 'Inspect a vague thing with no declared child relations.'
});

const langchainDashboard = buildRuntimeDashboard(langchainSpec, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });
const docsDashboard = buildRuntimeDashboard(docsSpec, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });
const emptyDashboard = buildRuntimeDashboard(emptySpec, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });

const runtimeSelection = inspectRuntimeDrilldown({
  request: { query_type: 'runtime_selection' },
  registryArtifacts,
  runtimeSpec: langchainSpec,
  dashboard: langchainDashboard,
  irMatrix: langchainDashboard.ir_matrix,
  moltMap: langchainDashboard.molt_map
});

const neostackInspection = inspectRuntimeDrilldown({
  request: {
    query_type: 'inspect_neostack',
    artifact_id: 'NS.UMG.LANGCHAIN_BRIDGE.v0.1',
    depth: 1,
    include_provenance: true,
    include_matrix_links: true,
    include_molt_map_links: true
  },
  registryArtifacts,
  runtimeSpec: langchainSpec,
  dashboard: langchainDashboard,
  irMatrix: langchainDashboard.ir_matrix,
  moltMap: langchainDashboard.molt_map
});

const supportInspection = inspectRuntimeDrilldown({
  request: {
    query_type: 'inspect_support_docs',
    artifact_id: 'SLV.UMG.CORE_REFERENCE.v1',
    include_support_docs: true
  },
  registryArtifacts,
  runtimeSpec: docsSpec,
  dashboard: docsDashboard,
  irMatrix: docsDashboard.ir_matrix,
  moltMap: docsDashboard.molt_map
});

const matrixInspection = inspectRuntimeDrilldown({
  request: {
    query_type: 'inspect_matrix_links',
    artifact_id: 'NS.UMG.LANGCHAIN_BRIDGE.v0.1',
    include_matrix_links: true
  },
  registryArtifacts,
  runtimeSpec: langchainSpec,
  dashboard: langchainDashboard,
  irMatrix: langchainDashboard.ir_matrix,
  moltMap: langchainDashboard.molt_map
});

const moltInspection = inspectRuntimeDrilldown({
  request: {
    query_type: 'inspect_molt_map_links',
    artifact_id: 'NS.UMG.LANGCHAIN_BRIDGE.v0.1',
    include_molt_map_links: true
  },
  registryArtifacts,
  runtimeSpec: langchainSpec,
  dashboard: langchainDashboard,
  irMatrix: langchainDashboard.ir_matrix,
  moltMap: langchainDashboard.molt_map
});

const noChildrenInspection = inspectRuntimeDrilldown({
  request: {
    query_type: 'inspect_artifact',
    artifact_id: 'NS.UMG.LANGCHAIN_BRIDGE.v0.1',
    depth: 1
  },
  registryArtifacts,
  runtimeSpec: emptySpec,
  dashboard: emptyDashboard,
  irMatrix: emptyDashboard.ir_matrix,
  moltMap: emptyDashboard.molt_map
});

for (const result of [runtimeSelection, neostackInspection, supportInspection, matrixInspection, moltInspection, noChildrenInspection]) {
  ensure(result.execution_statement === 'No tools executed.', 'Execution statement must always remain dry-run');
}

ensure(runtimeSelection.runtime_selection?.runtime_kind === 'neostack_runtime', 'Runtime selection runtime kind mismatch');
ensure(runtimeSelection.runtime_selection?.active_sleeve === null, 'Runtime selection should safely allow active_sleeve null');
ensure(runtimeSelection.runtime_selection?.active_neostacks.includes('NS.UMG.LANGCHAIN_BRIDGE.v0.1'), 'Runtime selection missing active NeoStack');

ensure(neostackInspection.artifact?.id === 'NS.UMG.LANGCHAIN_BRIDGE.v0.1', 'NeoStack inspection missing artifact');
ensure(neostackInspection.artifact?.kind === 'neostack', 'NeoStack inspection kind mismatch');
ensure(Boolean(neostackInspection.provenance?.discovery_method), 'NeoStack inspection missing provenance');
ensure(neostackInspection.warnings.includes('no declared child relations found'), 'NeoStack inspection should warn when child relations are missing');

ensure(supportInspection.support_docs.length > 0, 'Support docs inspection should find support docs');
ensure(supportInspection.support_docs.every((doc) => doc.support_only === true), 'Support docs must remain support_only');
ensure(supportInspection.support_docs.every((doc) => doc.runtime_selectable === false), 'Support docs must never become runtime-selectable');
ensure(!supportInspection.children.some((child) => child.support_only), 'Support docs must not appear as runtime-selected children');

ensure(matrixInspection.relations.some((relation) => relation.relation === 'appears_in_matrix'), 'Matrix inspection should find structural matrix presence');
ensure(matrixInspection.relations.every((relation) => relation.relation !== 'executes_tool'), 'Matrix inspection must remain structural only');

ensure(moltInspection.relations.some((relation) => relation.relation === 'maps_to_molt_field'), 'MOLT inspection should find MOLT field links');
ensure(moltInspection.relations.every((relation) => relation.label?.includes('source=') ?? true), 'MOLT links should remain declarative');

ensure(noChildrenInspection.warnings.includes('no declared child relations found'), 'Artifact with no declared relations should warn instead of fabricating hierarchy');

console.log(JSON.stringify({
  ok: true,
  runtime_selection: runtimeSelection,
  neostack: neostackInspection,
  support_docs: supportInspection,
  matrix_links: matrixInspection,
  molt_links: moltInspection,
  no_children: noChildrenInspection
}, null, 2));
