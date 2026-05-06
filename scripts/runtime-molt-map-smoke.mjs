import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeMOLTMap } from '../dist/runtime-spec/molt-map.js';

const langchainSpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.'
});
const assembledSpec = compileRuntimeSpecDryRun({
  user_task: 'Build a one-off file report.'
});
const supportSpec = compileRuntimeSpecDryRun({
  user_task: 'Explain how this sleeve works.'
});

console.log(JSON.stringify({
  ok: true,
  langchain: buildRuntimeMOLTMap(langchainSpec),
  assembled: buildRuntimeMOLTMap(assembledSpec),
  support: buildRuntimeMOLTMap(supportSpec)
}, null, 2));
