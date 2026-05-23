import { simulateApprovalDecision } from '../dist/action-gate-approval-decision-simulation.js';

const approve = simulateApprovalDecision('approve');
const deny = simulateApprovalDecision('deny');
const dryRunOnly = simulateApprovalDecision('dry_run_only');

if (approve.decisionAccepted !== true) throw new Error('approve decision not accepted');
if (approve.resultingCheckpointState !== 'execution_eligible') throw new Error('approve checkpoint state drift');
if (approve.executionEligibilityProjection.executionEligible !== true) throw new Error('approve executionEligible drift');
if (approve.executionPerformed !== false) throw new Error('approve executionPerformed drift');
if (approve.decisionSimulationOnly !== true) throw new Error('approve decisionSimulationOnly drift');

if (deny.resultingCheckpointState !== 'denied') throw new Error('deny checkpoint state drift');
if (deny.executionEligibilityProjection.executionBlocked !== true) throw new Error('deny executionBlocked drift');
if (deny.executionPerformed !== false) throw new Error('deny executionPerformed drift');

if (dryRunOnly.resultingCheckpointState !== 'preview_required') throw new Error('dry_run_only checkpoint state drift');
if (dryRunOnly.previewStillRequired !== true) throw new Error('dry_run_only previewStillRequired drift');
if (dryRunOnly.executionPerformed !== false) throw new Error('dry_run_only executionPerformed drift');

console.log(JSON.stringify({
  ok: true,
  approve,
  deny,
  dryRunOnly
}, null, 2));
