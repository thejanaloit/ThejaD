import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT, resolveRepoRoot } from './paths.mjs';

const REPO_URL = 'https://github.com/teng-lin/notebooklm-py.git';

export function notebooklmInstallHint() {
  return {
    pip: 'pip install "notebooklm-py[browser]"',
    playwright: 'playwright install chromium',
    login: 'notebooklm login',
    verify: 'notebooklm auth check --test --json',
    repo: REPO_URL,
    skill: 'notebooklm skill install',
  };
}

function tryExec(cmd) {
  try {
    return { ok: true, output: execSync(cmd, { encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] }) };
  } catch (e) {
    return { ok: false, error: String(e.stderr || e.message || e) };
  }
}

export async function notebooklmAuthStatus() {
  const check = tryExec('notebooklm auth check --test --json');
  if (check.ok) {
    try {
      return { authenticated: true, detail: JSON.parse(check.output) };
    } catch {
      return { authenticated: true, detail: check.output.slice(0, 200) };
    }
  }
  return { authenticated: false, hint: 'Run: notebooklm login (interactive OAuth)' };
}

export async function notebooklmAsk(question) {
  const q = String(question || '').trim();
  const auth = await notebooklmAuthStatus();

  const cli = tryExec(`notebooklm ask ${JSON.stringify(q)}`);
  if (cli.ok) return { source: 'notebooklm-cli', authenticated: auth.authenticated, answer: cli.output };

  const py = tryExec(`python -c "import notebooklm; print('ok')"`);
  if (!py.ok) {
    return {
      mock: true,
      authenticated: false,
      question: q,
      install: notebooklmInstallHint(),
      fallbackDocs: [
        path.join(resolveRepoRoot(), 'docs', 'PROGRAMME_MASTER_REFERENCE.md'),
        path.join(resolveRepoRoot(), 'docs', 'AUTHENTICATION_AND_AUTHORIZATION.md'),
        path.join(PACKAGE_ROOT, 'data', 'stories-traceability.json'),
      ],
      message: 'notebooklm-py not installed — use pip install per requested.md R2',
    };
  }

  return {
    mock: true,
    authenticated: auth.authenticated,
    question: q,
    pythonAvailable: true,
    auth,
    hint: auth.authenticated ? 'notebooklm ask failed — check notebook' : 'Run: notebooklm login then notebooklm ask "..."',
    install: notebooklmInstallHint(),
  };
}

export function notebooklmAddRepoSources() {
  const repo = resolveRepoRoot();
  const docs = [
    'docs/PROGRAMME_MASTER_REFERENCE.md',
    'docs/MVP_CURRENT_STATE.md',
    'docs/AUTHENTICATION_AND_AUTHORIZATION.md',
    'docs/security/SECURITY_WHITE_HAT.md',
    'AGENTS.md',
  ];
  const existing = docs.filter((d) => fs.existsSync(path.join(repo, d)));
  return {
    action: 'notebooklm source add (manual or CLI)',
    paths: existing.map((d) => path.join(repo, d)),
    hint: notebooklmInstallHint(),
  };
}
