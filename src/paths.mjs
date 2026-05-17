import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PACKAGE_ROOT = path.join(__dirname, '..');

export function resolveDataDir() {
  const env = process.env.THEJAD_DATA_DIR?.trim();
  if (env) return path.resolve(env);
  const cwd = process.cwd();
  const inRepo = path.join(cwd, '.thejad');
  if (!fs.existsSync(inRepo)) fs.mkdirSync(inRepo, { recursive: true });
  return inRepo;
}

export function resolveRepoRoot() {
  const env = process.env.THEJAD_REPO_ROOT?.trim();
  if (env && fs.existsSync(env)) return path.resolve(env);
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'AGENTS.md')) && fs.existsSync(path.join(dir, 'apps', 'web'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function readJson(relFromPackage) {
  return JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, relFromPackage), 'utf8'));
}
