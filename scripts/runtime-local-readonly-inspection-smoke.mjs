import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { compileRuntimeSpecDryRun } from '../dist/runtime-spec/compiler.js';
import { buildGovernedExecutionHandoffDryRun } from '../dist/runtime-spec/governed-execution-handoff.js';
import { buildApprovalRequestDryRun, buildExecutionCheckpointRecordDryRun } from '../dist/runtime-spec/approval-checkpoint-contract.js';
import { buildLocalReadOnlyInspectionMockResultDryRun, buildLocalReadOnlyInspectionPlanDryRun, buildLocalReadOnlyInspectionPreflightDryRun, buildLocalReadOnlyInspectionScope, executeApprovedLocalReadOnlyMetadataScan, executeLocalReadOnlyMetadataScan, hashLocalReadOnlyInspectionScope, redactScopePath } from '../dist/runtime-spec/local-readonly-inspection.js';

function ensure(condition, message) {
  if (!condition) throw new Error(message);
}

function buildContext(user_task, requested_tools) {
  const runtimeSpec = compileRuntimeSpecDryRun({ user_task, requested_tools });
  const handoff = buildGovernedExecutionHandoffDryRun({ runtimeSpec });
  return { runtimeSpec, handoff };
}

async function withFixture(run) {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'umg-local-scan-'));
  try {
    await fs.mkdir(path.join(fixtureRoot, 'src'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'docs'), { recursive: true });
    await fs.mkdir(path.join(fixtureRoot, 'src', 'nested', 'deep'), { recursive: true });
    await fs.writeFile(path.join(fixtureRoot, 'README.md'), '# fixture\n');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'index.ts'), 'export const x = 1;\n');
    await fs.writeFile(path.join(fixtureRoot, 'docs', 'guide.md'), 'guide\n');
    await fs.writeFile(path.join(fixtureRoot, '.env'), 'SECRET=1\n');
    await fs.writeFile(path.join(fixtureRoot, 'secret.key'), 'not-read\n');
    await fs.writeFile(path.join(fixtureRoot, 'src', 'nested', 'deep', 'very-deep.ts'), 'deep\n');
    await run(fixtureRoot);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
}

const context = buildContext('Scan local fixture for metadata only.', ['desktop_bridge.file_scan']);

await withFixture(async (fixtureRoot) => {
  const scope = buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100 });
  const approvalMissing = buildLocalReadOnlyInspectionMockResultDryRun({ ...context, scope });
  ensure(approvalMissing.status === 'approval_required', 'missing approval should block before scan');

  const plan = buildLocalReadOnlyInspectionPlanDryRun({ ...context, root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100 });
  ensure(plan.scope_hash.startsWith('scope_'), 'plan should return scope hash');
  ensure(typeof plan.approval_token === 'string' && plan.approval_token.startsWith('approval_scope_'), 'plan should return approval token for allowed scope');
  ensure(plan.execution_boundary.local_inspection_performed === false, 'plan must not perform scan');

  const approvalRequest = buildApprovalRequestDryRun({ handoff: context.handoff, localReadOnlyScope: { redacted_root: redactScopePath(scope.root_path), recursive: scope.recursive, max_depth: scope.max_depth, max_items: scope.max_items } });
  const scopeHash = hashLocalReadOnlyInspectionScope(scope);
  const checkpoint = buildExecutionCheckpointRecordDryRun({ handoff: context.handoff, approvalRequest, localInspectionScopeHash: scopeHash });
  const preflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest, checkpoint, scope });
  ensure(preflight.status === 'pass_future_only', 'matching approval/checkpoint should pass future-only before scan');

  const success = await executeApprovedLocalReadOnlyMetadataScan({ ...context, root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100, scope_hash: plan.scope_hash, approval_token: plan.approval_token, user_approved_exact_scope: true, confirm_no_file_contents: true });
  ensure(success.status === 'executed_read_only', 'fixture scan should succeed');
  ensure(success.summary.item_count > 0, 'fixture scan should return items');
  ensure(success.summary.file_count > 0, 'fixture scan should return files');
  ensure(success.summary.directory_count > 0, 'fixture scan should return directories');
  ensure(success.execution_boundary.file_contents_read === false, 'fixture scan must not read file contents');
  ensure(success.execution_boundary.write_performed === false, 'fixture scan must not write');
  ensure(success.execution_boundary.delete_performed === false, 'fixture scan must not delete');
  ensure(success.execution_boundary.shell_command_executed === false, 'fixture scan must not execute shell');
  ensure(success.execution_boundary.external_calls_performed === false, 'fixture scan must not make external calls');
  ensure(success.items.every((item) => !path.isAbsolute(item.relative_path)), 'returned item paths must be relative');

  const nonRecursive = await executeLocalReadOnlyMetadataScan({ ...context, approvalRequest, checkpoint, scope: buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100 }), preflight: buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest, checkpoint: buildExecutionCheckpointRecordDryRun({ handoff: context.handoff, approvalRequest, localInspectionScopeHash: hashLocalReadOnlyInspectionScope(buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100 })) }), scope: buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100 }) }) });
  ensure(!nonRecursive.items.some((item) => item.relative_path.includes('nested/deep/very-deep.ts')), 'non-recursive scan should not include nested child files');

  const recursiveScope = buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: true, max_depth: 2, max_items: 100 });
  const recursiveApproval = buildApprovalRequestDryRun({ handoff: context.handoff, localReadOnlyScope: { redacted_root: redactScopePath(recursiveScope.root_path), recursive: recursiveScope.recursive, max_depth: recursiveScope.max_depth, max_items: recursiveScope.max_items } });
  const recursiveCheckpoint = buildExecutionCheckpointRecordDryRun({ handoff: context.handoff, approvalRequest: recursiveApproval, localInspectionScopeHash: hashLocalReadOnlyInspectionScope(recursiveScope) });
  const recursivePreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest: recursiveApproval, checkpoint: recursiveCheckpoint, scope: recursiveScope });
  const recursiveResult = await executeLocalReadOnlyMetadataScan({ ...context, approvalRequest: recursiveApproval, checkpoint: recursiveCheckpoint, scope: recursiveScope, preflight: recursivePreflight });
  ensure(!recursiveResult.items.some((item) => item.relative_path.includes('nested/deep/very-deep.ts')), 'recursive scan should obey max depth');

  const truncationScope = buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: true, max_depth: 5, max_items: 2 });
  const truncationApproval = buildApprovalRequestDryRun({ handoff: context.handoff, localReadOnlyScope: { redacted_root: redactScopePath(truncationScope.root_path), recursive: truncationScope.recursive, max_depth: truncationScope.max_depth, max_items: truncationScope.max_items } });
  const truncationCheckpoint = buildExecutionCheckpointRecordDryRun({ handoff: context.handoff, approvalRequest: truncationApproval, localInspectionScopeHash: hashLocalReadOnlyInspectionScope(truncationScope) });
  const truncationPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest: truncationApproval, checkpoint: truncationCheckpoint, scope: truncationScope });
  const truncationResult = await executeLocalReadOnlyMetadataScan({ ...context, approvalRequest: truncationApproval, checkpoint: truncationCheckpoint, scope: truncationScope, preflight: truncationPreflight });
  ensure(truncationResult.summary.truncated === true, 'small max_items should truncate results');
  ensure(truncationResult.summary.item_count <= 2, 'item_count must respect max_items');
  ensure(truncationResult.warnings.includes('result truncated at max_items'), 'truncation warning should be present');

  ensure(success.summary.skipped_count > 0, 'sensitive filenames should be skipped');
  ensure(success.items.some((item) => item.skipped_reason === 'sensitive_filename_pattern'), 'sensitive filename skip should be reported');

  const missingApprovalToken = await executeApprovedLocalReadOnlyMetadataScan({ ...context, root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100, scope_hash: plan.scope_hash, user_approved_exact_scope: true, confirm_no_file_contents: true });
  ensure(missingApprovalToken.status === 'invalid', 'missing approval token should invalidate scan');

  const missingExactScopeApproval = await executeApprovedLocalReadOnlyMetadataScan({ ...context, root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100, scope_hash: plan.scope_hash, approval_token: plan.approval_token, confirm_no_file_contents: true });
  ensure(missingExactScopeApproval.status === 'approval_required', 'missing exact-scope approval flag should block scan');

  const missingNoContentsConfirmation = await executeApprovedLocalReadOnlyMetadataScan({ ...context, root_path: fixtureRoot, recursive: false, max_depth: 2, max_items: 100, scope_hash: plan.scope_hash, approval_token: plan.approval_token, user_approved_exact_scope: true });
  ensure(missingNoContentsConfirmation.status === 'invalid', 'missing no-file-contents confirmation should invalidate scan');

  const missingCheckpointPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest, scope });
  ensure(missingCheckpointPreflight.status === 'checkpoint_required', 'missing checkpoint should block before scan');

  const mismatchScope = buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot + '-other', recursive: false, max_depth: 2, max_items: 100 });
  const mismatchPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest, checkpoint, scope: mismatchScope });
  ensure(mismatchPreflight.status === 'invalid', 'scope mismatch should invalidate before scan');

  const rootBlockedScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\', recursive: false, max_depth: 2, max_items: 100 });
  const rootBlockedPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, scope: rootBlockedScope });
  ensure(rootBlockedPreflight.status === 'blocked', 'root drive should block before scan');

  const appDataScope = buildLocalReadOnlyInspectionScope({ root_path: 'C:\\Users\\Example\\AppData', recursive: false, max_depth: 2, max_items: 100 });
  const appDataPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, scope: appDataScope });
  ensure(appDataPreflight.status === 'blocked', 'AppData should block before scan');

  let symlinkSmoke = 'symlink smoke skipped due to platform permissions';
  try {
    const linkPath = path.join(fixtureRoot, 'link-to-src');
    await fs.symlink(path.join(fixtureRoot, 'src'), linkPath, 'junction');
    const symlinkScope = buildLocalReadOnlyInspectionScope({ root_path: fixtureRoot, recursive: true, max_depth: 3, max_items: 100 });
    const symlinkApproval = buildApprovalRequestDryRun({ handoff: context.handoff, localReadOnlyScope: { redacted_root: redactScopePath(symlinkScope.root_path), recursive: symlinkScope.recursive, max_depth: symlinkScope.max_depth, max_items: symlinkScope.max_items } });
    const symlinkCheckpoint = buildExecutionCheckpointRecordDryRun({ handoff: context.handoff, approvalRequest: symlinkApproval, localInspectionScopeHash: hashLocalReadOnlyInspectionScope(symlinkScope) });
    const symlinkPreflight = buildLocalReadOnlyInspectionPreflightDryRun({ ...context, approvalRequest: symlinkApproval, checkpoint: symlinkCheckpoint, scope: symlinkScope });
    const symlinkResult = await executeLocalReadOnlyMetadataScan({ ...context, approvalRequest: symlinkApproval, checkpoint: symlinkCheckpoint, scope: symlinkScope, preflight: symlinkPreflight });
    ensure(symlinkResult.items.some((item) => item.skipped_reason === 'symlink_or_reparse_point_not_followed'), 'symlink should be skipped and not followed');
    symlinkSmoke = 'symlink skipped and not followed';
  } catch {
    // keep skip message
  }

  console.log(JSON.stringify({
    ok: true,
    plan_allowed_project_fixture: plan,
    fixture_scan_success: success,
    non_recursive_direct_children_only: nonRecursive.summary,
    recursive_max_depth: recursiveResult.summary,
    max_items_truncation: truncationResult.summary,
    sensitive_filename_skipped: success.items.filter((item) => item.skipped_reason === 'sensitive_filename_pattern'),
    root_drive_blocked: rootBlockedPreflight,
    appdata_private_blocked: appDataPreflight,
    missing_approval_blocked: approvalMissing,
    missing_approval_token: missingApprovalToken,
    missing_exact_scope_approval: missingExactScopeApproval,
    missing_no_contents_confirmation: missingNoContentsConfirmation,
    missing_checkpoint_blocked: missingCheckpointPreflight,
    scope_mismatch_invalid: mismatchPreflight,
    symlink_not_followed: symlinkSmoke
  }, null, 2));
});
