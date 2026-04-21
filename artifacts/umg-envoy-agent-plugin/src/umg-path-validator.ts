import type {
  RelationshipKind,
  UMGPathDocument,
  ValidationIssue
} from "./umg-path-types.js";
import { buildLegendResolverIndex, validateUMGPathAgainstLegend } from "./umg-legend-resolver.js";
import type { ResolvedPaths } from "./types.js";

function push(
  issues: ValidationIssue[],
  severity: ValidationIssue["severity"],
  code: string,
  message: string,
  path?: string
): void {
  issues.push({ severity, code, message, path });
}

function isNonEmptyId(value: string): boolean {
  return value.trim().length > 0;
}

function hasBasicIdShape(value: string): boolean {
  return /^[A-Za-z0-9_@#.:\/-]+$/.test(value);
}

function duplicateItems(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return Array.from(dupes);
}

function canonicalRelationshipKinds(): Set<RelationshipKind> {
  return new Set(["PAR", "SEQ", "NEST", "OVR"]);
}

function collectDeclaredIds(doc: UMGPathDocument): Set<string> {
  const ids = new Set<string>();
  if (doc.sleeveId) ids.add(doc.sleeveId);
  for (const stackId of doc.loadedStacks) ids.add(stackId);
  for (const stack of doc.stacks) {
    ids.add(stack.id);
    for (const block of stack.blocks) {
      ids.add(block.id);
      for (const molt of block.molts) ids.add(molt.id);
    }
  }
  for (const trigger of doc.triggers) ids.add(trigger);
  for (const gate of doc.gates) ids.add(gate.id);
  return ids;
}

function collectMoltStates(doc: UMGPathDocument): Map<string, Set<string>> {
  const states = new Map<string, Set<string>>();
  for (const stack of doc.stacks) {
    for (const block of stack.blocks) {
      for (const molt of block.molts) {
        const current = states.get(molt.id) ?? new Set<string>();
        current.add(molt.state);
        states.set(molt.id, current);
      }
    }
  }
  return states;
}

function collectNodeKinds(doc: UMGPathDocument): Map<string, "stack" | "block" | "molt" | "trigger" | "gate" | "sleeve"> {
  const map = new Map<string, "stack" | "block" | "molt" | "trigger" | "gate" | "sleeve">();
  if (doc.sleeveId) map.set(doc.sleeveId, "sleeve");
  for (const trigger of doc.triggers) map.set(trigger, "trigger");
  for (const gate of doc.gates) map.set(gate.id, "gate");
  for (const stack of doc.stacks) {
    map.set(stack.id, "stack");
    for (const block of stack.blocks) {
      map.set(block.id, "block");
      for (const molt of block.molts) map.set(molt.id, "molt");
    }
  }
  return map;
}

function validateIdFields(doc: UMGPathDocument, issues: ValidationIssue[]): void {
  if (!doc.use) push(issues, "error", "MISSING_USE", "USE is required", "use");
  if (!doc.aim) push(issues, "error", "MISSING_AIM", "AIM is required", "aim");

  if (!doc.sleeveId) {
    push(issues, "error", "MISSING_SLEEVE", "SLV is required", "sleeveId");
  } else {
    if (!hasBasicIdShape(doc.sleeveId)) {
      push(issues, "error", "INVALID_SLEEVE_ID", `Sleeve id has illegal characters: ${doc.sleeveId}`, "sleeveId");
    }
    const acceptedInternalShape = /^(slv[.\-_@#:]|slv[A-Za-z0-9._-]|sample-|generated-|runtime-)/.test(doc.sleeveId);
    if (!acceptedInternalShape) {
      push(issues, "warning", "SLEEVE_ID_SHAPE", "Sleeve id does not match expected internal/canonical shape", "sleeveId");
    }
  }

  for (const [index, stackId] of doc.loadedStacks.entries()) {
    if (!isNonEmptyId(stackId)) {
      push(issues, "error", "EMPTY_LOAD_STACK_ID", "LOAD contains an empty stack id", `loadedStacks[${index}]`);
    } else if (!hasBasicIdShape(stackId)) {
      push(issues, "error", "INVALID_STACK_ID", `Stack id has illegal characters: ${stackId}`, `loadedStacks[${index}]`);
    }
  }

  for (const [index, trigger] of doc.triggers.entries()) {
    if (!isNonEmptyId(trigger)) {
      push(issues, "error", "EMPTY_TRIGGER_ID", "TRG contains an empty trigger id", `triggers[${index}]`);
    }
  }

  for (const [index, gate] of doc.gates.entries()) {
    if (!isNonEmptyId(gate.id)) {
      push(issues, "error", "EMPTY_GATE_ID", "GATE contains an empty gate id", `gates[${index}]`);
    }
  }
}

function validateStructure(doc: UMGPathDocument, issues: ValidationIssue[]): void {
  const stackIds = new Set<string>();
  const blockIds = new Set<string>();
  const moltIds = new Set<string>();

  const duplicateLoadedStacks = duplicateItems(doc.loadedStacks);
  for (const dupe of duplicateLoadedStacks) {
    push(issues, "warning", "DUP_LOAD_STACK", `LOAD contains duplicate stack id: ${dupe}`, "loadedStacks");
  }

  const duplicateTriggers = duplicateItems(doc.triggers);
  for (const dupe of duplicateTriggers) {
    push(issues, "warning", "DUP_TRIGGER", `TRG contains duplicate trigger id: ${dupe}`, "triggers");
  }

  const duplicateGateIds = duplicateItems(doc.gates.map((gate) => gate.id));
  for (const dupe of duplicateGateIds) {
    push(issues, "warning", "DUP_GATE", `GATE contains duplicate gate id: ${dupe}`, "gates");
  }

  for (const [stackIndex, stack] of doc.stacks.entries()) {
    if (!isNonEmptyId(stack.id)) {
      push(issues, "error", "EMPTY_STACK_ID", "STACK id cannot be empty", `stacks[${stackIndex}]`);
    } else if (!hasBasicIdShape(stack.id)) {
      push(issues, "error", "INVALID_STACK_ID", `Stack id has illegal characters: ${stack.id}`, `stacks[${stackIndex}]`);
    }

    if (stackIds.has(stack.id)) {
      push(issues, "error", "DUP_STACK_ID", `Duplicate stack id: ${stack.id}`, `stacks[${stackIndex}]`);
    }
    stackIds.add(stack.id);

    if (!doc.loadedStacks.includes(stack.id)) {
      push(issues, "warning", "STACK_NOT_LOADED", `Stack declared but not present in LOAD: ${stack.id}`, `stacks[${stackIndex}]`);
    }

    if (stack.blocks.length === 0) {
      push(issues, "warning", "EMPTY_STACK", `NeoStack has no NeoBlocks: ${stack.id}`, `stacks[${stackIndex}]`);
    }

    for (const [blockIndex, block] of stack.blocks.entries()) {
      if (!isNonEmptyId(block.id)) {
        push(issues, "error", "EMPTY_BLOCK_ID", "BLOCK id cannot be empty", `stacks[${stackIndex}].blocks[${blockIndex}]`);
      } else if (!hasBasicIdShape(block.id)) {
        push(issues, "error", "INVALID_BLOCK_ID", `Block id has illegal characters: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
      }

      if (blockIds.has(block.id)) {
        push(issues, "error", "DUP_BLOCK_ID", `Duplicate block id: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
      }
      blockIds.add(block.id);

      if (block.molts.length === 0) {
        push(issues, "warning", "EMPTY_BLOCK", `NeoBlock has no MOLT members: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
      }

      const activeCount = block.molts.filter((molt) => molt.state === "active").length;
      const modulationBlock = /^NB\.MOD\./.test(block.id);
      if (activeCount > 1 && !modulationBlock) {
        push(issues, "warning", "MULTI_ACTIVE_BLOCK", `NeoBlock has multiple active MOLT nodes: ${block.id}`, `stacks[${stackIndex}].blocks[${blockIndex}]`);
      }

      for (const [moltIndex, molt] of block.molts.entries()) {
        if (!isNonEmptyId(molt.id)) {
          push(issues, "error", "EMPTY_MOLT_ID", "MOLT id cannot be empty", `stacks[${stackIndex}].blocks[${blockIndex}].molts[${moltIndex}]`);
        } else if (!hasBasicIdShape(molt.id)) {
          push(issues, "error", "INVALID_MOLT_ID", `MOLT id has illegal characters: ${molt.id}`, `stacks[${stackIndex}].blocks[${blockIndex}].molts[${moltIndex}]`);
        }

        if (moltIds.has(molt.id)) {
          push(issues, "warning", "DUP_MOLT_ID", `Duplicate MOLT id referenced: ${molt.id}`, `stacks[${stackIndex}].blocks[${blockIndex}].molts[${moltIndex}]`);
        }
        moltIds.add(molt.id);
      }
    }
  }
}

function validateMoltStateConflicts(doc: UMGPathDocument, issues: ValidationIssue[]): void {
  const stateMap = collectMoltStates(doc);
  for (const [id, states] of stateMap.entries()) {
    if (states.size > 1) {
      push(issues, "error", "STATE_CONTRADICTION", `MOLT id appears with contradictory states: ${id} -> ${Array.from(states).join(", ")}`);
    }
  }
}

function validateRelationships(
  doc: UMGPathDocument,
  issues: ValidationIssue[],
  ids: Set<string>,
  nodeKinds: Map<string, "stack" | "block" | "molt" | "trigger" | "gate" | "sleeve">
): void {
  const canonicalKinds = canonicalRelationshipKinds();

  for (const [index, relation] of doc.relationships.entries()) {
    if (!canonicalKinds.has(relation.kind)) {
      if (relation.kind === "CHN") {
        push(issues, "warning", "REL_COMPAT_KIND", "CHN is compatibility-only and not canonical v0.2 syntax", `relationships[${index}]`);
      } else {
        push(issues, "error", "REL_INVALID_KIND", `Illegal relationship kind: ${relation.kind}`, `relationships[${index}]`);
      }
    }

    if (relation.members.length < 2) {
      push(issues, "error", "REL_TOO_SMALL", `Relationship ${relation.kind} must reference at least two members`, `relationships[${index}]`);
    }

    const dupes = duplicateItems(relation.members);
    for (const dupe of dupes) {
      push(issues, "error", "REL_DUP_MEMBER", `Relationship duplicates member: ${dupe}`, `relationships[${index}]`);
    }

    for (const member of relation.members) {
      if (!ids.has(member)) {
        push(issues, "warning", "REL_UNKNOWN_MEMBER", `Relationship member not declared elsewhere: ${member}`, `relationships[${index}]`);
      }
    }

    if (relation.kind === "NEST") {
      const invalidKinds = relation.members.filter((member) => {
        const kind = nodeKinds.get(member);
        return kind !== undefined && kind !== "stack" && kind !== "block";
      });
      if (invalidKinds.length) {
        push(issues, "error", "REL_NEST_INVALID_TARGET", `NEST relationship may only target stack/block ids: ${invalidKinds.join(", ")}`, `relationships[${index}]`);
      }
    }
  }
}

function validateBundles(doc: UMGPathDocument, issues: ValidationIssue[], ids: Set<string>): void {
  for (const [index, bundle] of doc.bundles.entries()) {
    if (bundle.members.length < 2) {
      push(issues, "error", "BND_TOO_SMALL", "Bundle must contain at least two members", `bundles[${index}]`);
    }

    const dupes = duplicateItems(bundle.members);
    for (const dupe of dupes) {
      push(issues, "error", "BND_DUP_MEMBER", `Bundle duplicates member: ${dupe}`, `bundles[${index}]`);
    }

    for (const member of bundle.members) {
      if (!ids.has(member)) {
        push(issues, "warning", "BND_UNKNOWN_MEMBER", `Bundle member not declared elsewhere: ${member}`, `bundles[${index}]`);
      }
    }
  }
}

function validateMerges(doc: UMGPathDocument, issues: ValidationIssue[], ids: Set<string>): void {
  for (const [index, merge] of doc.merges.entries()) {
    if (merge.sources.length < 2) {
      push(issues, "error", "MRG_TOO_SMALL", "Merge must contain at least two source ids", `merges[${index}]`);
    }

    const dupes = duplicateItems(merge.sources);
    for (const dupe of dupes) {
      push(issues, "error", "MRG_DUP_SOURCE", `Merge duplicates source: ${dupe}`, `merges[${index}]`);
    }

    if (!isNonEmptyId(merge.result)) {
      push(issues, "error", "MRG_EMPTY_RESULT", "Merge result id cannot be empty", `merges[${index}]`);
    }

    if (merge.sources.includes(merge.result)) {
      push(issues, "error", "MRG_SELF_RESULT", `Merge result cannot also be a source: ${merge.result}`, `merges[${index}]`);
    }

    for (const source of merge.sources) {
      if (!ids.has(source)) {
        push(issues, "warning", "MRG_UNKNOWN_SOURCE", `Merge source not declared elsewhere: ${source}`, `merges[${index}]`);
      }
    }
  }
}

function validateCrossDeclarationConflicts(doc: UMGPathDocument, issues: ValidationIssue[]): void {
  for (const [bundleIndex, bundle] of doc.bundles.entries()) {
    const bundleSet = new Set(bundle.members);
    for (const [mergeIndex, merge] of doc.merges.entries()) {
      const overlap = merge.sources.filter((source) => bundleSet.has(source));
      if (overlap.length === merge.sources.length && overlap.length > 0) {
        push(issues, "warning", "BND_MRG_FULL_OVERLAP", `Bundle fully overlaps merge sources: ${overlap.join(", ")}`, `bundles[${bundleIndex}]`);
      }
      if (bundleSet.has(merge.result)) {
        push(issues, "warning", "BND_MRG_RESULT_OVERLAP", `Bundle contains merge result id: ${merge.result}`, `merges[${mergeIndex}]`);
      }
    }
  }
}

function validateWinners(doc: UMGPathDocument, issues: ValidationIssue[], ids: Set<string>): void {
  const chainWinners = doc.winners.filter((winner) => winner.key === "chain");
  if (chainWinners.length > 1) {
    push(issues, "error", "WIN_DUP_CHAIN", "Multiple WIN[chain] declarations are not legal in v0.2", "winners");
  }

  for (const [index, winner] of doc.winners.entries()) {
    if (!winner.key) {
      push(issues, "error", "WIN_EMPTY_KEY", "Winner key cannot be empty", `winners[${index}]`);
    }
    if (!winner.value) {
      push(issues, "error", "WIN_EMPTY_VALUE", "Winner value cannot be empty", `winners[${index}]`);
    }

    if (winner.key === "chain") {
      const chainMembers = winner.value.split(">").map((item) => item.trim()).filter(Boolean);
      if (chainMembers.length < 2) {
        push(issues, "error", "WIN_CHAIN_TOO_SMALL", "WIN[chain] must contain at least two members", `winners[${index}]`);
      }
      const dupes = duplicateItems(chainMembers);
      for (const dupe of dupes) {
        push(issues, "error", "WIN_CHAIN_DUP_MEMBER", `Winner chain duplicates member: ${dupe}`, `winners[${index}]`);
      }
      for (const member of chainMembers) {
        if (!ids.has(member)) {
          push(issues, "warning", "WIN_UNKNOWN_TARGET", `Winner chain member not declared elsewhere: ${member}`, `winners[${index}]`);
        }
      }
    } else if (!ids.has(winner.value)) {
      push(issues, "warning", "WIN_UNKNOWN_TARGET", `Winner target not declared elsewhere: ${winner.value}`, `winners[${index}]`);
    }
  }
}

function validateCompilerStages(doc: UMGPathDocument, issues: ValidationIssue[]): void {
  if (!doc.compiler.stages.length) {
    push(issues, "error", "MISSING_COMPILER_STAGES", "CMP stages are required", "compiler");
    return;
  }

  const requiredStages = ["validate", "compile"];
  for (const stage of requiredStages) {
    if (!doc.compiler.stages.includes(stage)) {
      push(issues, "warning", "CMP_MISSING_EXPECTED_STAGE", `CMP is missing expected stage: ${stage}`, "compiler");
    }
  }

  const dupes = duplicateItems(doc.compiler.stages);
  for (const dupe of dupes) {
    push(issues, "warning", "CMP_DUP_STAGE", `CMP contains duplicate stage: ${dupe}`, "compiler");
  }
}

export function validateUMGPath(doc: UMGPathDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  validateIdFields(doc, issues);
  validateStructure(doc, issues);
  validateMoltStateConflicts(doc, issues);
  validateCompilerStages(doc, issues);

  const ids = collectDeclaredIds(doc);
  const nodeKinds = collectNodeKinds(doc);

  validateRelationships(doc, issues, ids, nodeKinds);
  validateBundles(doc, issues, ids);
  validateMerges(doc, issues, ids);
  validateCrossDeclarationConflicts(doc, issues);
  validateWinners(doc, issues, ids);

  if (!doc.loadedStacks.length) {
    push(issues, "warning", "EMPTY_LOAD", "LOAD is empty");
  }

  const triggerStateHint = doc.need.find((item) => item.startsWith("trigger_state:"));
  if (!doc.triggers.length && triggerStateHint !== "trigger_state:neutral") {
    push(issues, "warning", "NO_TRIGGERS", "TRG is empty");
  }

  if (!doc.stacks.length) {
    push(issues, "warning", "NO_STACKS", "Planner document has no STACK declarations");
  }

  return issues;
}

export function summarizeValidationIssues(issues: ValidationIssue[]): { ok: boolean; errors: number; warnings: number } {
  let errors = 0;
  let warnings = 0;
  for (const issue of issues) {
    if (issue.severity === "error") errors += 1;
    if (issue.severity === "warning") warnings += 1;
  }
  return {
    ok: errors === 0,
    errors,
    warnings
  };
}

export function hasValidationErrors(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}

export function isCanonicalRelationshipKind(kind: RelationshipKind): boolean {
  return canonicalRelationshipKinds().has(kind);
}

export function plannerValidatorStage(): string {
  return "stage-2-hardened";
}

export function plannerValidatorCapabilities(): string[] {
  return [
    "required-field-checks",
    "id-shape-checks",
    "hierarchy-checks",
    "state-contradiction-checks",
    "relationship-legality-checks",
    "bundle-legality-checks",
    "merge-legality-checks",
    "winner-legality-checks",
    "compiler-stage-checks",
    "cross-declaration-overlap-checks",
    "legend-resolution-checks"
  ];
}

export function validateUMGPathSemantically(doc: UMGPathDocument, paths: ResolvedPaths): ValidationIssue[] {
  const structural = validateUMGPath(doc);
  const legendIndex = buildLegendResolverIndex(paths);
  const semantic = validateUMGPathAgainstLegend(doc, legendIndex);
  return [...structural, ...semantic];
}

export default validateUMGPath;
