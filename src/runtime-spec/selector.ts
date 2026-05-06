import type { NormalizedArtifact } from "../resolver/block-library-config.js";
import type { RuntimeSpecCompileInput, RuntimeKind } from "./types.js";

function includesText(artifact: NormalizedArtifact, terms: string[]): number {
  const haystack = [artifact.id, artifact.title ?? "", artifact.description ?? "", artifact.tags.join(" "), artifact.domains.join(" "), artifact.capabilities.join(" ")].join("\n").toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function boostedScore(artifact: NormalizedArtifact, terms: string[], preferredKind?: RuntimeSpecCompileInput['preferred_kind']): number {
  let score = includesText(artifact, terms);
  if (preferredKind && artifact.kind === preferredKind.replace('molt_block', 'molt_block')) score += 2;
  const haystack = [artifact.id, artifact.title ?? '', artifact.description ?? ''].join('\n').toLowerCase();
  if (terms.includes('langchain') && haystack.includes('langchain')) score += 4;
  if (terms.includes('bridge') && haystack.includes('bridge')) score += 3;
  if (terms.includes('sleeve') && artifact.kind === 'sleeve') score += 3;
  if (terms.includes('report') && artifact.kind === 'neostack') score -= 2;
  if (terms.includes('one-off') && artifact.kind === 'neostack') score -= 2;
  return score;
}

export function selectRuntimeArtifacts(input: RuntimeSpecCompileInput, selectable: NormalizedArtifact[], support: NormalizedArtifact[]) {
  const terms = input.user_task.toLowerCase().split(/\s+/).filter(Boolean);

  const sleeves = selectable.filter((artifact) => artifact.kind === "sleeve").map((artifact) => ({ artifact, score: boostedScore(artifact, terms, input.preferred_kind) }));
  const neostacks = selectable.filter((artifact) => artifact.kind === "neostack").map((artifact) => ({ artifact, score: boostedScore(artifact, terms, input.preferred_kind) }));
  const neoblocks = selectable.filter((artifact) => artifact.kind === "neoblock").map((artifact) => ({ artifact, score: boostedScore(artifact, terms, input.preferred_kind) }));
  const molt = selectable.filter((artifact) => artifact.kind === "molt_block").map((artifact) => ({ artifact, score: boostedScore(artifact, terms, input.preferred_kind) }));

  sleeves.sort((a, b) => b.score - a.score);
  neostacks.sort((a, b) => b.score - a.score);
  neoblocks.sort((a, b) => b.score - a.score);
  molt.sort((a, b) => b.score - a.score);

  let runtime_kind: RuntimeKind = "assembled_runtime";
  let active_sleeve: string | null = null;
  let active_neostacks: string[] = [];
  let active_neoblocks: string[] = [];
  let active_molt_blocks: string[] = [];
  const warnings: string[] = [];

  if (neostacks[0] && neostacks[0].score >= 4 && terms.includes('langchain')) {
    runtime_kind = "neostack_runtime";
    active_neostacks = [neostacks[0].artifact.id];
  } else if (sleeves[0] && sleeves[0].score >= 4 && !terms.includes('one-off')) {
    runtime_kind = "sleeve_runtime";
    active_sleeve = sleeves[0].artifact.id;
  } else if (neostacks[0] && neostacks[0].score >= 2 && !terms.includes('one-off')) {
    runtime_kind = "neostack_runtime";
    active_neostacks = [neostacks[0].artifact.id];
  } else {
    runtime_kind = "assembled_runtime";
    active_neoblocks = neoblocks.slice(0, 2).filter((entry) => entry.score > 0).map((entry) => entry.artifact.id);
    active_molt_blocks = molt.slice(0, 3).filter((entry) => entry.score > 0).map((entry) => entry.artifact.id);
    warnings.push("no matching sleeve found");
  }

  const docsBias = /\b(explain|guide|docs|readme|how)\b/.test(input.user_task.toLowerCase());
  const support_artifacts = docsBias
    ? support.filter((artifact) => includesText(artifact, terms) > 0).slice(0, 5).map((artifact) => artifact.id)
    : [];

  return {
    runtime_kind,
    active_sleeve,
    active_neostacks,
    active_neoblocks,
    active_molt_blocks,
    support_artifacts,
    warnings,
    candidates: {
      sleeve: sleeves[0]?.artifact,
      neostack: neostacks[0]?.artifact,
      neoblock: neoblocks[0]?.artifact,
      molt: molt[0]?.artifact
    }
  };
}
