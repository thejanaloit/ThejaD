import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';
import { getPodStatus } from './team-pod.mjs';

const MANIFEST_NAME = 'agent-manifest.json';

function manifestPath() {
  const st = getPodStatus();
  if (st.joined && st.manifestPath) return st.manifestPath;
  return path.join(PACKAGE_ROOT, 'data', MANIFEST_NAME);
}

/** Same agent level for every team member — skills, rules, orchestra hooks. */
export function buildAgentManifest() {
  const repo = process.env.THEJAD_REPO_ROOT || process.cwd();
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    orchestra: {
      rule: '.cursor/rules/thejad-orchestra.mdc',
      skill: '.cursor/skills/thejad-orchestrator/SKILL.md',
      hooks: '.cursor/hooks.json',
    },
    team: {
      roles: ['thejana', 'lahiru', 'geesara', 'sachini', 'security', 'backend'],
      rosterTool: 'engineering_team_roster',
    },
    mcp: {
      server: 'ThejaD',
      entry: 'thejad/bin/thejad.js mcp start',
      orchestrate: 'thejad_orchestrate',
      sharedMemory: 'thejad_pod_memory_store',
    },
    hyperspace: {
      docs: 'https://pods.hyper.space/',
      gatewayEnv: 'HYPERSPACE_GATEWAY_URL',
      apiKeyEnv: 'HYPERSPACE_POD_API_KEY',
    },
    paths: {
      repo,
      thejad: path.join(repo, 'thejad'),
    },
  };
}

export function exportAgentManifest() {
  const manifest = buildAgentManifest();
  const p = manifestPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2), 'utf8');
  return { path: p, manifest };
}

export function applyAgentManifest(manifest) {
  const m = manifest || JSON.parse(fs.readFileSync(manifestPath(), 'utf8'));
  const hints = [];
  const repo = m.paths?.repo || process.cwd();
  for (const [key, rel] of Object.entries(m.orchestra || {})) {
    const full = path.join(repo, rel);
    hints.push({ item: key, path: full, exists: fs.existsSync(full) });
  }
  return {
    applied: true,
    manifest: m,
    files: hints,
    message: 'Copy missing files from export host; run thejad_pod_memory_sync for shared memory.',
  };
}
