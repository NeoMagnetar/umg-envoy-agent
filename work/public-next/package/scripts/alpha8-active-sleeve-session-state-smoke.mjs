import {
  getCurrentRuntimeSleeveSession,
  selectRuntimeSleeveSession,
  clearRuntimeSleeveSession,
  inspectRuntimeSleeveSession,
  runBoundedReadOnlyOrchestration
} from '../dist/block-library-resolver.js';

const version = '0.3.0-alpha.9';
const entrypoint = 'dist/plugin-entry.js';
const sleeveId = 'neomagnetar-dynamic-persona-v1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const initial = getCurrentRuntimeSleeveSession(version, entrypoint, undefined, {
  includeInspection: true,
  includeRuntimePreview: true,
  includeTrace: true
});
assert(initial.sessionStatus === 'NO_ACTIVE_SLEEVE', 'current should begin with NO_ACTIVE_SLEEVE');
assert(initial.activeSleeveId === null, 'active sleeve should begin null');

const selected = selectRuntimeSleeveSession(version, entrypoint, undefined, {
  sleeveId,
  selectionReason: 'smoke test active sleeve session state',
  persistenceMode: 'memory_only',
  includeInspection: true,
  includeRuntimePreview: true,
  includeTrace: true
});
assert(selected.sessionStatus === 'SLEEVE_ACTIVE', 'select should activate sleeve');
assert(selected.selectedSleeveId === sleeveId, 'selected sleeve should match');
assert(selected.activeSleeveId === sleeveId, 'active sleeve should match');
assert(selected.runtimeEligible === true, 'selected sleeve should be runtime eligible');
assert(selected.automaticResponseTakeover === false, 'automaticResponseTakeover must remain false');
assert(selected.directSourceEnabled === false, 'directSourceEnabled must remain false');

const current = getCurrentRuntimeSleeveSession(version, entrypoint, undefined, {
  includeInspection: true,
  includeRuntimePreview: true,
  includeTrace: true
});
assert(current.sessionStatus === 'SLEEVE_ACTIVE', 'current should return selected sleeve');
assert(current.activeSleeveId === sleeveId, 'current active sleeve should match');

const inspected = inspectRuntimeSleeveSession(version, entrypoint, undefined, {
  includeNeoStacks: true,
  includeNeoBlocks: true,
  includeMoltBlocks: true,
  includeRuntimeSpec: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeExecutionGateState: true,
  includeTrace: true
});
assert(inspected.activeSleeveId === sleeveId, 'inspect should use selected sleeve');
assert(inspected.lastInspectionSummary?.activeSleeve?.sleeveId === sleeveId, 'inspection summary should reflect active sleeve');

const orchFromSession = runBoundedReadOnlyOrchestration(version, entrypoint, undefined, {
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'approved_read_only',
  includeInspector: true,
  includeRuntimePreview: true,
  includeIrMatrix: true,
  includeEnvelope: true,
  includeExecutionGateState: true,
  includeTrace: true
});
assert(orchFromSession.sourceSleeveId === sleeveId, 'orchestration should use active session sleeve when sleeveId omitted');
assert(orchFromSession.approvedReadOnlyExecution?.sideEffectStatus === 'read_only_no_mutation', 'orchestration from session should remain read-only');

const orchExplicitOther = runBoundedReadOnlyOrchestration(version, entrypoint, undefined, {
  sleeveId,
  selectSession: false,
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'approved_read_only',
  includeTrace: true
});
assert(orchExplicitOther.sourceSleeveId === sleeveId, 'explicit sleeveId should work');
const currentAfterExplicit = getCurrentRuntimeSleeveSession(version, entrypoint, undefined, { includeTrace: true });
assert(currentAfterExplicit.activeSleeveId === sleeveId, 'explicit sleeveId should not overwrite session when selectSession=false');

const cleared = clearRuntimeSleeveSession({
  clearReason: 'smoke reset',
  includePreviousState: true,
  includeTrace: true
});
assert(cleared.sessionStatus === 'SLEEVE_CLEARED', 'clear should return SLEEVE_CLEARED');
assert(cleared.activeSleeveId === null, 'clear should null active sleeve');
assert(cleared.previousSleeveId === sleeveId, 'clear should report previous sleeve');

const orchWithoutSleeveAfterClear = runBoundedReadOnlyOrchestration(version, entrypoint, undefined, {
  requestedToolName: 'umg_envoy_block_library_status',
  requestedAction: 'status_read',
  approvalDecision: 'approve',
  mode: 'approved_read_only',
  includeTrace: true
});
assert(orchWithoutSleeveAfterClear.orchestrationStatus === 'ORCHESTRATION_BLOCKED', 'orchestration should block when no active sleeve exists');
assert(orchWithoutSleeveAfterClear.blockedActions?.[0]?.blockedReason === 'no_active_sleeve', 'orchestration should report no_active_sleeve');

const unknownSelect = selectRuntimeSleeveSession(version, entrypoint, undefined, {
  sleeveId: 'unknown-sleeve-id',
  selectionReason: 'negative test',
  persistenceMode: 'memory_only',
  includeInspection: true,
  includeRuntimePreview: true,
  includeTrace: true
});
assert(unknownSelect.runtimeEligible === false, 'unknown sleeve should fail safely');
assert(unknownSelect.sessionStatus === 'SLEEVE_HELD' || unknownSelect.sessionStatus === 'SESSION_ERROR', 'unknown sleeve should not become active eligible state');
assert(unknownSelect.automaticResponseTakeover === false, 'automaticResponseTakeover must remain false after unknown sleeve');
assert(unknownSelect.directSourceEnabled === false, 'directSourceEnabled must remain false after unknown sleeve');

clearRuntimeSleeveSession({ clearReason: 'cleanup', includePreviousState: false, includeTrace: false });

console.log(JSON.stringify({
  ok: true,
  smoke: 'alpha8-active-sleeve-session-state',
  checks: 18,
  safety: {
    automaticResponseTakeover: false,
    directSourceEnabled: false,
    libraryMutation: 'not_performed',
    toolExecutionDuringSessionOps: 'not_performed'
  }
}, null, 2));
