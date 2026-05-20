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

const baseCheckpoint = {
  checkpointId: 'ckpt_smoke_1',
  checkpointStatus: 'CHECKPOINT_CREATED',
  sourceRuntimeSpecId: 'rtv0-checkpoint-resume',
  sourceSleeveId: 'checkpoint-resume-sleeve',
  sourceGatePlanId: 'gateplan-checkpoint-resume',
  sourceRequestId: 'req-approval-1',
  requestedToolName: 'umg_envoy_external_write',
  requestedAction: 'Write external state after approval',
  argsPreview: 'Approval required before side effects.',
  riskLevel: 'high',
  approvalRequired: true,
  approvalStatus: 'WAITING_FOR_APPROVAL',
  allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
  idempotencyKey: 'idem-smoke-1',
  resumeToken: 'resume-smoke-token-1',
  createdAt: new Date().toISOString(),
  expiresAt: null,
  executionStatus: 'not_performed',
  audit: {
    execution: 'not_performed',
    toolExecution: 'not_performed',
    approvalCheckpointCreated: true,
    approvalCheckpointPersistence: 'not_persisted',
    triggerEvaluation: 'not_performed',
    libraryMutation: 'not_performed',
    packageMutation: 'not_performed',
    restart: 'not_performed',
    publish: 'not_performed'
  },
  trace: ['checkpoint-created']
};

const approveResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: baseCheckpoint,
  resumeToken: 'resume-smoke-token-1',
  decision: 'approve',
  includeTrace: true,
  mode: 'resume_only'
});

const denyResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: baseCheckpoint,
  resumeToken: 'resume-smoke-token-1',
  decision: 'deny',
  includeTrace: true,
  mode: 'resume_only'
});

const editResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: baseCheckpoint,
  resumeToken: 'resume-smoke-token-1',
  decision: 'edit',
  editedArgsPreview: { note: 'Need a safer variant' },
  decisionReason: 'Please revise args',
  includeTrace: true,
  mode: 'resume_only'
});

const dryRunOnlyResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: baseCheckpoint,
  resumeToken: 'resume-smoke-token-1',
  decision: 'dry_run_only',
  includeTrace: true,
  mode: 'resume_only'
});

const badTokenResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: baseCheckpoint,
  resumeToken: 'wrong-token',
  decision: 'approve',
  includeTrace: true,
  mode: 'resume_only'
});

const finalCheckpoint = {
  ...baseCheckpoint,
  approvalStatus: 'APPROVED'
};
const alreadyFinalResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: finalCheckpoint,
  resumeToken: 'resume-smoke-token-1',
  decision: 'deny',
  includeTrace: true,
  mode: 'resume_only'
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
const checkpointCreateResult = await invoke('umg_envoy_runtime_approval_checkpoint_create', {
  gatePlan: {
    gatePlanId: 'gateplan-approval-smoke',
    sourceRuntimeSpecId: 'rtv0-approval',
    sourceSleeveId: 'approval-sleeve',
    planStatus: 'GATE_PLAN_READY',
    requestCount: 1,
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
      }
    ],
    readOnlyCount: 0,
    approvalRequiredCount: 1,
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
  },
  includeTrace: true,
  storageMode: 'returned_only',
  mode: 'checkpoint_create'
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
  resumeToolRegistered: toolNames.includes('umg_envoy_runtime_approval_checkpoint_resume'),
  approveContractId: approveResult.outputContract?.contractId,
  approveResumeStatus: approveResult.resumeStatus,
  approveNextApprovalStatus: approveResult.nextApprovalStatus,
  approveExecutionEligible: approveResult.executionEligible,
  approveExecutionStatus: approveResult.executionStatus,
  denyNextApprovalStatus: denyResult.nextApprovalStatus,
  denyExecutionEligible: denyResult.executionEligible,
  editNextApprovalStatus: editResult.nextApprovalStatus,
  editRequested: editResult.editRequested,
  dryRunOnlyNextApprovalStatus: dryRunOnlyResult.nextApprovalStatus,
  dryRunOnlyFlag: dryRunOnlyResult.dryRunOnly,
  badTokenStatus: badTokenResult.resumeStatus,
  alreadyFinalStatus: alreadyFinalResult.resumeStatus,
  toolExecution: approveResult.audit?.toolExecution,
  triggerEvaluation: approveResult.audit?.triggerEvaluation,
  restart: approveResult.audit?.restart,
  publish: approveResult.audit?.publish,
  libraryMutation: approveResult.audit?.libraryMutation,
  classifierContractId: classifierResult.outputContract?.contractId,
  gatePlanContractId: gatePlanResult.outputContract?.contractId,
  checkpointCreateContractId: checkpointCreateResult.outputContract?.contractId,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.8' &&
  assertions.resumeToolRegistered === true &&
  assertions.approveContractId === 'umg.runtime.approval_checkpoint.resume.v1' &&
  assertions.approveResumeStatus === 'CHECKPOINT_RESUME_READY' &&
  assertions.approveNextApprovalStatus === 'APPROVED' &&
  assertions.approveExecutionEligible === true &&
  assertions.approveExecutionStatus === 'not_performed' &&
  assertions.denyNextApprovalStatus === 'DENIED' &&
  assertions.denyExecutionEligible === false &&
  assertions.editNextApprovalStatus === 'EDIT_REQUESTED' &&
  assertions.editRequested === true &&
  assertions.dryRunOnlyNextApprovalStatus === 'DRY_RUN_ONLY' &&
  assertions.dryRunOnlyFlag === true &&
  ['CHECKPOINT_RESUME_HELD', 'CHECKPOINT_RESUME_FAILED'].includes(assertions.badTokenStatus) &&
  ['CHECKPOINT_RESUME_HELD', 'CHECKPOINT_RESUME_FAILED'].includes(assertions.alreadyFinalStatus) &&
  assertions.toolExecution === 'not_performed' &&
  assertions.triggerEvaluation === 'not_performed' &&
  assertions.restart === 'not_performed' &&
  assertions.publish === 'not_performed' &&
  assertions.libraryMutation === 'not_performed' &&
  assertions.classifierContractId === 'umg.runtime.tool_request.classify.v1' &&
  assertions.gatePlanContractId === 'umg.runtime.execution_gate.plan.v1' &&
  assertions.checkpointCreateContractId === 'umg.runtime.approval_checkpoint.create.v1' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, approveResult, denyResult, editResult, dryRunOnlyResult, badTokenResult, alreadyFinalResult, classifierResult, gatePlanResult, checkpointCreateResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
