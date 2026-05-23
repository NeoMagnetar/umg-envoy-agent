import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ApprovalCheckpointProjection {
  packageVersion: string;
  checkpointId: string;
  linkedApprovalId: string;
  linkedActionId: string;
  linkedPolicyId: string;
  checkpointState: string;
  approvalState: string;
  allowedDecisions: string[];
  requestedDecision: string | null;
  decisionResult: string | null;
  scopeBoundaries: {
    scopeKind: string;
    scopeTarget: string;
    scopeBounded: boolean;
    nonTransferable: boolean;
  };
  previewRequirement: {
    required: boolean;
    reason: string;
  };
  dryRunRequirement: {
    required: boolean;
    reason: string;
  };
  expiration: {
    expires: boolean;
    expiresAt: string;
  };
  auditTrailSummary: {
    auditRequired: boolean;
    auditRef: string;
    requestLogged: boolean;
    decisionLogged: boolean;
    previewRefLogged: boolean;
    executionPerformed: boolean;
  };
  executionEligibility: {
    executionEligible: boolean;
    executionBlocked: boolean;
    reason: string;
  };
  checkpointDoesNotEqualExecution: boolean;
  approvalDoesNotEqualExecution: boolean;
  executionPerformed: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

export function projectApprovalCheckpointState(): ApprovalCheckpointProjection {
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const flow = JSON.parse(
    fs.readFileSync(
      path.join(packageRoot, 'fixtures', 'action-gates', 'action-gate-approval-flow-example.json'),
      'utf8',
    ),
  );

  return {
    packageVersion: packageJson.version,
    checkpointId: `checkpoint.${flow.approvalId}`,
    linkedApprovalId: flow.approvalId,
    linkedActionId: flow.linkedActionId,
    linkedPolicyId: flow.linkedActionGatePolicyId,
    checkpointState: 'execution_blocked',
    approvalState: flow.approvalState,
    allowedDecisions: flow.allowedDecisions,
    requestedDecision: flow.approvalDecision?.decision ?? null,
    decisionResult: flow.approvalDecision?.decision ?? null,
    scopeBoundaries: flow.approvalScope,
    previewRequirement: flow.previewRequirement,
    dryRunRequirement: flow.dryRunRequirement,
    expiration: flow.expiration,
    auditTrailSummary: flow.auditTrail,
    executionEligibility: {
      executionEligible: flow.executionEligibilityProjection.executionEligible,
      executionBlocked: flow.executionEligibilityProjection.executionBlocked,
      reason: flow.executionEligibilityProjection.reason,
    },
    checkpointDoesNotEqualExecution: true,
    approvalDoesNotEqualExecution: flow.approvalDoesNotEqualExecution,
    executionPerformed: flow.auditTrail.executionPerformed,
  };
}
