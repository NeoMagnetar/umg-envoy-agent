import { Type } from '@sinclair/typebox';
import { buildControlledActionRuntimeReportNavigation, projectControlledActionRuntimeReport, renderControlledActionRuntimeReportAscii, } from './controlled-action-runtime-report-integration.js';
export const ControlledActionRuntimeReportToolPanelEnum = Type.Union([
    Type.Literal('overview'),
    Type.Literal('active_route'),
    Type.Literal('safety_evidence_chain'),
    Type.Literal('blocked_capabilities'),
    Type.Literal('readiness'),
    Type.Literal('audit_and_review'),
    Type.Literal('recording_metadata'),
    Type.Literal('hard_boundaries'),
    Type.Literal('next_safe_step'),
]);
export const ControlledActionRuntimeReportToolInputSchema = Type.Object({
    sleeveId: Type.Optional(Type.String()),
    routeId: Type.Optional(Type.String()),
    reportMode: Type.Optional(Type.Union([
        Type.Literal('summary'),
        Type.Literal('full'),
        Type.Literal('ascii_only'),
        Type.Literal('structured_only'),
        Type.Literal('panel'),
        Type.Literal('navigation_only'),
    ])),
    panel: Type.Optional(ControlledActionRuntimeReportToolPanelEnum),
    includeAscii: Type.Optional(Type.Boolean()),
    includeNavigation: Type.Optional(Type.Boolean()),
    includeStructuredReport: Type.Optional(Type.Boolean()),
    reportInput: Type.Optional(Type.Any()),
}, { additionalProperties: false });
const VALID_PANELS = new Set([
    'overview',
    'active_route',
    'safety_evidence_chain',
    'blocked_capabilities',
    'readiness',
    'audit_and_review',
    'recording_metadata',
    'hard_boundaries',
    'next_safe_step',
]);
function defaultReportInput(input) {
    const routeId = input.routeId ?? 'runtime_report_preview_route';
    return {
        reportId: 'runtime-report-preview',
        runtimeContext: {
            packageVersion: '0.3.0-alpha.12',
            branch: 'alpha7/from-public-synced-alpha6',
            baselineCommit: '6056566b11a76d89f9b86a079ccbd2e005ed3594',
            activeSleeveId: input.sleeveId,
            activeNeoStackIds: [],
            activeRouteId: input.routeId,
            mode: 'read_only_report',
        },
        route: input.routeId ? {
            routeId,
            routeClass: 'bridge_action_candidate',
            riskLevel: 'high',
            routeStatus: 'blocked',
        } : {
            routeId,
            routeClass: 'metadata_only',
            riskLevel: 'none',
            routeStatus: 'incomplete',
        },
        policy: {
            policyPresent: true,
            requiredGates: ['policy_projection', 'dry_run', 'audit'],
            policyStatus: 'present',
        },
        readiness: {
            readinessStatus: input.routeId ? 'blocked_pending_evidence' : 'incomplete_preview',
            executionEligibility: 'blocked',
            satisfiedRequirements: input.routeId ? ['policy_projection_visible'] : [],
            missingRequirements: input.routeId ? ['approval_not_granted'] : ['report_input_not_supplied'],
        },
        blocked: {
            blockedReasons: input.routeId ? ['bridge actions disabled in this build'] : ['no reportInput supplied; returning safe preview metadata'],
            blockedCapabilityIds: ['execute_action', 'bridge_actions'],
        },
        evidence: {
            auditPacketPresent: Boolean(input.routeId),
            auditExportPresent: Boolean(input.routeId),
            reviewBundlePresent: Boolean(input.routeId),
            recordingMetadataPresent: Boolean(input.routeId),
            phaseHandoffReportPresent: true,
            evidenceComplete: false,
            missingEvidenceItems: input.routeId ? 1 : 3,
        },
        review: {
            reviewDecisionPacketPresent: Boolean(input.routeId),
            reviewDecisionProjectionPresent: Boolean(input.routeId),
            reviewDecisionRecorded: false,
            approvalGranted: false,
        },
        recording: {
            recordingImplemented: false,
            recordingPerformed: false,
            liveDecisionRecorded: false,
            recordingStatus: input.routeId ? 'metadata_only' : 'incomplete_preview',
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
        recommendedNextLane: 'ALPHA9_CONTROLLED_ACTION_EXECUTION_RUNTIME_REPORT_LIVE_INSTALL_VERIFY_SOURCE',
    };
}
function mapPanel(panel) {
    switch (panel) {
        case 'active_route': return 'activeRoute';
        case 'safety_evidence_chain': return 'safetyEvidenceChain';
        case 'blocked_capabilities': return 'blockedCapabilities';
        case 'audit_and_review': return 'auditAndReview';
        case 'recording_metadata': return 'recordingMetadata';
        case 'hard_boundaries': return 'hardBoundaries';
        case 'next_safe_step': return 'nextSafeStep';
        case 'readiness': return 'readiness';
        case 'overview': return 'activeRoute';
        default: return null;
    }
}
export function executeControlledActionRuntimeReportTool(input = {}) {
    const selectedMode = input.reportMode ?? 'full';
    const includeAscii = input.includeAscii ?? !['structured_only', 'navigation_only'].includes(selectedMode);
    const includeNavigation = input.includeNavigation ?? selectedMode !== 'ascii_only';
    const includeStructuredReport = input.includeStructuredReport ?? !['ascii_only', 'navigation_only'].includes(selectedMode);
    if (selectedMode === 'panel' && (!input.panel || !VALID_PANELS.has(input.panel))) {
        return {
            toolName: 'umg_envoy_controlled_action_runtime_report',
            toolMode: 'read_only_report_preview',
            selectedMode,
            selectedPanel: input.panel ?? null,
            runtimeReportReturned: false,
            validationError: {
                code: 'invalid_panel',
                message: 'panel mode requires a valid navigation target',
            },
            runtimeReportOnly: true,
            toolSurfaceReadOnly: true,
            toolSurfaceDoesNotEqualApproval: true,
            toolSurfaceDoesNotEqualRecording: true,
            toolSurfaceDoesNotEqualExecution: true,
            executionPerformed: false,
            approvalGranted: false,
            recordingPerformed: false,
            liveDecisionRecorded: false,
            fileWritten: false,
            externalTransmissionPerformed: false,
            packagePublished: false,
            openClawRestarted: false,
            directSourceEnabled: false,
            automaticResponseTakeoverEnabled: false,
        };
    }
    const projected = projectControlledActionRuntimeReport(input.reportInput ?? defaultReportInput(input));
    const navigation = buildControlledActionRuntimeReportNavigation({ panels: projected.panels });
    const asciiReport = renderControlledActionRuntimeReportAscii(projected);
    const selectedPanelKey = input.panel ? mapPanel(input.panel) : null;
    const base = {
        toolName: 'umg_envoy_controlled_action_runtime_report',
        toolMode: 'read_only_report_preview',
        selectedMode,
        selectedPanel: input.panel ?? null,
        runtimeReportReturned: true,
        runtimeReportOnly: true,
        toolSurfaceReadOnly: true,
        toolSurfaceDoesNotEqualApproval: true,
        toolSurfaceDoesNotEqualRecording: true,
        toolSurfaceDoesNotEqualExecution: true,
        executionPerformed: false,
        approvalGranted: false,
        recordingPerformed: false,
        liveDecisionRecorded: false,
        fileWritten: false,
        externalTransmissionPerformed: false,
        packagePublished: false,
        openClawRestarted: false,
        directSourceEnabled: false,
        automaticResponseTakeoverEnabled: false,
    };
    if (selectedMode === 'ascii_only') {
        return { ...base, asciiReport };
    }
    if (selectedMode === 'structured_only') {
        return { ...base, structuredReport: projected };
    }
    if (selectedMode === 'navigation_only') {
        return { ...base, navigation };
    }
    if (selectedMode === 'panel') {
        return {
            ...base,
            navigation: includeNavigation ? navigation : undefined,
            selectedPanelReport: selectedPanelKey ? projected.panels[selectedPanelKey] : undefined,
            asciiReport: includeAscii ? asciiReport : undefined,
            structuredReport: includeStructuredReport ? projected : undefined,
        };
    }
    if (selectedMode === 'summary') {
        return {
            ...base,
            navigation: includeNavigation ? navigation : undefined,
            structuredReport: includeStructuredReport ? {
                reportId: projected.reportId,
                overview: projected.overview,
                runtimeContext: projected.runtimeContext,
            } : undefined,
            asciiReport: includeAscii ? asciiReport : undefined,
        };
    }
    return {
        ...base,
        navigation: includeNavigation ? navigation : undefined,
        structuredReport: includeStructuredReport ? projected : undefined,
        asciiReport: includeAscii ? asciiReport : undefined,
    };
}
