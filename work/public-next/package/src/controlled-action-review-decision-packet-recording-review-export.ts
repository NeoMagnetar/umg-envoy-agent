export interface ControlledActionReviewDecisionPacketRecordingReviewExportFindingInput {
  findingId: string;
  severity: 'info' | 'notice' | 'warning' | 'critical';
  category: 'recording_state' | 'recording_action' | 'missing_evidence' | 'blocked_recording_action' | 'policy' | 'hard_boundary' | 'metadata_only' | 'lifecycle' | 'retention';
  message: string;
}

export interface ControlledActionReviewDecisionPacketRecordingReviewExportInput {
  exportId: string;
  generatedAt?: string;
  exportFormat: 'review_json' | 'handoff_json' | 'debug_json' | 'compliance_json';
  exportProfile: 'internal_review' | 'agent_handoff' | 'debug_review' | 'compliance_review';
  sourceSummary: {
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
      recordingStatus: string;
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
    auditFindings: ControlledActionReviewDecisionPacketRecordingReviewExportFindingInput[];
    recordingImplemented: false;
    recordingPerformed: false;
    liveDecisionRecorded: false;
    reviewDecisionRecorded: false;
    approvalGranted: false;
    executionPerformed: false;
  };
  redactionPolicy?: {
    redactSummaryId?: boolean;
    redactRecordingPacketId?: boolean;
    redactReviewDecisionPacketId?: boolean;
    redactRequestedBy?: boolean;
    redactTimestamps?: boolean;
    includeAuditFindings?: boolean;
    includeBlockedRecordingActions?: boolean;
    includeEvidenceCounts?: boolean;
    includePolicyAudit?: boolean;
    includeBoundaryAudit?: boolean;
  };
  exportNotes?: string[];
}

export interface ControlledActionReviewDecisionPacketRecordingReviewExportFinding {
  findingId: string;
  severity: 'info' | 'notice' | 'warning' | 'critical';
  category: string;
  message: string;
}

export interface ControlledActionReviewDecisionPacketRecordingReviewExport {
  exportId: string;
  generatedAt?: string;
  exportFormat: string;
  exportProfile: string;
  recordingReviewExportOnly: true;
  recordingAuditSummaryExported: true;
  fileWritten: false;
  externalTransmissionPerformed: false;
  packagePublished: false;
  recordingImplemented: false;
  recordingPerformed: false;
  liveDecisionRecorded: false;
  reviewDecisionRecorded: false;
  approvalGranted: false;
  executionPerformed: false;
  sourceSummary: {
    summaryId: string;
    generatedAt?: string;
  };
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
    recordingStatus: string;
  };
  reviewExportSummary: {
    evidenceComplete: boolean;
    totalEvidenceItems: number;
    requiredEvidenceItems: number;
    presentEvidenceItems: number;
    missingEvidenceItems: number;
    missingEvidenceRatio: number;
    auditFindingCount: number;
    criticalFindingCount: number;
    warningFindingCount: number;
    blockedRecordingActionCount: number;
    highRiskBlockedActionsPresent: boolean;
  };
  reviewFocus: string[];
  exportedAuditFindings: ControlledActionReviewDecisionPacketRecordingReviewExportFinding[];
  redactionApplied: boolean;
  redactionPolicy: {
    redactSummaryId: boolean;
    redactRecordingPacketId: boolean;
    redactReviewDecisionPacketId: boolean;
    redactRequestedBy: boolean;
    redactTimestamps: boolean;
    includeAuditFindings: boolean;
    includeBlockedRecordingActions: boolean;
    includeEvidenceCounts: boolean;
    includePolicyAudit: boolean;
    includeBoundaryAudit: boolean;
  };
  blockedRecordingActions: string[];
  policyAudit?: {
    idempotencyRequired: boolean;
    sideEffectsAllowed: false;
    lifecycleMetadataOnly: boolean;
    auditTrailRequired: boolean;
    retentionMetadataOnly: boolean;
  };
  boundaryAudit?: {
    hardBoundaryCount: number;
    recordingBoundaryIntact: boolean;
    approvalBoundaryIntact: boolean;
    executionBoundaryIntact: boolean;
    transmissionBoundaryIntact: boolean;
    bridgeBoundaryIntact: boolean;
    directSourceBoundaryIntact: boolean;
    automaticTakeoverBoundaryIntact: boolean;
  };
  hardBoundaries: {
    recordingReviewExportDoesNotEqualRecording: true;
    recordingReviewExportDoesNotEqualApproval: true;
    recordingReviewExportDoesNotEqualExecution: true;
    recordingAuditSummaryDoesNotEqualRecording: true;
    recordingDoesNotEqualApproval: true;
    recordingDoesNotEqualExecution: true;
  };
  exportNotes: string[];
}

export function projectControlledActionReviewDecisionPacketRecordingReviewExport(
  input: ControlledActionReviewDecisionPacketRecordingReviewExportInput,
): ControlledActionReviewDecisionPacketRecordingReviewExport {
  const p = {
    redactSummaryId: false,
    redactRecordingPacketId: false,
    redactReviewDecisionPacketId: false,
    redactRequestedBy: false,
    redactTimestamps: false,
    includeAuditFindings: true,
    includeBlockedRecordingActions: true,
    includeEvidenceCounts: true,
    includePolicyAudit: true,
    includeBoundaryAudit: true,
    ...input.redactionPolicy,
  };
  const s = input.sourceSummary;
  const redactionApplied = p.redactSummaryId || p.redactRecordingPacketId || p.redactReviewDecisionPacketId || p.redactRequestedBy || p.redactTimestamps;
  const reviewFocus: string[] = [];
  if (!s.evidenceAudit.evidenceComplete) reviewFocus.push('Review missing evidence before any future metadata recording lane.');
  if (s.recordingVocabularyAudit.highRiskBlockedActionsPresent) reviewFocus.push('Confirm high-risk blocked recording actions remain blocked.');
  const criticalFindingCount = s.auditFindings.filter((f) => f.severity === 'critical').length;
  const warningFindingCount = s.auditFindings.filter((f) => f.severity === 'warning').length;
  if (criticalFindingCount > 0) reviewFocus.push('Review critical audit findings.');
  if (warningFindingCount > 0) reviewFocus.push('Review warning audit findings.');
  reviewFocus.push('Confirm recording/approval/execution boundaries remain intact.');

  return {
    exportId: input.exportId,
    generatedAt: p.redactTimestamps ? 'REDACTED_TIMESTAMP' : input.generatedAt,
    exportFormat: input.exportFormat,
    exportProfile: input.exportProfile,
    recordingReviewExportOnly: true,
    recordingAuditSummaryExported: true,
    fileWritten: false,
    externalTransmissionPerformed: false,
    packagePublished: false,
    recordingImplemented: false,
    recordingPerformed: false,
    liveDecisionRecorded: false,
    reviewDecisionRecorded: false,
    approvalGranted: false,
    executionPerformed: false,
    sourceSummary: {
      summaryId: p.redactSummaryId ? 'REDACTED_SUMMARY' : s.summaryId,
      generatedAt: p.redactTimestamps ? 'REDACTED_TIMESTAMP' : s.generatedAt,
    },
    sourceProjection: {
      projectionId: s.sourceProjection.projectionId,
      recordingPacketId: p.redactRecordingPacketId ? 'REDACTED_RECORDING_PACKET' : s.sourceProjection.recordingPacketId,
      schemaVersion: s.sourceProjection.schemaVersion,
    },
    sourceReviewDecisionPacket: {
      reviewDecisionPacketId: p.redactReviewDecisionPacketId ? 'REDACTED_REVIEW_DECISION_PACKET' : s.sourceReviewDecisionPacket.reviewDecisionPacketId,
      reviewDecisionPacketSchemaId: s.sourceReviewDecisionPacket.reviewDecisionPacketSchemaId,
      reviewDecisionPacketProjectionId: s.sourceReviewDecisionPacket.reviewDecisionPacketProjectionId,
    },
    recordingRequestSummary: {
      recordingRequestId: s.recordingRequestSummary.recordingRequestId,
      requestedRecordingAction: s.recordingRequestSummary.requestedRecordingAction,
      requestedBy: p.redactRequestedBy ? 'REDACTED_REQUESTER' : s.recordingRequestSummary.requestedBy,
      requestedAt: p.redactTimestamps ? 'REDACTED_TIMESTAMP' : s.recordingRequestSummary.requestedAt,
    },
    recordingResultSummary: s.recordingResultSummary,
    reviewExportSummary: {
      evidenceComplete: s.evidenceAudit.evidenceComplete,
      totalEvidenceItems: p.includeEvidenceCounts ? s.evidenceAudit.totalEvidenceItems : 0,
      requiredEvidenceItems: p.includeEvidenceCounts ? s.evidenceAudit.requiredEvidenceItems : 0,
      presentEvidenceItems: p.includeEvidenceCounts ? s.evidenceAudit.presentEvidenceItems : 0,
      missingEvidenceItems: p.includeEvidenceCounts ? s.evidenceAudit.missingEvidenceItems : 0,
      missingEvidenceRatio: p.includeEvidenceCounts ? s.evidenceAudit.missingEvidenceRatio : 0,
      auditFindingCount: p.includeAuditFindings ? s.auditFindings.length : 0,
      criticalFindingCount,
      warningFindingCount,
      blockedRecordingActionCount: p.includeBlockedRecordingActions ? s.recordingVocabularyAudit.blockedRecordingActionCount : 0,
      highRiskBlockedActionsPresent: s.recordingVocabularyAudit.highRiskBlockedActionsPresent,
    },
    reviewFocus,
    exportedAuditFindings: p.includeAuditFindings ? s.auditFindings : [],
    redactionApplied,
    redactionPolicy: p,
    blockedRecordingActions: p.includeBlockedRecordingActions ? s.recordingVocabularyAudit.blockedRecordingActions : [],
    policyAudit: p.includePolicyAudit ? s.policyAudit : undefined,
    boundaryAudit: p.includeBoundaryAudit ? s.boundaryAudit : undefined,
    hardBoundaries: {
      recordingReviewExportDoesNotEqualRecording: true,
      recordingReviewExportDoesNotEqualApproval: true,
      recordingReviewExportDoesNotEqualExecution: true,
      recordingAuditSummaryDoesNotEqualRecording: true,
      recordingDoesNotEqualApproval: true,
      recordingDoesNotEqualExecution: true,
    },
    exportNotes: input.exportNotes ?? [],
  };
}
