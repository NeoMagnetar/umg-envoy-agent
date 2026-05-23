import type { ControlledActionReviewDecisionPacketRecordingHardBoundaries } from './controlled-action-review-decision-packet-recording-projection.js';

export interface ControlledActionReviewDecisionPacketRecordingAuditSummaryInput {
  summaryId: string;
  generatedAt?: string;
  sourceProjection: {
    projectionId: string;
    recordingPacketId: string;
    schemaVersion: string;
    reviewDecisionPacketRecordingProjectionOnly: true;
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
    sourceReviewDecisionPacket: {
      reviewDecisionPacketId: string;
      reviewDecisionPacketSchemaId: string;
      reviewDecisionPacketProjectionId: string;
    };
    sourceProjection: {
      projectionId: string;
      packetId: string;
    };
    recordingRequestSummary: {
      recordingRequestId: string;
      requestedRecordingAction: string;
      requestedBy: string;
      requestedAt?: string;
    };
    recordingResultSummary: {
      recordingResultId: string;
      recordingState: string;
      recordingAccepted: boolean;
    };
    recordingVocabularySummary: {
      allowedRecordingStateCount: number;
      allowedRecordingActionCount: number;
      blockedRecordingActionCount: number;
      allowedRecordingStates: string[];
      allowedRecordingActions: string[];
      blockedRecordingActions: string[];
    };
    evidenceSummary: {
      totalEvidenceItems: number;
      requiredEvidenceItems: number;
      presentEvidenceItems: number;
      missingEvidenceItems: number;
    };
    policySummary: {
      idempotencyRequired: boolean;
      sideEffectsAllowed: false;
      supersessionMetadataOnly: boolean;
      revocationMetadataOnly: boolean;
      expirationMetadataOnly: boolean;
      auditTrailRequired: boolean;
      retentionMetadataOnly: boolean;
    };
    hardBoundaries: ControlledActionReviewDecisionPacketRecordingAuditSummaryHardBoundaries;
    projectionNotes: string[];
  };
}

export interface ControlledActionReviewDecisionPacketRecordingAuditSummaryHardBoundaries extends ControlledActionReviewDecisionPacketRecordingHardBoundaries {}

export interface ControlledActionReviewDecisionPacketRecordingAuditFinding {
  findingId: string;
  severity: 'info' | 'notice' | 'warning' | 'critical';
  category: 'recording_state' | 'recording_action' | 'missing_evidence' | 'blocked_recording_action' | 'policy' | 'hard_boundary' | 'metadata_only' | 'lifecycle' | 'retention';
  message: string;
}

export interface ControlledActionReviewDecisionPacketRecordingAuditSummary {
  summaryId: string;
  generatedAt?: string;
  recordingAuditSummaryOnly: true;
  sourceProjection: {
    projectionId: string;
    recordingPacketId: string;
    schemaVersion: string;
  };
  sourceReviewDecisionPacket: {
    reviewDecisionPacketId: string;
    reviewDecisionPacketSchemaId: string;
    reviewDecisionPacketProjectionId: string;
  };
  recordingRequestSummary: {
    recordingRequestId: string;
    requestedRecordingAction: string;
    requestedBy: string;
    requestedAt?: string;
  };
  recordingResultSummary: {
    recordingResultId: string;
    recordingState: string;
    recordingAccepted: boolean;
    recordingStatus:
      | 'design_only'
      | 'not_started'
      | 'requested_metadata_only'
      | 'validated_metadata_only'
      | 'rejected_invalid_metadata_only'
      | 'rejected_missing_evidence_metadata_only'
      | 'recorded_metadata_only_future_lane'
      | 'superseded_metadata_only'
      | 'revoked_metadata_only'
      | 'expired_metadata_only'
      | 'unknown_metadata_only';
  };
  evidenceAudit: {
    totalEvidenceItems: number;
    requiredEvidenceItems: number;
    presentEvidenceItems: number;
    missingEvidenceItems: number;
    evidenceComplete: boolean;
    missingEvidenceRatio: number;
  };
  recordingVocabularyAudit: {
    allowedRecordingStateCount: number;
    allowedRecordingActionCount: number;
    blockedRecordingActionCount: number;
    blockedRecordingActions: string[];
    highRiskBlockedActionsPresent: boolean;
  };
  policyAudit: {
    idempotencyRequired: boolean;
    sideEffectsAllowed: false;
    lifecycleMetadataOnly: boolean;
    auditTrailRequired: boolean;
    retentionMetadataOnly: boolean;
  };
  boundaryAudit: {
    hardBoundaryCount: number;
    recordingBoundaryIntact: boolean;
    approvalBoundaryIntact: boolean;
    executionBoundaryIntact: boolean;
    transmissionBoundaryIntact: boolean;
    bridgeBoundaryIntact: boolean;
    directSourceBoundaryIntact: boolean;
    automaticTakeoverBoundaryIntact: boolean;
  };
  auditFindings: ControlledActionReviewDecisionPacketRecordingAuditFinding[];
  hardBoundaries: ControlledActionReviewDecisionPacketRecordingAuditSummaryHardBoundaries;
  recordingImplemented: false;
  recordingPerformed: false;
  liveDecisionRecorded: false;
  reviewDecisionRecorded: false;
  approvalGranted: false;
  executionPerformed: false;
}

function mapState(state: string): ControlledActionReviewDecisionPacketRecordingAuditSummary['recordingResultSummary']['recordingStatus'] {
  switch (state) {
    case 'recording_design_only': return 'design_only';
    case 'recording_not_started': return 'not_started';
    case 'recording_requested_metadata_only': return 'requested_metadata_only';
    case 'recording_validated_metadata_only': return 'validated_metadata_only';
    case 'recording_rejected_invalid': return 'rejected_invalid_metadata_only';
    case 'recording_rejected_missing_evidence': return 'rejected_missing_evidence_metadata_only';
    case 'recording_recorded_metadata_only_future_lane': return 'recorded_metadata_only_future_lane';
    case 'recording_superseded_metadata_only': return 'superseded_metadata_only';
    case 'recording_revoked_metadata_only': return 'revoked_metadata_only';
    case 'recording_expired_metadata_only': return 'expired_metadata_only';
    default: return 'unknown_metadata_only';
  }
}

export function projectControlledActionReviewDecisionPacketRecordingAuditSummary(
  input: ControlledActionReviewDecisionPacketRecordingAuditSummaryInput,
): ControlledActionReviewDecisionPacketRecordingAuditSummary {
  const p = input.sourceProjection;
  const required = p.evidenceSummary.requiredEvidenceItems;
  const missing = p.evidenceSummary.missingEvidenceItems;
  const evidenceComplete = required > 0 && missing === 0;
  const missingEvidenceRatio = required === 0 ? 0 : missing / required;
  const blocked = p.recordingVocabularySummary.blockedRecordingActions;
  const highRiskBlockedActionsPresent = blocked.some((action) => [
    'execute_action','grant_approval','authorize_write_action','authorize_bridge_action','enable_direct_source','enable_automatic_response_takeover','publish_package','restart_openclaw','mutate_block_library','touch_resleever'
  ].includes(action));

  const boundaryAudit = {
    hardBoundaryCount: Object.keys(p.hardBoundaries).length,
    recordingBoundaryIntact: p.hardBoundaries.recordingImplemented === false && p.hardBoundaries.recordingPerformed === false && p.hardBoundaries.liveDecisionRecorded === false,
    approvalBoundaryIntact: p.hardBoundaries.approvalGranted === false,
    executionBoundaryIntact: p.hardBoundaries.executionPerformed === false,
    transmissionBoundaryIntact: p.hardBoundaries.externalTransmissionPerformed === false && p.hardBoundaries.fileWritten === false && p.hardBoundaries.packagePublished === false,
    bridgeBoundaryIntact: p.hardBoundaries.bridgeActionPerformed === false,
    directSourceBoundaryIntact: p.hardBoundaries.directSourceEnabled === false,
    automaticTakeoverBoundaryIntact: p.hardBoundaries.automaticResponseTakeoverEnabled === false,
  };

  const auditFindings: ControlledActionReviewDecisionPacketRecordingAuditFinding[] = [
    {
      findingId: `${input.summaryId}.state`,
      severity: p.recordingResultSummary.recordingState.includes('rejected') ? 'warning' : 'info',
      category: 'recording_state',
      message: `Recording state ${p.recordingResultSummary.recordingState} remains metadata only.`,
    },
    {
      findingId: `${input.summaryId}.action`,
      severity: 'info',
      category: 'recording_action',
      message: `Requested recording action ${p.recordingRequestSummary.requestedRecordingAction} remains metadata only.`,
    },
    {
      findingId: `${input.summaryId}.policy`,
      severity: 'notice',
      category: 'policy',
      message: 'Policy summary confirms sideEffectsAllowed=false.',
    },
    {
      findingId: `${input.summaryId}.lifecycle`,
      severity: 'info',
      category: 'lifecycle',
      message: 'Lifecycle policies remain metadata-only.',
    },
    {
      findingId: `${input.summaryId}.retention`,
      severity: 'info',
      category: 'retention',
      message: 'Retention policy remains metadata-only.',
    },
    {
      findingId: `${input.summaryId}.boundary`,
      severity: boundaryAudit.recordingBoundaryIntact && boundaryAudit.approvalBoundaryIntact && boundaryAudit.executionBoundaryIntact ? 'info' : 'critical',
      category: 'hard_boundary',
      message: 'Hard boundaries remain intact and non-executing.',
    },
  ];

  if (!evidenceComplete) {
    auditFindings.push({
      findingId: `${input.summaryId}.missing-evidence`,
      severity: 'warning',
      category: 'missing_evidence',
      message: `Missing evidence items: ${missing}.`,
    });
  }
  if (blocked.length > 0) {
    auditFindings.push({
      findingId: `${input.summaryId}.blocked-actions`,
      severity: highRiskBlockedActionsPresent ? 'notice' : 'info',
      category: 'blocked_recording_action',
      message: `Blocked recording actions summarized: ${blocked.join(', ')}.`,
    });
  }

  return {
    summaryId: input.summaryId,
    generatedAt: input.generatedAt,
    recordingAuditSummaryOnly: true,
    sourceProjection: {
      projectionId: p.projectionId,
      recordingPacketId: p.recordingPacketId,
      schemaVersion: p.schemaVersion,
    },
    sourceReviewDecisionPacket: p.sourceReviewDecisionPacket,
    recordingRequestSummary: p.recordingRequestSummary,
    recordingResultSummary: {
      recordingResultId: p.recordingResultSummary.recordingResultId,
      recordingState: p.recordingResultSummary.recordingState,
      recordingAccepted: p.recordingResultSummary.recordingAccepted,
      recordingStatus: mapState(p.recordingResultSummary.recordingState),
    },
    evidenceAudit: {
      totalEvidenceItems: p.evidenceSummary.totalEvidenceItems,
      requiredEvidenceItems: p.evidenceSummary.requiredEvidenceItems,
      presentEvidenceItems: p.evidenceSummary.presentEvidenceItems,
      missingEvidenceItems: p.evidenceSummary.missingEvidenceItems,
      evidenceComplete,
      missingEvidenceRatio,
    },
    recordingVocabularyAudit: {
      allowedRecordingStateCount: p.recordingVocabularySummary.allowedRecordingStateCount,
      allowedRecordingActionCount: p.recordingVocabularySummary.allowedRecordingActionCount,
      blockedRecordingActionCount: p.recordingVocabularySummary.blockedRecordingActionCount,
      blockedRecordingActions: blocked,
      highRiskBlockedActionsPresent,
    },
    policyAudit: {
      idempotencyRequired: p.policySummary.idempotencyRequired,
      sideEffectsAllowed: false,
      lifecycleMetadataOnly: p.policySummary.supersessionMetadataOnly && p.policySummary.revocationMetadataOnly && p.policySummary.expirationMetadataOnly,
      auditTrailRequired: p.policySummary.auditTrailRequired,
      retentionMetadataOnly: p.policySummary.retentionMetadataOnly,
    },
    boundaryAudit,
    auditFindings,
    hardBoundaries: p.hardBoundaries,
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
  };
}
