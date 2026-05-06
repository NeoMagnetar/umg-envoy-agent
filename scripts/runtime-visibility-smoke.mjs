import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildRuntimeVisibilityHeader, renderRuntimeVisibilityHeader } from '../dist/runtime-spec/visibility.js';

const langchainSpec = compileRuntimeSpecDryRun({
  user_task: 'Use the LangChain bridge for a governed workflow.'
});
const assembledSpec = compileRuntimeSpecDryRun({
  user_task: 'Build a one-off file report.'
});
const supportSpec = compileRuntimeSpecDryRun({
  user_task: 'Explain how this sleeve works.'
});

const langchainHeader = buildRuntimeVisibilityHeader(langchainSpec, 'developer');
const assembledHeader = buildRuntimeVisibilityHeader(assembledSpec, 'developer');
const supportHeader = buildRuntimeVisibilityHeader(supportSpec, 'developer');

console.log(JSON.stringify({
  ok: true,
  langchain: {
    header: langchainHeader,
    rendered: renderRuntimeVisibilityHeader(langchainHeader)
  },
  assembled: {
    header: assembledHeader,
    rendered: renderRuntimeVisibilityHeader(assembledHeader)
  },
  support: {
    header: supportHeader,
    rendered: renderRuntimeVisibilityHeader(supportHeader)
  }
}, null, 2));
