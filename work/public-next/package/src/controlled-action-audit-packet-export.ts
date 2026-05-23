import type { ControlledActionAuditPacketRouteInput } from './controlled-action-audit-packet.js';

export interface ControlledActionAuditPacketExportInput {
  exportId: string;
  generatedAt?: string;
  exportFormat: 'review_json' | 'handoff_json' | 'compliance_json' | 'debug_json';
  exportProfile: 'internal_review' | 'agent_handoff' | 'compliance_review' | 'debug_trace';
  packet: ControlledActionAuditPacketExportPacketInput;
  redactionPolicy?: {
    redactRouteIds?: boolean;
    redactActionIds?: boolean;
    redactPolicyIds?: boolean;
    redactTimestamps?: boolean;
    includeTraceStages?: boolean;
    includeBlockedReasons?: boolean;
    includeMissingRequirements?: boolean;
    includeSatisfiedRequirements?: boolean;
  };
  exportNotes?: string[];
}

export interface ControlledActionAuditPacketExportPacketInput {
  packetId: string;
  generatedAt?: string;
  runtimeVersion?: string;
  packageVersion?: string;
  auditPacketOnly: true;
  executionPerformed: false;
  summary: {
    totalRoutes: number;
    metadataOnlyRoutes: number;
    blockedRoutes: number;
    futureActionCapableRoutes: number;
    executionFutureOnlyRoutes: number;
    auditIncompleteRoutes: number;
    totalBlockedReasons: number;
    totalMissingRequirements: number;
    totalSatisfiedRequirements: number;
    totalTraceEntries: number;
    executionPerformedCount: 0;
  };
  hardBoundaries: {
    policyDoesNotEqualExecution: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
    traceReportDoesNotEqualExecution: true;
    auditPacketDoesNotEqualExecution: true;
  };
  routes: ControlledActionAuditPacketExportRouteInput[];
}

export interface ControlledActionAuditPacketExportRouteInput extends ControlledActionAuditPacketRouteInput {
  auditStatus: string;
  evidence: Record<string, string>;
  blockedReasons: string[];
  missingRequirements: string[];
  satisfiedRequirements: string[];
  traceEntryCount: number;
  traceStages: string[];
  hardBoundaryCount: number;
  executionPerformed: false;
}

export interface ControlledActionAuditPacketExport {
  exportId: string;
  generatedAt?: string;
  exportFormat: string;
  exportProfile: string;
  auditPacketExportOnly: true;
  executionPerformed: false;
  fileWritten: false;
  packagePublished: false;
  externalTransmissionPerformed: false;
  sourcePacket: {
    packetId: string;
    generatedAt?: string;
    runtimeVersion?: string;
    packageVersion?: string;
  };
  exportSummary: {
    totalRoutes: number;
    exportedRoutes: number;
    redactedRoutes: number;
    metadataOnlyRoutes: number;
    blockedRoutes: number;
    futureActionCapableRoutes: number;
    executionFutureOnlyRoutes: number;
    auditIncompleteRoutes: number;
    totalBlockedReasons: number;
    totalMissingRequirements: number;
    totalSatisfiedRequirements: number;
    totalTraceEntries: number;
    executionPerformedCount: 0;
  };
  redactionApplied: boolean;
  redactionPolicy: {
    redactRouteIds: boolean;
    redactActionIds: boolean;
    redactPolicyIds: boolean;
    redactTimestamps: boolean;
    includeTraceStages: boolean;
    includeBlockedReasons: boolean;
    includeMissingRequirements: boolean;
    includeSatisfiedRequirements: boolean;
  };
  routes: ControlledActionAuditPacketExportRoute[];
  hardBoundaries: {
    policyDoesNotEqualExecution: true;
    approvalDoesNotEqualExecution: true;
    checkpointDoesNotEqualExecution: true;
    dryRunDoesNotEqualExecution: true;
    decisionSimulationOnly: true;
    readinessDoesNotEqualExecution: true;
    traceReportDoesNotEqualExecution: true;
    auditPacketDoesNotEqualExecution: true;
    auditPacketExportDoesNotEqualExecution: true;
  };
  exportNotes: string[];
}

export interface ControlledActionAuditPacketExportRoute {
  routeId: string;
  linkedActionId?: string;
  linkedPolicyId?: string;
  linkedApprovalId?: string;
  linkedCheckpointId?: string;
  linkedDecisionSimulationId?: string;
  linkedDryRunId?: string;
  linkedBlockedRouteSummaryId?: string;
  linkedReadinessMatrixId?: string;
  linkedPolicyToReadinessIntegrationId?: string;
  linkedPolicyTraceReportId?: string;
  routeClass: string;
  riskLevel: string;
  auditStatus: string;
  evidence: Record<string, string>;
  blockedReasons: string[];
  missingRequirements: string[];
  satisfiedRequirements: string[];
  traceEntryCount: number;
  traceStages: string[];
  hardBoundaryCount: number;
  executionPerformed: false;
}

export function projectControlledActionAuditPacketExport(
  input: ControlledActionAuditPacketExportInput,
): ControlledActionAuditPacketExport {
  const policy = {
    redactRouteIds: false,
    redactActionIds: false,
    redactPolicyIds: false,
    redactTimestamps: false,
    includeTraceStages: true,
    includeBlockedReasons: true,
    includeMissingRequirements: true,
    includeSatisfiedRequirements: true,
    ...input.redactionPolicy,
  };

  const routes = input.packet.routes.map((route) => ({
    routeId: policy.redactRouteIds ? 'REDACTED_ROUTE' : route.routeId,
    linkedActionId: policy.redactActionIds ? 'REDACTED_ACTION' : route.linkedActionId,
    linkedPolicyId: policy.redactPolicyIds ? 'REDACTED_POLICY' : route.linkedPolicyId,
    linkedApprovalId: route.linkedApprovalId,
    linkedCheckpointId: route.linkedCheckpointId,
    linkedDecisionSimulationId: route.linkedDecisionSimulationId,
    linkedDryRunId: route.linkedDryRunId,
    linkedBlockedRouteSummaryId: route.linkedBlockedRouteSummaryId,
    linkedReadinessMatrixId: route.linkedReadinessMatrixId,
    linkedPolicyToReadinessIntegrationId: route.linkedPolicyToReadinessIntegrationId,
    linkedPolicyTraceReportId: route.linkedPolicyTraceReportId,
    routeClass: route.routeClass,
    riskLevel: route.riskLevel,
    auditStatus: route.auditStatus,
    evidence: route.evidence,
    blockedReasons: policy.includeBlockedReasons ? route.blockedReasons : [],
    missingRequirements: policy.includeMissingRequirements ? route.missingRequirements : [],
    satisfiedRequirements: policy.includeSatisfiedRequirements ? route.satisfiedRequirements : [],
    traceEntryCount: route.traceEntryCount,
    traceStages: policy.includeTraceStages ? route.traceStages : [],
    hardBoundaryCount: route.hardBoundaryCount,
    executionPerformed: false as const,
  }));

  const redactedRoutes = routes.filter((route) => route.routeId === 'REDACTED_ROUTE').length;

  return {
    exportId: input.exportId,
    generatedAt: policy.redactTimestamps ? 'REDACTED_TIMESTAMP' : input.generatedAt,
    exportFormat: input.exportFormat,
    exportProfile: input.exportProfile,
    auditPacketExportOnly: true,
    executionPerformed: false,
    fileWritten: false,
    packagePublished: false,
    externalTransmissionPerformed: false,
    sourcePacket: {
      packetId: input.packet.packetId,
      generatedAt: policy.redactTimestamps ? 'REDACTED_TIMESTAMP' : input.packet.generatedAt,
      runtimeVersion: input.packet.runtimeVersion,
      packageVersion: input.packet.packageVersion,
    },
    exportSummary: {
      totalRoutes: input.packet.summary.totalRoutes,
      exportedRoutes: routes.length,
      redactedRoutes,
      metadataOnlyRoutes: input.packet.summary.metadataOnlyRoutes,
      blockedRoutes: input.packet.summary.blockedRoutes,
      futureActionCapableRoutes: input.packet.summary.futureActionCapableRoutes,
      executionFutureOnlyRoutes: input.packet.summary.executionFutureOnlyRoutes,
      auditIncompleteRoutes: input.packet.summary.auditIncompleteRoutes,
      totalBlockedReasons: input.packet.summary.totalBlockedReasons,
      totalMissingRequirements: input.packet.summary.totalMissingRequirements,
      totalSatisfiedRequirements: input.packet.summary.totalSatisfiedRequirements,
      totalTraceEntries: input.packet.summary.totalTraceEntries,
      executionPerformedCount: 0,
    },
    redactionApplied: Object.values(policy).some((value) => value === true && value !== policy.includeTraceStages && value !== policy.includeBlockedReasons && value !== policy.includeMissingRequirements && value !== policy.includeSatisfiedRequirements) || policy.redactTimestamps,
    redactionPolicy: policy,
    routes,
    hardBoundaries: {
      ...input.packet.hardBoundaries,
      auditPacketExportDoesNotEqualExecution: true,
    },
    exportNotes: input.exportNotes ?? [],
  };
}
