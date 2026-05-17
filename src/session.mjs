import fs from 'fs';
import path from 'path';
import { resolveDataDir } from './paths.mjs';

const SESSION_FILE = 'session.json';

function sessionPath() {
  return path.join(resolveDataDir(), SESSION_FILE);
}

export function loadSession() {
  const p = sessionPath();
  if (!fs.existsSync(p)) {
    return {
      installedAt: null,
      setupComplete: false,
      userAcknowledged: [],
      lastOrchestration: null,
      tokenStats: { savedEstimate: 0, runs: 0 },
    };
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function saveSession(session) {
  fs.writeFileSync(sessionPath(), JSON.stringify(session, null, 2), 'utf8');
}

export function markSetupItem(id) {
  const s = loadSession();
  if (!s.userAcknowledged.includes(id)) s.userAcknowledged.push(id);
  saveSession(s);
}

export function setSetupComplete(complete) {
  const s = loadSession();
  s.setupComplete = !!complete;
  if (complete && !s.installedAt) s.installedAt = new Date().toISOString();
  saveSession(s);
}

export function recordOrchestration(meta) {
  const s = loadSession();
  s.lastOrchestration = { ...meta, at: new Date().toISOString() };
  if (meta.tokensSaved) {
    s.tokenStats.savedEstimate += meta.tokensSaved;
    s.tokenStats.runs += 1;
  }
  saveSession(s);
}
