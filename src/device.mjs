import fs from 'fs';
import path from 'path';
import { PACKAGE_ROOT } from './paths.mjs';

function loadIndex() {
  const p = path.join(PACKAGE_ROOT, 'data', 'device-index.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadUsable() {
  const p = path.join(PACKAGE_ROOT, 'data', 'device-usable.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

export function deviceSearch(query) {
  const idx = loadIndex();
  if (!idx) {
    return { error: 'device-index missing — MCP tool device_reindex or: node thejad/scripts/build-device-index.mjs' };
  }
  const q = String(query || '').toLowerCase();
  const hits = (idx.files || []).filter((f) => f.toLowerCase().includes(q)).slice(0, 50);
  return {
    generatedAt: idx.generatedAt,
    roots: idx.roots,
    totalIndexed: idx.fileCount,
    hitCount: hits.length,
    hits,
  };
}

export function deviceUsableSummary() {
  const u = loadUsable();
  if (!u) {
    return { error: 'device-usable missing — run device_reindex' };
  }
  return {
    generatedAt: u.generatedAt,
    summary: u.summary,
    roots: u.roots,
    ollamaModels: u.ollamaModels || [],
    cursorGlobalMcp: u.cursorGlobalMcp,
    samples: {
      mcpConfigs: (u.mcpConfigs || []).slice(0, 15),
      skills: (u.skills || []).slice(0, 15),
      fusionxOrBanking: (u.fusionxOrBanking || []).slice(0, 15),
      docker: (u.docker || []).slice(0, 10),
      postman: (u.postman || []).slice(0, 10),
    },
  };
}

export function deviceUsableSearch(category, query) {
  const u = loadUsable();
  if (!u) return { error: 'device-usable missing — run device_reindex' };
  const key = category || 'fusionxOrBanking';
  const list = u[key];
  if (!Array.isArray(list)) {
    return { error: `Unknown category. Use: ${Object.keys(u).filter((k) => Array.isArray(u[k])).join(', ')}` };
  }
  const q = String(query || '').toLowerCase();
  const hits = list.filter((f) => f.toLowerCase().includes(q)).slice(0, 40);
  return { category: key, hitCount: hits.length, hits };
}

export function deviceReindexHint() {
  return {
    command: 'node thejad/scripts/build-device-index.mjs',
    env: 'THEJAD_DEVICE_ROOTS=path1;path2 for extra roots',
    outputs: ['data/device-index.json', 'data/device-usable.json'],
    mcpTools: ['device_search', 'device_usable_summary', 'device_usable_search', 'device_reindex'],
  };
}
