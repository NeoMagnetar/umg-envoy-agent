import { projectApprovalCheckpointState } from './action-gate-approval-checkpoint-projection.js';

export type ApprovalDecisionSimulationInput =
  | 'approve'
  | 'deny'
  | 'edit'
  | 'revoke'
  | 'expire'
  | 'supersede'
  | 'dry_run_only';

export interface ApprovalDecisionSimulationResult {
  packageVersion: string;
  checkpointId: string;
  originalCheckpointState: string;
  originalApprovalState: string;
  requestedDecision: ApprovalDecisionSimulationInput;
  decisionAccepted: boolean;
  decisionRejectedReason: string | null;
  resultingCheckpointState: string;
  resultingApprovalState: string;
  executionEligibilityProjection: {
    executionEligible: boolean;
    executionBlocked: boolean;
    reason: string;
  };
  previewStillRequired: boolean;
  dryRunStillRequired: boolean;
  updatedAuditTrailSummary: {
    auditRequired: boolean;
    auditRef: string;
    requestLogged: boolean;
    decisionLogged: boolean;
    previewRefLogged: boolean;
    executionPerformed: boolean;
  };
  executionPerformed: boolean;
  decisionSimulationOnly: boolean;
  checkpointDoesNotEqualExecution: boolean;
  approvalDoesNotEqualExecution: boolean;
}

export function simulateApprovalDecision(
  requestedDecision: ApprovalDecisionSimulationInput,
): ApprovalDecisionSimulationResult {
  const checkpoint = projectApprovalCheckpointState();
  const allowed = checkpoint.allowedDecisions.includes(requestedDecision);

  let resultingCheckpointState = checkpoint.checkpointState;
  let resultingApprovalState = checkpoint.approvalState;
  let executionEligible = checkpoint.executionEligibility.executionEligible;
  let executionBlocked = checkpoint.executionEligibility.executionBlocked;
  let reason = checkpoint.executionEligibility.reason;
  let previewStillRequired = checkpoint.previewRequirement.required;
  let dryRunStillRequired = checkpoint.dryRunRequirement.required;

  if (allowed) {
    switch (requestedDecision) {
      case 'approve':
        resultingCheckpointState = 'execution_eligible';
        resultingApprovalState = 'approved';
        executionEligible = true;
        executionBlocked = false;
        reason = 'Approval simulated as accepted; execution eligibility is projected only and nothing executed.';
        break;
      case 'deny':
        resultingCheckpointState = 'denied';
        resultingApprovalState = 'denied';
        executionEligible = false;
        executionBlocked = true;
        reason = 'Approval simulated as denied.';
        break;
      case 'edit':
        resultingCheckpointState = 'waiting_for_approval';
        resultingApprovalState = 'waiting_for_approval';
        executionEligible = false;
        executionBlocked = true;
        previewStillRequired = true;
        dryRunStillRequired = true;
        reason = 'Approval simulated as edited; checkpoint returns to waiting state pending revised approval.';
        break;
      case 'revoke':
        resultingCheckpointState = 'revoked';
        resultingApprovalState = 'revoked';
        executionEligible = false;
        executionBlocked = true;
        reason = 'Approval simulated as revoked.';
        break;
      case 'expire':
        resultingCheckpointState = 'expired';
        resultingApprovalState = 'expired';
        executionEligible = false;
        executionBlocked = true;
        reason = 'Approval simulated as expired.';
        break;
      case 'supersede':
        resultingCheckpointState = 'superseded';
        resultingApprovalState = 'superseded';
        executionEligible = false;
        executionBlocked = true;
        reason = 'Approval simulated as superseded by a newer approval path.';
        break;
      case 'dry_run_only':
        resultingCheckpointState = 'preview_required';
        resultingApprovalState = 'preview_required';
        executionEligible = false;
        executionBlocked = true;
        previewStillRequired = true;
        dryRunStillRequired = true;
        reason = 'Decision simulated as dry-run-only; route remains preview-bound and non-executable.';
        break;
    }
  }

  return {
    packageVersion: checkpoint.packageVersion,
    checkpointId: checkpoint.checkpointId,
    originalCheckpointState: checkpoint.checkpointState,
    originalApprovalState: checkpoint.approvalState,
    requestedDecision,
    decisionAccepted: allowed,
    decisionRejectedReason: allowed ? null : 'Decision is not allowed by this checkpoint projection.',
    resultingCheckpointState,
    resultingApprovalState,
    executionEligibilityProjection: {
      executionEligible,
      executionBlocked,
      reason,
    },
    previewStillRequired,
    dryRunStillRequired,
    updatedAuditTrailSummary: {
      ...checkpoint.auditTrailSummary,
      decisionLogged: checkpoint.auditTrailSummary.auditRequired,
      executionPerformed: false,
    },
    executionPerformed: false,
    decisionSimulationOnly: true,
    checkpointDoesNotEqualExecution: checkpoint.checkpointDoesNotEqualExecution,
    approvalDoesNotEqualExecution: checkpoint.approvalDoesNotEqualExecution,
  };
}
