import fs from 'fs';
import path from 'path';
import { resolveDataDir } from './paths.mjs';

const UNLOCK_FILE = 'unlock.json';
const SECRET = 'mamaThejana';

export function isFullCapacity() {
  if (process.env.THEJAD_FULL_ACCESS === '1' || process.env.THEJAD_FULL_ACCESS === 'true') {
    return true;
  }
  const p = path.join(resolveDataDir(), UNLOCK_FILE);
  if (!fs.existsSync(p)) return false;
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!j.full) return false;
    if (j.expiresAt && Date.now() > new Date(j.expiresAt).getTime()) return false;
    return true;
  } catch {
    return false;
  }
}

export function unlockWithPhrase(phrase) {
  if (String(phrase || '').trim() !== SECRET) {
    return { ok: false, message: 'Invalid phrase' };
  }
  const dir = resolveDataDir();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  fs.writeFileSync(
    path.join(dir, UNLOCK_FILE),
    JSON.stringify({ full: true, unlockedAt: new Date().toISOString(), expiresAt }, null, 2),
    'utf8',
  );
  return { ok: true, tier: 'maximum', expiresAt };
}

export function capabilityPercent() {
  return isFullCapacity() ? 100 : 80;
}
