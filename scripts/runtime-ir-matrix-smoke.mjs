import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';
import { buildRuntimeIRMatrix, renderRuntimeIRMatrix } from '../dist/runtime-spec/ir-matrix.js';

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

const langchainDashboard = buildRuntimeDashboard(langchainSpec, {
  include_molt_map: true,
  mode: 'developer'
});
const assembledDashboard = buildRuntimeDashboard(assembledSpec, {
  include_molt_map: true,
  mode: 'developer'
});
const supportDashboard = buildRuntimeDashboard(supportSpec, {
  include_molt_map: true,
  mode: 'developer'
});

const langchainMatrix = buildRuntimeIRMatrix({
  spec: langchainSpec,
  molt_map: langchainDashboard.molt_map,
  dashboard: langchainDashboard
});
const assembledMatrix = buildRuntimeIRMatrix({
  spec: assembledSpec,
  molt_map: assembledDashboard.molt_map,
  dashboard: assembledDashboard
});
const supportMatrix = buildRuntimeIRMatrix({
  spec: supportSpec,
  molt_map: supportDashboard.molt_map,
  dashboard: supportDashboard
});

ensure(langchainMatrix.source === 'RuntimeSpecV0', 'LangChain matrix source mismatch');
ensure(langchainMatrix.mode === 'dry_run', 'LangChain matrix mode mismatch');
ensure(langchainMatrix.matrix_available === true, 'LangChain matrix should be available');
ensure(langchainMatrix.nodes.some((node) => node.id === 'NS.UMG.LANGCHAIN_BRIDGE.v0.1'), 'LangChain matrix missing selected NeoStack');
ensure(langchainMatrix.nodes.some((node) => node.kind === 'governance'), 'LangChain matrix missing governance node');
ensure(langchainMatrix.nodes.some((node) => node.kind === 'tool_binding' && node.state === 'requires_approval' && node.label === 'langchain.agent_mode'), 'LangChain matrix missing approval-required tool binding');
ensure(langchainMatrix.nodes.some((node) => node.kind === 'molt_map'), 'LangChain matrix missing MOLT Map node');
ensure(langchainMatrix.trace_id === langchainSpec.trace.trace_id, 'LangChain matrix trace mismatch');
ensure(renderRuntimeIRMatrix(langchainMatrix).includes('NS.UMG.LANGCHAIN_BRIDGE.v0.1'), 'LangChain symbolic matrix missing NeoStack');

ensure(assembledMatrix.warnings.includes('no matching sleeve found'), 'Assembled matrix missing no-sleeve warning');
ensure(assembledMatrix.nodes.some((node) => node.kind === 'matrix_placeholder'), 'Assembled matrix missing placeholder node');
ensure(assembledMatrix.trace_id === assembledSpec.trace.trace_id, 'Assembled matrix trace mismatch');

ensure(supportMatrix.nodes.some((node) => node.kind === 'support_artifact'), 'Support matrix missing support artifact node');
ensure(supportMatrix.nodes.some((node) => node.kind === 'support_artifact' && node.state === 'support_only'), 'Support matrix missing support_only state');
ensure(!supportMatrix.edges.some((edge) => edge.relation === 'selects' && edge.to.startsWith('support.')), 'Support artifact must not be runtime-selected');
ensure(supportMatrix.trace_id === supportSpec.trace.trace_id, 'Support matrix trace mismatch');

console.log(JSON.stringify({
  ok: true,
  langchain: {
    matrix: langchainMatrix,
    symbolic: renderRuntimeIRMatrix(langchainMatrix),
    execution_statement: langchainDashboard.execution_statement
  },
  assembled: {
    matrix: assembledMatrix,
    symbolic: renderRuntimeIRMatrix(assembledMatrix),
    execution_statement: assembledDashboard.execution_statement
  },
  support: {
    matrix: supportMatrix,
    symbolic: renderRuntimeIRMatrix(supportMatrix),
    execution_statement: supportDashboard.execution_statement
  }
}, null, 2));
