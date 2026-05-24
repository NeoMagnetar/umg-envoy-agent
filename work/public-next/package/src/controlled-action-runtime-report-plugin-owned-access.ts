import { Type } from '@sinclair/typebox';
import {
  ControlledActionRuntimeReportToolInputSchema,
  executeControlledActionRuntimeReportTool,
  type ControlledActionRuntimeReportToolInput,
} from './controlled-action-runtime-report-tool-surface.js';

export const ControlledActionRuntimeReportPluginOwnedAccessInputSchema = ControlledActionRuntimeReportToolInputSchema;

export interface ControlledActionRuntimeReportPluginOwnedAccessInput extends ControlledActionRuntimeReportToolInput {}

export function executeControlledActionRuntimeReportPluginOwnedAccess(
  input: ControlledActionRuntimeReportPluginOwnedAccessInput = {},
) {
  const result = executeControlledActionRuntimeReportTool(input);

  return {
    accessSurface: 'plugin_owned_envoy_access' as const,
    preferredGatewayMethod: 'umg.envoy.controlledActionRuntimeReport' as const,
    currentToolName: 'umg_envoy_controlled_action_runtime_report_access' as const,
    currentCliCommand: 'openclaw umg-envoy runtime-report' as const,
    runtimeReportOnly: true as const,
    toolSurfaceReadOnly: true as const,
    toolSurfaceDoesNotEqualApproval: true as const,
    toolSurfaceDoesNotEqualRecording: true as const,
    toolSurfaceDoesNotEqualExecution: true as const,
    executionPerformed: false as const,
    approvalGranted: false as const,
    recordingPerformed: false as const,
    liveDecisionRecorded: false as const,
    fileWritten: false as const,
    externalTransmissionPerformed: false as const,
    packagePublished: false as const,
    directSourceEnabled: false as const,
    automaticResponseTakeoverEnabled: false as const,
    result,
  };
}
