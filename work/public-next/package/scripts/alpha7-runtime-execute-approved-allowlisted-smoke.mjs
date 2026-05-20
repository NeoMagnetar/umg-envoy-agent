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
  checkpointId: 'ckpt-exec-1',
  checkpointStatus: 'CHECKPOINT_CREATED',
  sourceRuntimeSpecId: 'rtv0-exec',
  sourceSleeveId: 'neomagnetar-dynamic-persona-v1',
  sourceGatePlanId: 'gateplan-exec',
  sourceRequestId: 'req-exec-1',
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'Read block library status',
  argsPreview: 'Read-only status action.',
  riskLevel: 'low',
  approvalRequired: true,
  approvalStatus: 'WAITING_FOR_APPROVAL',
  allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
  idempotencyKey: 'idem-exec-1',
  resumeToken: 'resume-exec-1',
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

const approvedResume = {
  resumeResultId: 'resume-approved-1',
  resumeStatus: 'CHECKPOINT_RESUME_READY',
  sourceCheckpointId: 'ckpt-exec-1',
  sourceRuntimeSpecId: 'rtv0-exec',
  sourceSleeveId: 'neomagnetar-dynamic-persona-v1',
  sourceGatePlanId: 'gateplan-exec',
  sourceRequestId: 'req-exec-1',
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'Read block library status',
  decision: 'approve',
  previousApprovalStatus: 'WAITING_FOR_APPROVAL',
  nextApprovalStatus: 'APPROVED',
  allowedDecision: true,
  decisionAccepted: true,
  editRequested: false,
  dryRunOnly: false,
  executionEligible: true,
  executionStatus: 'not_performed',
  checkpointPersistence: 'not_persisted',
  updatedCheckpointProjection: { ...baseCheckpoint, approvalStatus: 'APPROVED' },
  audit: {
    execution: 'not_performed',
    toolExecution: 'not_performed',
    approvalCheckpointResumed: true,
    approvalCheckpointPersistence: 'not_persisted',
    triggerEvaluation: 'not_performed',
    libraryMutation: 'not_performed',
    packageMutation: 'not_performed',
    restart: 'not_performed',
    publish: 'not_performed'
  },
  trace: ['approved']
};

const unapprovedResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: baseCheckpoint,
  resumeResult: { ...approvedResume, nextApprovalStatus: 'WAITING_FOR_APPROVAL', executionEligible: false },
  mode: 'approved_execute',
  includeTrace: true
});

const deniedResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: baseCheckpoint,
  resumeResult: { ...approvedResume, nextApprovalStatus: 'DENIED', executionEligible: false, decision: 'deny' },
  mode: 'approved_execute',
  includeTrace: true
});

const editResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: baseCheckpoint,
  resumeResult: { ...approvedResume, nextApprovalStatus: 'EDIT_REQUESTED', executionEligible: false, decision: 'edit', editRequested: true },
  mode: 'approved_execute',
  includeTrace: true
});

const dryRunOnlyResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: baseCheckpoint,
  resumeResult: { ...approvedResume, nextApprovalStatus: 'DRY_RUN_ONLY', executionEligible: false, decision: 'dry_run_only', dryRunOnly: true },
  mode: 'approved_execute',
  includeTrace: true
});

const nonAllowlistedCheckpoint = { ...baseCheckpoint, checkpointId: 'ckpt-exec-2', sourceRequestId: 'req-exec-2', requestedToolName: 'umg_envoy_external_write', requestedAction: 'Write external state' };
const nonAllowlistedResume = { ...approvedResume, sourceCheckpointId: 'ckpt-exec-2', sourceRequestId: 'req-exec-2', requestedToolName: 'umg_envoy_external_write', requestedAction: 'Write external state' };
const nonAllowlistedResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: nonAllowlistedCheckpoint,
  resumeResult: nonAllowlistedResume,
  mode: 'approved_execute',
  includeTrace: true
});

const approvedStatusResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: baseCheckpoint,
  resumeResult: approvedResume,
  mode: 'approved_execute',
  includeTrace: true
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
        checkpointPreview: { checkpointWouldBeRequired: true, allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'], checkpointCreated: false },
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
const checkpointResumeResult = await invoke('umg_envoy_runtime_approval_checkpoint_resume', {
  checkpoint: baseCheckpoint,
  resumeToken: 'resume-exec-1',
  decision: 'approve',
  includeTrace: true,
  mode: 'resume_only'
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
  execToolRegistered: toolNames.includes('umg_envoy_runtime_execute_approved_allowlisted'),
  approvedContractId: approvedStatusResult.outputContract?.contractId,
  unapprovedStatus: unapprovedResult.executionStatus,
  deniedStatus: deniedResult.executionStatus,
  editStatus: editResult.executionStatus,
  dryRunOnlyStatus: dryRunOnlyResult.executionStatus,
  nonAllowlistedStatus: nonAllowlistedResult.executionStatus,
  approvedStatus: approvedStatusResult.executionStatus,
  approvedSideEffectStatus: approvedStatusResult.sideEffectStatus,
  approvedToolExecution: approvedStatusResult.audit?.toolExecution,
  approvedLibraryMutation: approvedStatusResult.audit?.libraryMutation,
  approvedPackageMutation: approvedStatusResult.audit?.packageMutation,
  approvedFilesystemMutation: approvedStatusResult.audit?.filesystemMutation,
  approvedRestart: approvedStatusResult.audit?.restart,
  approvedPublish: approvedStatusResult.audit?.publish,
  approvedTriggerEvaluation: approvedStatusResult.audit?.triggerEvaluation,
  approvedResultPayloadExists: approvedStatusResult.resultPayload && typeof approvedStatusResult.resultPayload === 'object',
  classifierContractId: classifierResult.outputContract?.contractId,
  gatePlanContractId: gatePlanResult.outputContract?.contractId,
  checkpointCreateContractId: checkpointCreateResult.outputContract?.contractId,
  checkpointResumeContractId: checkpointResumeResult.outputContract?.contractId,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.8' &&
  assertions.execToolRegistered === true &&
  assertions.approvedContractId === 'umg.runtime.execute_approved.allowlisted.v1' &&
  assertions.unapprovedStatus === 'EXECUTION_BLOCKED' &&
  assertions.deniedStatus === 'EXECUTION_BLOCKED' &&
  assertions.editStatus === 'EXECUTION_BLOCKED' &&
  assertions.dryRunOnlyStatus === 'EXECUTION_BLOCKED' &&
  assertions.nonAllowlistedStatus === 'EXECUTION_BLOCKED' &&
  assertions.approvedStatus === 'EXECUTION_READY' &&
  assertions.approvedSideEffectStatus === 'read_only_no_mutation' &&
  assertions.approvedToolExecution === 'performed' &&
  assertions.approvedLibraryMutation === 'not_performed' &&
  assertions.approvedPackageMutation === 'not_performed' &&
  assertions.approvedFilesystemMutation === 'not_performed' &&
  assertions.approvedRestart === 'not_performed' &&
  assertions.approvedPublish === 'not_performed' &&
  assertions.approvedTriggerEvaluation === 'not_performed' &&
  assertions.approvedResultPayloadExists === true &&
  assertions.classifierContractId === 'umg.runtime.tool_request.classify.v1' &&
  assertions.gatePlanContractId === 'umg.runtime.execution_gate.plan.v1' &&
  assertions.checkpointCreateContractId === 'umg.runtime.approval_checkpoint.create.v1' &&
  assertions.checkpointResumeContractId === 'umg.runtime.approval_checkpoint.resume.v1' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, unapprovedResult, deniedResult, editResult, dryRunOnlyResult, nonAllowlistedResult, approvedStatusResult, classifierResult, gatePlanResult, checkpointCreateResult, checkpointResumeResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
