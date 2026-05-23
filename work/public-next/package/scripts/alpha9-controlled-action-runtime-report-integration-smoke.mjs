import assert from 'node:assert/strict';
import {
  projectControlledActionRuntimeReport,
} from '../dist/controlled-action-runtime-report-integration.js';

function makeInput(overrides = {}) {
  return {
    reportId: 'runtime-report-1',
    generatedAt: '2026-05-23T20:00:00Z',
    runtimeContext: {
      packageVersion: '0.3.0-alpha.12',
      branch: 'alpha7/from-public-synced-alpha6',
      baselineCommit: '9b1b83b1be9b4df922d2b3e3775eccf982805b2d',
      activeSleeveId: 'umg-runtime-inspector-native-v1',
      activeNeoStackIds: ['stack.policy', 'stack.audit'],
      activeRouteId: 'desktop_write_candidate',
      mode: 'read_only_report',
    },
    route: {
      routeId: 'desktop_write_candidate',
      routeClass: 'bridge_action_candidate',
      riskLevel: 'high',
      routeStatus: 'blocked',
    },
    policy: {
      policyPresent: true,
      requiredGates: ['approval_flow', 'dry_run', 'audit'],
      policyStatus: 'present',
    },
    readiness: {
      readinessStatus: 'blocked_pending_evidence',
      executionEligibility: 'blocked',
      satisfiedRequirements: ['policy_projection_visible', 'audit_packet_visible'],
      missingRequirements: ['live_execution_unavailable', 'approval_not_granted'],
    },
    blocked: {
      blockedReasons: ['bridge actions disabled in this build', 'approval not granted'],
      blockedCapabilityIds: ['bridge_actions', 'execute_action'],
    },
    evidence: {
      auditPacketPresent: true,
      auditExportPresent: true,
      reviewBundlePresent: true,
      recordingMetadataPresent: true,
      phaseHandoffReportPresent: true,
      evidenceComplete: false,
      missingEvidenceItems: 2,
    },
    review: {
      reviewDecisionPacketPresent: true,
      reviewDecisionProjectionPresent: true,
      reviewDecisionRecorded: false,
      approvalGranted: false,
    },
    recording: {
      recordingImplemented: false,
      recordingPerformed: false,
      liveDecisionRecorded: false,
      recordingStatus: 'metadata_only',
    },
    boundaries: {
      directSourceEnabled: false,
      automaticResponseTakeoverEnabled: false,
      fileWritten: false,
      externalTransmissionPerformed: false,
      packagePublished: false,
      openClawRestarted: false,
      executionPerformed: false,
    },
    validation: {
      buildPassed: true,
      validateAlphaCurrentPassed: true,
      smokeChainPassed: true,
    },
    recommendedNextLane: 'ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_TOOL_SURFACE_DESIGN_SOURCE',
    ...overrides,
  };
}

const report = projectControlledActionRuntimeReport(makeInput());

assert.equal(report.runtimeReportOnly, true);
assert.equal(report.runtimeReportDoesNotEqualExecution, true);
assert.equal(report.executionPerformed, false);
assert.equal(report.approvalGranted, false);
assert.equal(report.recordingPerformed, false);
assert.equal(report.liveDecisionRecorded, false);
assert.ok(report.asciiReport.includes('UMG ENVOY RUNTIME REPORT'));
assert.ok(report.asciiReport.includes('Execution: FALSE'));
assert.ok(report.asciiReport.includes('ACTIVE ROUTE'));
assert.ok(report.asciiReport.includes('SAFETY EVIDENCE CHAIN'));
assert.ok(report.asciiReport.includes('BLOCKED CAPABILITIES'));

for (const navId of [
  'overview',
  'active_route',
  'safety_evidence_chain',
  'blocked_capabilities',
  'readiness',
  'audit_and_review',
  'recording_metadata',
  'hard_boundaries',
  'next_safe_step',
]) {
  assert.ok(report.navigation.some((item) => item.id === navId), `missing nav item: ${navId}`);
}

for (const blockedId of [
  'execute_action',
  'write_actions',
  'bridge_actions',
  'direct_source',
  'automatic_response_takeover',
  'package_publish',
  'openclaw_restart',
  'block_library_mutation',
  'resleever_touch',
]) {
  assert.ok(report.panels.blockedCapabilities.rows.some((row) => row.label === blockedId), `missing blocked capability: ${blockedId}`);
}

for (const evidenceLabel of [
  'policy projection',
  'dry-run projection',
  'blocked route summary',
  'readiness matrix',
  'audit packet',
  'review bundle',
  'recording metadata',
  'phase handoff report',
]) {
  assert.ok(report.panels.safetyEvidenceChain.rows.some((row) => row.label === evidenceLabel), `missing evidence row: ${evidenceLabel}`);
}

const missingEvidenceReport = projectControlledActionRuntimeReport(makeInput({
  evidence: {
    auditPacketPresent: true,
    auditExportPresent: false,
    reviewBundlePresent: true,
    recordingMetadataPresent: true,
    phaseHandoffReportPresent: true,
    evidenceComplete: false,
    missingEvidenceItems: 3,
  },
}));
assert.ok(missingEvidenceReport.panels.readiness.rows.some((row) => row.marker === 'warning'));
assert.ok(missingEvidenceReport.asciiReport.includes('WHY BLOCKED / MISSING'));

assert.equal(report.hardBoundaries.policyDoesNotEqualExecution, true);
assert.equal(report.hardBoundaries.approvalDoesNotEqualExecution, true);
assert.equal(report.hardBoundaries.recordingDoesNotEqualExecution, true);
assert.equal(report.hardBoundaries.runtimeReportDoesNotEqualExecution, true);
assert.equal(report.fileWritten, false);
assert.equal(report.externalTransmissionPerformed, false);
assert.equal(report.packagePublished, false);

const forbiddenCorpus = `${JSON.stringify(report)}\n${report.asciiReport}`;
for (const forbidden of [
  'ready_to_execute',
  'can_execute',
  'approved_for_execution',
  'execution_allowed',
  'approval_granted',
  'grant_execution',
  'authorize_execution',
  'recorded_live',
  'write_allowed',
  'bridge_allowed',
]) {
  assert.equal(forbiddenCorpus.includes(forbidden), false, `forbidden term present: ${forbidden}`);
}

console.log('alpha9 controlled action runtime report integration smoke: PASS');
