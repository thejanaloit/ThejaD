import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';

export function deviceSearch(query) {
  const p = path.join(PACKAGE_ROOT, 'data', 'device-index.json');
  if (!fs.existsSync(p)) {
    return { error: 'device-index missing — run: node scripts/build-device-index.mjs' };
  }
  const idx = JSON.parse(fs.readFileSync(p, 'utf8'));
  const q = String(query || '').toLowerCase();
  const hits = (idx.files || []).filter((f) => f.toLowerCase().includes(q)).slice(0, 40);
  return {
    generatedAt: idx.generatedAt,
    roots: idx.roots,
    totalIndexed: idx.fileCount,
    hitCount: hits.length,
    hits,
  };
}
