import { execSync } from 'child_process';
import { readJson, resolveRepoRoot } from './paths.mjs';
import { loadSession, markSetupItem, setSetupComplete } from './session.mjs';

async function checkOllama() {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkNotebooklm() {
  try {
    execSync('notebooklm --version', { encoding: 'utf8', timeout: 5000, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function checkRepo() {
  try {
    resolveRepoRoot();
    return true;
  } catch {
    return false;
  }
}

function envSet(name) {
  return Boolean(process.env[name]?.trim());
}

export async function evaluateSetupItem(item) {
  switch (item.check) {
    case 'always':
      return { ok: true, detail: 'Host IDE active' };
    case 'repo':
      return { ok: checkRepo(), detail: checkRepo() ? resolveRepoRoot() : 'THEJAD_REPO_ROOT or cwd must be LOLC monorepo' };
    case 'ollama':
      return { ok: await checkOllama(), detail: 'http://127.0.0.1:11434/api/tags' };
    case 'env':
      return { ok: envSet(item.envVar), detail: item.envVar };
    case 'notebooklm': {
      const cli = await checkNotebooklm();
      return { ok: cli, detail: cli ? 'notebooklm CLI found' : 'Run: pip install notebooklm-py && notebooklm login' };
    }
    default:
      return { ok: false, detail: 'unknown check' };
  }
}

export async function getSetupStatus() {
  const spec = readJson('data/setup-requirements.json');
  const session = loadSession();
  const items = [];

  for (const item of spec.items) {
    const result = await evaluateSetupItem(item);
    const userMarked = session.userAcknowledged.includes(item.id);
    items.push({
      id: item.id,
      label: item.label,
      required: item.required,
      help: item.help,
      ok: result.ok,
      detail: result.detail,
      userAcknowledged: userMarked,
      satisfied: result.ok || (!item.required && userMarked),
    });
  }

  const requiredOk = items.filter((i) => i.required).every((i) => i.ok);
  const ready = session.setupComplete && requiredOk;

  return {
    ready,
    setupCompleteFlag: session.setupComplete,
    requiredOk,
    items,
    missingRequired: items.filter((i) => i.required && !i.ok).map((i) => ({ id: i.id, label: i.label, help: i.help })),
    optionalPending: items.filter((i) => !i.required && !i.ok && !i.userAcknowledged).map((i) => i.id),
    installedAt: session.installedAt,
    message: ready
      ? 'Setup complete — use thejad_orchestrate for every user prompt.'
      : 'Complete setup: fix missing required items, then thejad_setup_complete.',
  };
}

export async function registerSetup(args) {
  if (args.markComplete) setSetupComplete(true);
  if (Array.isArray(args.acknowledge)) {
    for (const id of args.acknowledge) markSetupItem(id);
  }
  if (args.itemId) markSetupItem(args.itemId);
  return getSetupStatus();
}
