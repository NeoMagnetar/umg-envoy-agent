export function getRuntimeReportStatusPresentation(status) {
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
