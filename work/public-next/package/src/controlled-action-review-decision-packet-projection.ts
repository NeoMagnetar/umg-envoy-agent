export interface ControlledActionReviewDecisionPacketProjectionInput {
  packetId: string;
  packetType: 'controlled_action_review_decision_packet';
  schemaVersion: string;
  status: 'schema_validated' | 'example' | 'runtime_projection_input' | 'invalid';
  createdAt?: string;
  sourceReviewBundle: {
    reviewBundleId: string;
    sourceExportId: string;
    sourcePacketId: string;
    reviewBundleDoesNotEqualApproval: true;
    reviewBundleDoesNotEqualExecution: true;
  };
  decisionRequest: {
    decisionRequestId: string;
    reviewBundleId: string;
    requestedBy: string;
    requestedAt?: string;
    targetRoutes: ControlledActionReviewDecisionPacketProjectionTargetRoute[];
    executionPerformed: false;
    approvalGranted: false;
  };
  decisionResult: {
    decisionResultId: string;
    decisionRequestId: string;
    resultState:
      | 'review_decision_recorded_metadata_only'
      | 'review_decision_denied'
      | 'review_decision_needs_more_evidence'
      | 'review_decision_incomplete'
      | 'review_decision_dry_run_only'
      | 'review_decision_future_execution_review_only'
      | 'review_decision_revoked'
      | 'review_decision_superseded'
      | 'review_decision_expired'
      | 'review_decision_rejected_invalid';
    routeDecisionResults: ControlledActionReviewDecisionPacketProjectionRouteDecisionResult[];
    approvalGranted: false;
    executionPerformed: false;
  };
  evidenceRequirements: Record<string, ControlledActionReviewDecisionPacketEvidenceRequirement>;
  hardBoundaries: ControlledActionReviewDecisionPacketProjectionHardBoundaries;
  blockedDecisionCategories: ControlledActionReviewDecisionPacketBlockedDecisionCategory[];
  executionPerformed: false;
  approvalGranted: false;
  reviewDecisionRecorded: boolean;
  reviewDecisionPacketDoesNotEqualApproval: true;
  reviewDecisionPacketDoesNotEqualExecution: true;
}

export interface ControlledActionReviewDecisionPacketProjectionTargetRoute {
  routeId: string;
  requestedDecision:
    | 'deny'
    | 'request_more_evidence'
    | 'mark_incomplete'
    | 'approve_for_dry_run_only'
    | 'approve_for_future_execution_review_only'
    | 'revoke_prior_review'
    | 'supersede_prior_review'
    | 'expire_review'
    | 'no_decision';
  reviewReason: string;
  evidencePresent: string[];
  evidenceMissing: string[];
  blockedReasonsReviewed: string[];
  missingRequirementsReviewed: string[];
  hardBoundariesReviewed: string[];
}

export interface ControlledActionReviewDecisionPacketProjectionRouteDecisionResult {
  routeId: string;
  decision:
    | 'deny'
    | 'request_more_evidence'
    | 'mark_incomplete'
    | 'approve_for_dry_run_only'
    | 'approve_for_future_execution_review_only'
    | 'revoke_prior_review'
    | 'supersede_prior_review'
    | 'expire_review'
    | 'no_decision';
  decisionAccepted: boolean;
  decisionDoesNotGrantApproval: true;
  decisionDoesNotGrantExecution: true;
  executionPerformed: false;
}

export interface ControlledActionReviewDecisionPacketEvidenceRequirement {
  required: boolean;
  present: boolean;
  referenceId?: string;
  notes?: string[];
}

export interface ControlledActionReviewDecisionPacketBlockedDecisionCategory {
  category:
    | 'execute_action'
    | 'approve_for_execution'
    | 'authorize_write_action'
    | 'authorize_bridge_action'
    | 'enable_direct_source'
    | 'enable_automatic_response_takeover'
    | 'publish_package'
    | 'restart_openclaw'
    | 'mutate_block_library'
    | 'touch_resleever';
  reason: string;
  requiresFutureLane: boolean;
  requiresExplicitApproval: boolean;
}

export interface ControlledActionReviewDecisionPacketProjectionHardBoundaries {
  policyDoesNotEqualExecution: true;
  approvalDoesNotEqualExecution: true;
  checkpointDoesNotEqualExecution: true;
  dryRunDoesNotEqualExecution: true;
  decisionSimulationDoesNotEqualExecution: true;
  decisionSimulationOnly: true;
  readinessDoesNotEqualExecution: true;
  traceReportDoesNotEqualExecution: true;
  auditPacketDoesNotEqualExecution: true;
  auditPacketExportDoesNotEqualExecution: true;
  reviewBundleDoesNotEqualApproval: true;
  reviewBundleDoesNotEqualExecution: true;
  reviewDecisionPacketDoesNotEqualApproval: true;
  reviewDecisionPacketDoesNotEqualExecution: true;
  executionPerformed: false;
  approvalGranted: false;
  writeActionPerformed: false;
  bridgeActionPerformed: false;
  fileWritten: false;
  externalTransmissionPerformed: false;
  packagePublished: false;
  directSourceEnabled: false;
  automaticResponseTakeoverEnabled: false;
}

export interface ControlledActionReviewDecisionPacketProjection {
  projectionId: string;
  packetId: string;
  schemaVersion: string;
  projectedAt?: string;
  reviewDecisionPacketProjectionOnly: true;
  executionPerformed: false;
  approvalGranted: false;
  reviewDecisionRecorded: boolean;
  liveDecisionRecorded: false;
  sourceReviewBundle: {
    reviewBundleId: string;
    sourceExportId: string;
    sourcePacketId: string;
  };
  decisionRequestSummary: {
    decisionRequestId: string;
    targetRouteCount: number;
    requestedDecisionTypes: string[];
  };
  decisionResultSummary: {
    decisionResultId: string;
    resultState: string;
    routeDecisionResultCount: number;
    acceptedDecisionCount: number;
    rejectedDecisionCount: number;
  };
  routeDecisionProjections: ControlledActionReviewDecisionPacketRouteProjection[];
  evidenceSummary: {
    totalEvidenceItems: number;
    requiredEvidenceItems: number;
    presentEvidenceItems: number;
    missingEvidenceItems: number;
  };
  blockedDecisionCategorySummary: {
    totalBlockedCategories: number;
    categories: string[];
  };
  hardBoundaries: ControlledActionReviewDecisionPacketProjectionHardBoundaries;
  projectionNotes: string[];
}

export interface ControlledActionReviewDecisionPacketRouteProjection {
  routeId: string;
  requestedDecision: string;
  resultDecision?: string;
  decisionProjectionStatus:
    | 'metadata_only'
    | 'denied_metadata_only'
    | 'needs_more_evidence_metadata_only'
    | 'incomplete_metadata_only'
    | 'dry_run_only_metadata'
    | 'future_execution_review_only_metadata'
    | 'revoked_metadata_only'
    | 'superseded_metadata_only'
    | 'expired_metadata_only'
    | 'no_decision_metadata_only'
    | 'invalid_or_rejected_metadata_only';
  decisionAccepted: boolean;
  evidencePresent: string[];
  evidenceMissing: string[];
  blockedReasonsReviewed: string[];
  missingRequirementsReviewed: string[];
  hardBoundariesReviewed: string[];
  decisionDoesNotGrantApproval: true;
  decisionDoesNotGrantExecution: true;
  approvalGranted: false;
  executionPerformed: false;
}

function mapDecisionStatus(decision: string, accepted: boolean): ControlledActionReviewDecisionPacketRouteProjection['decisionProjectionStatus'] {
  if (!accepted) return 'invalid_or_rejected_metadata_only';
  switch (decision) {
    case 'deny': return 'denied_metadata_only';
    case 'request_more_evidence': return 'needs_more_evidence_metadata_only';
    case 'mark_incomplete': return 'incomplete_metadata_only';
    case 'approve_for_dry_run_only': return 'dry_run_only_metadata';
    case 'approve_for_future_execution_review_only': return 'future_execution_review_only_metadata';
    case 'revoke_prior_review': return 'revoked_metadata_only';
    case 'supersede_prior_review': return 'superseded_metadata_only';
    case 'expire_review': return 'expired_metadata_only';
    case 'no_decision': return 'no_decision_metadata_only';
    default: return 'invalid_or_rejected_metadata_only';
  }
}

export function projectControlledActionReviewDecisionPacket(
  input: ControlledActionReviewDecisionPacketProjectionInput,
): ControlledActionReviewDecisionPacketProjection {
  const routeDecisionProjections = input.decisionRequest.targetRoutes.map((targetRoute) => {
    const result = input.decisionResult.routeDecisionResults.find((item) => item.routeId === targetRoute.routeId);
    const accepted = result?.decisionAccepted ?? false;
    return {
      routeId: targetRoute.routeId,
      requestedDecision: targetRoute.requestedDecision,
      resultDecision: result?.decision,
      decisionProjectionStatus: mapDecisionStatus(result?.decision ?? targetRoute.requestedDecision, accepted),
      decisionAccepted: accepted,
      evidencePresent: targetRoute.evidencePresent,
      evidenceMissing: targetRoute.evidenceMissing,
      blockedReasonsReviewed: targetRoute.blockedReasonsReviewed,
      missingRequirementsReviewed: targetRoute.missingRequirementsReviewed,
      hardBoundariesReviewed: targetRoute.hardBoundariesReviewed,
      decisionDoesNotGrantApproval: true,
      decisionDoesNotGrantExecution: true,
      approvalGranted: false,
      executionPerformed: false,
    } satisfies ControlledActionReviewDecisionPacketRouteProjection;
  });

  const evidenceItems = Object.values(input.evidenceRequirements);

  return {
    projectionId: `projection.${input.packetId}`,
    packetId: input.packetId,
    schemaVersion: input.schemaVersion,
    projectedAt: input.createdAt,
    reviewDecisionPacketProjectionOnly: true,
    executionPerformed: false,
    approvalGranted: false,
    reviewDecisionRecorded: input.reviewDecisionRecorded,
    liveDecisionRecorded: false,
    sourceReviewBundle: {
      reviewBundleId: input.sourceReviewBundle.reviewBundleId,
      sourceExportId: input.sourceReviewBundle.sourceExportId,
      sourcePacketId: input.sourceReviewBundle.sourcePacketId,
    },
    decisionRequestSummary: {
      decisionRequestId: input.decisionRequest.decisionRequestId,
      targetRouteCount: input.decisionRequest.targetRoutes.length,
      requestedDecisionTypes: [...new Set(input.decisionRequest.targetRoutes.map((route) => route.requestedDecision))],
    },
    decisionResultSummary: {
      decisionResultId: input.decisionResult.decisionResultId,
      resultState: input.decisionResult.resultState,
      routeDecisionResultCount: input.decisionResult.routeDecisionResults.length,
      acceptedDecisionCount: input.decisionResult.routeDecisionResults.filter((route) => route.decisionAccepted).length,
      rejectedDecisionCount: input.decisionResult.routeDecisionResults.filter((route) => !route.decisionAccepted).length,
    },
    routeDecisionProjections,
    evidenceSummary: {
      totalEvidenceItems: evidenceItems.length,
      requiredEvidenceItems: evidenceItems.filter((item) => item.required).length,
      presentEvidenceItems: evidenceItems.filter((item) => item.present).length,
      missingEvidenceItems: evidenceItems.filter((item) => item.required && !item.present).length,
    },
    blockedDecisionCategorySummary: {
      totalBlockedCategories: input.blockedDecisionCategories.length,
      categories: input.blockedDecisionCategories.map((item) => item.category),
    },
    hardBoundaries: input.hardBoundaries,
    projectionNotes: [
      'Projection remains metadata-only.',
      'No live review decision was recorded by this helper.',
      'No approval or execution authority was granted.',
    ],
  };
}
