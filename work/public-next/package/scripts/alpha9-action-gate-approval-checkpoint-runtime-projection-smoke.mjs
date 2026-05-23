import { projectApprovalCheckpointState } from '../dist/action-gate-approval-checkpoint-projection.js';

const projection = projectApprovalCheckpointState();

const expectedStates = new Set([
  'checkpoint_created',
  'waiting_for_approval',
  'preview_required',
  'approved_not_executed',
  'denied',
  'expired',
  'revoked',
  'superseded',
  'execution_eligible',
  'execution_blocked',
]);

if (!projection.checkpointId) throw new Error('checkpointId missing');
if (!projection.linkedApprovalId) throw new Error('linkedApprovalId missing');
if (!projection.linkedActionId) throw new Error('linkedActionId missing');
if (!projection.linkedPolicyId) throw new Error('linkedPolicyId missing');
if (!expectedStates.has(projection.checkpointState)) throw new Error('checkpointState drift');
if (!projection.allowedDecisions.includes('approve')) throw new Error('approve decision missing');
if (projection.executionEligibility.executionEligible !== false) throw new Error('executionEligible drift');
if (projection.executionEligibility.executionBlocked !== true) throw new Error('executionBlocked drift');
if (projection.executionPerformed !== false) throw new Error('executionPerformed drift');
if (projection.checkpointDoesNotEqualExecution !== true) throw new Error('checkpointDoesNotEqualExecution drift');
if (projection.approvalDoesNotEqualExecution !== true) throw new Error('approvalDoesNotEqualExecution drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: projection.packageVersion,
  checkpointId: projection.checkpointId,
  linkedApprovalId: projection.linkedApprovalId,
  linkedActionId: projection.linkedActionId,
  linkedPolicyId: projection.linkedPolicyId,
  checkpointState: projection.checkpointState,
  approvalState: projection.approvalState,
  requestedDecision: projection.requestedDecision,
  decisionResult: projection.decisionResult,
  scopeBoundaries: projection.scopeBoundaries,
  previewRequirement: projection.previewRequirement,
  dryRunRequirement: projection.dryRunRequirement,
  expiration: projection.expiration,
  auditTrailSummary: projection.auditTrailSummary,
  executionEligibility: projection.executionEligibility,
  checkpointDoesNotEqualExecution: projection.checkpointDoesNotEqualExecution,
  approvalDoesNotEqualExecution: projection.approvalDoesNotEqualExecution,
  executionPerformed: projection.executionPerformed
}, null, 2));
