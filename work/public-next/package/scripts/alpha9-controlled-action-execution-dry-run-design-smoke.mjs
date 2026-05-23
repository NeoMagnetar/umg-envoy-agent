import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const designPath = path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-dry-run-v1.design.json');
const design = JSON.parse(fs.readFileSync(designPath, 'utf8'));

if (design.designStatus !== 'dry_run_design_only') throw new Error('designStatus drift');
if (design.baselineVersion !== packageJson.version) throw new Error('baselineVersion drift');
if (design.dryRunOnly !== true) throw new Error('dryRunOnly drift');
if (design.executionPerformed !== false) throw new Error('executionPerformed drift');
if (design.dryRunDoesNotEqualExecution !== true) throw new Error('dryRunDoesNotEqualExecution drift');
if (!Array.isArray(design.requiredPreconditions) || design.requiredPreconditions.length === 0) throw new Error('requiredPreconditions missing');
if (!Array.isArray(design.blockedPreconditions) || design.blockedPreconditions.length === 0) throw new Error('blockedPreconditions missing');
if (design.scopePreview.scopeBounded !== true) throw new Error('scopeBounded drift');
if (design.expectedSideEffects.currentlyBlocked !== true) throw new Error('currentlyBlocked drift');
if (design.executionEligibilityAfterDryRun.executionEligible !== false) throw new Error('executionEligible drift');
if (design.executionEligibilityAfterDryRun.executionBlocked !== true) throw new Error('executionBlocked drift');
if (design.actualExecutionUnavailableInThisBuild !== true) throw new Error('actualExecutionUnavailableInThisBuild drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  designId: design.designId,
  linkedActionId: design.linkedActionId,
  linkedPolicyId: design.linkedPolicyId,
  linkedApprovalCheckpointId: design.linkedApprovalCheckpointId,
  linkedDecisionSimulationId: design.linkedDecisionSimulationId,
  dryRunOnly: design.dryRunOnly,
  executionPerformed: design.executionPerformed,
  blockedPreconditions: design.blockedPreconditions,
  executionEligibilityAfterDryRun: design.executionEligibilityAfterDryRun,
  actualExecutionUnavailableInThisBuild: design.actualExecutionUnavailableInThisBuild
}, null, 2));
