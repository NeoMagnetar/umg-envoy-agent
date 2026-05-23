import { projectApprovalFlowState } from '../dist/action-gate-approval-flow-projection.js';

const projection = projectApprovalFlowState();

if (projection.packageVersion.length === 0) throw new Error('packageVersion missing');
if (projection.approvalDoesNotEqualExecution !== true) throw new Error('approvalDoesNotEqualExecution drift');
if (projection.auditTrailSummary.executionPerformed !== false) throw new Error('executionPerformed drift');
if (!projection.linkedActionId) throw new Error('linkedActionId missing');
if (!projection.linkedActionGatePolicyId) throw new Error('linkedActionGatePolicyId missing');
if (!projection.allowedDecisions.includes('approve')) throw new Error('approve decision missing');
if (!projection.allowedDecisions.includes('dry_run_only')) throw new Error('dry_run_only decision missing');
if (projection.previewRequirement.required !== true) throw new Error('previewRequirement drift');
if (projection.dryRunRequirement.required !== true) throw new Error('dryRunRequirement drift');
if (projection.approvalScope.nonTransferable !== true) throw new Error('approvalScope nonTransferable drift');
if (projection.executionEligibilityProjection.executionEligible !== false) throw new Error('executionEligible drift');
if (projection.executionEligibilityProjection.executionBlocked !== true) throw new Error('executionBlocked drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: projection.packageVersion,
  approvalId: projection.approvalId,
  linkedActionId: projection.linkedActionId,
  linkedActionGatePolicyId: projection.linkedActionGatePolicyId,
  approvalState: projection.approvalState,
  allowedDecisions: projection.allowedDecisions,
  previewRequirement: projection.previewRequirement,
  dryRunRequirement: projection.dryRunRequirement,
  approvalScope: projection.approvalScope,
  expirationState: projection.expirationState,
  revocationState: projection.revocationState,
  supersessionState: projection.supersessionState,
  auditTrailSummary: projection.auditTrailSummary,
  executionEligibilityProjection: projection.executionEligibilityProjection,
  approvalDoesNotEqualExecution: projection.approvalDoesNotEqualExecution
}, null, 2));
