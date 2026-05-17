import fs from 'fs';
import path from 'path';
import { resolveRepoRoot } from './paths.mjs';

export function bootstrapEnv() {
  const repo = resolveRepoRoot();
  const envPath = path.join(repo, '.env');
  if (!fs.existsSync(envPath)) return repo;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq <= 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
  process.env.THEJAD_REPO_ROOT = repo;
  return repo;
}
