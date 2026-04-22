import type {
  BundleDeclaration,
  GateStateChange,
  MergeDeclaration,
  MoltNode,
  NeoBlockNode,
  NeoStackNode,
  PlannerNodeState,
  RelationshipDeclaration,
  UMGPathDocument,
  WinnerDeclaration
} from "./umg-path-types.js";

function stateToSymbol(state: PlannerNodeState): string {
  switch (state) {
    case "active": return "+";
    case "latent": return "~";
    case "suppressed": return "-";
    case "off": return "x";
  }
}

function renderGate(entry: GateStateChange): string {
  return `${entry.state === "active" ? "+" : "-"}${entry.id}`;
}

function renderMolt(node: MoltNode): string {
  return `MOLT[${stateToSymbol(node.state)}${node.role}${node.id}]`;
}

function renderBlock(block: NeoBlockNode): string[] {
  return [
    `BLOCK[${block.id}]`,
    ...block.molts.map(renderMolt),
    `ENDBLOCK`
  ];
}

function renderStack(stack: NeoStackNode): string[] {
  return [
    `STACK[${stack.id}]`,
    ...stack.blocks.flatMap(renderBlock),
    `ENDSTACK`
  ];
}

function renderRelationship(entry: RelationshipDeclaration): string {
  return `REL[${entry.kind}]{${entry.raw}}`;
}

function renderBundle(entry: BundleDeclaration): string {
  const joiner = entry.intent === "RANK" ? ">" : "|";
  return `BND[${entry.role}]=${entry.intent}(${entry.members.join(joiner)})`;
}

function renderMerge(entry: MergeDeclaration): string {
  return `MRG[${entry.role}]=(${entry.sources.join("+")})=>${entry.result}`;
}

function renderWinner(entry: WinnerDeclaration): string {
  return `WIN[${entry.key}]=${entry.value}`;
}

export function renderUMGPath(doc: UMGPathDocument): string {
  const lines: string[] = [];
  lines.push(`USE[${doc.use}]`);
  lines.push(`AIM[${doc.aim}]`);
  lines.push(`NEED[${doc.need.join(",")}]`);
  lines.push(`SLV[${doc.sleeveId}]`);
  lines.push(`TRG[${doc.triggers.join(",")}]`);
  lines.push(`GATE[${doc.gates.map(renderGate).join(",")}]`);
  lines.push(`LOAD[${doc.loadedStacks.join(",")}]`);
  if (doc.stacks.length) {
    lines.push("");
    lines.push(...doc.stacks.flatMap(renderStack));
  }
  if (doc.relationships.length) {
    lines.push("");
    lines.push(...doc.relationships.map(renderRelationship));
  }
  if (doc.bundles.length) {
    lines.push("");
    lines.push(...doc.bundles.map(renderBundle));
  }
  if (doc.merges.length) {
    lines.push("");
    lines.push(...doc.merges.map(renderMerge));
  }
  if (doc.winners.length) {
    lines.push("");
    lines.push(...doc.winners.map(renderWinner));
  }
  lines.push(`CMP[${doc.compiler.stages.join(">")}]`);
  return lines.join("\n");
}
