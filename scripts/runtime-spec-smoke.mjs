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

console.log(JSON.stringify({
  ok: true,
  langchain,
  assembled,
  support
}, null, 2));
