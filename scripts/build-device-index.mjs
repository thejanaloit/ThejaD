#!/usr/bin/env node
/**
 * Scoped local index — NOT full C:/D: scan (privacy + size).
 * Indexes: internetBanking repo, Cursor project, user Documents dev folders.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'data', 'device-index.json');

const ROOTS = [
  process.env.THEJAD_REPO_ROOT,
  'e:\\internetBanking',
  'C:\\Users\\ThejanaD\\.cursor\\projects\\e-internetBanking',
  'C:\\Users\\ThejanaD\\Documents',
].filter(Boolean);

const EXT = new Set(['.md', '.json', '.ts', '.tsx', '.js', '.mjs', '.cjs', '.yaml', '.yml', '.env.example']);
const MAX_FILES = 8000;
const MAX_DEPTH = 6;

function walk(dir, depth, out) {
  if (out.length >= MAX_FILES || depth > MAX_DEPTH) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === '.next' || e.name === 'dist') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, depth + 1, out);
    else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (EXT.has(ext) || e.name === 'AGENTS.md' || e.name === 'COORDINATION.md') {
        out.push(full.replace(/\\/g, '/'));
      }
    }
  }
}

const files = [];
const seen = new Set();
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  const before = files.length;
  walk(path.resolve(root), 0, files);
  seen.add(path.resolve(root));
  console.log(`[device-index] ${root} +${files.length - before} files`);
}

const payload = {
  generatedAt: new Date().toISOString(),
  note: 'Scoped dev paths only — not full disk scan. D: not present on this machine.',
  roots: [...seen],
  fileCount: files.length,
  files,
};

fs.writeFileSync(OUT, JSON.stringify(payload), 'utf8');
console.log(`[device-index] wrote ${files.length} paths → ${OUT}`);
