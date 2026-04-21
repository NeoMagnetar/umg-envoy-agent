import {
  type BundleDeclaration,
  type BundleIntent,
  type CompilerStageList,
  type GateStateChange,
  type MergeDeclaration,
  type MoltNode,
  type MoltRoleCode,
  type NeoBlockNode,
  type NeoStackNode,
  type PlannerNodeState,
  type RelationshipDeclaration,
  type RelationshipKind,
  type UMGPathDocument,
  type WinnerDeclaration
} from "./umg-path-types.js";

function parseBracketContent(line: string, prefix: string): string {
  const match = line.match(new RegExp(`^${prefix}\\[(.*)\\]$`));
  if (!match) {
    throw new Error(`Invalid ${prefix} line: ${line}`);
  }
  return match[1].trim();
}

function splitList(content: string, delimiter = ","): string[] {
  return content
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseStateSymbol(symbol: string): PlannerNodeState {
  switch (symbol) {
    case "+": return "active";
    case "~": return "latent";
    case "-": return "suppressed";
    case "x": return "off";
    default:
      throw new Error(`Unknown state symbol: ${symbol}`);
  }
}

function parseGateEntry(entry: string): GateStateChange {
  const symbol = entry[0];
  const id = entry.slice(1).trim();
  if (symbol !== "+" && symbol !== "-") {
    throw new Error(`Invalid gate entry: ${entry}`);
  }
  return {
    state: symbol === "+" ? "active" : "suppressed",
    id
  };
}

function parseMoltLine(line: string): MoltNode {
  const content = parseBracketContent(line, "MOLT");
  const match = content.match(/^([+~\-x])([TDISPHB])(.+)$/);
  if (!match) {
    throw new Error(`Invalid MOLT line: ${line}`);
  }
  return {
    state: parseStateSymbol(match[1]),
    role: match[2] as MoltRoleCode,
    id: match[3].trim()
  };
}

function parseRelationship(line: string): RelationshipDeclaration {
  const match = line.match(/^REL\[([A-Z]+)\]\{(.+)\}$/);
  if (!match) {
    throw new Error(`Invalid REL line: ${line}`);
  }
  const kind = match[1] as RelationshipKind;
  const raw = match[2].trim();
  const members = raw.includes(">")
    ? raw.split(">").map((item) => item.trim()).filter(Boolean)
    : raw.split(",").map((item) => item.trim()).filter(Boolean);
  return { kind, raw, members };
}

function parseBundle(line: string): BundleDeclaration {
  const match = line.match(/^BND\[([TDISPHB])\]=([A-Z]+)\((.+)\)$/);
  if (!match) {
    throw new Error(`Invalid BND line: ${line}`);
  }
  const role = match[1] as MoltRoleCode;
  const intent = match[2] as BundleIntent;
  const body = match[3].trim();
  const members = body.includes("|")
    ? body.split("|").map((item) => item.trim()).filter(Boolean)
    : body.split(">").map((item) => item.trim()).filter(Boolean);
  return { role, intent, members };
}

function parseMerge(line: string): MergeDeclaration {
  const match = line.match(/^MRG\[([TDISPHB])\]=\((.+)\)=>(.+)$/);
  if (!match) {
    throw new Error(`Invalid MRG line: ${line}`);
  }
  const role = match[1] as MoltRoleCode;
  const sources = match[2].split("+").map((item) => item.trim()).filter(Boolean);
  const result = match[3].trim();
  return { role, sources, result };
}

function parseWinner(line: string): WinnerDeclaration {
  const match = line.match(/^WIN\[([^\]]+)\]=(.+)$/);
  if (!match) {
    throw new Error(`Invalid WIN line: ${line}`);
  }
  return {
    key: match[1].trim(),
    value: match[2].trim()
  };
}

function parseCompiler(line: string): CompilerStageList {
  const content = parseBracketContent(line, "CMP");
  return {
    stages: content.split(">").map((item) => item.trim()).filter(Boolean)
  };
}

export function parseUMGPath(input: string): UMGPathDocument {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("//") && !line.startsWith("# "));

  let use = "";
  let aim = "";
  let need: string[] = [];
  let sleeveId = "";
  let triggers: string[] = [];
  let gates: GateStateChange[] = [];
  let loadedStacks: string[] = [];
  const stacks: NeoStackNode[] = [];
  const relationships: RelationshipDeclaration[] = [];
  const bundles: BundleDeclaration[] = [];
  const merges: MergeDeclaration[] = [];
  const winners: WinnerDeclaration[] = [];
  let compiler: CompilerStageList = { stages: [] };

  let currentStack: NeoStackNode | null = null;
  let currentBlock: NeoBlockNode | null = null;

  for (const line of lines) {
    if (line.startsWith("USE[")) {
      use = parseBracketContent(line, "USE");
      continue;
    }
    if (line.startsWith("AIM[")) {
      aim = parseBracketContent(line, "AIM");
      continue;
    }
    if (line.startsWith("NEED[")) {
      need = splitList(parseBracketContent(line, "NEED"));
      continue;
    }
    if (line.startsWith("SLV[")) {
      sleeveId = parseBracketContent(line, "SLV");
      continue;
    }
    if (line.startsWith("TRG[")) {
      triggers = splitList(parseBracketContent(line, "TRG"));
      continue;
    }
    if (line.startsWith("GATE[")) {
      gates = splitList(parseBracketContent(line, "GATE")).map(parseGateEntry);
      continue;
    }
    if (line.startsWith("LOAD[")) {
      loadedStacks = splitList(parseBracketContent(line, "LOAD"));
      continue;
    }
    if (line.startsWith("STACK[")) {
      if (currentStack || currentBlock) {
        throw new Error(`Nested STACK without closing prior stack: ${line}`);
      }
      currentStack = { id: parseBracketContent(line, "STACK"), blocks: [] };
      continue;
    }
    if (line === "ENDSTACK") {
      if (!currentStack || currentBlock) {
        throw new Error(`ENDSTACK encountered out of order`);
      }
      stacks.push(currentStack);
      currentStack = null;
      continue;
    }
    if (line.startsWith("BLOCK[")) {
      if (!currentStack || currentBlock) {
        throw new Error(`BLOCK encountered outside a valid stack: ${line}`);
      }
      currentBlock = { id: parseBracketContent(line, "BLOCK"), molts: [] };
      continue;
    }
    if (line === "ENDBLOCK") {
      if (!currentStack || !currentBlock) {
        throw new Error(`ENDBLOCK encountered out of order`);
      }
      currentStack.blocks.push(currentBlock);
      currentBlock = null;
      continue;
    }
    if (line.startsWith("MOLT[")) {
      if (!currentBlock) {
        throw new Error(`MOLT encountered outside a block: ${line}`);
      }
      currentBlock.molts.push(parseMoltLine(line));
      continue;
    }
    if (line.startsWith("REL[")) {
      relationships.push(parseRelationship(line));
      continue;
    }
    if (line.startsWith("BND[")) {
      bundles.push(parseBundle(line));
      continue;
    }
    if (line.startsWith("MRG[")) {
      merges.push(parseMerge(line));
      continue;
    }
    if (line.startsWith("WIN[")) {
      winners.push(parseWinner(line));
      continue;
    }
    if (line.startsWith("CMP[")) {
      compiler = parseCompiler(line);
      continue;
    }

    throw new Error(`Unknown line: ${line}`);
  }

  if (currentBlock || currentStack) {
    throw new Error(`Unclosed STACK/BLOCK section`);
  }

  return {
    use,
    aim,
    need,
    sleeveId,
    triggers,
    gates,
    loadedStacks,
    stacks,
    relationships,
    bundles,
    merges,
    winners,
    compiler
  };
}
