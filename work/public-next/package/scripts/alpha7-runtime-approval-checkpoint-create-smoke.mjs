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
  runtimeSpecId: 'rtv0-empty-checkpoint',
  sleeveId: 'empty-checkpoint-sleeve',
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

const emptyResult = await invoke('umg_envoy_runtime_approval_checkpoint_create', {
  runtimeSpec: emptyRuntimeSpec,
  includeTrace: true,
  storageMode: 'returned_only',
  mode: 'checkpoint_create'
});

const readOnlyPlan = {
  gatePlanId: 'gateplan-readonly-smoke',
  sourceRuntimeSpecId: 'rtv0-readonly',
  sourceSleeveId: 'readonly-sleeve',
  planStatus: 'GATE_PLAN_READY',
  requestCount: 1,
  plannedActions: [
    {
      requestId: 'req-readonly-1',
      requestedToolName: 'umg_envoy_runtime_preview',
      requestedAction: 'Call umg_envoy_runtime_preview',
      classification: 'available_read_only',
      riskLevel: 'low',
      approvalRequired: false,
      allowlisted: true,
      plannedMode: 'classify_only',
      gateDecision: 'allow_read_only',
      decisionReason: 'Read-only safe action.',
      checkpointPreview: null,
      executionStatus: 'not_performed',
      trace: ['readonly']
    }
  ],
  readOnlyCount: 1,
  approvalRequiredCount: 0,
  blockedCount: 0,
  unknownCount: 0,
  executionStatus: 'not_performed',
  audit: {
    execution: 'not_performed',
    toolExecution: 'not_performed',
    approvalCheckpointCreated: false,
    triggerEvaluation: 'not_performed',
    libraryMutation: 'not_performed',
    packageMutation: 'not_performed',
    restart: 'not_performed',
    publish: 'not_performed'
  },
  trace: []
};

const readOnlyResult = await invoke('umg_envoy_runtime_approval_checkpoint_create', {
  gatePlan: readOnlyPlan,
  includeTrace: true,
  storageMode: 'returned_only',
  mode: 'checkpoint_create'
});

const approvalPlan = {
  gatePlanId: 'gateplan-approval-smoke',
  sourceRuntimeSpecId: 'rtv0-approval',
  sourceSleeveId: 'approval-sleeve',
  planStatus: 'GATE_PLAN_READY',
  requestCount: 2,
  plannedActions: [
    {
      requestId: 'req-approval-1',
      requestedToolName: 'umg_envoy_external_write',
      requestedAction: 'Write external state after approval',
      classification: 'available_requires_approval',
      riskLevel: 'high',
      approvalRequired: true,
      allowlisted: false,
      plannedMode: 'approval_required',
      gateDecision: 'require_approval',
      decisionReason: 'Approval required before side effects.',
      checkpointPreview: {
        checkpointWouldBeRequired: true,
        allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
        checkpointCreated: false
      },
      executionStatus: 'not_performed',
      trace: ['approval']
    },
    {
      requestId: 'req-blocked-1',
      requestedToolName: 'totally_unknown_runtime_tool',
      requestedAction: 'Unknown external action',
      classification: 'blocked_unimplemented',
      riskLevel: 'medium',
      approvalRequired: false,
      allowlisted: false,
      plannedMode: 'blocked',
      gateDecision: 'block_unimplemented',
      decisionReason: 'Unknown action.',
      checkpointPreview: null,
      executionStatus: 'not_performed',
      trace: ['blocked']
    }
  ],
  readOnlyCount: 0,
  approvalRequiredCount: 1,
  blockedCount: 1,
  unknownCount: 1,
  executionStatus: 'not_performed',
  audit: {
    execution: 'not_performed',
    toolExecution: 'not_performed',
    approvalCheckpointCreated: false,
    triggerEvaluation: 'not_performed',
    libraryMutation: 'not_performed',
    packageMutation: 'not_performed',
    restart: 'not_performed',
    publish: 'not_performed'
  },
  trace: []
};

const approvalResult = await invoke('umg_envoy_runtime_approval_checkpoint_create', {
  gatePlan: approvalPlan,
  includeTrace: true,
  storageMode: 'returned_only',
  mode: 'checkpoint_create'
});

const classifierResult = await invoke('umg_envoy_runtime_tool_request_classify', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  compileIfMissing: true,
  includeTrace: true,
  mode: 'classify_only'
});
const gatePlanResult = await invoke('umg_envoy_runtime_execution_gate_plan', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  compileIfMissing: true,
  classifyIfMissing: true,
  includeTrace: true,
  includeCheckpointPreview: true,
  mode: 'plan_only'
});
const previewResult = await invoke('umg_envoy_runtime_preview', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  previewFormat: 'summary',
  includeActiveStack: true,
  includeMoltMap: true,
  includeEnvelope: true,
  includeToolRequests: true
});

const checkpoint = approvalResult.checkpoints[0] ?? null;

const assertions = {
  packageVersion: packageJson.version,
  checkpointToolRegistered: toolNames.includes('umg_envoy_runtime_approval_checkpoint_create'),
  emptyContractId: emptyResult.outputContract?.contractId,
  emptyCheckpointCount: emptyResult.checkpointCount,
  emptyExecutionStatus: emptyResult.executionStatus,
  readOnlyCheckpointCount: readOnlyResult.checkpointCount,
  readOnlySkippedActionCount: readOnlyResult.skippedActionCount,
  approvalContractId: approvalResult.outputContract?.contractId,
  approvalCheckpointCount: approvalResult.checkpointCount,
  approvalExecutionStatus: approvalResult.executionStatus,
  approvalCheckpointCreated: approvalResult.audit?.approvalCheckpointCreated,
  checkpointStatus: checkpoint?.checkpointStatus ?? null,
  checkpointApprovalStatus: checkpoint?.approvalStatus ?? null,
  checkpointResumeToken: typeof checkpoint?.resumeToken === 'string' && checkpoint.resumeToken.length > 0,
  checkpointIdempotencyKey: typeof checkpoint?.idempotencyKey === 'string' && checkpoint.idempotencyKey.length > 0,
  checkpointAllowedDecisions: checkpoint?.allowedDecisions ?? [],
  toolExecution: approvalResult.audit?.toolExecution,
  triggerEvaluation: approvalResult.audit?.triggerEvaluation,
  restart: approvalResult.audit?.restart,
  publish: approvalResult.audit?.publish,
  libraryMutation: approvalResult.audit?.libraryMutation,
  classifierContractId: classifierResult.outputContract?.contractId,
  gatePlanContractId: gatePlanResult.outputContract?.contractId,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.8' &&
  assertions.checkpointToolRegistered === true &&
  assertions.emptyContractId === 'umg.runtime.approval_checkpoint.create.v1' &&
  assertions.emptyCheckpointCount === 0 &&
  assertions.emptyExecutionStatus === 'not_performed' &&
  assertions.readOnlyCheckpointCount === 0 &&
  assertions.readOnlySkippedActionCount >= 1 &&
  assertions.approvalContractId === 'umg.runtime.approval_checkpoint.create.v1' &&
  assertions.approvalCheckpointCount === 1 &&
  assertions.approvalExecutionStatus === 'not_performed' &&
  assertions.approvalCheckpointCreated === true &&
  assertions.checkpointStatus === 'CHECKPOINT_CREATED' &&
  assertions.checkpointApprovalStatus === 'WAITING_FOR_APPROVAL' &&
  assertions.checkpointResumeToken === true &&
  assertions.checkpointIdempotencyKey === true &&
  Array.isArray(assertions.checkpointAllowedDecisions) &&
  assertions.checkpointAllowedDecisions.join(',') === 'approve,deny,edit,dry_run_only' &&
  assertions.toolExecution === 'not_performed' &&
  assertions.triggerEvaluation === 'not_performed' &&
  assertions.restart === 'not_performed' &&
  assertions.publish === 'not_performed' &&
  assertions.libraryMutation === 'not_performed' &&
  assertions.classifierContractId === 'umg.runtime.tool_request.classify.v1' &&
  assertions.gatePlanContractId === 'umg.runtime.execution_gate.plan.v1' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, emptyResult, readOnlyResult, approvalResult, classifierResult, gatePlanResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
