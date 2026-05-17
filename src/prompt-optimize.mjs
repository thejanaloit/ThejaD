import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';

/** Rough token estimate (~4 chars per token). */
export function estimateTokens(text) {
  return Math.ceil(String(text || '').length / 4);
}

const FILLER = /\b(please|kindly|just|really|very|actually|basically|i want you to|can you)\b/gi;

/**
 * Regenerate user prompt in ThejaD token-efficient style:
 * structured blocks + skill refs instead of pasted docs.
 */
export function regeneratePrompt(userPrompt, assignment) {
  const raw = String(userPrompt || '').trim();
  const compressed = raw.replace(FILLER, '').replace(/\s+/g, ' ').trim();

  const skillRefs = (assignment.skills || [])
    .slice(0, 4)
    .map((s) => `thejad://skill/${s}`)
    .join('\n');

  const blocks = [
    '## Goal',
    compressed,
    '',
    '## Role',
    `${assignment.role.title} (${assignment.roleId}) — lanes ${assignment.role.lanes?.join(',') || '—'}`,
    '',
    '## Workflow (LOLC delivery)',
    ...(assignment.workflowSteps || []).map((w) => `${w.order}. ${w.who}: ${w.action}`),
    '',
    '## Constraints',
    '- Phase 1 spine only unless logged in MULTI_AGENT_DEVELOPMENT_LOG',
    '- coordination_claim before multi-file edits',
    '- Prefer skill files over re-pasting repo docs (token savings)',
    '',
    '## Skills (load on demand — do not inline full SKILL.md)',
    skillRefs || '(none — use team plugins list)',
    '',
    '## Tools to call first',
    ...(assignment.recommendedTools || []).map((t) => `- ${t}`),
    '',
    '## Output',
    assignment.outputShape || 'Implementation plan → code → smoke_hint → diary_append',
  ];

  const optimized = blocks.join('\n');
  const before = estimateTokens(raw);
  const after = estimateTokens(optimized);
  const saved = Math.max(0, before - after);

  return {
    original: raw,
    optimized,
    style: 'thejad-structured-v1',
    tokens: { before, after, savedEstimate: saved },
    note: 'Host agent: execute optimized prompt; use secondary offline model for drafts only.',
  };
}

export function resolveSkillPaths(skillNames) {
  const base = path.join(PACKAGE_ROOT, 'skills', 'imported');
  return skillNames
    .map((name) => {
      const dir = path.join(base, name);
      const md = path.join(dir, 'SKILL.md');
      if (fs.existsSync(md)) return md;
      return null;
    })
    .filter(Boolean);
}
