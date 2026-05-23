import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ApprovalFlowProjection {
  packageVersion: string;
  approvalId: string;
  approvalFlowVersion: string;
  linkedActionId: string;
  linkedActionGatePolicyId: string;
  approvalState: string;
  allowedDecisions: string[];
  approvalRequestSummary: {
    approvalRequestId: string;
    requestedAt: string;
    requestedBy: string;
    previewRef: string;
    requestedScope: {
      scopeKind: string;
      scopeTarget: string;
      scopeBounded: boolean;
      nonTransferable: boolean;
    };
  };
  approvalDecisionSummary: {
    decision: string;
    decidedAt: string;
    decidedBy: string;
    reason: string;
  };
  previewRequirement: {
    required: boolean;
    reason: string;
  };
  dryRunRequirement: {
    required: boolean;
    reason: string;
  };
  approvalScope: {
    scopeKind: string;
    scopeTarget: string;
    scopeBounded: boolean;
    nonTransferable: boolean;
  };
  expirationState: {
    expires: boolean;
    expiresAt: string;
  };
  revocationState: {
    revocable: boolean;
    revokedNow: boolean;
  };
  supersessionState: {
    supersededNow: boolean;
    supersededByNewApproval: boolean;
  };
  auditTrailSummary: {
    auditRequired: boolean;
    auditRef: string;
    requestLogged: boolean;
    decisionLogged: boolean;
    previewRefLogged: boolean;
    executionPerformed: boolean;
  };
  executionEligibilityProjection: {
    executionEligible: boolean;
    executionBlocked: boolean;
    policyAllowsExecutionClass: boolean;
    bridgeImplementationPresent: boolean;
    reason: string;
  };
  approvalDoesNotEqualExecution: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

export function projectApprovalFlowState(): ApprovalFlowProjection {
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const fixture = JSON.parse(
    fs.readFileSync(
      path.join(packageRoot, 'fixtures', 'action-gates', 'action-gate-approval-flow-example.json'),
      'utf8',
    ),
  );

  return {
    packageVersion: packageJson.version,
    approvalId: fixture.approvalId,
    approvalFlowVersion: fixture.approvalFlowVersion,
    linkedActionId: fixture.linkedActionId,
    linkedActionGatePolicyId: fixture.linkedActionGatePolicyId,
    approvalState: fixture.approvalState,
    allowedDecisions: fixture.allowedDecisions,
    approvalRequestSummary: fixture.approvalRequest,
    approvalDecisionSummary: fixture.approvalDecision,
    previewRequirement: fixture.previewRequirement,
    dryRunRequirement: fixture.dryRunRequirement,
    approvalScope: fixture.approvalScope,
    expirationState: fixture.expiration,
    revocationState: fixture.revocation,
    supersessionState: fixture.supersession,
    auditTrailSummary: fixture.auditTrail,
    executionEligibilityProjection: fixture.executionEligibilityProjection,
    approvalDoesNotEqualExecution: fixture.approvalDoesNotEqualExecution,
  };
}
