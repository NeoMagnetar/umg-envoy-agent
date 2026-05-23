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
export declare function projectControlledActionAuditPacketExport(input: ControlledActionAuditPacketExportInput): ControlledActionAuditPacketExport;
