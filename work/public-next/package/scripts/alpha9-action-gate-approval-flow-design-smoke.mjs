import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const designPath = path.join(packageRoot, 'fixtures', 'action-gates', 'action-gate-approval-flow-v1.design.json');
const design = JSON.parse(fs.readFileSync(designPath, 'utf8'));

if (design.designStatus !== 'approval_flow_design_only') throw new Error('designStatus drift');
if (design.baselineVersion !== packageJson.version) throw new Error('baselineVersion drift');
if (design.executionAuthorityExpanded !== false) throw new Error('executionAuthorityExpanded drift');
if (design.approvalDoesNotEqualExecution !== true) throw new Error('approvalDoesNotEqualExecution drift');
if (design.bridgeExecutionStillBlocked !== true) throw new Error('bridgeExecutionStillBlocked drift');
if (design.hardBoundaries.executionEnabled !== false) throw new Error('executionEnabled drift');
if (design.hardBoundaries.desktopBridgeActionsEnabled !== false) throw new Error('desktopBridgeActionsEnabled drift');
if (design.hardBoundaries.phaseBridgeActionsEnabled !== false) throw new Error('phaseBridgeActionsEnabled drift');
if (!Array.isArray(design.approvalStates) || design.approvalStates.length < 6) throw new Error('approvalStates missing');
if (!design.approvalStates.includes('approved_pending_execution_capability')) throw new Error('approval state missing');
if (!Array.isArray(design.allowedDecisions) || !design.allowedDecisions.includes('approve')) throw new Error('allowedDecisions missing');
if (design.previewBeforeApprovalRequired !== true) throw new Error('previewBeforeApprovalRequired drift');
if (design.scopeRules.scopeSpecific !== true) throw new Error('scopeSpecific drift');
if (design.scopeRules.nonTransferable !== true) throw new Error('nonTransferable drift');
if (design.auditRequirements.requestAuditRequired !== true) throw new Error('requestAuditRequired drift');
if (design.auditRequirements.decisionAuditRequired !== true) throw new Error('decisionAuditRequired drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  designId: design.designId,
  approvalStateCount: design.approvalStates.length,
  allowedDecisionCount: design.allowedDecisions.length,
  previewBeforeApprovalRequired: design.previewBeforeApprovalRequired,
  approvalDoesNotEqualExecution: design.approvalDoesNotEqualExecution,
  bridgeExecutionStillBlocked: design.bridgeExecutionStillBlocked
}, null, 2));
