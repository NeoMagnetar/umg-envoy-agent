import entry from '../dist/plugin-entry.js';
const defs = [];
await entry.register({ registerTool(def){ defs.push(def); }, registerCli(){} }, {});
const tool = defs.find(d => d.name === 'umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect');
if (!tool) throw new Error('tool missing: umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect');
const result = JSON.parse((await tool.execute({
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  includeNeoStacks: true,
  includeNeoBlocks: true,
  includeMoltBlocks: true,
  includeRuntimeSpec: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeExecutionGateState: true,
  mode: 'inspect_only'
})).content[0].text);
if (result.outputContract?.contractId !== 'umg.runtime.active_sleeve_ir_matrix_envelope.inspect.v1') throw new Error('contract drift');
if (!result.activeSleeve?.sleeveId) throw new Error('active sleeve missing');
if (typeof result.activeNeoStacks?.count !== 'number') throw new Error('NeoStack count missing');
if (!('reason' in result.activeNeoStacks)) throw new Error('NeoStack empty reason/status missing');
if (typeof result.activeNeoBlocks?.count !== 'number') throw new Error('NeoBlock count missing');
if (!('reason' in result.activeNeoBlocks)) throw new Error('NeoBlock empty reason/status missing');
if (!result.activeMoltBlocks || typeof result.activeMoltBlocks.source !== 'string') throw new Error('MOLT source mode missing');
if (!result.runtimeSpec || typeof result.runtimeSpec.sourceMode !== 'string') throw new Error('RuntimeSpec sourceMode missing');
if (typeof result.runtimeSpec.usesSampleBlocks !== 'boolean') throw new Error('RuntimeSpec sample flag missing');
if (!result.irMatrixProjection?.nodes?.some(n => n.type === 'diagnostic' || n.type === 'neoBlock' || n.type === 'neoStack')) throw new Error('IR Matrix diagnostic/graph nodes missing');
if (!result.responseEnvelopePreview || typeof result.responseEnvelopePreview.envelopeSource !== 'string') throw new Error('Envelope source missing');
if (!result.responseEnvelopePreview.envelopeStatus) throw new Error('Envelope status missing');
if (!result.executionGateState) throw new Error('Execution gate state missing');
if (!(result.executionGateState.blockedReasons || []).some(x => String(x).includes('blocked policy class'))) throw new Error('blocked_policy summary missing');
if (!result.inspectorCompleteness) throw new Error('inspectorCompleteness missing');
if (result.executionStatus !== 'not_performed') throw new Error('inspector execution drift');
if (result.audit?.toolExecution !== 'not_performed') throw new Error('tool execution drift');
if (result.audit?.triggerEvaluation !== 'not_performed') throw new Error('trigger evaluation drift');
if (result.audit?.restart !== 'not_performed') throw new Error('restart drift');
if (result.audit?.publish !== 'not_performed') throw new Error('publish drift');
if (result.audit?.libraryMutation !== 'not_performed') throw new Error('library mutation drift');
console.log(JSON.stringify({ ok: true, smoke: 'alpha7-inspector-output-refinement', overallCompleteness: result.overallCompleteness, neoStackStatus: result.activeNeoStacks.status, neoBlockStatus: result.activeNeoBlocks.status, envelopeStatus: result.responseEnvelopePreview.envelopeStatus }, null, 2));

