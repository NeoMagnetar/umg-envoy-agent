export type RuntimeReportStatus =
  | "complete"
  | "warning"
  | "blocked"
  | "off"
  | "info";

export type RuntimeReportMarker = "✓" | "!" | "✗" | "OFF" | "i";

export interface RuntimeReportStatusPresentation {
  status: RuntimeReportStatus;
  marker: RuntimeReportMarker;
  label: string;
  colorSemantic:
    | "green"
    | "yellow"
    | "red"
    | "gray"
    | "blue"
    | "purple"
    | "orange";
}

export function getRuntimeReportStatusPresentation(
  status: RuntimeReportStatus,
): RuntimeReportStatusPresentation {
  switch (status) {
    case "complete":
      return { status, marker: "✓", label: "Complete", colorSemantic: "green" };
    case "warning":
      return { status, marker: "!", label: "Warning", colorSemantic: "yellow" };
    case "blocked":
      return { status, marker: "✗", label: "Blocked", colorSemantic: "red" };
    case "off":
      return { status, marker: "OFF", label: "Off", colorSemantic: "gray" };
    case "info":
    default:
      return { status: "info", marker: "i", label: "Info", colorSemantic: "blue" };
  }
}
