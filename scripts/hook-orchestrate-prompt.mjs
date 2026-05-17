#!/usr/bin/env node
/**
 * Cursor beforeSubmitPrompt — auto-run ThejaD orchestra (no MCP call by host).
 * Writes .thejad/last-orchestra.json + .thejad/last-orchestra.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bootstrapEnv } from '../src/env-bootstrap.mjs';
import { runOrchestra } from '../src/orchestra.mjs';
import { resolveDataDir } from '../src/paths.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.join(__dirname, '..');

const SKIP_RE = /^(ok|yes|no|thanks|thank you|continue|done|y|n)$/i;
const UNLOCK_RE = /^(mamaThejana|nothejad unlock)$/i;

function formatOrchestraMd(result) {
  if (result.phase === 'setup_required') {
    return `# ThejaD — setup required\n\nRun MCP \`thejad_setup_status\` then \`thejad_setup_complete\`.\n`;
  }
  const a = result.assignment || {};
  return `# ThejaD auto-orchestra (hook)

**Role:** ${a.title || a.roleId} (\`${a.roleId}\`)  
**Agent:** \`${a.agent}\`  
**Models:** ${result.modelsStarted?.offline || 0} offline · ${result.modelsStarted?.online || 0} online  

## Optimized prompt (execute this)
${result.optimizedPrompt || ''}

## Workflow
${(result.workflow || []).map((w) => `${w.order}. ${w.who}: ${w.action}`).join('\n')}

## Host instructions
${(result.hostInstructions || []).map((x) => `- ${x}`).join('\n')}
`;
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

  if (!prompt || prompt.length < 4 || SKIP_RE.test(prompt) || UNLOCK_RE.test(prompt)) {
    console.log(JSON.stringify({ continue: true }));
    return;
  }

  bootstrapEnv();
  process.chdir(process.env.THEJAD_REPO_ROOT || process.cwd());

  const fast = process.env.THEJAD_HOOK_FAST !== '0';
  const result = await runOrchestra(prompt, {
    warmModels: !fast,
    skipOllama: fast || process.env.THEJAD_ORCHESTRA_SKIP_OLLAMA === '1',
    maxWarmOllama: fast ? 0 : 1,
  });

  const jsonPath = path.join(dataDir, 'last-orchestra.json');
  const mdPath = path.join(dataDir, 'last-orchestra.md');
  fs.writeFileSync(jsonPath, JSON.stringify({ prompt, at: new Date().toISOString(), ...result }, null, 2), 'utf8');
  fs.writeFileSync(mdPath, formatOrchestraMd(result), 'utf8');

  const brief =
    result.phase === 'setup_required'
      ? `ThejaD: complete setup first (see ${mdPath}).`
      : `ThejaD orchestra: role=${result.assignment?.roleId}, agent=${result.assignment?.agent}. Follow ${mdPath} — do not call thejad_orchestrate again unless the user changes task.`;

  console.log(
    JSON.stringify({
      continue: true,
      additional_context: brief,
    }),
  );
}

main().catch((e) => {
  console.log(JSON.stringify({ continue: true, user_message: `ThejaD hook warning: ${String(e.message || e).slice(0, 120)}` }));
});
