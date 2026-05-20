import fs from 'node:fs';
import path from 'node:path';
import entry from '../dist/plugin-entry.js';

const packageRoot = path.resolve(process.cwd());
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const pluginJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'openclaw.plugin.json'), 'utf8'));

const defs = [];
await entry.register({ registerTool(def) { defs.push(def); }, registerCli() {} }, {});
const toolNames = defs.map((d) => d.name);
const getTool = (name) => {
  const tool = defs.find((d) => d.name === name);
  if (!tool) throw new Error(`tool missing: ${name}`);
  return tool;
};
const invoke = async (name, input) => JSON.parse((await getTool(name).execute(input)).content[0].text);

const emptyRuntimeSpec = {
  runtimeSpecVersion: 'RuntimeSpecV0',
  runtimeSpecId: 'rtv0-empty-smoke',
  sleeveId: 'empty-smoke-sleeve',
  activeBlocks: [],
  moltMap: {},
  promptParts: [],
  strategy: null,
  constraints: null,
  context: { subject: null, primary: null },
  values: null,
  format: null,
  toolRequests: []
};

const emptyResult = await invoke('umg_envoy_runtime_tool_request_classify', {
  runtimeSpec: emptyRuntimeSpec,
  includeTrace: true,
  mode: 'classify_only'
});

const syntheticRuntimeSpec = {
  ...emptyRuntimeSpec,
  runtimeSpecId: 'rtv0-synthetic-smoke',
  sleeveId: 'synthetic-smoke-sleeve',
  toolRequests: [
    { kind: 'declared_trigger', sourceBlockId: 'trigger-readonly', declaredAction: 'Call umg_envoy_runtime_preview for dry-run context only' },
    { kind: 'declared_trigger', sourceBlockId: 'trigger-unknown', declaredAction: 'Call totally_unknown_runtime_tool and execute now' }
  ]
};

const syntheticResult = await invoke('umg_envoy_runtime_tool_request_classify', {
  runtimeSpec: syntheticRuntimeSpec,
  includeTrace: true,
  mode: 'classify_only'
});

const liveResult = await invoke('umg_envoy_runtime_tool_request_classify', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  compileIfMissing: true,
  includeTrace: true,
  mode: 'classify_only'
});

const previewResult = await invoke('umg_envoy_runtime_preview', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  previewFormat: 'summary',
  includeActiveStack: true,
  includeMoltMap: true,
  includeEnvelope: true,
  includeToolRequests: true
});

const readonlyClassification = syntheticResult.classifications.find((item) => item.requestedToolName === 'umg_envoy_runtime_preview');
const unknownClassification = syntheticResult.classifications.find((item) => item.requestedToolName === null || item.requestedToolName === 'totally_unknown_runtime_tool');

const assertions = {
  packageVersion: packageJson.version,
  pluginVersion: pluginJson.version,
  sourceEntrypointExists: fs.existsSync(path.join(packageRoot, 'src', 'plugin-entry.ts')),
  classifierRegistered: toolNames.includes('umg_envoy_runtime_tool_request_classify'),
  previewRegistered: toolNames.includes('umg_envoy_runtime_preview'),
  emptyContractId: emptyResult.outputContract?.contractId,
  emptyClassificationStatus: emptyResult.classificationStatus,
  emptyExecutionStatus: emptyResult.executionStatus,
  syntheticContractId: syntheticResult.outputContract?.contractId,
  syntheticExecutionStatus: syntheticResult.executionStatus,
  liveContractId: liveResult.outputContract?.contractId,
  liveClassificationStatus: liveResult.classificationStatus,
  liveExecutionStatus: liveResult.executionStatus,
  readonlyClassification: readonlyClassification?.classification ?? null,
  unknownClassification: unknownClassification?.classification ?? null,
  approvalCheckpointCreated: syntheticResult.audit?.approvalCheckpointCreated,
  triggerEvaluation: syntheticResult.audit?.triggerEvaluation,
  toolExecution: syntheticResult.audit?.toolExecution,
  restart: syntheticResult.audit?.restart,
  publish: syntheticResult.audit?.publish,
  libraryMutation: syntheticResult.audit?.libraryMutation,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewCompileStatus: previewResult.compileStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.8' &&
  assertions.pluginVersion === '0.3.0-alpha.8' &&
  assertions.sourceEntrypointExists === true &&
  assertions.classifierRegistered === true &&
  assertions.previewRegistered === true &&
  assertions.emptyContractId === 'umg.runtime.tool_request.classify.v1' &&
  ['CLASSIFICATION_READY', 'CLASSIFICATION_PARTIAL', 'CLASSIFICATION_HELD', 'CLASSIFICATION_FAILED'].includes(assertions.emptyClassificationStatus) &&
  assertions.emptyExecutionStatus === 'not_performed' &&
  assertions.syntheticContractId === 'umg.runtime.tool_request.classify.v1' &&
  assertions.syntheticExecutionStatus === 'not_performed' &&
  assertions.liveContractId === 'umg.runtime.tool_request.classify.v1' &&
  ['CLASSIFICATION_READY', 'CLASSIFICATION_PARTIAL', 'CLASSIFICATION_HELD', 'CLASSIFICATION_FAILED'].includes(assertions.liveClassificationStatus) &&
  assertions.liveExecutionStatus === 'not_performed' &&
  ['available_read_only', 'metadata_only'].includes(assertions.readonlyClassification) &&
  ['blocked_unimplemented', 'unknown', 'blocked_policy'].includes(assertions.unknownClassification) &&
  assertions.approvalCheckpointCreated === false &&
  assertions.triggerEvaluation === 'not_performed' &&
  assertions.toolExecution === 'not_performed' &&
  assertions.restart === 'not_performed' &&
  assertions.publish === 'not_performed' &&
  assertions.libraryMutation === 'not_performed' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewCompileStatus === 'COMPILED' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, emptyResult, syntheticResult, liveResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
