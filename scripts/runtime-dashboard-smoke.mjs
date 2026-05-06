import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const langchainSpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.',
  requested_tools: ['langchain_bridge', 'langchain.agent_mode']
});
const assembledSpec = compileRuntimeSpecDryRun({
  user_task: 'Build a one-off file report.'
});
const supportSpec = compileRuntimeSpecDryRun({
  user_task: 'Explain how this sleeve works.'
});
const compactSpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.'
});
const moltOnlySpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.'
});
const matrixOnlySpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.',
  requested_tools: ['langchain_bridge', 'langchain.agent_mode']
});

const langchain = buildRuntimeDashboard(langchainSpec, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });
const assembled = buildRuntimeDashboard(assembledSpec, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });
const support = buildRuntimeDashboard(supportSpec, { include_molt_map: true, include_ir_matrix: true, mode: 'developer' });
const compact = buildRuntimeDashboard(compactSpec, { include_molt_map: false, include_ir_matrix: false, mode: 'compact' });
const moltOnly = buildRuntimeDashboard(moltOnlySpec, { include_molt_map: true, include_ir_matrix: false, mode: 'developer' });
const matrixOnly = buildRuntimeDashboard(matrixOnlySpec, { include_molt_map: false, include_ir_matrix: true, mode: 'developer' });
const debug = buildRuntimeDashboard(langchainSpec, { include_molt_map: true, include_ir_matrix: true, mode: 'debug' });

ensure(Boolean(langchain.header), 'LangChain dashboard missing header');
ensure(Boolean(langchain.molt_map), 'LangChain dashboard missing MOLT Map');
ensure(Boolean(langchain.ir_matrix), 'LangChain dashboard missing IR Matrix');
ensure(langchain.ir_matrix?.molt_map_id === langchain.molt_map?.molt_map_id, 'LangChain matrix should reference MOLT Map');
ensure(langchain.header.active_neostacks.includes('NS.UMG.LANGCHAIN_BRIDGE.v0.1'), 'LangChain dashboard missing selected NeoStack');
ensure(Boolean(langchain.ir_matrix?.nodes.some((node) => node.id === 'NS.UMG.LANGCHAIN_BRIDGE.v0.1')), 'LangChain matrix missing selected NeoStack node');
ensure(Boolean(langchain.ir_matrix?.nodes.some((node) => node.kind === 'tool_binding' && node.state === 'requires_approval' && node.label === 'langchain.agent_mode')), 'LangChain matrix missing approval-required tool binding');
ensure(langchain.execution_statement === 'No tools executed.', 'LangChain execution statement mismatch');
ensure(renderRuntimeDashboard(langchain).includes('RUNTIME IR MATRIX'), 'LangChain rendered dashboard missing IR Matrix');

ensure(assembled.header.runtime_kind === 'assembled_runtime', 'Assembled dashboard runtime kind mismatch');
ensure(assembled.header.warnings.includes('no matching sleeve found'), 'Assembled dashboard missing no-sleeve warning');
ensure(Boolean(assembled.ir_matrix?.nodes.some((node) => node.kind === 'matrix_placeholder')), 'Assembled dashboard missing matrix placeholder');
ensure(Boolean(assembled.molt_map), 'Assembled dashboard missing MOLT Map');
ensure(Boolean(assembled.ir_matrix), 'Assembled dashboard missing IR Matrix');

ensure(support.header.support_artifacts.length > 0, 'Support dashboard missing support artifacts');
ensure(Boolean(support.ir_matrix?.nodes.some((node) => node.kind === 'support_artifact' && node.state === 'support_only')), 'Support dashboard missing support_only matrix node');
ensure(!support.ir_matrix?.edges.some((edge) => edge.relation === 'selects' && edge.to.startsWith('support.')), 'Support docs must not be runtime-selected');
ensure(Boolean(support.molt_map), 'Support dashboard missing MOLT Map');
ensure(Boolean(support.ir_matrix), 'Support dashboard missing IR Matrix');

ensure(Boolean(compact.header), 'Compact dashboard missing header');
ensure(!compact.molt_map, 'Compact dashboard should omit MOLT Map');
ensure(!compact.ir_matrix, 'Compact dashboard should omit IR Matrix');

ensure(Boolean(moltOnly.molt_map), 'MOLT-only dashboard missing MOLT Map');
ensure(!moltOnly.ir_matrix, 'MOLT-only dashboard should omit IR Matrix');

ensure(!matrixOnly.molt_map, 'Matrix-only dashboard should omit top-level MOLT Map');
ensure(Boolean(matrixOnly.ir_matrix), 'Matrix-only dashboard missing IR Matrix');
ensure(Boolean(matrixOnly.ir_matrix?.molt_map_id), 'Matrix-only dashboard should still build matrix with MOLT reference when derived');

ensure(Boolean(debug.header.trace_events?.length), 'Debug dashboard missing trace event names');
ensure(renderRuntimeDashboard(debug).includes('Matrix Nodes:'), 'Debug dashboard missing matrix node count');
ensure(renderRuntimeDashboard(debug).includes('Matrix Edges:'), 'Debug dashboard missing matrix edge count');

console.log(JSON.stringify({
  ok: true,
  langchain: { dashboard: langchain, rendered: renderRuntimeDashboard(langchain) },
  assembled: { dashboard: assembled, rendered: renderRuntimeDashboard(assembled) },
  support: { dashboard: support, rendered: renderRuntimeDashboard(support) },
  compact: { dashboard: compact, rendered: renderRuntimeDashboard(compact) },
  molt_only: { dashboard: moltOnly, rendered: renderRuntimeDashboard(moltOnly) },
  matrix_only: { dashboard: matrixOnly, rendered: renderRuntimeDashboard(matrixOnly) },
  debug: { dashboard: debug, rendered: renderRuntimeDashboard(debug) }
}, null, 2));
