import { ControlledActionRuntimeReportToolInputSchema, executeControlledActionRuntimeReportTool, } from './controlled-action-runtime-report-tool-surface.js';
export const ControlledActionRuntimeReportPluginOwnedAccessInputSchema = ControlledActionRuntimeReportToolInputSchema;
export function executeControlledActionRuntimeReportPluginOwnedAccess(input = {}) {
    const result = executeControlledActionRuntimeReportTool(input);
    return {
        accessSurface: 'plugin_owned_envoy_access',
        preferredGatewayMethod: 'umg.envoy.controlledActionRuntimeReport',
        currentToolName: 'umg_envoy_controlled_action_runtime_report_access',
        currentCliCommand: 'openclaw umg-envoy runtime-report',
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
        directSourceEnabled: false,
        automaticResponseTakeoverEnabled: false,
        result,
    };
}
