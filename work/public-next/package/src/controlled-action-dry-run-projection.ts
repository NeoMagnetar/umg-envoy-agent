import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ControlledActionDryRunProjection {
  packageVersion: string;
  dryRunId: string;
  linkedActionId: string;
  linkedPolicyId: string;
  linkedApprovalId: string;
  linkedCheckpointId: string;
  linkedDecisionSimulationId: string;
  dryRunState: string;
  dryRunRequestSummary: {
    requestedAt: string;
    requestedBy: string;
    requestedScope: {
      scopeKind: string;
      scopeTarget: string;
      scopeBounded: boolean;
      deniedOperationFamilies?: string[];
      blastRadius?: string;
    };
    requestedTargets: {
      targetKind: string;
      targets: string[];
    };
  };
  dryRunResultSummary: {
    resultState: string;
    wouldExecuteLater: boolean;
    currentlyBlocked: boolean;
    actualExecutionUnavailableInThisBuild: boolean;
  };
  requiredPreconditions: string[];
  blockedPreconditions: string[];
  scopePreview: {
    scopeKind: string;
    scopeTarget: string;
    scopeBounded: boolean;
    deniedOperationFamilies?: string[];
    blastRadius?: string;
  };
  targetPreview: {
    targetKind: string;
    targets: string[];
  };
  expectedSideEffects: {
    wouldTouchExternalState: boolean;
    currentlyBlocked: boolean;
    description: string;
  };
  rollbackPreview: {
    rollbackRequired: boolean;
    reversibility: string;
  };
  backupPreview: {
    backupRequired: boolean;
    backupTargetDescription: string;
  };
  auditPreview: {
    auditRequired: boolean;
    wouldRecord: string[];
  };
  riskConfirmation: {
    actionClass: string;
    riskLevel: string;
    approvalRequired: boolean;
    allowlistRequired: boolean;
    routeBlockedNow: boolean;
  };
  executionEligibilityAfterDryRun: {
    executionEligible: boolean;
    executionBlocked: boolean;
    reason: string;
  };
  dryRunOnly: boolean;
  executionPerformed: boolean;
  dryRunDoesNotEqualExecution: boolean;
  approvalDoesNotEqualExecution: boolean;
  checkpointDoesNotEqualExecution: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

export function projectControlledActionDryRun(): ControlledActionDryRunProjection {
  const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const dryRun = JSON.parse(
    fs.readFileSync(
      path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-dry-run-example.json'),
      'utf8',
    ),
  );

  return {
    packageVersion: packageJson.version,
    dryRunId: dryRun.dryRunId,
    linkedActionId: dryRun.linkedActionId,
    linkedPolicyId: dryRun.linkedPolicyId,
    linkedApprovalId: dryRun.linkedApprovalId,
    linkedCheckpointId: dryRun.linkedCheckpointId,
    linkedDecisionSimulationId: dryRun.linkedDecisionSimulationId,
    dryRunState: dryRun.dryRunState,
    dryRunRequestSummary: dryRun.dryRunRequest,
    dryRunResultSummary: dryRun.dryRunResult,
    requiredPreconditions: dryRun.requiredPreconditions,
    blockedPreconditions: dryRun.blockedPreconditions,
    scopePreview: dryRun.scopePreview,
    targetPreview: dryRun.targetPreview,
    expectedSideEffects: dryRun.expectedSideEffects,
    rollbackPreview: dryRun.rollbackPreview,
    backupPreview: dryRun.backupPreview,
    auditPreview: dryRun.auditPreview,
    riskConfirmation: dryRun.riskConfirmation,
    executionEligibilityAfterDryRun: dryRun.executionEligibilityAfterDryRun,
    dryRunOnly: dryRun.dryRunOnly,
    executionPerformed: dryRun.executionPerformed,
    dryRunDoesNotEqualExecution: dryRun.dryRunDoesNotEqualExecution,
    approvalDoesNotEqualExecution: true,
    checkpointDoesNotEqualExecution: true,
  };
}
