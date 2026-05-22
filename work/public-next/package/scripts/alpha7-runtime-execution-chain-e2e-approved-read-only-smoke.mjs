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

const approvedResult = await invoke('umg_envoy_runtime_execution_chain_e2e_approved_read_only', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'e2e_approved_read_only',
  includeTrace: true
});

const deniedResult = await invoke('umg_envoy_runtime_execution_chain_e2e_approved_read_only', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'deny',
  mode: 'e2e_approved_read_only',
  includeTrace: true
});

const nonAllowlistedResult = await invoke('umg_envoy_runtime_execution_chain_e2e_approved_read_only', {
  sleeveId: 'neomagnetar-dynamic-persona-v1',
  requestedToolName: 'umg_envoy_external_write',
  requestedAction: 'external_write',
  approvalDecision: 'approve',
  mode: 'e2e_approved_read_only',
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
  checkpoint: {
    checkpointId: 'ckpt-e2e-smoke',
    checkpointStatus: 'CHECKPOINT_CREATED',
    sourceRuntimeSpecId: 'rtv0-e2e',
    sourceSleeveId: 'neomagnetar-dynamic-persona-v1',
    sourceGatePlanId: 'gateplan-e2e',
    sourceRequestId: 'req-e2e-1',
    requestedToolName: 'umg_envoy_block_library_status',
    requestedAction: 'status_read',
    argsPreview: 'Read-only status action.',
    riskLevel: 'low',
    approvalRequired: true,
    approvalStatus: 'WAITING_FOR_APPROVAL',
    allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
    idempotencyKey: 'idem-e2e',
    resumeToken: 'resume-e2e',
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
  },
  resumeToken: 'resume-e2e',
  decision: 'approve',
  includeTrace: true,
  mode: 'resume_only'
});
const executeApprovedResult = await invoke('umg_envoy_runtime_execute_approved_allowlisted', {
  checkpoint: {
    checkpointId: 'ckpt-e2e-smoke',
    checkpointStatus: 'CHECKPOINT_CREATED',
    sourceRuntimeSpecId: 'rtv0-e2e',
    sourceSleeveId: 'neomagnetar-dynamic-persona-v1',
    sourceGatePlanId: 'gateplan-e2e',
    sourceRequestId: 'req-e2e-1',
    requestedToolName: 'umg_envoy_block_library_status',
    requestedAction: 'status_read',
    argsPreview: 'Read-only status action.',
    riskLevel: 'low',
    approvalRequired: true,
    approvalStatus: 'WAITING_FOR_APPROVAL',
    allowedDecisions: ['approve', 'deny', 'edit', 'dry_run_only'],
    idempotencyKey: 'idem-e2e',
    resumeToken: 'resume-e2e',
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
  },
  resumeResult: checkpointResumeResult.updatedCheckpointProjection ? checkpointResumeResult : null,
  mode: 'approved_execute',
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
  e2eToolRegistered: toolNames.includes('umg_envoy_runtime_execution_chain_e2e_approved_read_only'),
  approvedContractId: approvedResult.outputContract?.contractId,
  approvedChainStatus: approvedResult.chainStatus,
  approvedExecutionStatus: approvedResult.executionStatus,
  approvedSideEffectStatus: approvedResult.sideEffectStatus,
  approvedToolExecution: approvedResult.audit?.toolExecution,
  approvedApprovalCheckpointCreated: approvedResult.audit?.approvalCheckpointCreated,
  approvedApprovalCheckpointResumed: approvedResult.audit?.approvalCheckpointResumed,
  approvedApprovalVerified: approvedResult.audit?.approvalVerified,
  approvedAllowlistVerified: approvedResult.audit?.allowlistVerified,
  approvedReadOnlyVerified: approvedResult.audit?.readOnlyVerified,
  approvedRuntimeCompiled: approvedResult.audit?.runtimeCompiled,
  approvedResultPayloadExists: approvedResult.resultPayload && typeof approvedResult.resultPayload === 'object',
  deniedChainStatus: deniedResult.chainStatus,
  deniedExecutionStatus: deniedResult.executionStatus,
  nonAllowlistedChainStatus: nonAllowlistedResult.chainStatus,
  nonAllowlistedExecutionStatus: nonAllowlistedResult.executionStatus,
  classifierContractId: classifierResult.outputContract?.contractId,
  gatePlanContractId: gatePlanResult.outputContract?.contractId,
  checkpointCreateContractId: checkpointCreateResult.outputContract?.contractId,
  checkpointResumeContractId: checkpointResumeResult.outputContract?.contractId,
  executeApprovedContractId: executeApprovedResult.outputContract?.contractId,
  previewContractId: previewResult.outputContract?.contractId,
  previewStatus: previewResult.previewStatus,
  previewExecutionStatus: previewResult.executionStatus
};

const ok =
  assertions.packageVersion === '0.3.0-alpha.11' &&
  assertions.e2eToolRegistered === true &&
  assertions.approvedContractId === 'umg.runtime.execution_chain.e2e_approved_read_only.v1' &&
  assertions.approvedChainStatus === 'CHAIN_E2E_READY' &&
  assertions.approvedExecutionStatus === 'EXECUTION_READY' &&
  assertions.approvedSideEffectStatus === 'read_only_no_mutation' &&
  assertions.approvedToolExecution === 'performed' &&
  assertions.approvedApprovalCheckpointCreated === true &&
  assertions.approvedApprovalCheckpointResumed === true &&
  assertions.approvedApprovalVerified === true &&
  assertions.approvedAllowlistVerified === true &&
  assertions.approvedReadOnlyVerified === true &&
  assertions.approvedRuntimeCompiled === true &&
  assertions.approvedResultPayloadExists === true &&
  assertions.deniedChainStatus === 'CHAIN_E2E_BLOCKED' &&
  assertions.deniedExecutionStatus === 'EXECUTION_BLOCKED' &&
  assertions.nonAllowlistedChainStatus === 'CHAIN_E2E_BLOCKED' &&
  assertions.nonAllowlistedExecutionStatus === 'EXECUTION_BLOCKED' &&
  assertions.classifierContractId === 'umg.runtime.tool_request.classify.v1' &&
  assertions.gatePlanContractId === 'umg.runtime.execution_gate.plan.v1' &&
  assertions.checkpointCreateContractId === 'umg.runtime.approval_checkpoint.create.v1' &&
  assertions.checkpointResumeContractId === 'umg.runtime.approval_checkpoint.resume.v1' &&
  assertions.executeApprovedContractId === 'umg.runtime.execute_approved.allowlisted.v1' &&
  assertions.previewContractId === 'umg.runtime.preview.v1' &&
  assertions.previewStatus === 'RUNTIME_PREVIEW_READY' &&
  assertions.previewExecutionStatus === 'not_performed';

if (!ok) {
  console.error(JSON.stringify({ ok, assertions, approvedResult, deniedResult, nonAllowlistedResult, classifierResult, gatePlanResult, checkpointCreateResult, checkpointResumeResult, executeApprovedResult, previewResult }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok, assertions }, null, 2));
