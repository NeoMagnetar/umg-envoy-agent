import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
export function projectApprovalFlowState() {
    const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
    const fixture = JSON.parse(fs.readFileSync(path.join(packageRoot, 'fixtures', 'action-gates', 'action-gate-approval-flow-example.json'), 'utf8'));
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
