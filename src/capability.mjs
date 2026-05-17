import fs from 'fs';
import path from 'path';
import { resolveDataDir } from './paths.mjs';

const UNLOCK_FILE = 'unlock.json';
const UNLOCK_PHRASE = 'mamaThejana';
const LOCK_PHRASE = 'nothejad unlock';

export function isFullCapacity() {
  if (process.env.THEJAD_FULL_ACCESS === '1' || process.env.THEJAD_FULL_ACCESS === 'true') {
    return true;
  }
  const p = path.join(resolveDataDir(), UNLOCK_FILE);
  if (!fs.existsSync(p)) return false;
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!j.full) return false;
    if (j.expiresAt != null && Date.now() > new Date(j.expiresAt).getTime()) return false;
    return true;
  } catch {
    return false;
  }
}

export function unlockWithPhrase(phrase) {
  const p = String(phrase || '').trim();
  if (p.toLowerCase() === LOCK_PHRASE) {
    return lockMaximum();
  }
  if (p !== UNLOCK_PHRASE) {
    return { ok: false, message: 'Invalid phrase. Unlock: mamaThejana · Lock: nothejad unlock' };
  }
  const dir = resolveDataDir();
  fs.writeFileSync(
    path.join(dir, UNLOCK_FILE),
    JSON.stringify(
      {
        full: true,
        unlockedAt: new Date().toISOString(),
        expiresAt: null,
        lockedBy: null,
      },
      null,
      2,
    ),
    'utf8',
  );
  return {
    ok: true,
    tier: 'maximum',
    persistent: true,
    message: 'Maximum capability unlocked until you run thejad_unlock with phrase "nothejad unlock"',
  };
}

export function lockMaximum() {
  const dir = resolveDataDir();
  const file = path.join(dir, UNLOCK_FILE);
  if (fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      JSON.stringify(
        {
          full: false,
          lockedAt: new Date().toISOString(),
          lockedBy: LOCK_PHRASE,
        },
        null,
        2,
      ),
      'utf8',
    );
  }
  return {
    ok: true,
    tier: 'standard',
    capabilityPercent: 80,
    message: 'Locked to standard tier (80%). Use mamaThejana to unlock maximum again.',
  };
}

export function getUnlockState() {
  const file = path.join(resolveDataDir(), UNLOCK_FILE);
  if (!fs.existsSync(file)) {
    return { full: false, tier: 'standard', capabilityPercent: 80 };
  }
  try {
    const j = JSON.parse(fs.readFileSync(file, 'utf8'));
    const full = isFullCapacity();
    return {
      full,
      tier: full ? 'maximum' : 'standard',
      capabilityPercent: full ? 100 : 80,
      unlockedAt: j.unlockedAt || null,
      lockedAt: j.lockedAt || null,
      persistent: j.expiresAt == null && j.full === true,
      lockCommand: LOCK_PHRASE,
      unlockCommand: UNLOCK_PHRASE,
    };
  } catch {
    return { full: false, tier: 'standard', capabilityPercent: 80 };
  }
}

export function capabilityPercent() {
  return isFullCapacity() ? 100 : 80;
}

export function getCapabilityTier() {
  return isFullCapacity() ? 'full' : 'standard';
}

export function isToolAllowed(toolTier, sessionTier) {
  const tier = toolTier || 'standard';
  if (tier === 'core' || tier === 'standard') return true;
  return sessionTier === 'full';
}
