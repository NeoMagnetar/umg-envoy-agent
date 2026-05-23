import { projectControlledActionDryRun } from '../dist/controlled-action-dry-run-projection.js';

const projection = projectControlledActionDryRun();

if (!projection.dryRunId) throw new Error('dryRunId missing');
if (!projection.linkedActionId) throw new Error('linkedActionId missing');
if (!projection.linkedPolicyId) throw new Error('linkedPolicyId missing');
if (!projection.linkedApprovalId) throw new Error('linkedApprovalId missing');
if (!projection.linkedCheckpointId) throw new Error('linkedCheckpointId missing');
if (!projection.linkedDecisionSimulationId) throw new Error('linkedDecisionSimulationId missing');
if (projection.dryRunOnly !== true) throw new Error('dryRunOnly drift');
if (projection.executionPerformed !== false) throw new Error('executionPerformed drift');
if (projection.dryRunDoesNotEqualExecution !== true) throw new Error('dryRunDoesNotEqualExecution drift');
if (projection.approvalDoesNotEqualExecution !== true) throw new Error('approvalDoesNotEqualExecution drift');
if (projection.checkpointDoesNotEqualExecution !== true) throw new Error('checkpointDoesNotEqualExecution drift');
if (!Array.isArray(projection.requiredPreconditions) || projection.requiredPreconditions.length === 0) throw new Error('requiredPreconditions missing');
if (!Array.isArray(projection.blockedPreconditions) || projection.blockedPreconditions.length === 0) throw new Error('blockedPreconditions missing');
if (projection.executionEligibilityAfterDryRun.executionEligible !== false) throw new Error('executionEligible drift');
if (projection.executionEligibilityAfterDryRun.executionBlocked !== true) throw new Error('executionBlocked drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: projection.packageVersion,
  dryRunId: projection.dryRunId,
  linkedActionId: projection.linkedActionId,
  linkedPolicyId: projection.linkedPolicyId,
  linkedApprovalId: projection.linkedApprovalId,
  linkedCheckpointId: projection.linkedCheckpointId,
  linkedDecisionSimulationId: projection.linkedDecisionSimulationId,
  dryRunState: projection.dryRunState,
  dryRunRequestSummary: projection.dryRunRequestSummary,
  dryRunResultSummary: projection.dryRunResultSummary,
  requiredPreconditions: projection.requiredPreconditions,
  blockedPreconditions: projection.blockedPreconditions,
  executionEligibilityAfterDryRun: projection.executionEligibilityAfterDryRun,
  dryRunOnly: projection.dryRunOnly,
  executionPerformed: projection.executionPerformed,
  dryRunDoesNotEqualExecution: projection.dryRunDoesNotEqualExecution,
  approvalDoesNotEqualExecution: projection.approvalDoesNotEqualExecution,
  checkpointDoesNotEqualExecution: projection.checkpointDoesNotEqualExecution
}, null, 2));
