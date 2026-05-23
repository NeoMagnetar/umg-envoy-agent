import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const schemaPath = path.join(packageRoot, 'schemas', 'umg-controlled-action-dry-run.schema.json');
const fixturePath = path.join(packageRoot, 'fixtures', 'action-gates', 'controlled-action-dry-run-example.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

if (schema.$id !== 'umg.controlled_action_dry_run.v1') throw new Error('schema $id drift');
if (fixture.dryRunVersion !== 'umg.controlled_action_dry_run.v1') throw new Error('fixture dryRunVersion drift');
if (fixture.baselineVersion !== packageJson.version) throw new Error('fixture baselineVersion drift');
if (fixture.dryRunOnly !== true) throw new Error('dryRunOnly drift');
if (fixture.executionPerformed !== false) throw new Error('executionPerformed drift');
if (fixture.dryRunDoesNotEqualExecution !== true) throw new Error('dryRunDoesNotEqualExecution drift');
if (!['requested','ready_for_preview','preview_generated','blocked','failed_validation','dry_run_complete','execution_eligible_after_dry_run','execution_blocked_after_dry_run'].every((state) => schema.properties.dryRunState.enum.includes(state))) {
  throw new Error('dryRun state set drift');
}
if (fixture.executionEligibilityAfterDryRun.executionEligible !== false) throw new Error('executionEligible drift');
if (fixture.executionEligibilityAfterDryRun.executionBlocked !== true) throw new Error('executionBlocked drift');
if (fixture.dryRunResult.actualExecutionUnavailableInThisBuild !== true) throw new Error('actualExecutionUnavailableInThisBuild drift');

console.log(JSON.stringify({
  ok: true,
  packageVersion: packageJson.version,
  schemaId: schema.$id,
  dryRunId: fixture.dryRunId,
  dryRunState: fixture.dryRunState,
  linkedActionId: fixture.linkedActionId,
  linkedPolicyId: fixture.linkedPolicyId,
  executionEligibilityAfterDryRun: fixture.executionEligibilityAfterDryRun,
  dryRunOnly: fixture.dryRunOnly,
  executionPerformed: fixture.executionPerformed,
  dryRunDoesNotEqualExecution: fixture.dryRunDoesNotEqualExecution
}, null, 2));
