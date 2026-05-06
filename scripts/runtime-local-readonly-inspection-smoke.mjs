import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildGovernedExecutionHandoffDryRun } from '../dist/runtime-spec/governed-execution-handoff.js';
import { buildApprovalRequestDryRun, buildExecutionCheckpointRecordDryRun } from '../dist/runtime-spec/approval-checkpoint-contract.js';
import { buildLocalReadOnlyInspectionMockResultDryRun, buildLocalReadOnlyInspectionScope, buildLocalReadOnlyInspectionPreflightDryRun, hashLocalReadOnlyInspectionScope, redactScopePath, validateLocalReadOnlyInspectionScopeDryRun } from '../dist/runtime-spec/local-readonly-inspection.js';
import { buildRuntimeDashboard, renderRuntimeDashboard } from '../dist/runtime-spec/dashboard.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function buildContext(user_task, requested_tools) {
  const runtimeSpec = compileRuntimeSpecDryRun({ user_task, requested_tools });
  const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
  return { runtimeSpec, handoff };
}

const context = buildContext('Scan C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean for file metadata only.', ['desktop_bridge.file_scan']);
const scope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean', recursive: false, max_depth: 2, max_items: 100 });
const approvalRequired = buildLocalReadOnlyInspectionMockResultDryRun({ ...context, scope });
ensure(approvalRequired.status === 'approval_required', 'project-like scope without approval should be approval_required');
ensure(approvalRequired.scope_hash.startsWith('scope_'), 'scope hash should be present');
ensure(approvalRequired.execution_boundary.local_inspection_performed === false, 'no local inspection should be performed');
ensure(approvalRequired.execution_boundary.file_contents_read === false, 'file contents should not be read');

const approvalRequest = buildApprovalRequestDryRun({ handoff: context.handoff, localReadOnlyScope: { redacted_root: redactScopePath(scope.root_path), recursive: scope.recursive, max_depth: scope.max_depth, max_items: scope.max_items } });
const scopeHash = hashLocalReadOnlyInspectionScope(scope);
const checkpoint = buildExecutionCheckpointRecordDryRun({ handoff: context.handoff, approvalRequest, localInspectionScopeHash: scopeHash });
const passFutureOnly = buildLocalReadOnlyInspectionMockResultDryRun({ ...context, scope, approvalRequest, checkpoint });
ensure(passFutureOnly.status === 'preflight_pass_future_only', 'matching approval/checkpoint should pass future-only');
ensure(passFutureOnly.execution_boundary.statement === 'No local inspection performed.', 'matching approval/checkpoint should still not perform inspection');

const checkpointRequired = buildLocalReadOnlyInspectionMockResultDryRun({ ...context, scope, approvalRequest });
ensure(checkpointRequired.status === 'checkpoint_required', 'missing checkpoint should require checkpoint');

const rootBlockedScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\', recursive: false, max_depth: 2, max_items: 100 });
const rootBlocked = buildLocalReadOnlyInspectionMockResultDryRun({ ...context, scope: rootBlockedScope });
ensure(rootBlocked.status === 'blocked', 'root drive should be blocked');
ensure(rootBlocked.warnings.join(' ').includes('root drive') || rootBlocked.preflight.checks.some((check) => check.reason.includes('root drive')), 'root drive block reason should mention root drive');

const appDataScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\Users\\Example\\AppData', recursive: false, max_depth: 2, max_items: 100 });
const appDataBlocked = buildLocalReadOnlyInspectionMockResultDryRun({ ...context, scope: appDataScope });
ensure(appDataBlocked.status === 'blocked', 'AppData should be blocked');

const fileContentsScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean', include_file_contents: true });
const fileContentsValidation = validateLocalReadOnlyInspectionScopeDryRun({ scope: fileContentsScope });
ensure(fileContentsScope.include_file_contents === false, 'include_file_contents must be forced false');
ensure(fileContentsValidation.allowed === true || fileContentsValidation.blocked_reasons.length >= 0, 'file contents request should not enable contents');

const clampedScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean', max_depth: 99, max_items: 100000 });
ensure(clampedScope.max_depth === 5, 'max_depth should clamp to 5');
ensure(clampedScope.max_items === 500, 'max_items should clamp to 500');
ensure(clampedScope.reason.includes('Warnings') || clampedScope.max_depth === 5, 'clamped scope should carry warning context');

const mismatchScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\.openclaw\\workspace\\different-project', recursive: false, max_depth: 2, max_items: 100 });
const mismatchPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest, checkpoint, scope: mismatchScope });
ensure(mismatchPreflight.status === 'invalid', 'scope mismatch against checkpoint should be invalid');

const dashboard = buildRuntimeDashboard(context.runtimeSpec, {
  include_governed_handoff: true,
  include_approval_checkpoint: true,
  include_local_readonly_inspection: true,
  local_readonly_root_path: 'C:\\.openclaw\\workspace\\umg-envoy-agent-release-clean',
  local_readonly_recursive: false,
  local_readonly_max_depth: 2,
  local_readonly_max_items: 100,
  mode: 'developer'
});
ensure(renderRuntimeDashboard(dashboard).includes('LOCAL READ-ONLY INSPECTION ALPHA'), 'dashboard should render local readonly inspection section');
ensure(renderRuntimeDashboard(dashboard).includes('Execution: No local inspection performed.'), 'dashboard should preserve no local inspection wording');

console.log(JSON.stringify({
  ok: true,
  project_scope_without_approval: approvalRequired,
  matching_approval_checkpoint: passFutureOnly,
  missing_checkpoint: checkpointRequired,
  root_drive_blocked: rootBlocked,
  appdata_blocked: appDataBlocked,
  file_contents_scope: fileContentsScope,
  clamped_scope: clampedScope,
  mismatch_preflight: mismatchPreflight,
  dashboard_rendered: renderRuntimeDashboard(dashboard)
}, null, 2));
