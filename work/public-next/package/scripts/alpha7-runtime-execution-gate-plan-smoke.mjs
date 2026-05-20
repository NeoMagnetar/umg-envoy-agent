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

const emptyRuntimeSpec = {
  runtimeSpecVersion: 'RuntimeSpecV0',
  runtimeSpecId: 'rtv0-empty-gate-plan',
  sleeveId: 'empty-gate-plan-sleeve',
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

const emptyPlan = await invoke('umg_envoy_runtime_execution_gate_plan', {
  runtimeSpec: emptyRuntimeSpec,
  includeTrace: true,
  includeCheckpointPreview: true,
  mode: 'plan_only'
});

const syntheticRuntimeSpec = {
  ...emptyRuntimeSpec,
  runtimeSpecId: 'rtv0-synthetic-gate-plan',
  sleeveId: 'synthetic-gate-plan-sleeve',
  toolRequests: [
    { kind: 'declared_trigger', sourceBlockId: 'trigger-readonly', declaredAction: 'Call umg_envoy_runtime_preview for dry-run context only' },
    { kind: 'declared_trigger', sourceBlockId: 'trigger-blocked', declaredAction: 'Publish package and restart immediately' }
  ]
};

const syntheticPlan = await invoke('umg_envoy_runtime_execution_gate_plan', {
  runtimeSpec: syntheticRuntimeSpec,
  includeTrace: true,
  includeCheckpointPreview: true,
  mode: 'plan_only'
});

const livePlan = await invoke('umg_envoy_runtime_execution_gate_plan', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  compileIfMissing: true,
  classifyIfMissing: true,
  includeTrace: true,
  includeCheckpointPreview: true,
  mode: 'plan_only'
});

const classifierResult = await invoke('umg_envoy_runtime_tool_request_classify', {
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

const readonlyAction = syntheticPlan.plannedActions.find((item) => item.requestedToolName === 'umg_envoy_runtime_preview');
const blockedAction = syntheticPlan.plannedActions.find((item) => item.requestedAction?.toLowerCase().includes('publish'));

const assertions = {
  packageVersion: packageJson.version,
  gatePlanRegistered: toolNames.includes('umg_envoy_runtime_execution_gate_plan'),
  classifierRegistered: toolNames.includes('umg_envoy_runtime_tool_request_classify'),
  emptyContractId: emptyPlan.outputContract?.contractId,
  emptyPlanStatus: emptyPlan.planStatus,
  emptyRequestCount: emptyPlan.requestCount,
  emptyExecutionStatus: emptyPlan.executionStatus,
  syntheticContractId: syntheticPlan.outputContract?.contractId,
  syntheticPlanStatus: syntheticPlan.planStatus,
  syntheticExecutionStatus: syntheticPlan.executionStatus,
  syntheticCheckpointCreated: syntheticPlan.checkpointCreated,
  readonlyGateDecision: readonlyAction?.gateDecision ?? null,
  readonlyPlannedMode: readonlyAction?.plannedMode ?? null,
  blockedGateDecision: blockedAction?.gateDecision ?? null,
  blockedPlannedMode: blockedAction?.plannedMode ?? null,
  liveContractId: livePlan.outputContract?.contractId,
  livePlanStatus: livePlan.planStatus,
  liveExecutionStatus: livePlan.executionStatus,
  liveCheckpointCreated: livePlan.checkpointCreated,
  approvalCheckpointCreated: livePlan.audit?.approvalCheckpointCreated,
  toolExecution: livePlan.audit?.toolExecution,
  triggerEvaluation: livePlan.audit?.triggerEvaluation,
  restart: livePlan.audit?.restart,
  publish: livePlan.audit?.publish,
  libraryMutation: livePlan.audit?.libraryMutation,
  classifierContractId: classifierResult.outputContract?.contractId,
  classifierExecutionStatus: classifierResult.executionStatus,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.8' &&
  assertions.gatePlanRegistered === true &&
  assertions.classifierRegistered === true &&
  assertions.emptyContractId === 'umg.runtime.execution_gate.plan.v1' &&
  assertions.emptyPlanStatus === 'GATE_PLAN_READY' &&
  assertions.emptyRequestCount === 0 &&
  assertions.emptyExecutionStatus === 'not_performed' &&
  assertions.syntheticContractId === 'umg.runtime.execution_gate.plan.v1' &&
  ['GATE_PLAN_READY', 'GATE_PLAN_PARTIAL', 'GATE_PLAN_HELD', 'GATE_PLAN_FAILED'].includes(assertions.syntheticPlanStatus) &&
  assertions.syntheticExecutionStatus === 'not_performed' &&
  assertions.syntheticCheckpointCreated === false &&
  ['allow_read_only', 'metadata_only', 'preview_only', 'dry_run_only'].includes(assertions.readonlyGateDecision) &&
  ['classify_only', 'preview', 'dry_run'].includes(assertions.readonlyPlannedMode) &&
  ['block_policy', 'block_unknown', 'block_unimplemented'].includes(assertions.blockedGateDecision) &&
  assertions.blockedPlannedMode === 'blocked' &&
  assertions.liveContractId === 'umg.runtime.execution_gate.plan.v1' &&
  ['GATE_PLAN_READY', 'GATE_PLAN_PARTIAL', 'GATE_PLAN_HELD', 'GATE_PLAN_FAILED'].includes(assertions.livePlanStatus) &&
  assertions.liveExecutionStatus === 'not_performed' &&
  assertions.liveCheckpointCreated === false &&
  assertions.approvalCheckpointCreated === false &&
  assertions.toolExecution === 'not_performed' &&
  assertions.triggerEvaluation === 'not_performed' &&
  assertions.restart === 'not_performed' &&
  assertions.publish === 'not_performed' &&
  assertions.libraryMutation === 'not_performed' &&
  assertions.classifierContractId === 'umg.runtime.tool_request.classify.v1' &&
  assertions.classifierExecutionStatus === 'not_performed' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, emptyPlan, syntheticPlan, livePlan, classifierResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
