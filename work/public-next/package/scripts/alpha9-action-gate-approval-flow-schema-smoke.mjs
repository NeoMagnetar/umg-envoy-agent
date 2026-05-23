import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const schemaPath = path.join(packageRoot, 'schemas', 'umg-action-gate-approval-flow.schema.json');
const fixturePath = path.join(packageRoot, 'fixtures', 'action-gates', 'action-gate-approval-flow-example.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

if (schema.$id !== 'umg.action_gate_approval_flow.v1') throw new Error('schema $id drift');
if (fixture.approvalFlowVersion !== 'umg.action_gate_approval_flow.v1') throw new Error('fixture approvalFlowVersion drift');
if (fixture.baselineVersion !== packageJson.version) throw new Error('fixture baselineVersion drift');
if (fixture.approvalDoesNotEqualExecution !== true) throw new Error('approvalDoesNotEqualExecution drift');
if (!fixture.allowedDecisions.includes('approve')) throw new Error('approve decision missing');
if (!fixture.allowedDecisions.includes('dry_run_only')) throw new Error('dry_run_only decision missing');
if (fixture.executionEligibilityProjection.executionEligible !== false) throw new Error('executionEligible drift');
if (fixture.executionEligibilityProjection.executionBlocked !== true) throw new Error('executionBlocked drift');
if (fixture.auditTrail.executionPerformed !== false) throw new Error('executionPerformed drift');
if (!['requested','preview_required','waiting_for_approval','approved','denied','expired','revoked','superseded','execution_eligible','execution_blocked'].every((state) => schema.properties.approvalState.enum.includes(state))) {
  throw new Error('approval state set drift');
}

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  schemaId: schema.$id,
  approvalId: fixture.approvalId,
  approvalState: fixture.approvalState,
  allowedDecisionCount: fixture.allowedDecisions.length,
  executionEligible: fixture.executionEligibilityProjection.executionEligible,
  executionBlocked: fixture.executionEligibilityProjection.executionBlocked,
  approvalDoesNotEqualExecution: fixture.approvalDoesNotEqualExecution
}, null, 2));
