import fs from 'fs';
import path from 'path';
import { resolveDataDir, resolveRepoRoot } from './paths.mjs';

export function swarmInit(topology = 'hierarchical-mesh') {
  const id = `swarm-${Date.now()}`;
  const state = {
    swarmId: id,
    topology,
    maxAgents: 15,
    agents: [],
    startedAt: new Date().toISOString(),
  };
  const dir = resolveDataDir();
  fs.writeFileSync(path.join(dir, 'swarm.json'), JSON.stringify(state, null, 2), 'utf8');
  return state;
}

export function swarmStatus() {
  const p = path.join(resolveDataDir(), 'swarm.json');
  if (!fs.existsSync(p)) return { active: false };
  return { active: true, ...JSON.parse(fs.readFileSync(p, 'utf8')) };
}

export function agentSpawn(type, task) {
  const st = swarmStatus();
  if (!st.active) swarmInit();
  const agent = {
    id: `agent-${Date.now()}`,
    type,
    task,
    status: 'spawned',
    at: new Date().toISOString(),
  };
  const p = path.join(resolveDataDir(), 'swarm.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.agents = data.agents || [];
  data.agents.push(agent);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
  return agent;
}

export function workerHints() {
  return {
    workers: ['map', 'audit', 'optimize', 'consolidate', 'testgaps', 'predict', 'document'],
    rufloDaemon: 'npx ruflo@latest daemon start',
    thejadDiary: 'diary_append',
  };
}

export function securityScanRepo() {
  const repo = resolveRepoRoot();
  const docs = [
    'docs/security/SECURITY_WHITE_HAT.md',
    'docs/security/SECURITY_FIXED.md',
    'docs/security/SECURITY_DEV_LOGIN_SESSION.md',
  ];
  const found = docs.filter((d) => fs.existsSync(path.join(repo, d)));
  return {
    repo,
    securityDocs: found,
    devFlags: [
      'ALLOW_DEV_PROXY_USER_FALLBACK',
      'ALLOW_INSECURE_JWT_DECODE',
      'ALLOW_DEV_HEADER_USER_ID',
      'WEB_PROXY_ACCOUNTS_DEV_FALLBACK',
    ],
    prodNever: ['FIXED_OTP in production', 'committed API keys'],
    whiteHatRole: 'Use security role consult for triage',
  };
}
