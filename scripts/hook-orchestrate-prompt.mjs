#!/usr/bin/env node
/**
 * Cursor beforeSubmitPrompt — auto-run ThejaD orchestra; inject full plan into context.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bootstrapEnv } from '../src/env-bootstrap.mjs';
import { handleUnlockPhrase } from '../src/finalize.mjs';
import { runOrchestra } from '../src/orchestra.mjs';
import { resolveDataDir } from '../src/paths.mjs';

const MAX_CTX = 12000;
const SKIP_RE = /^(ok|yes|no|thanks|thank you|continue|done|y|n)$/i;
const UNLOCK_RE = /^(mamaThejana|nothejad unlock)$/i;

function formatOrchestraMd(result) {
  if (result.phase === 'setup_required') {
    return `# ThejaD — setup required\n\n${JSON.stringify(result.setup?.missingRequired || [], null, 2)}\n`;
  }
  const a = result.assignment || {};
  let md = `# ThejaD auto-orchestra — EXECUTE NOW

**Role:** ${a.title || a.roleId} (\`${a.roleId}\`)  
**Agent:** \`${a.agent}\`  
**Models:** ${result.modelsStarted?.offline || 0} offline · ${result.modelsStarted?.online || 0} online  

## Optimized prompt
${result.optimizedPrompt || ''}

## Workflow
${(result.workflow || []).map((w) => `${w.order}. ${w.who}: ${w.action}`).join('\n')}

## Instructions
${(result.hostInstructions || []).map((x) => `- ${x}`).join('\n')}
`;
  if (result.ollamaDraft?.draft) {
    md += `\n## Offline draft (Ollama)\n${result.ollamaDraft.draft}\n`;
  }
  if (result.integrationContext?.figma) {
    md += `\n## Figma\n\`\`\`json\n${JSON.stringify(result.integrationContext.figma, null, 2).slice(0, 2000)}\n\`\`\`\n`;
  }
  if (result.integrationContext?.notebooklm?.answer) {
    md += `\n## NotebookLM\n${String(result.integrationContext.notebooklm.answer).slice(0, 1500)}\n`;
  }
  md += '\n---\nDo not call thejad_orchestrate again for this same task.\n';
  return md;
}

async function main() {
  let input = {};
  try {
    const raw = fs.readFileSync(0, 'utf8');
    if (raw.trim()) input = JSON.parse(raw);
  } catch {
    input = {};
  }

  const prompt = String(input.prompt || input.text || '').trim();
  const dataDir = resolveDataDir();
  fs.mkdirSync(dataDir, { recursive: true });

  bootstrapEnv();
  process.chdir(process.env.THEJAD_REPO_ROOT || process.cwd());

  if (UNLOCK_RE.test(prompt)) {
    const r = handleUnlockPhrase(prompt);
    console.log(
      JSON.stringify({
        continue: true,
        additional_context: `ThejaD unlock: ${r.message} (tier ${r.tier || r.capabilityPercent}%)`,
      }),
    );
    return;
  }

  if (!prompt || prompt.length < 4 || SKIP_RE.test(prompt)) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  const fast = process.env.THEJAD_HOOK_FAST !== '0';
  const result = await runOrchestra(prompt, {
    warmModels: !fast,
    skipOllama: fast || process.env.THEJAD_ORCHESTRA_SKIP_OLLAMA === '1',
    maxWarmOllama: fast ? 0 : 1,
  });

  const md = formatOrchestraMd(result);
  const mdPath = path.join(dataDir, 'last-orchestra.md');
  fs.writeFileSync(path.join(dataDir, 'last-orchestra.json'), JSON.stringify({ prompt, at: new Date().toISOString(), ...result }, null, 2), 'utf8');
  fs.writeFileSync(mdPath, md, 'utf8');

  const ctx = md.length > MAX_CTX ? `${md.slice(0, MAX_CTX)}\n\n...[truncated — see ${mdPath}]` : md;

  console.log(JSON.stringify({ continue: true, additional_context: ctx }));
}

main().catch((e) => {
  console.log(
    JSON.stringify({
      continue: true,
      additional_context: `ThejaD hook error: ${String(e.message || e).slice(0, 200)}`,
    }),
  );
});
