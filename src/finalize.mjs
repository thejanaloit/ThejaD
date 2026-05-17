import { getUnlockState, isFullCapacity, unlockWithPhrase } from './capability.mjs';
import { bootstrapEnv } from './env-bootstrap.mjs';
import { loadMcpEnv } from './mcp-env.mjs';
import { getFigmaContext } from './figma.mjs';
import { notebooklmAuthStatus } from './notebooklm.mjs';
import { ensureSetupReady } from './setup.mjs';
import { catalogToolCount } from './tool-catalog.mjs';
import { resolveRepoRoot, PACKAGE_ROOT } from './paths.mjs';
import fs from 'fs';
import path from 'path';

async function checkOllama() {
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function runFinalize() {
  bootstrapEnv();
  const repo = resolveRepoRoot();
  const mcp = loadMcpEnv(repo);
  const setup = await ensureSetupReady();
  const unlock = getUnlockState();
  const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));
  const stats = { version: pkg.version, tools: 35 + catalogToolCount() };
  const ollama = await checkOllama();
  const figma = await getFigmaContext('/home');
  const nblm = await notebooklmAuthStatus();

  const hooksPath = path.join(repo, '.cursor', 'hooks.json');
  const rulePath = path.join(repo, '.cursor', 'rules', 'thejad-orchestra.mdc');

  const checks = [
    { id: 'repo', ok: true, required: true, detail: repo },
    { id: 'mcp_stats', ok: stats.tools >= 500, required: true, detail: `${stats.tools} tools` },
    { id: 'setup_ready', ok: setup.ready, required: true, detail: setup.message },
    { id: 'cursor_hooks', ok: fs.existsSync(hooksPath), required: true, detail: hooksPath },
    { id: 'orchestra_rule', ok: fs.existsSync(rulePath), required: true, detail: rulePath },
    { id: 'ollama', ok: ollama, required: true, detail: ollama ? 'reachable' : 'start Ollama' },
    { id: 'figma_live', ok: figma.live === true, required: false, detail: figma.live ? figma.fileName : 'set FIGMA_* in mcp.json' },
    { id: 'notebooklm_auth', ok: nblm.authenticated === true, required: false, detail: nblm.authenticated ? 'ok' : 'notebooklm login' },
    { id: 'mcp_env_loaded', ok: mcp.loaded, required: true, detail: mcp.path || 'n/a' },
  ];

  const required = checks.filter((c) => c.required);
  const requiredPass = required.every((c) => c.ok);
  const optionalPass = checks.filter((c) => !c.required).every((c) => c.ok);
  const percent = Math.round(
    (checks.filter((c) => c.ok).length / checks.length) * 100,
  );

  return {
    version: stats.version,
    percent,
    programme100: requiredPass,
    integrations100: optionalPass,
    overall100: requiredPass && optionalPass,
    requiredPass,
    unlock,
    fullCapacity: isFullCapacity(),
    stats,
    setup,
    checks,
    nextSteps: checks.filter((c) => !c.ok).map((c) => `${c.id}: ${c.detail}`),
    thanks: 'Thanks to Theja',
  };
}

export function handleUnlockPhrase(text) {
  const p = String(text || '').trim();
  if (p === 'mamaThejana' || p.toLowerCase() === 'nothejad unlock') {
    return unlockWithPhrase(p);
  }
  return null;
}
