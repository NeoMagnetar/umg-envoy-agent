import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';

const langchainSpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.'
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

const langchain = buildRuntimeDashboard(langchainSpec, { include_molt_map: true, mode: 'developer' });
const assembled = buildRuntimeDashboard(assembledSpec, { include_molt_map: true, mode: 'developer' });
const support = buildRuntimeDashboard(supportSpec, { include_molt_map: true, mode: 'developer' });
const compact = buildRuntimeDashboard(compactSpec, { include_molt_map: false, mode: 'compact' });

console.log(JSON.stringify({
  ok: true,
  langchain: { dashboard: langchain, rendered: renderRuntimeDashboard(langchain) },
  assembled: { dashboard: assembled, rendered: renderRuntimeDashboard(assembled) },
  support: { dashboard: support, rendered: renderRuntimeDashboard(support) },
  compact: { dashboard: compact, rendered: renderRuntimeDashboard(compact) }
}, null, 2));
