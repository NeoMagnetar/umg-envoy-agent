import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';

const langchain = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.'
});

const assembled = compileRuntimeSpecDryRun({
  user_task: 'Build a one-off file report.'
});

const support = compileRuntimeSpecDryRun({
  user_task: 'Explain how this sleeve works.'
});

const sleeveStrong = compileRuntimeSpecDryRun({
  user_task: 'Use the pure UMG core reference sleeve for a dry-run compiler foundation workflow.',
  requested_capabilities: ['CAP.IR.BUILD', 'CAP.TRACE.EMIT']
});

console.log(JSON.stringify({
  ok: true,
  langchain,
  assembled,
  support,
  sleeveStrong
}, null, 2));
