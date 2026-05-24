export type RuntimeReportPanelId =
  | "overview"
  | "active_route"
  | "safety_evidence_chain"
  | "blocked_capabilities"
  | "readiness"
  | "audit_and_review"
  | "recording_metadata"
  | "hard_boundaries"
  | "next_safe_step";

export interface RuntimeReportEvidenceItem {
  id: string;
  label: string;
  status: "complete" | "warning" | "blocked" | "off";
  marker: "✓" | "!" | "✗" | "OFF";
}

export interface RuntimeReportBlockedCapability {
  id:
    | "execute_action"
    | "write_files"
    | "bridge_actions"
    | "direct_source"
    | "automatic_takeover"
    | "package_publish";
  label: string;
  status: "blocked" | "off";
  reason: string;
}

export interface RuntimeReportNavigationItem {
  id: RuntimeReportPanelId;
  label: string;
  status: "complete" | "warning" | "blocked" | "off" | "info";
  marker: "✓" | "!" | "✗" | "OFF" | "i";
  description: string;
}

export interface RuntimeReportPanelRow {
  id: string;
  label: string;
  value?: string;
  status?: "complete" | "warning" | "blocked" | "off" | "info";
  marker?: "✓" | "!" | "✗" | "OFF" | "i";
  reason?: string;
}

export interface RuntimeReportPanel {
  id: RuntimeReportPanelId;
  title: string;
  description: string;
  rows: RuntimeReportPanelRow[];
}

export interface ControlledActionRuntimeReportViewModel {
  reportId: string;
  mode: "read_only";
  approvalGranted: false;
  executionPerformed: false;
  recordingPerformed: false;
  liveDecisionRecorded: false;

  activeRoute: {
    routeId: string;
    routeClass: string;
    riskLevel: "none" | "low" | "medium" | "high" | "critical";
    status: "blocked" | "metadata_only" | "incomplete";
  };

  safetyEvidenceChain: RuntimeReportEvidenceItem[];
  blockedCapabilities: RuntimeReportBlockedCapability[];
  navigation: RuntimeReportNavigationItem[];
  panels: Record<RuntimeReportPanelId, RuntimeReportPanel>;
  asciiReport?: string;
  liveCallProof: "not_available_from_current_cli_surface" | "available" | "unknown";
}
