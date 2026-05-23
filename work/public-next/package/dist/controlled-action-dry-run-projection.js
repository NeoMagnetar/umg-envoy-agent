import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
export function projectControlledActionDryRun() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const dryRun = JSON.parse(fs.readFileSync(path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-dry-run-example.json'), 'utf8'));
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
