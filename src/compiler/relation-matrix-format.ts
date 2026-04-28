import type { RelationMatrixLine } from "./relation-matrix-types.js";

function formatStates(states?: string[]) {
  if (!states || states.length === 0) {
    return "";
  }
  return states.join("");
}

export function renderRelationMatrixText(input: {
  header: {
    sleeve?: string | null;
    route?: string | null;
    ir?: string | null;
    runtime_spec?: string | null;
  };
  lines: RelationMatrixLine[];
}): string {
  const out: string[] = [];
  out.push("# UMG_RELATION_MATRIX v0.1");
  out.push(`# sleeve=${input.header.sleeve ?? "unknown"} route=${input.header.route ?? "unknown"}`);
  if (input.header.ir) {
    out.push(`# ir=${input.header.ir}`);
  }
  if (input.header.runtime_spec) {
    out.push(`# runtime_spec=${input.header.runtime_spec}`);
  }
  out.push("");

  for (const line of input.lines) {
    if (line.line_kind === "comment") {
      if (line.text) out.push(`# ${line.text}`);
      continue;
    }
    if (line.line_kind === "node_state") {
      out.push(`${line.from ?? "UNKNOWN"} ${formatStates(line.states)}`.trim());
      continue;
    }
    if (line.line_kind === "relation") {
      out.push(`${line.from ?? "UNKNOWN"} ${line.relation_code ?? "-?-"} ${line.to ?? "UNKNOWN"} ${formatStates(line.states)}`.trim());
      continue;
    }
    if (line.line_kind === "diagnostic") {
      out.push(`${line.from ?? "DIAG.UNKNOWN"} ${formatStates(line.states)}${line.text ? ` ${line.text}` : ""}`.trim());
    }
  }

  return `${out.join("\n")}\n`;
}
