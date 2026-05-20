import fs from 'node:fs';
import path from 'node:path';
import entry from '../dist/plugin-entry.js';

const packageRoot = path.resolve(process.cwd());
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));

const defs = [];
await entry.register({ registerTool(def) { defs.push(def); }, registerCli() {} }, {});
const toolNames = defs.map((d) => d.name);
const getTool = (name) => {
  const tool = defs.find((d) => d.name === name);
  if (!tool) throw new Error(`tool missing: ${name}`);
  return tool;
};
const invoke = async (name, input) => JSON.parse((await getTool(name).execute(input)).content[0].text);

const inspectResult = await invoke('umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  includeNeoStacks: true,
  includeNeoBlocks: true,
  includeMoltBlocks: true,
  includeRuntimeSpec: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeExecutionGateState: true,
  mode: 'inspect_only'
});

const e2eResult = await invoke('umg_envoy_runtime_execution_chain_e2e_approved_read_only', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'e2e_approved_read_only',
  includeTrace: true
});

const previewResult = await invoke('umg_envoy_runtime_preview', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  previewFormat: 'summary',
  includeActiveStack: true,
  includeMoltMap: true,
  includeEnvelope: true,
  includeToolRequests: true
});

const assertions = {
  packageVersion: packageJson.version,
  inspectorToolRegistered: toolNames.includes('umg_envoy_runtime_active_sleeve_ir_matrix_envelope_inspect'),
  inspectorContractId: inspectResult.outputContract?.contractId,
  inspectorStatus: inspectResult.inspectorStatus,
  activeSleevePresent: !!inspectResult.activeSleeve,
  activeSleeveId: inspectResult.activeSleeve?.sleeveId ?? null,
  neoStacksPresent: Array.isArray(inspectResult.activeNeoStacks),
  neoBlocksPresent: Array.isArray(inspectResult.activeNeoBlocks),
  moltBlocksPresent: !!inspectResult.activeMoltBlocks,
  runtimeSpecPresent: !!inspectResult.runtimeSpec,
  irMatrixPresent: !!inspectResult.irMatrixProjection,
  envelopePresent: !!inspectResult.responseEnvelopePreview,
  executionGateStatePresent: inspectResult.executionGatePlan !== undefined && inspectResult.approvalCheckpointState !== undefined,
  inspectorExecutionStatus: inspectResult.executionStatus,
  inspectorToolExecution: inspectResult.audit?.toolExecution,
  inspectorTriggerEvaluation: inspectResult.audit?.triggerEvaluation,
  inspectorRestart: inspectResult.audit?.restart,
  inspectorPublish: inspectResult.audit?.publish,
  inspectorLibraryMutation: inspectResult.audit?.libraryMutation,
  e2eContractId: e2eResult.outputContract?.contractId,
  e2eChainStatus: e2eResult.chainStatus,
  e2eExecutionStatus: e2eResult.executionStatus,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.8' &&
  assertions.inspectorToolRegistered === true &&
  assertions.inspectorContractId === 'umg.runtime.active_sleeve_ir_matrix_envelope.inspect.v1' &&
  ['INSPECTOR_READY', 'INSPECTOR_PARTIAL'].includes(assertions.inspectorStatus) &&
  assertions.activeSleevePresent === true &&
  assertions.activeSleeveId === 'neomagnetar-dynamic-persona-v1' &&
  assertions.neoStacksPresent === true &&
  assertions.neoBlocksPresent === true &&
  assertions.moltBlocksPresent === true &&
  assertions.runtimeSpecPresent === true &&
  assertions.irMatrixPresent === true &&
  assertions.envelopePresent === true &&
  assertions.executionGateStatePresent === true &&
  assertions.inspectorExecutionStatus === 'not_performed' &&
  assertions.inspectorToolExecution === 'not_performed' &&
  assertions.inspectorTriggerEvaluation === 'not_performed' &&
  assertions.inspectorRestart === 'not_performed' &&
  assertions.inspectorPublish === 'not_performed' &&
  assertions.inspectorLibraryMutation === 'not_performed' &&
  assertions.e2eContractId === 'umg.runtime.execution_chain.e2e_approved_read_only.v1' &&
  assertions.e2eChainStatus === 'CHAIN_E2E_READY' &&
  assertions.e2eExecutionStatus === 'EXECUTION_READY' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, inspectResult, e2eResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
